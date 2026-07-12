import { NextRequest, NextResponse } from "next/server";

const CACHE = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

interface EpisodeData {
  episode: number;
  title: string;
  rating: number | null;
  replies: number;
  filler: boolean;
  recap: boolean;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

async function fetchMalEpisodes(malId: number, page: number): Promise<EpisodeData[]> {
  const url = `https://myanimelist.net/anime/${malId}/episode${page > 1 ? `?page=${page}` : ""}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return [];

  const html = await res.text();
  const rows = html.match(/<tr class="episode-list-data">[\s\S]*?<\/tr>/g) || [];

  return rows.map((row) => {
    const epNum = row.match(/episode-number.*?data-raw="(\d+)"/);
    const titleMatch = row.match(/class="fl-l fw-b ">(.*?)<\/a>/);
    const ratingMatch = row.match(/episode-poll.*?data-raw="(\d+\.?\d*)"/);
    const repliesMatch = row.match(/episode-forum.*?data-raw="(\d+)"/);
    const isFiller = /icon-episode-type-bg">Filler/.test(row);
    const isRecap = /icon-episode-type-bg">Recap/.test(row);

    return {
      episode: epNum ? parseInt(epNum[1]) : 0,
      title: titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "",
      rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
      replies: repliesMatch ? parseInt(repliesMatch[1]) : 0,
      filler: isFiller,
      recap: isRecap,
    };
  }).filter((ep) => ep.episode > 0);
}

async function fetchAllMalEpisodes(malId: number): Promise<EpisodeData[]> {
  const allEpisodes: EpisodeData[] = [];
  let page = 1;

  while (page <= 50) {
    const eps = await fetchMalEpisodes(malId, page);
    if (eps.length === 0) break;
    allEpisodes.push(...eps);
    if (eps.length < 100) break;
    page++;
    await new Promise((r) => setTimeout(r, 500));
  }

  return allEpisodes;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const malId = parseInt(id, 10);
  if (isNaN(malId)) {
    return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
  }

  const cacheKey = `mal-episodes-${malId}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const episodes = await fetchAllMalEpisodes(malId);
    const rated = episodes.filter((e) => e.rating !== null);
    const avgScore = rated.length > 0
      ? Math.round((rated.reduce((s, e) => s + (e.rating || 0), 0) / rated.length) * 100) / 100
      : 0;
    const totalReplies = episodes.reduce((s, e) => s + e.replies, 0);

    const result = {
      episodes,
      totalEpisodes: episodes.length,
      ratedCount: rated.length,
      averageScore: avgScore,
      totalReplies,
    };

    CACHE.set(cacheKey, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch episode data from MAL" },
      { status: 502 }
    );
  }
}
