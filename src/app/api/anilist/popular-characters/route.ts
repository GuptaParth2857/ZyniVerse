import { NextRequest } from "next/server";
import { getPopularCharacters, AniListUnavailableError } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 100);
  try {
    const data = await getPopularCharacters(page, perPage);
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    // Degraded only for this one key — the stale-cache lookup inside getPopularCharacters
    // already failed, so there is nothing to fall back to. Serve the empty shape the
    // client expects and keep it out of the CDN, so the next request retries live.
    if (err instanceof AniListUnavailableError) {
      return Response.json(
        { pageInfo: { total: 0, hasNextPage: false }, characters: [] },
        { headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
      );
    }
    return Response.json(
      { pageInfo: { total: 0, hasNextPage: false }, characters: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
