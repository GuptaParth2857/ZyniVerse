import { searchAll } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q?.trim())
    return Response.json(
      { results: [] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );

  try {
    const data = await searchAll({ search: q.trim() });
    const results = [...data.anime, ...data.manga].slice(0, 20);
    return Response.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return Response.json(
      { results: [] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  }
}
