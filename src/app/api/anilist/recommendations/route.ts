import { getRecommendationsByGenres } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const genre = url.searchParams.get("genre") || "";
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 18, 50);
  if (!genre) {
    return Response.json([], {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }
  const data = await getRecommendationsByGenres([genre], perPage);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
