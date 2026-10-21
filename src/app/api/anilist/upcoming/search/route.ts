import { NextRequest } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { searchUpcoming } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

async function GET_inner(req: NextRequest) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q?.trim()) {
    return Response.json({ pageInfo: { hasNextPage: false, total: 0 }, media: [] });
  }
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 50);
  const data = await searchUpcoming(q.trim(), perPage);
  return Response.json(data);
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
