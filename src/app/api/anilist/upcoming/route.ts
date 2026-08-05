import { NextRequest } from "next/server";
import { getUpcomingPage } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 50);
  const data = await getUpcomingPage(page, perPage);
  return Response.json(data);
}
