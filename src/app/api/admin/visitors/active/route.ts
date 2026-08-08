import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const activeThreshold = new Date(now.getTime() - 90000);
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [liveCount, activeSessions, loggedInToday, anonToday, pageViewsToday, sessionsToday, todaySessionRows, hourlyRaw, deviceRows, osRows, countryRows] =
      await Promise.all([
        prisma.userSession.count({
          where: { isActive: true, lastActiveAt: { gte: activeThreshold } },
        }),
        prisma.userSession.findMany({
          where: { isActive: true, lastActiveAt: { gte: activeThreshold } },
          orderBy: { lastActiveAt: "desc" },
          take: 50,
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        }),
        prisma.pageView.groupBy({
          by: ["userId"],
          where: { createdAt: { gte: todayStart, lt: tomorrowStart }, userId: { not: null } },
        }),
        prisma.pageView.groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: todayStart, lt: tomorrowStart }, userId: null, sessionId: { not: null } },
        }),
        prisma.pageView.count({
          where: { createdAt: { gte: todayStart, lt: tomorrowStart } },
        }),
        prisma.userSession.count({
          where: { startedAt: { gte: todayStart, lt: tomorrowStart } },
        }),
        prisma.userSession.findMany({
          where: { startedAt: { gte: todayStart, lt: tomorrowStart } },
          select: { startedAt: true, lastActiveAt: true, pagesViewed: true },
        }),
        prisma.pageView.findMany({
          where: { createdAt: { gte: last24h } },
          select: { createdAt: true },
        }),
        prisma.userSession.groupBy({
          by: ["device"],
          where: { startedAt: { gte: todayStart, lt: tomorrowStart }, device: { not: null } },
          _count: { device: true },
          orderBy: { _count: { device: "desc" } },
          take: 6,
        }),
        prisma.userSession.groupBy({
          by: ["os"],
          where: { startedAt: { gte: todayStart, lt: tomorrowStart }, os: { not: null } },
          _count: { os: true },
          orderBy: { _count: { os: "desc" } },
          take: 6,
        }),
        prisma.userSession.groupBy({
          by: ["country"],
          where: { startedAt: { gte: todayStart, lt: tomorrowStart }, country: { not: null } },
          _count: { country: true },
          orderBy: { _count: { country: "desc" } },
          take: 8,
        }),
      ]);

    const todayVisitors = loggedInToday.length + anonToday.length;
    const anonymousVisitors = anonToday.length;

    let avgSessionMinutesToday = 0;
    if (todaySessionRows.length > 0) {
      const totalMinutes = todaySessionRows.reduce(
        (sum, s) => sum + Math.max((s.lastActiveAt.getTime() - s.startedAt.getTime()) / (1000 * 60), 0),
        0
      );
      avgSessionMinutesToday = totalMinutes / todaySessionRows.length;
    }

    const hourlyPageViews = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(last24h.getTime() + i * 60 * 60 * 1000);
      const label = hour.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });
      return { label, count: 0 };
    });
    for (const pv of hourlyRaw) {
      const idx = Math.min(23, Math.max(0, Math.floor((pv.createdAt.getTime() - last24h.getTime()) / (60 * 60 * 1000))));
      hourlyPageViews[idx].count += 1;
    }

    const topPages = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: todayStart, lt: tomorrowStart } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    });

    const deviceBreakdown = deviceRows.map((d) => ({ device: d.device || "Unknown", count: d._count.device }));
    const osBreakdown = osRows.map((o) => ({ os: o.os || "Unknown", count: o._count.os }));
    const countryBreakdown = countryRows.map((c) => ({ country: c.country || "Unknown", count: c._count.country }));

    return NextResponse.json({
      liveCount,
      activeSessions: activeSessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        username: s.user?.username || "Anonymous",
        avatar: s.user?.avatar || null,
        device: s.device,
        browser: s.browser,
        os: s.os,
        country: s.country,
        pagesViewed: s.pagesViewed,
        lastActiveAt: s.lastActiveAt,
        startedAt: s.startedAt,
      })),
      todayVisitors,
      anonymousVisitors,
      pageViewsToday,
      sessionsToday,
      avgSessionMinutesToday,
      hourlyPageViews,
      topPages: topPages.map((p) => ({ path: p.path, count: p._count.path })),
      deviceBreakdown,
      osBreakdown,
      countryBreakdown,
    });
  } catch (e) {
    console.error("Visitors API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
