import { prisma } from "@/lib/prisma";

/**
 * Retention (in days) for high-volume log/analytics tables. Older rows are
 * deleted to keep the database (and Supabase free-tier quota) bounded.
 */
const LOG_RETENTION_DAYS = 45;

/**
 * Prune high-volume log tables that grow unbounded. These rows are analytics
 * only — the aggregated RetentionMetric/dashboard values are what matter, so
 * trimming raw rows does not affect product functionality.
 */
export async function pruneLogs(): Promise<Record<string, number>> {
  const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const deleted: Record<string, number> = {};

  const [pageView, sessions, activity, adImpression, searchLog] = await Promise.all([
    prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } }).then((r) => r.count),
    prisma.userSession.deleteMany({ where: { startedAt: { lt: cutoff } } }).then((r) => r.count),
    prisma.userActivity.deleteMany({ where: { createdAt: { lt: cutoff } } }).then((r) => r.count),
    prisma.adImpression.deleteMany({ where: { createdAt: { lt: cutoff } } }).then((r) => r.count),
    prisma.searchLog.deleteMany({ where: { createdAt: { lt: cutoff } } }).then((r) => r.count),
  ]);

  deleted.pageView = pageView;
  deleted.userSession = sessions;
  deleted.userActivity = activity;
  deleted.adImpression = adImpression;
  deleted.searchLog = searchLog;

  return deleted;
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
