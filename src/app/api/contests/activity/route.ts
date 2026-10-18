import { getContestActivity } from "@/lib/contests";
import { NextResponse } from "next/server";

// Live ticker feed: deliberately short (20s) so the rail feels alive without
// hammering the pooler.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
};

export async function GET() {
  const activity = await getContestActivity(12);
  return NextResponse.json({ activity }, { headers: CACHE_HEADERS });
}
