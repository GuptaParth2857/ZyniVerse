import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";

// Jikan is slow/flaky and this route is hit on every anime detail view. Cache
// the successful payload hard at the CDN (no ISR write) so repeat views never
// invoke the function; a failed upstream gets a short TTL so it retries soon.
const SUCCESS_CACHE = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };
const FAILURE_CACHE = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
const UPSTREAM_TIMEOUT_MS = 8000;
const USER_AGENT = "ZyniVerse/1.0 (https://zyverse.in)";

interface JikanNamedItem {
  name: string;
}

interface JikanExternalLink {
  name: string;
  url: string;
}

interface JikanRelationEntry {
  mal_id: number;
  name: string;
  type: string;
}

interface JikanRelation {
  relation: string;
  entry: JikanRelationEntry[];
}

interface JikanAnimeFull {
  data: {
    broadcast?: { string?: string | null };
    licensors?: JikanNamedItem[];
    producers?: JikanNamedItem[];
    rating?: string | null;
    demographics?: JikanNamedItem[];
    duration?: string | null;
    season?: string | null;
    year?: number | null;
    synopsis?: string | null;
    background?: string | null;
    external?: JikanExternalLink[];
    relations?: JikanRelation[];
    theme?: { openings?: string[]; endings?: string[] } | string;
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  let data: JikanAnimeFull | null = null;
  try {
    const resp = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`, {
      // Without a timeout a stalled Jikan call burned ~10s of Function Duration
      // on every anime page view before failing.
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { "User-Agent": USER_AGENT },
    });
    if (resp.ok) data = (await resp.json()) as JikanAnimeFull;
  } catch (e) {
    logError(e, "anime-metadata");
  }
  if (!data?.data) {
    return NextResponse.json({ metadata: null }, { headers: FAILURE_CACHE });
  }

  const d = data.data;
  const themeData = typeof d.theme === "string" ? null : d.theme;

  const metadata = {
    broadcast: d.broadcast?.string || null,
    licensors: (d.licensors || []).map((l) => l.name),
    producers: (d.producers || []).map((p) => p.name),
    rating: d.rating || null,
    demographics: (d.demographics || []).map((dm) => dm.name),
    duration: d.duration || null,
    season: d.season || null,
    year: d.year || null,
    synopsis: d.synopsis || null,
    background: d.background || null,
    external: (d.external || []).map((e) => ({ name: e.name, url: e.url })),
    relations: (d.relations || []).map((r) => ({
      relation: r.relation,
      entries: (r.entry || []).map((en) => ({ malId: en.mal_id, name: en.name, type: en.type })),
    })),
    theme: d.theme ? (typeof d.theme === "string" ? d.theme : JSON.stringify(d.theme)) : null,
    openings: (themeData?.openings || []).slice(0, 5),
    endings: (themeData?.endings || []).slice(0, 5),
  };

  return NextResponse.json({ metadata }, { headers: SUCCESS_CACHE });
}
