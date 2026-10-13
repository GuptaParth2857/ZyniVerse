import { getLightNovelTrending, getLightNovelPopular, getLightNovelTopRated } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "trending";
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 24, 50);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const genre = url.searchParams.get("genre") || null;

  const fetchers: Record<string, (p?: number, pg?: number, g?: string | null) => Promise<unknown>> = {
    trending: getLightNovelTrending,
    popular: getLightNovelPopular,
    top: getLightNovelTopRated,
  };

  const fetcher = fetchers[tab] || getLightNovelTrending;
  const data = await fetcher(perPage, page, genre);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
