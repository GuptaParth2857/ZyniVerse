import { NextRequest, NextResponse } from "next/server";
import { searchLightNovels } from "@/lib/anilist";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return NextResponse.json({ media: [], pageInfo: { hasNextPage: false, total: 0 } });
  }

  try {
    const result = await searchLightNovels(q.trim(), 40);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[light-novels/search]", err);
    return NextResponse.json({ media: [], pageInfo: { hasNextPage: false, total: 0 }, error: "Search failed" }, { status: 502 });
  }
}
