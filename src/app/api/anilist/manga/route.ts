import { getMangaTrending, getMangaPopular, getMangaTopRated } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "trending";
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 24, 50);

  const fetchers: Record<string, (p?: number) => Promise<unknown>> = {
    trending: getMangaTrending,
    popular: getMangaPopular,
    top: getMangaTopRated,
  };

  const fetcher = fetchers[tab] || getMangaTrending;
  const data = await fetcher(perPage);
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
