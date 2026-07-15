import { NextResponse } from "next/server";
import { getRecentlyWatched, getWatchStreak } from "@/lib/episode-tracking";
import { resolveUserId } from "@/lib/resolve-user";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ episodes: [], streak: { current: 0, longest: 0 } });

  const [episodes, streak] = await Promise.all([
    getRecentlyWatched(userId),
    getWatchStreak(userId),
  ]);

  return NextResponse.json({ episodes, streak });
}
