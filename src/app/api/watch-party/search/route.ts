import { NextRequest, NextResponse } from "next/server";
import { searchMedia, bestTitle } from "@/lib/anilist";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const result = await searchMedia({ search: q, perPage: 8, type: "ANIME" });
    return NextResponse.json({
      results: result.media.map((a) => ({
        id: a.idMal || a.id,
        title: bestTitle(a.title),
        image: a.coverImage?.large || a.coverImage?.medium || null,
        episodes: a.episodes || null,
        status: a.status || null,
        year: a.startDate?.year || null,
      })),
    });
  } catch (e) {
    console.error("[/api/watch-party/search] error:", e);
    return NextResponse.json({ results: [], error: "Search failed" });
  }
}
