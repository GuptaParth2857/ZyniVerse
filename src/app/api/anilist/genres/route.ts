import { getGenres } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const data = await getGenres();
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=600" },
  });
}
