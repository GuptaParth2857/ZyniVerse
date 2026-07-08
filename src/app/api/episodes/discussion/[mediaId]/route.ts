import { NextRequest, NextResponse } from "next/server";

const REDDIT_SEARCH = "https://www.reddit.com/search.json";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const animeResp = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
  if (!animeResp.ok) return NextResponse.json({ discussions: [] });

  const animeData = await animeResp.json();
  const title = animeData.data?.title || "";

  const discussionResp = await fetch(
    `${REDDIT_SEARCH}?q=${encodeURIComponent(title + " episode discussion")}&restrict_sr=anime&sort=new&limit=25`
  );
  if (!discussionResp.ok) return NextResponse.json({ discussions: [] });

  const redditData = await discussionResp.json();
  const discussions = (redditData.data?.children || [])
    .filter((c: any) => c.kind === "t3")
    .map((c: any) => ({
      title: c.data.title,
      url: `https://reddit.com${c.data.permalink}`,
      score: c.data.score,
      comments: c.data.num_comments,
      created: new Date(c.data.created_utc * 1000).toISOString(),
    }))
    .slice(0, 10);

  return NextResponse.json({ discussions });
}
