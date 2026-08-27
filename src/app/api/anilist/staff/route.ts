import { searchStaff, getPopularStaff } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 12, 50);

  if (q?.trim()) {
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const data = await searchStaff(q.trim(), page, perPage);
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  }

  const data = await getPopularStaff(perPage);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
