import { NextRequest } from "next/server";
import { getPopularCharacters } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 100);
  try {
    const data = await getPopularCharacters(page, perPage);
    return Response.json(data);
  } catch {
    return Response.json({ pageInfo: { total: 0, hasNextPage: false }, characters: [] });
  }
}
