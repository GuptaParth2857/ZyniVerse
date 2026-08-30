import { getAiringSchedule } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const from = Number(url.searchParams.get("from")) || 0;
  const to = Number(url.searchParams.get("to")) || 0;
  if (!from || !to) {
    return Response.json([], {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }
  const data = await getAiringSchedule(from, to);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
