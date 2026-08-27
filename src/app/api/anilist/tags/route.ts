import { getAllTags } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const data = await getAllTags();
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=600" },
  });
}
