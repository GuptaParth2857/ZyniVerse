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
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Number(url.searchParams.get("perPage")) || 25, 25);
  const data = await getAnimeCharacters(id, page, perPage);
  return Response.json(data);
}
