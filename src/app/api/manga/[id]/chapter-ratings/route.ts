import { NextRequest, NextResponse } from "next/server";

const CACHE = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

async function fetchMangaDexStats(mangaId: number): Promise<{ average: number; bayesian: number; follows: number } | null> {
  try {
    const res = await fetch(`https://api.mangadex.org/statistics/manga/${mangaId}`, {
      headers: { "User-Agent": "ZyniVerse/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      average: data.statistics?.rating?.average || 0,
      bayesian: data.statistics?.rating?.bayesian || 0,
      follows: data.statistics?.follows || 0,
    };
  } catch {
    return null;
  }
}

async function fetchMalMangaInfo(malId: number): Promise<{ magazine: string; publisher: string; serialization: string } | null> {
  try {
    const url = `https://myanimelist.net/manga/${malId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const magazineMatch = html.match(/Magazine:<\/span>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
    const publisherMatch = html.match(/Serialization:<\/span>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
    return {
      magazine: magazineMatch ? decodeHtmlEntities(magazineMatch[1].trim()) : "",
      publisher: publisherMatch ? decodeHtmlEntities(publisherMatch[1].trim()) : "",
      serialization: publisherMatch ? decodeHtmlEntities(publisherMatch[1].trim()) : "",
    };
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mangaId = parseInt(id, 10);
  if (isNaN(mangaId)) {
    return NextResponse.json({ error: "Invalid manga ID" }, { status: 400 });
  }

  const cacheKey = `manga-ratings-${mangaId}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const [mangadexStats, malInfo] = await Promise.all([
      fetchMangaDexStats(mangaId),
      fetchMalMangaInfo(mangaId),
    ]);

    const result = {
      mangadex: mangadexStats,
      mal: malInfo,
    };

    CACHE.set(cacheKey, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch manga data" },
      { status: 502 }
    );
  }
}
