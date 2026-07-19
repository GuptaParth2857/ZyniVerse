import { NextRequest, NextResponse } from "next/server";
import { getOSTs } from "@/lib/ost";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const artist = searchParams.get("artist") || undefined;
  const animeId = searchParams.get("animeId") ? Number(searchParams.get("animeId")) : undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  const results = getOSTs(search, type, artist, animeId);
  const total = results.length;

  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  return NextResponse.json({ osts: paginated, total, page, limit });
}
