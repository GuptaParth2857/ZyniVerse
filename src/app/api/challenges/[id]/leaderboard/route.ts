import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/challenges";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const challengeId = (await params).id;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const leaderboard = await getLeaderboard(challengeId, limit);

  return NextResponse.json({ leaderboard }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
