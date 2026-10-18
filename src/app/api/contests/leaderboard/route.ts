import { getContestLeaderboard } from "@/lib/contests";
import { NextResponse } from "next/server";

// Standings shift slowly (only when votes land), so a short shared cache keeps
// the leaderboard off the database for most views.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
};

export async function GET() {
  const rows = await getContestLeaderboard(25);
  return NextResponse.json({ rows }, { headers: CACHE_HEADERS });
}
