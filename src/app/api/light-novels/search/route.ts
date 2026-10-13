import { NextRequest, NextResponse } from "next/server";
import { searchLightNovels } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return NextResponse.json({ media: [], pageInfo: { hasNextPage: false, total: 0 } });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const genre = req.nextUrl.searchParams.get("genre") || null;

  try {
    const result = await searchLightNovels(q.trim(), 40, page, genre);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[light-novels/search]", err);
    return NextResponse.json({ media: [], pageInfo: { hasNextPage: false, total: 0 }, error: "Search failed" }, { status: 502 });
  }
}
