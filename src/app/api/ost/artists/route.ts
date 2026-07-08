import { NextRequest, NextResponse } from "next/server";
import { getAllArtists } from "@/lib/ost";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const artists = getAllArtists();
  return NextResponse.json({ artists });
}
