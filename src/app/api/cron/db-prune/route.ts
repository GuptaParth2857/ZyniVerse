import { NextResponse } from "next/server";
import { pruneLogs, pruneAniListCacheToCap, pruneBotCounters } from "@/lib/db-prune";

export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anilistCap = await pruneAniListCacheToCap();
  const logs = await pruneLogs();
  // Bot counter keys (one per bot x path) have no other cleanup path.
  const botCounters = await pruneBotCounters();

  return NextResponse.json({
    prunedAt: new Date().toISOString(),
    anilistCache: anilistCap,
    botCounters,
    logs,
  });
}
