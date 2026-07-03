import { NextRequest } from "next/server";
import { getAnimeCharacters } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { id } = await params;
  const url = new URL(req.url);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 50, 100);
  const data = await getAnimeCharacters(id, perPage);
  return Response.json(data);
}
