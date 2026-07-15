import { NextRequest, NextResponse } from "next/server";
import { getAwardsForYear, AWARD_CATEGORIES, createAwardCycle } from "@/lib/zyni-awards";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");

  if (yearParam) {
    const year = Number(yearParam);
    if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    const awards = await getAwardsForYear(year);
    return NextResponse.json({ year, awards });
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  return NextResponse.json({ years, categories: AWARD_CATEGORIES });
}
