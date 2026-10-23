import { prisma } from "@/lib/prisma";
import { detectBot } from "@/lib/bot-detect";

export function countryFromRequest(headers: Headers): string | null {
  const c =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country") ||
    "";
  return c && c !== "XX" && c !== "unknown" && c !== "T1" ? c.toUpperCase().slice(0, 2) : null;
}

/**
 * True when a request cannot have come from a real browser.
 *
 * The analytics ingest endpoints are called by the client-side tracker, so
 * every hit is one serverless invocation plus one database write. During the
 * 2026-10-11..20 crawl storm that was ~19.6k sessions/day, and 94% of the
 * resulting rows were `Chrome / Linux` with a US/DE/GB/FR datacenter
 * country — a headless scraper fleet, not visitors. Those rows are pure cost:
 * they inflate the admin dashboard's DAU/session numbers and they are what
 * filled the 500 MB Supabase free-tier database budget.
 *
 * A known crawler/tool User-Agent (the catalogue in `lib/bot-detect`) or a
 * missing User-Agent header is enough to skip the write. Requests that look
 * automated but spoof a browser UA are caught client-side by
 * `AnalyticsTracker` (navigator.webdriver), which never sends the request at
 * all — cheaper than a server-side check.
 */
export function isAutomatedRequest(headers: Headers): boolean {
  const ua = headers.get("user-agent");
  if (!ua || !ua.trim()) return true;
  return detectBot(ua) !== null;
}

/** User-Agent of the request, falling back to the client-sent value. */
export function userAgentFromRequest(headers: Headers, fallback?: string | null): string | null {
  const ua = headers.get("user-agent");
  if (ua && ua.trim()) return ua;
  return fallback && fallback.trim() ? fallback : null;
}

const PAGEVIEW_COUNTER_KEY = "pageviews";

/**
 * Monotonic all-time page-view counter that survives the analytics log-prune
 * (which trims the raw PageView table after LOG_RETENTION_DAYS). Without this,
 * the "Total Views" KPI plateaus because pruned rows offset new ones.
 */
export async function incrementPageViewCounter(by: number) {
  if (by <= 0) return;
  try {
    const value = BigInt(by);
    await prisma.siteCounter.upsert({
      where: { key: PAGEVIEW_COUNTER_KEY },
      update: { value: { increment: value } },
      create: { key: PAGEVIEW_COUNTER_KEY, value },
    });
  } catch (error) {
    console.error("Failed to increment page view counter:", error);
  }
}

/** All-time page-view total, or null when the counter row is missing. */
export async function getTotalPageViews(): Promise<number | null> {
  try {
    const row = await prisma.siteCounter.findUnique({ where: { key: PAGEVIEW_COUNTER_KEY } });
    return row ? Number(row.value) : null;
  } catch {
    return null;
  }
}

export async function trackPageView(params: {
  path: string;
  userId?: string | null;
  sessionId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  country?: string | null;
}) {
  try {
    // Independent writes — fire them together so the remote pooler is touched
    // once instead of three times per view. `incrementPageViewCounter` swallows
    // its own errors, so a counter failure can't drop the page_view row.
    await Promise.all([
      prisma.pageView.create({
        data: {
          path: params.path,
          userId: params.userId || null,
          sessionId: params.sessionId || null,
          referrer: params.referrer || null,
          userAgent: params.userAgent || null,
          country: params.country || null,
        },
      }),
      params.sessionId
        ? prisma.userSession.updateMany({
            where: { sessionId: params.sessionId },
            data: { pagesViewed: { increment: 1 }, lastActiveAt: new Date() },
          })
        : Promise.resolve(),
      incrementPageViewCounter(1),
    ]);
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}

export async function trackPageViewBatch(entries: Array<{
  path: string;
  sessionId?: string | null;
  referrer?: string | null;
  country?: string | null;
  userAgent?: string | null;
}>) {
  if (entries.length === 0) return;
  // How many views belong to each session. Prisma's updateMany can only apply
  // one increment to every matched row, so a batch that covers more than one
  // session needs one update per session — in practice a batch is always a
  // single session, because the client flushes its own queue.
  const viewsPerSession = new Map<string, number>();
  for (const e of entries) {
    if (!e.sessionId) continue;
    viewsPerSession.set(e.sessionId, (viewsPerSession.get(e.sessionId) ?? 0) + 1);
  }
  try {
    // These three writes are independent, but the pooler is remote — awaiting
    // them one after another cost three round-trips (~3s) on every beacon.
    await Promise.all([
      prisma.pageView.createMany({
        data: entries.map((e) => ({
          path: e.path,
          sessionId: e.sessionId || null,
          referrer: e.referrer || null,
          country: e.country || null,
          // Stored so the admin view can tell a real visitor from a crawler
          // later; it used to be written as NULL on every single row.
          userAgent: e.userAgent || null,
        })),
      }),
      // `pagesViewed` used to be skipped on this path, so every session that
      // went through the batched route (i.e. all of them, since 4434f7d) showed
      // 0 pages. That made the admin panel unable to tell a real visitor from a
      // bot session that never delivered a page view.
      ...[...viewsPerSession].map(([sessionId, views]) =>
        prisma.userSession.updateMany({
          where: { sessionId },
          data: { pagesViewed: { increment: views }, lastActiveAt: new Date() },
        })
      ),
      incrementPageViewCounter(entries.length),
    ]);
  } catch (error) {
    console.error("Failed to batch track page views:", error);
  }
}

export async function trackSearch(params: {
  query: string;
  userId?: string;
  source?: string;
  resultsCount?: number;
}) {
  try {
    await prisma.searchLog.create({
      data: {
        query: params.query,
        userId: params.userId || null,
        source: params.source || "search",
        resultsCount: params.resultsCount ?? 0,
      },
    });
  } catch (error) {
    console.error("Failed to track search:", error);
  }
}

export async function startSession(params: {
  sessionId?: string | null;
  userId?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  country?: string | null;
}) {
  const sessionId = params.sessionId || crypto.randomUUID();
  try {
    // Atomic create-or-ignore: concurrent session+pageview requests can race
    // here, so never rely on findUnique-then-create.
    await prisma.userSession.upsert({
      where: { sessionId },
      update: { lastActiveAt: new Date() },
      create: {
        sessionId,
        userId: params.userId || null,
        device: params.device || null,
        browser: params.browser || null,
        os: params.os || null,
        country: params.country || null,
        pagesViewed: 0,
      },
    });
    return sessionId;
  } catch (error) {
    // Lost an insert race — the session row exists, that's fine.
    if ((error as { code?: string })?.code === "P2002") return sessionId;
    console.error("Failed to start session:", error);
    return null;
  }
}

export async function updateSessionActivity(sessionId: string) {
  try {
    await prisma.userSession.updateMany({
      where: { sessionId },
      data: { lastActiveAt: new Date() },
    });
  } catch (error) {
    console.error("Failed to update session activity:", error);
  }
}

export async function computeDailyMetrics(date: Date) {
  try {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(startOfDay);
    startOfMonth.setDate(startOfMonth.getDate() - 30);

    const dauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: { not: null },
      },
    });
    const dauAnonResult = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: null,
        sessionId: { not: null },
      },
    });
    const dau = dauResult.length + dauAnonResult.length;

    const wauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfWeek, lt: endOfDay },
        userId: { not: null },
      },
    });
    const wauAnonResult = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: startOfWeek, lt: endOfDay },
        userId: null,
        sessionId: { not: null },
      },
    });
    const wau = wauResult.length + wauAnonResult.length;

    const mauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfMonth, lt: endOfDay },
        userId: { not: null },
      },
    });
    const mauAnonResult = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: startOfMonth, lt: endOfDay },
        userId: null,
        sessionId: { not: null },
      },
    });
    const mau = mauResult.length + mauAnonResult.length;

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    const previousDayEnd = new Date(startOfDay);
    const previousDayStart = new Date(startOfDay);
    previousDayStart.setDate(previousDayStart.getDate() - 1);

    const previousDayUsers = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: previousDayStart, lt: previousDayEnd },
        userId: { not: null },
      },
    });

    const todayUsers = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: { not: null },
      },
    });

    const previousUserIds = new Set(previousDayUsers.map((u) => u.userId));
    const returningUsers = todayUsers.filter((u) => previousUserIds.has(u.userId)).length;

    const sessions = await prisma.userSession.findMany({
      where: {
        startedAt: { gte: startOfDay, lt: endOfDay },
      },
      select: {
        startedAt: true,
        lastActiveAt: true,
        pagesViewed: true,
      },
    });

    let avgSessionMinutes = 0;
    let avgPagesPerSession = 0;

    if (sessions.length > 0) {
      const totalMinutes = sessions.reduce((sum, s) => {
        const durationMs = s.lastActiveAt.getTime() - s.startedAt.getTime();
        return sum + durationMs / (1000 * 60);
      }, 0);
      avgSessionMinutes = totalMinutes / sessions.length;

      const totalPages = sessions.reduce((sum, s) => sum + s.pagesViewed, 0);
      avgPagesPerSession = totalPages / sessions.length;
    }

    const metric = await prisma.retentionMetric.upsert({
      where: { date: startOfDay },
      update: {
        dau,
        wau,
        mau,
        newUsers,
        returningUsers,
        avgSessionMinutes,
        avgPagesPerSession,
      },
      create: {
        date: startOfDay,
        dau,
        wau,
        mau,
        newUsers,
        returningUsers,
        avgSessionMinutes,
        avgPagesPerSession,
      },
    });

    return metric;
  } catch (error) {
    console.error("Failed to compute daily metrics:", error);
    return null;
  }
}

export async function getDashboardMetrics(dateRange?: { start: Date; end: Date }) {
  try {
    const now = new Date();
    const end = dateRange?.end || now;
    const start = dateRange?.start || new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
    const weekAgo = new Date(startOfDay);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(startOfDay);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const daysAgo = (n: number) => {
      const d = new Date(startOfDay);
      d.setDate(d.getDate() - n);
      return d;
    };
    const DAYS = 14;

    const dauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: { not: null },
      },
    });
    const dauAnonResult = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: null,
        sessionId: { not: null },
      },
    });
    const dau = dauResult.length + dauAnonResult.length;

    const wauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: weekAgo, lt: endOfDay },
        userId: { not: null },
      },
    });
    const wauAnonResult = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: weekAgo, lt: endOfDay },
        userId: null,
        sessionId: { not: null },
      },
    });
    const wau = wauResult.length + wauAnonResult.length;

    const mauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: monthAgo, lt: endOfDay },
        userId: { not: null },
      },
    });
    const mauAnonResult = await prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: monthAgo, lt: endOfDay },
        userId: null,
        sessionId: { not: null },
      },
    });
    const mau = mauResult.length + mauAnonResult.length;

    const [
      pageViewsToday,
      pageViews7,
      pageViews30,
      newUsersToday,
      totalUsers,
      sessionsToday,
      activeNow,
      recentPageViews,
      recentSessions,
      recentUsers,
      topPagesRaw,
      searchTrendsRaw,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: startOfDay, lt: endOfDay } } }),
      prisma.pageView.count({ where: { createdAt: { gte: weekAgo, lt: endOfDay } } }),
      prisma.pageView.count({ where: { createdAt: { gte: monthAgo, lt: endOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfDay, lt: endOfDay } } }),
      prisma.user.count(),
      prisma.userSession.count({ where: { startedAt: { gte: startOfDay, lt: endOfDay } } }),
      prisma.userSession.count({ where: { lastActiveAt: { gte: new Date(now.getTime() - 5 * 60 * 1000) } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: daysAgo(DAYS - 1), lt: endOfDay } },
        select: { createdAt: true, userId: true, sessionId: true },
      }),
      prisma.userSession.findMany({
        where: { startedAt: { gte: daysAgo(DAYS - 1), lt: endOfDay } },
        select: { startedAt: true, lastActiveAt: true, pagesViewed: true, browser: true, device: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: daysAgo(DAYS - 1), lt: endOfDay } },
        select: { createdAt: true },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: weekAgo, lt: endOfDay } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
      prisma.userActivity.groupBy({
        by: ["query"],
        where: { createdAt: { gte: weekAgo, lt: endOfDay }, action: "search", query: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
    ]);

    const topPages = topPagesRaw.map((p) => ({ path: p.path, count: p._count.id }));
    const searchTrends = searchTrendsRaw
      .map((s) => ({ query: s.query || "", count: s._count.id }))
      .filter((s) => s.query.trim().length > 0);

    const dailyKey = (d: Date) => d.toISOString().slice(0, 10);
    const labelFor = (key: string) =>
      new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    const pvMap = new Map<string, number>();
    const activeMap = new Map<string, Set<string>>();
    for (let i = DAYS - 1; i >= 0; i--) {
      pvMap.set(dailyKey(daysAgo(i)), 0);
      activeMap.set(dailyKey(daysAgo(i)), new Set());
    }
    for (const pv of recentPageViews) {
      const key = dailyKey(pv.createdAt);
      if (!pvMap.has(key)) continue;
      pvMap.set(key, (pvMap.get(key) || 0) + 1);
      const identity = pv.userId || `anon:${pv.sessionId}`;
      if (identity && identity !== "anon:null") activeMap.get(key)?.add(identity);
    }
    const dailyPageViews = Array.from(pvMap.entries()).map(([date, count]) => ({ date, label: labelFor(date), count }));
    const dailyActiveUsers = Array.from(activeMap.entries()).map(([date, set]) => ({
      date,
      label: labelFor(date),
      count: set.size,
    }));

    const nuMap = new Map<string, number>();
    for (let i = DAYS - 1; i >= 0; i--) nuMap.set(dailyKey(daysAgo(i)), 0);
    for (const u of recentUsers) {
      const key = dailyKey(u.createdAt);
      if (nuMap.has(key)) nuMap.set(key, (nuMap.get(key) || 0) + 1);
    }
    const dailyNewUsers = Array.from(nuMap.entries()).map(([date, count]) => ({ date, label: labelFor(date), count }));

    let avgSessionMinutes = 0;
    let avgPagesPerSession = 0;
    if (recentSessions.length > 0) {
      const totalMinutes = recentSessions.reduce(
        (sum, s) => sum + Math.max((s.lastActiveAt.getTime() - s.startedAt.getTime()) / (1000 * 60), 0),
        0
      );
      avgSessionMinutes = totalMinutes / recentSessions.length;
      avgPagesPerSession = recentSessions.reduce((sum, s) => sum + s.pagesViewed, 0) / recentSessions.length;
    }

    const browserCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    for (const s of recentSessions) {
      const b = s.browser || "Unknown";
      const d = s.device || "Unknown";
      browserCounts.set(b, (browserCounts.get(b) || 0) + 1);
      deviceCounts.set(d, (deviceCounts.get(d) || 0) + 1);
    }
    const browserBreakdown = Array.from(browserCounts.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
    const deviceBreakdown = Array.from(deviceCounts.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    const retainedMetric = await prisma.retentionMetric.findFirst({
      orderBy: { date: "desc" },
    });
    const retentionRate =
      totalUsers > 0 ? (retainedMetric?.dau ?? dau) / totalUsers : 0;

    return {
      dau,
      wau,
      mau,
      pageViewsToday,
      pageViews7,
      pageViews30,
      newUsersToday,
      totalUsers,
      sessionsToday,
      activeNow,
      avgSessionMinutes,
      avgPagesPerSession,
      retentionRate,
      dailyPageViews,
      dailyActiveUsers,
      dailyNewUsers,
      topPages,
      searchTrends,
      browserBreakdown,
      deviceBreakdown,
    };
  } catch (error) {
    console.error("Failed to get dashboard metrics:", error);
    return {
      dau: 0,
      wau: 0,
      mau: 0,
      pageViewsToday: 0,
      pageViews7: 0,
      pageViews30: 0,
      newUsersToday: 0,
      totalUsers: 0,
      sessionsToday: 0,
      activeNow: 0,
      avgSessionMinutes: 0,
      avgPagesPerSession: 0,
      retentionRate: 0,
      dailyPageViews: [],
      dailyActiveUsers: [],
      dailyNewUsers: [],
      topPages: [],
      searchTrends: [],
      browserBreakdown: [],
      deviceBreakdown: [],
    };
  }
}
