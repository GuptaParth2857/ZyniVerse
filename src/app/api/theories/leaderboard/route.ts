import { NextRequest, NextResponse } from "next/server";
import { getTheoryLeaderboard } from "@/lib/theory-leaderboard";
import { logError } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") === "week" ? "week" : "all";
  const take = Math.min(Math.max(Number(req.nextUrl.searchParams.get("take")) || 25, 1), 50);

  try {
    const entries = await getTheoryLeaderboard(period, take);
    return NextResponse.json({ period, entries });
  } catch (e) {
    logError(e);
    return NextResponse.json({ period, entries: [] }, { status: 500 });
  }
}