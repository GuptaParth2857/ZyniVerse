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

  const SYSTEM = `Convert the user's mood/vibe description into an AniList anime search.
Respond ONLY with JSON:
{"search": "2-6 word keyword string best for AniList text search", "genre": one of [${GENRES.join(", ")}] or null}
Prefer genre that matches the mood; keep "search" concrete (themes, settings, tropes), not the mood words themselves.`;

  interface VibeQuery {
    search?: string;
    genre?: string | null;
  }

  let vibe: VibeQuery = { search: query, genre: null };
  try {
    const text = await geminiGenerate({
      system: SYSTEM,
      prompt: query,
      json: true,
      cacheKey: aiCacheKey("vibe", query),
    });
    const parsed = parseGeminiJson<VibeQuery>(text);
    if (parsed?.search) vibe = parsed;
  } catch {
    // fallback: raw text search below
  }

  const genre = vibe.genre && GENRES.includes(vibe.genre) ? vibe.genre : null;
  let results;
  try {
    results = await searchMedia({
      search: vibe.search || query,
      genre,
      sort: "POPULARITY_DESC",
      perPage: 18,
    });
  } catch {
    return NextResponse.json({ error: "Search failed, try again shortly." }, { status: 502 });
  }

  return NextResponse.json({
    interpreted: { search: vibe.search || query, genre },
    results: results.media.slice(0, 18).map((m) => ({
      id: m.id,
      title: bestTitle(m.title),
      poster: m.coverImage?.large ?? null,
      year: m.startDate?.year ?? null,
      format: m.format ?? null,
      score: m.averageScore ?? null,
    })),
  });
}
