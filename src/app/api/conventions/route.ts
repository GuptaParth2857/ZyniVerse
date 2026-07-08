import { NextRequest, NextResponse } from "next/server";
import { getConventions, getConventionsMeta } from "@/lib/conventions";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city") || undefined;
  const state = searchParams.get("state") || undefined;
  const status = (searchParams.get("status") as "upcoming" | "past" | "ongoing" | "all") || undefined;
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

  const conventions = getConventions({ city, state, status, month, year });
  const meta = getConventionsMeta();

  return NextResponse.json({ conventions, meta });
}
