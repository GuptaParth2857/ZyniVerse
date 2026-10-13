import { getMangaTrending, getMangaPopular, getMangaTopRated } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "trending";
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 24, 50);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const type = url.searchParams.get("type");

  const fetchers: Record<
    string,
    (p?: number, pg?: number, t?: string | null) => Promise<unknown>
  > = {
    trending: getMangaTrending,
    popular: getMangaPopular,
    top: getMangaTopRated,
  };

  const fetcher = fetchers[tab] || getMangaTrending;
  try {
    const data = await fetcher(perPage, page, type);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    // AniList is rate-limited or down. Surface a retryable status (instead of
    // a 500) so the client can show its "try again" state.
    return Response.json(
      { error: "Manga catalog is temporarily unavailable. Please try again." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store", "Retry-After": "30" },
      },
    );
  }
}
