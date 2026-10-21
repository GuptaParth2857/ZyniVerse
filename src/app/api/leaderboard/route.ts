import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getUserLeaderboard } from "@/lib/leaderboard";
export const dynamic = "force-dynamic";

async function GET_inner(req: NextRequest) {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
