import { searchCharacters } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 20, 50);
  const data = await searchCharacters(q, page, perPage);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
