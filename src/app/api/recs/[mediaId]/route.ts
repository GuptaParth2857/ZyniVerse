import { NextRequest, NextResponse } from "next/server";

interface JikanNameItem {
  mal_id: number;
  type: string;
  name: string;
}

interface JikanAnime {
  genres?: JikanNameItem[];
  studios?: JikanNameItem[];
  themes?: JikanNameItem[];
  source?: string;
}

interface JikanEntry {
  mal_id: number;
  title: string;
  url: string;
  source: string;
  genres?: JikanNameItem[];
  themes?: JikanNameItem[];
  studios?: JikanNameItem[];
  images?: { jpg?: { image_url?: string }; webp?: { image_url?: string } };
}

interface JikanRec {
  entry: JikanEntry;
}

// Public, non-personalised data -> safe to cache at the Vercel CDN. Without an
// explicit s-maxage every request is a MISS and a billed Node render.
const PUBLIC_CACHE = { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" };
const SHORT_CACHE = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" };

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  try {
    const [animeResp, recsResp] = await Promise.all([
      fetch(`https://api.jikan.moe/v4/anime/${id}`, { signal: AbortSignal.timeout(6000) }),
      fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`, { signal: AbortSignal.timeout(6000) }),
    ]);

    if (!animeResp.ok || !recsResp.ok) {
      return NextResponse.json({ recs: [], reason: "" }, { headers: SHORT_CACHE });
    }

    const animeData = await animeResp.json();
    const recsData = await recsResp.json();
    const anime = animeData.data as JikanAnime | null;

    const genres = new Set((anime?.genres || []).map((g: JikanNameItem) => g.name));
    const studios = new Set((anime?.studios || []).map((s: JikanNameItem) => s.name));
    const source = anime?.source || "";
    const themes = new Set((anime?.themes || []).map((t: JikanNameItem) => t.name));

    const recs = (recsData.data || []).slice(0, 8).map((r: JikanRec) => {
      const entry = r.entry;
      const reasons: string[] = [];
      const entryGenres = new Set((entry.genres || []).map((g: JikanNameItem) => g.name));
      const entryThemes = new Set((entry.themes || []).map((t: JikanNameItem) => t.name));

      const sharedGenres = [...genres].filter((g) => entryGenres.has(g));
      if (sharedGenres.length > 0) reasons.push(`Same ${sharedGenres.slice(0, 2).join(", ")} genre`);

      const sharedStudios = [...studios].filter((s) => entryGenres.has(s));
      if (sharedStudios.length > 0 || entry.studios?.some((s: JikanNameItem) => studios.has(s.name))) {
        reasons.push("Same studio");
      }

      if (source && entry.source === source) reasons.push(`Same source (${source})`);
      const sharedThemes = [...themes].filter((t) => entryThemes.has(t));
      if (sharedThemes.length > 0) reasons.push(`Shares ${sharedThemes[0]} theme`);

      return {
        malId: entry.mal_id,
        title: entry.title,
        image: entry.images?.jpg?.image_url || entry.images?.webp?.image_url,
        url: entry.url,
        reason: reasons[0] || "Similar taste",
        allReasons: reasons,
      };
    });

    return NextResponse.json({ recs, total: recs.length }, { headers: PUBLIC_CACHE });
  } catch {
    // Jikan is frequently rate-limited or slow. Never hang the function (previously
    // ~11s then a 500) — return cheap and briefly cache the empty result so the
    // retry storm doesn't keep re-invoking the function.
    return NextResponse.json({ recs: [], reason: "" }, { headers: SHORT_CACHE });
  }
}
