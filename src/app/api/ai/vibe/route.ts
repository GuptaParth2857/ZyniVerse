import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, parseGeminiJson, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { searchMedia, bestTitle } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
  "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller",
];

type MediaLike = Awaited<ReturnType<typeof searchMedia>>["media"][number];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use Zyni AI." }, { status: 401 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  const { q } = (await req.json()) as { q?: string };
  const query = q?.trim();
  if (!query || query.length < 3 || query.length > 200) {
    return NextResponse.json({ error: "Describe the vibe in a few words." }, { status: 400 });
  }

  // AniList's full-text search chokes on abstract vibe phrases ("cozy healing
  // anime" → 0 results), so ask Gemini for REAL titles instead and resolve
  // them one-by-one — same strategy as /api/ai/chat recommendations.
  const SYSTEM = `You are an anime recommendation engine inside ZyniVerse.
Convert the user's mood/vibe description into concrete anime recommendations.
Respond ONLY with JSON:
{"titles": ["Exact Real Anime Title", "..."], "genre": one of [${GENRES.join(", ")}] or null}
Rules:
- Include 4-8 REAL existing anime titles that best match the vibe, ordered by best match first.
- Use official English or common romaji titles so they can be found on AniList.
- Never invent titles.`;

  interface VibeQuery {
    titles?: string[];
    genre?: string | null;
  }

  let parsed: VibeQuery | null = null;
  try {
    const text = await geminiGenerate({
      system: SYSTEM,
      prompt: query,
      json: true,
      cacheKey: aiCacheKey("vibe", query),
    });
    parsed = parseGeminiJson<VibeQuery>(text);
  } catch {
    // fall through to keyword search below
  }

  const genre =
    parsed?.genre && GENRES.includes(parsed.genre) ? parsed.genre : null;
  const titles = (parsed?.titles ?? [])
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, 8);

  let media: MediaLike[] = [];
  const seen = new Set<number>();

  if (titles.length > 0) {
    const settled = await Promise.allSettled(
      titles.map((t) => searchMedia({ search: t, perPage: 1 }))
    );
    for (const s of settled) {
      if (s.status !== "fulfilled") continue;
      const m = s.value.media[0];
      if (m && !seen.has(m.id)) {
        seen.add(m.id);
        media.push(m);
      }
    }
  }

  // Too few resolved → back up with a genre browse (always yields results).
  if (media.length < 3) {
    try {
      const backup = await searchMedia({
        search: "",
        genre,
        sort: genre ? "SCORE_DESC" : "POPULARITY_DESC",
        perPage: 18,
      });
      for (const m of backup.media) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          media.push(m);
        }
      }
    } catch {
      /* ignore — final fallback below */
    }
  }

  // Last resort: raw text search with whatever the user typed.
  if (media.length === 0) {
    try {
      const last = await searchMedia({ search: query, perPage: 18 });
      media = last.media;
    } catch {
      return NextResponse.json({ error: "Search failed, try again shortly." }, { status: 502 });
    }
  }

  return NextResponse.json({
    interpreted: {
      search: titles[0] ?? query,
      genre,
    },
    results: media.slice(0, 18).map((m) => ({
      id: m.id,
      title: bestTitle(m.title),
      poster: m.coverImage?.large ?? null,
      year: m.startDate?.year ?? null,
      format: m.format ?? null,
      score: m.averageScore ?? null,
    })),
  });
}
