import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { searchLightNovels } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

async function GET_inner(req: NextRequest) {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
