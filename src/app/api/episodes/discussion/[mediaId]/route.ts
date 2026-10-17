import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const REDDIT_SEARCH = "https://www.reddit.com/search.json";
const USER_AGENT = "ZyniVerse/1.0 (https://zyverse.in)";

// Jikan/Reddit are external and frequently slow or blocked for non-browser
// agents. Cache the (often empty) result at the CDN so repeat anime page views
// don't re-invoke this function, and always fail fast with a timeout + fallback
// instead of burning ~10s of Function Duration before throwing a 500.
const OK_CACHE = { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" };
const FAIL_CACHE = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

interface RedditChild {
  kind?: string;
  data: {
    title?: string;
    permalink?: string;
    score?: number;
    num_comments?: number;
    created_utc?: number;
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  try {
    const animeResp = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": USER_AGENT },
    });
    if (!animeResp.ok) return NextResponse.json({ discussions: [] }, { headers: OK_CACHE });

    const animeData = await animeResp.json();
    const title = animeData.data?.title || "";

    const discussionResp = await fetch(
      `${REDDIT_SEARCH}?q=${encodeURIComponent(title + " episode discussion")}&restrict_sr=anime&sort=new&limit=25`,
      { signal: AbortSignal.timeout(8000), headers: { "User-Agent": USER_AGENT } },
    );
    if (!discussionResp.ok) return NextResponse.json({ discussions: [] }, { headers: OK_CACHE });

    const redditData = await discussionResp.json();
    const discussions = (redditData.data?.children || [])
      .filter((c: RedditChild) => c.kind === "t3")
      .map((c: RedditChild) => ({
        title: c.data.title,
        url: `https://reddit.com${c.data.permalink}`,
        score: c.data.score,
        comments: c.data.num_comments,
        created: new Date((c.data.created_utc ?? 0) * 1000).toISOString(),
      }))
      .slice(0, 10);

    return NextResponse.json({ discussions }, { headers: OK_CACHE });
  } catch (e) {
    logError(e, "episode-discussion");
    return NextResponse.json({ discussions: [] }, { headers: FAIL_CACHE });
  }
}
