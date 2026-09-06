import { getSuggestions } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q?.trim()) {
    return Response.json([], {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }
  const data = await getSuggestions(q.trim());
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
