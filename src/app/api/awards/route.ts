import { NextRequest, NextResponse } from "next/server";
import { getLiveAwards, AWARD_YEARS, getAwardsByYear, CRUNCHYROLL_AWARDS } from "@/lib/awards-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");

  if (yearParam) {
    const year = parseInt(yearParam, 10);
    if (isNaN(year)) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

    try {
      const live = await getLiveAwards();
      const liveYear = live.filter((a) => a.year === year);
      if (liveYear.length > 0) return NextResponse.json({ awards: liveYear, source: "live" });
    } catch {}

    const staticData = getAwardsByYear(year);
    return NextResponse.json({ awards: staticData, source: "static" });
  }

  try {
    const live = await getLiveAwards();
    return NextResponse.json({
      awards: live,
      years: [...new Set(live.map((a) => a.year))].sort((a, b) => b - a),
      source: "live",
    });
  } catch {
    return NextResponse.json({
      awards: CRUNCHYROLL_AWARDS,
      years: AWARD_YEARS,
      source: "static",
    });
  }
}
