import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/jikan";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchAnime(q);
    return NextResponse.json({
      results: results.map((a) => ({
        id: a.mal_id,
        title: a.title,
        image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
        episodes: a.episodes || null,
        status: a.status || null,
        year: a.year || null,
      })),
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
