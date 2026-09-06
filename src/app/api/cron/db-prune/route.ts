import { NextResponse } from "next/server";
import { pruneLogs, pruneAniListCacheToCap } from "@/lib/db-prune";

export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anilistCap = await pruneAniListCacheToCap();
  const logs = await pruneLogs();

  return NextResponse.json({
    prunedAt: new Date().toISOString(),
    anilistCache: anilistCap,
    logs,
  });
}
