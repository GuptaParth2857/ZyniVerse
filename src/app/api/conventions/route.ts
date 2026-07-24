import { NextRequest, NextResponse } from "next/server";
import { getConventions } from "@/lib/conventions";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city") || undefined;
  const state = searchParams.get("state") || undefined;
  const status = (searchParams.get("status") as "upcoming" | "past" | "ongoing" | "all") || undefined;
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

  const conventions = await getConventions({ city, state, status, month, year });

  return NextResponse.json({ conventions });
}
