import { getTrending } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
import { anilistRoute } from "@/lib/anilist-route";
export const dynamic = "force-dynamic";

export const GET = anilistRoute(async (req) => {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 18, 50);
  const data = await getTrending(perPage);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
});
