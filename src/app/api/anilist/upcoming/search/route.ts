import { NextRequest } from "next/server";
import { searchUpcoming } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = anilistLimiter.middleware(req);
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
