import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllEpgFromPw, getEpgPwChannelIds } from "@/lib/epg-pw";
import { pruneLogs, pruneAniListCacheToCap } from "@/lib/db-prune";
import { createCronBudget, cronJson, readStep } from "@/lib/cron-chunk";

export const revalidate = 0;
export const maxDuration = 60;

/**
 * This job used to do everything in one invocation (EPG grid, cache warming,
 * cache pruning, live-action refresh) and regularly blew past the 60s function
 * cap, so Vercel killed it and the caller saw a 504. It now runs exactly one
 * step per invocation; the GitHub Actions scheduler follows `nextQuery` until
 * the whole job is done.
 */
const EPG_CHANNELS_PER_STEP = 4;
const EPG_STEPS = Math.max(1, Math.ceil(getEpgPwChannelIds().length / EPG_CHANNELS_PER_STEP));

const STEPS = [
  ...Array.from({ length: EPG_STEPS }, (_, i) => `epg:${i}`),
  "warm",
  "prune",
  "live-action-updates",
  "live-action-catalog",
];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const step = readStep(url.searchParams.get("step"), STEPS.length - 1);
  const task = STEPS[step];
  const budget = createCronBudget();
  const results: { task: string; status: number; detail?: string }[] = [];

  if (task.startsWith("epg:")) {
    // 1. Cache the EPG grid from epg.pw a few channels at a time.
    const chunk = Number(task.slice("epg:".length));
    const from = chunk * EPG_CHANNELS_PER_STEP;
    const to = from + EPG_CHANNELS_PER_STEP;
    try {
      const epgData = await fetchAllEpgFromPw({ from, to });
      let cached = 0;
      for (const entry of epgData) {
        if (!entry.channelId || Object.keys(entry.days).length === 0) continue;
        const jsonData = JSON.parse(JSON.stringify(entry.days));
        await prisma.epgCache.upsert({
          where: { channelId: entry.channelId },
          update: { data: jsonData },
          create: { channelId: entry.channelId, data: jsonData },
        });
        cached++;
      }
      results.push({
        task,
        status: 200,
        detail: `${cached}/${epgData.length} channels cached (index ${from}-${to}) from epg.pw`,
      });
    } catch (error) {
      results.push({ task, status: 500, detail: error instanceof Error ? error.message : "Failed" });
    }
  } else if (task === "warm") {
    // 2. Animax is cached by the epg.pw steps above (EPG_PW_MAP → animax), so
    //    no hardcoded Animax grid is written here anymore. Just warm caches.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
    for (const route of ["/api/tv-schedule/live", "/api/airing/live"]) {
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
  } else if (task === "prune") {
    // 2. Prune stale/oversized caches + old log rows (keeps DB under Supabase quota)
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
  } else if (task === "live-action-updates") {
    // 3. Update live-action anime data
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
  } else {
    // 4. Update live-action anime data from Wikipedia
    try {
      const { syncLiveActionCatalog } = await import("@/lib/live-action-catalog");
      const syncResult = await syncLiveActionCatalog();
      results.push({
        task: "live-action-catalog",
        status: 200,
        detail: `${syncResult.total} titles, +${syncResult.added} new, ${syncResult.enriched} enriched`,
      });
    } catch (error) {
      results.push({
        task: "live-action-catalog",
        status: 500,
        detail: error instanceof Error ? error.message : "Failed to sync live-action catalog",
      });
    }
  }

  const nextQuery = step + 1 < STEPS.length ? `step=${step + 1}` : null;
  return cronJson(
    {
      ok: results.every((r) => r.status < 500),
      task,
      step,
      steps: STEPS.length,
      elapsedMs: budget.elapsedMs(),
      results,
    },
    nextQuery
  );
}
