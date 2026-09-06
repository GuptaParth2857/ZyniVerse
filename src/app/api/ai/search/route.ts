import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, parseGeminiJson, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { searchMedia, bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function toCard(m: Media, reason: string): {
  id: number; title: string; poster: string | null; year: number | null;
  format: string | null; score: number | null; reason: string;
} {
  return {
    id: m.id,
    title: bestTitle(m.title),
    poster: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || null,
    year: m.startDate?.year ?? null,
    format: m.format ?? null,
    score: m.averageScore ?? null,
    reason,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use Smart Search." }, { status: 401 });
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
    return NextResponse.json({ error: "Describe what you're looking for in a sentence." }, { status: 400 });
  }

  const SYSTEM = `You are a natural-language anime search engine inside ZyniVerse.
The user wrote a normal sentence/phrase (not a title) describing what they want — e.g. "anime jisme MC weak hai par strong ban jata hai", "wholesome comedy with no fan service", "an anime about a revenge arc".
Translate it into 4-8 concrete REAL anime titles that best match, ordered by best match first.
Respond ONLY with JSON like: {"titles":["First Piece","..."],"rationale":"one-line Hinglish explanation of what you understood"}
Rules:
- Use official English or common romaji titles so they can be found on AniList.
- Never invent titles. If nothing fits, return an empty array.`;

  interface Parsed { titles?: string[]; rationale?: string }
  let parsed: Parsed | null = null;
  try {
    const text = await geminiGenerate({
      system: SYSTEM,
      prompt: query,
      json: true,
      cacheKey: aiCacheKey("smart-search", query),
    });
    parsed = parseGeminiJson<Parsed>(text);
  } catch {
    /* fall through */
  }

  const titles = (parsed?.titles ?? [])
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, 8);

  const seen = new Set<number>();
  const results: ReturnType<typeof toCard>[] = [];

  if (titles.length > 0) {
    const settled = await Promise.allSettled(titles.map((t) => searchMedia({ search: t, perPage: 1 })));
    for (const s of settled) {
      if (s.status !== "fulfilled") continue;
      const m = s.value.media[0];
      if (m && !seen.has(m.id)) {
        seen.add(m.id);
        results.push(toCard(m, "Matches what you described."));
      }
    }
  }

  // Light keyword fallback so we always return something when Gemini gave us nothing.
  if (results.length === 0) {
    try {
      const fb = await searchMedia({ search: query, perPage: 12 });
      for (const m of fb.media) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          results.push(toCard(m, "Closest keyword match."));
        }
      }
    } catch {
      /* empty results below */
    }
  }

  return NextResponse.json({
    interpreted: parsed?.rationale || titles[0] || query,
    results: results.slice(0, 12),
  });
}