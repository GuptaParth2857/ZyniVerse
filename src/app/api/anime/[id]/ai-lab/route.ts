import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  consumeAiQuota,
  geminiGenerate,
  parseGeminiJson,
  aiCacheKey,
  isGeminiConfigured,
  AiQuotaError,
} from "@/lib/gemini";
import { getAnimeDetailFull, getMediaBatch, bestTitle, type MediaAnimeFull } from "@/lib/anilist";

export const maxDuration = 60;
export const revalidate = 0;

const CARDS = ["theory", "taste", "fancast", "s2predict", "dreamteam"] as const;
type CardKind = (typeof CARDS)[number];

const PREDICTION_TYPES = ["ending", "next_arc", "villain", "power_up", "romance", "twist", "side_plot"] as const;

function getAnimeIdParam(raw: string): number | null {
  const num = Number(raw);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function strip(str: string | null | undefined, max = 1400): string {
  return (str || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function buildMediaContext(anime: MediaAnimeFull): string {
  const lines: string[] = [];
  lines.push(`Title: ${bestTitle(anime.title)}`);
  lines.push(`Format: ${anime.format || "TV"} | Status: ${anime.status || "-"} | Episodes: ${anime.episodes ?? "-"} | Season: ${anime.season || "-"} ${anime.seasonYear || ""}`);
  if (anime.startDate?.year) lines.push(`Started: ${anime.startDate.year}`);
  if (anime.endDate?.year) lines.push(`Ended: ${anime.endDate.year}`);
  const src = anime.source ? ` | Source: ${anime.source}` : "";
  lines.push(`Average score: ${anime.averageScore ?? "-"} | Popularity: ${anime.popularity ?? "-"} | Favourites: ${anime.favourites ?? "-"}${src}${anime.isAdult ? " | MATURE CONTENT" : ""}`);
  if (anime.genres?.length) lines.push(`Genres: ${anime.genres.join(", ")}`);
  if (anime.studios?.nodes?.length) lines.push(`Studios: ${anime.studios.nodes.map((s) => s.name).join(", ")}`);
  const tags = (anime.tags || []).filter((t) => t.rank >= 50 && !t.isMediaSpoiler).sort((a, b) => b.rank - a.rank).slice(0, 12);
  if (tags.length) lines.push(`Key tags: ${tags.map((t) => `${t.name}(${t.rank})`).join(", ")}`);
  const rel = (anime.relations?.edges || [])
    .filter((e) => ["SEQUEL", "PREQUEL", "SIDE_STORY", "SPIN_OFF", "SUMMARY", "ADAPTATION", "SOURCE", "ALTERNATIVE"].includes(e.relationType))
    .slice(0, 8);
  if (rel.length) lines.push(`Relations: ${rel.map((e) => `${e.relationType} → ${e.node.type === "ANIME" ? bestTitle(e.node.title) : (e.node.title?.romaji || "")}`).join(" | ")}`);
  const chars = (anime.characters?.edges || []).slice(0, 10);
  if (chars.length) lines.push(`Characters: ${chars.map((e) => `${e.node.name?.full} (${e.role})`).join(", ")}`);
  lines.push(`Synopsis: ${strip(anime.description)}`);
  return lines.join("\n");
}

const SYSTEM_PROMPTS: Record<Exclude<CardKind, "taste">, string> = {
  theory: `You are ZyniVerse's AI futurist for anime fans. Predict what could happen NEXT in this show. These are FAN THEORIES only - clearly speculative, never asserted as canon. Be creative, grounded in the show's actual themes, characters and genre tropes, and fun. Never invent spoilers for content past the given status/synopsis.
Respond ONLY with JSON:
{"headline": "one catchy line", "confidence": number 1-100, "predictions": [{"type": "${PREDICTION_TYPES.join("|")}", "title": "short label", "text": "2-3 sentence theory"}]}
Rules:
- Exactly 4-6 predictions covering DIFFERENT types.
- Refer to the actual characters and plot elements given.
- Phrase everything as speculation ("could", "might", "my guess is").
- Keep it clean and spoiler-safe for anything not described.`,

  fancast: `You are a casting director pitching a hypothetical live-action adaptation of this anime. Fan speculation only.
Respond ONLY with JSON:
{"hook": "one-line angle for the adaptation", "casting": [{"role": "character name", "actor": "real actor name", "reason": "why they fit"}]}
Rules:
- 5-7 castings featuring the most prominent characters listed.
- Use REAL, famous actors whose age/vibe reasonably fit the role.
- Keep reasons short and concrete (range, energy, range, chemistry).`,

  s2predict: `You are ZyniVerse's AI predicting the continuation / next season of this anime. Speculation only, grounded in the given synopsis and characters.
Respond ONLY with JSON:
{"headline": "one line", "story": "2-4 sentence predicted direction", "arcs": ["2-3 arc names"], "stakes": "what's at stake", "new_chars": ["2-3 possible new characters/allies"], "reveal": "a cheeky final-season tease"}
Keep every part phrased as prediction, never fact.`,

  dreamteam: `Assemble a 5-member dream team from THIS anime's universe (ONLY characters that actually exist in this show) for an epic heist-grade mission. Fun, clean, fan speculation.
Respond ONLY with JSON:
{"mission": "one-line mission", "team": [{"member": "character name", "role": "team role", "power": "their key ability / asset worth"}]}
Rules:
- Exactly 5 members, each a REAL character from the show.
- Each role must be distinct (leader, brains, muscle, wildcard, sniper/spy, etc.).`,
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const animeId = getAnimeIdParam(rawId);
  if (!animeId) return NextResponse.json({ error: "Invalid anime id" }, { status: 404 });

  const card = (req.nextUrl.searchParams.get("card") || "") as CardKind;
  if (!(CARDS as readonly string[]).includes(card)) {
    return NextResponse.json({ error: `Card must be one of: ${CARDS.join(", ")}` }, { status: 400 });
  }

  let anime: MediaAnimeFull;
  try {
    anime = await getAnimeDetailFull(animeId);
  } catch {
    return NextResponse.json({ error: "Anime not found" }, { status: 404 });
  }

  const session = await auth();
  const userKey = card === "taste" ? `${session?.user?.id ?? "anon"}:${animeId}` : String(animeId);
  const cacheKey = aiCacheKey(card, userKey);

  // Public cards (theory/fancast/s2predict/dreamteam) are servable from cache
  // without login - keeps the viral content free. Only GENERATION needs auth.
  const cached = await prisma.aiCache.findUnique({ where: { key: cacheKey } }).catch(() => null);
  if (cached) {
    const parsed = parseGeminiJson<unknown>(cached.response);
    if (parsed) return NextResponse.json({ fromCache: true, card: parsed });
    await prisma.aiCache.delete({ where: { key: cacheKey } }).catch(() => {});
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to let Zyni AI generate this." }, { status: 401 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });
  }

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  let system: string;
  let prompt: string;
  if (card === "taste") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const entries = await prisma.listEntry.findMany({
      where: { userId: session.user.id },
      select: { mediaId: true, status: true, score: true },
      orderBy: { updatedAt: "desc" },
      take: 120,
    });
    const counts: Record<string, number> = {};
    for (const e of entries) counts[e.status] = (counts[e.status] || 0) + 1;
    const watchIds = entries.slice(0, 40).map((e) => e.mediaId);
    const watched = watchIds.length ? await getMediaBatch(watchIds) : [];
    const watchTaste = watched
      .map((m) => `${bestTitle(m.title)} [${m.genres?.join(", ") || m.format || ""}]`)
      .slice(0, 24)
      .join("; ") || "none tracked yet";

    system = `You are ZyniVerse's personal anime scout. Decide how well THIS anime fits a specific user. Be honest, opinionated and specific.
Respond ONLY with JSON:
{"score": 0-100, "verdict": "Watch now", "brief": "3-line spoiler-free summary of the show's vibe", "reasons": ["3-4 short reasons tied to the user's actual preferences"]}
Rules:
- Reasons MUST reference the user's declared favourites / tracked titles below.
- If it clearly mismatches, say so honestly (lower score + a "wait for the right mood"-style verdict).`;
    prompt = [
      `User's declared favorite genres: ${(user?.favoriteGenres || []).join(", ") || "not set"}`,
      `User's declared favorite moods: ${(user?.favoriteMoods || []).join(", ") || "not set"}`,
      `User's library stats (status → count): ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(", ") || "empty"}`,
      `User's recent tracked titles [genres]: ${watchTaste}`,
      "",
      `Now judge this anime:\n${buildMediaContext(anime)}`,
    ].join("\n");
  } else {
    system = SYSTEM_PROMPTS[card];
    prompt = buildMediaContext(anime);
  }

  let raw: string;
  try {
    raw = await geminiGenerate({ system, prompt, json: true, cacheKey });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("429") || msg.includes("Gemini 5")) {
      return NextResponse.json({ error: "Zyni AI is busy — try again in a few seconds." }, { status: 502 });
    }
    return NextResponse.json({ error: "Zyni AI hit a snag — try again shortly." }, { status: 502 });
  }

  const parsed = parseGeminiJson<unknown>(raw);
  if (!parsed) {
    await prisma.aiCache.delete({ where: { key: cacheKey } }).catch(() => {});
    return NextResponse.json({ error: "Zyni AI returned a bad response — try again." }, { status: 502 });
  }

  return NextResponse.json({ fromCache: false, card: parsed });
}