import { getContestHistory } from "@/lib/contests";
import { NextResponse } from "next/server";

// Public archive. Winners only change once a week (when a contest finalizes),
// so a 5 minute shared cache costs nothing and keeps the page snappy.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
};

export async function GET() {
  const history = await getContestHistory(60);
  return NextResponse.json({ contests: history }, { headers: CACHE_HEADERS });
}
