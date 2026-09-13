import { getSeasonal } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const year = url.searchParams.get("year") ? Number(url.searchParams.get("year")) : undefined;
  const season = url.searchParams.get("season") || undefined;
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 100);
  const data = await getSeasonal(year, season, perPage);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
