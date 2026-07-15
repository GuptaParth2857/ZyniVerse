import { prisma } from "@/lib/prisma";

export async function trackPageView(params: {
  path: string;
  userId?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}) {
  try {
    await prisma.pageView.create({
      data: {
        path: params.path,
        userId: params.userId || null,
        sessionId: params.sessionId || null,
        referrer: params.referrer || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to track page view:", error);
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
  userId?: string;
  device?: string;
  browser?: string;
  os?: string;
}) {
  try {
    const sessionId = crypto.randomUUID();
    await prisma.userSession.create({
      data: {
        sessionId,
        userId: params.userId || null,
        device: params.device || null,
        browser: params.browser || null,
        os: params.os || null,
      },
    });
    return sessionId;
  } catch (error) {
    console.error("Failed to start session:", error);
    return null;
  }
}

export async function updateSessionActivity(sessionId: string) {
  try {
    await prisma.userSession.update({
      where: { sessionId },
      data: {
        lastActiveAt: new Date(),
        pagesViewed: { increment: 1 },
      },
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
    const dau = dauResult.length;

    const wauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfWeek, lt: endOfDay },
        userId: { not: null },
      },
    });
    const wau = wauResult.length;

    const mauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfMonth, lt: endOfDay },
        userId: { not: null },
      },
    });
    const mau = mauResult.length;

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

    const dauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: { not: null },
      },
    });
    const dau = dauResult.length;

    const wauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: weekAgo, lt: endOfDay },
        userId: { not: null },
      },
    });
    const wau = wauResult.length;

    const mauResult = await prisma.pageView.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: monthAgo, lt: endOfDay },
        userId: { not: null },
      },
    });
    const mau = mauResult.length;

    const totalPageViews = await prisma.pageView.count({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    const topPagesRaw = await prisma.pageView.groupBy({
      by: ["path"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });
    const topPages = topPagesRaw.map((p) => ({ path: p.path, count: p._count.id }));

    const searchTrendsRaw = await prisma.searchLog.groupBy({
      by: ["query"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });
    const searchTrends = searchTrendsRaw.map((s) => ({ query: s.query, count: s._count.id }));

    const userGrowthRaw = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    });
    const userGrowth = userGrowthRaw.map((g) => ({
      date: g.createdAt.toISOString().split("T")[0],
      count: g._count.id,
    }));

    const totalUsers = await prisma.user.count();
    const retainedMetric = await prisma.retentionMetric.findFirst({
      where: { date: { gte: startOfDay, lt: endOfDay } },
      orderBy: { date: "desc" },
    });
    const retentionRate = retainedMetric && totalUsers > 0
      ? retainedMetric.dau / totalUsers
      : 0;

    return {
      dau,
      wau,
      mau,
      totalPageViews,
      topPages,
      searchTrends,
      userGrowth,
      retentionRate,
    };
  } catch (error) {
    console.error("Failed to get dashboard metrics:", error);
    return {
      dau: 0,
      wau: 0,
      mau: 0,
      totalPageViews: 0,
      topPages: [],
      searchTrends: [],
      userGrowth: [],
      retentionRate: 0,
    };
  }
}
