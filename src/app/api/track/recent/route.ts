import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getRecentlyWatched, getWatchStreak } from "@/lib/episode-tracking";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [episodes, streak] = await Promise.all([
    getRecentlyWatched(session.user.id),
    getWatchStreak(session.user.id),
  ]);

  return NextResponse.json({ episodes, streak });
}
