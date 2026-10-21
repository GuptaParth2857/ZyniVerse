import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getAllArtists } from "@/lib/ost";
import { apiLimiter } from "@/lib/rate-limiter";

async function GET_inner(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const artists = getAllArtists();
  return NextResponse.json({ artists });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
