import { searchMedia } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const sort = url.searchParams.get("sort") || "POPULARITY_DESC";
  const type = url.searchParams.get("type") || "ANIME";
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 30, 50);
  const genre = url.searchParams.get("genre") || undefined;
  const format = url.searchParams.get("format") || undefined;
  const status = url.searchParams.get("status") || undefined;

  const data = await searchMedia({ search, sort, type, page, perPage, genre: genre || null, format: format || null, status: status || null });
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
