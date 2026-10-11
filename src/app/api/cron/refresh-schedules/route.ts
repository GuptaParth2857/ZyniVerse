import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllEpgFromPw } from "@/lib/epg-pw";
import { pruneLogs, pruneAniListCacheToCap } from "@/lib/db-prune";

export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; status: number; detail?: string }[] = [];

  // 1. Fetch EPG data from epg.pw (free, works from any IP — no datacenter blocking)
  try {
    const epgData = await fetchAllEpgFromPw();

    for (const entry of epgData) {
      if (!entry.channelId || Object.keys(entry.days).length === 0) continue;
      const jsonData = JSON.parse(JSON.stringify(entry.days));
      await prisma.epgCache.upsert({
        where: { channelId: entry.channelId },
        update: { data: jsonData },
        create: { channelId: entry.channelId, data: jsonData },
      });
    }
    results.push({ task: "epg-cache", status: 200, detail: `${epgData.length} channels cached from epg.pw` });
  } catch (error) {
    results.push({ task: "epg-cache", status: 500, detail: error instanceof Error ? error.message : "Failed" });
  }

  // 2. Animax is now cached by the epg.pw step above (EPG_PW_MAP → animax),
  //    so no hardcoded Animax grid is written here anymore.

  // 3. Warm caches
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  const routes = ["/api/tv-schedule/live", "/api/airing/live"];

  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
        next: { revalidate: 0 },
      });
      results.push({ task: `warm:${route}`, status: res.status });
    } catch {
      results.push({ task: `warm:${route}`, status: 500 });
    }
  }

  // 4. Prune stale/oversized caches + old log rows (keeps DB under Supabase quota)
  try {
    const [anilistAge, podcast, anilistCap] = await Promise.all([
      prisma.aniListCache
        .deleteMany({ where: { updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        .then((r) => r.count)
        .catch(() => 0),
      prisma.podcastCache
        .deleteMany({ where: { updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        .then((r) => r.count)
        .catch(() => 0),
      pruneAniListCacheToCap(),
    ]);
    const logs = await pruneLogs();
    const logTotals = Object.values(logs).reduce((a, b) => a + b, 0);
    results.push({
      task: "cache-prune",
      status: 200,
      detail:
        `AniListCache -${anilistAge} (age), cap -${anilistCap.deleted} (now ${anilistCap.total}), ` +
        `PodcastCache -${podcast}, logs -${logTotals} (older than 45d)`,
    });
  } catch (error) {
    results.push({
      task: "cache-prune",
      status: 500,
      detail: error instanceof Error ? error.message : "Failed to prune caches",
    });
  }

  // 5. Update live-action anime data
  try {
    const { fetchLiveActionUpdates } = await import("@/lib/live-action-updater");
    const updateResult = await fetchLiveActionUpdates();
    const updatedCount = Object.values(updateResult.updates).length;
    results.push({
      task: "live-action-updates",
      status: 200,
      detail: `${updatedCount} titles checked, cache updated at ${updateResult.lastUpdated}`,
    });
  } catch (error) {
    results.push({
      task: "live-action-updates",
      status: 500,
      detail: error instanceof Error ? error.message : "Failed to update live-action data",
    });
  }

  // 6. Sync live-action catalog from Wikipedia (+ AniList enrichment)
  try {
    const { syncLiveActionCatalog } = await import("@/lib/live-action-catalog");
    const catalogResult = await syncLiveActionCatalog();
    results.push({
      task: "live-action-catalog-sync",
      status: 200,
      detail: `${catalogResult.total} titles, +${catalogResult.added} new, ${catalogResult.enriched} enriched`,
    });
  } catch (error) {
    results.push({
      task: "live-action-catalog-sync",
      status: 500,
      detail: error instanceof Error ? error.message : "Failed to sync live-action catalog",
    });
  }

  return NextResponse.json({ refreshedAt: new Date().toISOString(), results });
}
