import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/challenges";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const challengeId = (await params).id;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const leaderboard = await getLeaderboard(challengeId, limit);

  return NextResponse.json({ leaderboard });
}
