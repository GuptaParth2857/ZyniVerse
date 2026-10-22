import { prisma } from "@/lib/prisma";

/**
 * Retention (in days) for high-volume log/analytics tables. Older rows are
 * deleted to keep the database (and Supabase free-tier quota) bounded.
 *
 * These windows are deliberately SHORT. The raw tables are analytics-only —
 * the aggregated RetentionMetric/dashboard values are what matter — and the
 * crawler traffic that reached this site peaked at ~19.6k sessions/day
 * (2026-10-19). At that rate a 45-day window alone puts UserSession at
 * ~390 MB, i.e. most of the 500 MB Supabase free-tier database cap.
 *
 * Sessions and page views are the two fastest growers (54.8 MB + 8 MB) and
 * are the least valuable historically, so they get the shortest window.
 */
export const SESSION_RETENTION_DAYS = 14;
export const PAGEVIEW_RETENTION_DAYS = 14;
export const AD_RETENTION_DAYS = 30;
export const ACTIVITY_RETENTION_DAYS = 30;
export const SEARCH_LOG_RETENTION_DAYS = 30;
/**
 * Bot counter keys live in `SiteCounter` as `bot:day:*`, `bot:path:*` and
 * `bot:country:*`. There is one key per (bot, path) pair, so a crawler fleet
 * adds tens of thousands of keys a week and nothing ever removed them
 * (21,122 keys / 4.9 MB and counting). `updatedAt` is bumped on every upsert,
 * so an age-based TTL is exact.
 */
export const BOT_COUNTER_RETENTION_DAYS = 30;

/** Mirrors `BOT_KEY_PREFIX` in src/lib/bot-stats.ts (kept local to avoid an import cycle). */
const BOT_KEY_PREFIX = "bot:";

function cutoff(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Prune high-volume log tables that grow unbounded. These rows are analytics
 * only — the aggregated RetentionMetric/dashboard values are what matter, so
 * trimming raw rows does not affect product functionality.
 */
export async function pruneLogs(): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {};

  const [pageView, sessions, activity, adImpression, searchLog] = await Promise.all([
    prisma.pageView
      .deleteMany({ where: { createdAt: { lt: cutoff(PAGEVIEW_RETENTION_DAYS) } } })
      .then((r) => r.count),
    prisma.userSession
      .deleteMany({ where: { startedAt: { lt: cutoff(SESSION_RETENTION_DAYS) } } })
      .then((r) => r.count),
    prisma.userActivity
      .deleteMany({ where: { createdAt: { lt: cutoff(ACTIVITY_RETENTION_DAYS) } } })
      .then((r) => r.count),
    prisma.adImpression
      .deleteMany({ where: { createdAt: { lt: cutoff(AD_RETENTION_DAYS) } } })
      .then((r) => r.count),
    prisma.searchLog
      .deleteMany({ where: { createdAt: { lt: cutoff(SEARCH_LOG_RETENTION_DAYS) } } })
      .then((r) => r.count),
  ]);

  deleted.pageView = pageView;
  deleted.userSession = sessions;
  deleted.userActivity = activity;
  deleted.adImpression = adImpression;
  deleted.searchLog = searchLog;

  return deleted;
}

/**
 * Drop bot counter keys that have not been touched for
 * `BOT_COUNTER_RETENTION_DAYS`. Only `bot:*` keys are touched — the
 * all-time `pageviews` counter lives in the same table and must survive.
 */
export async function pruneBotCounters(): Promise<number> {
  try {
    const res = await prisma.siteCounter.deleteMany({
      where: {
        key: { startsWith: BOT_KEY_PREFIX },
        updatedAt: { lt: cutoff(BOT_COUNTER_RETENTION_DAYS) },
      },
    });
    return res.count;
  } catch (error) {
    console.error("Failed to prune bot counters:", error);
    return 0;
  }
}

/**
 * Safety net for the cron path: the GitHub Actions cron silently ran to
 * completion without calling anything for 5 days, and nothing pruned the
 * tables in that window. This opportunistic prune runs on a small fraction of
 * bot hits so the counter table stays bounded even if the cron breaks again.
 */
export function maybePruneBotCounters(): void {
  if (Math.random() >= 0.002) return; // ~1 in 500 bot hits
  void pruneBotCounters();
}

/**
 * Enforce a hard row cap on the AniList cache by evicting the oldest rows.
 * The age-based prune lives in anilist-cache.ts; this is the size safety net
 * so the table can never approach the Supabase free-tier storage limit.
 */
export async function pruneAniListCacheToCap(): Promise<{ deleted: number; total: number }> {
  const MAX_ROWS = 10_000;
  const count = await prisma.aniListCache.count();
  const over = count - MAX_ROWS;
  let deleted = 0;

  if (over > 0) {
    const oldest = await prisma.aniListCache.findMany({
      orderBy: { updatedAt: "asc" },
      take: over,
      select: { key: true },
    });
    if (oldest.length > 0) {
      deleted = await prisma.aniListCache.deleteMany({
        where: { key: { in: oldest.map((r) => r.key) } },
      }).then((r) => r.count);
    }
  }

  return { deleted, total: count };
}
