import { getPopular } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 100);
  const data = await getPopular(perPage);
  return Response.json(data);
}
