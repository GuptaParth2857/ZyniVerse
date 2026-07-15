import { NextRequest, NextResponse } from "next/server";
import { getUserLeaderboard } from "@/lib/leaderboard";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
    const offset = Number(url.searchParams.get("offset")) || 0;
    const result = await getUserLeaderboard(limit, offset);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/leaderboard] error:", error);
    return NextResponse.json({ entries: [], total: 0 });
  }
}
