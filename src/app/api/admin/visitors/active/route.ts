import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (user?.email !== "gupta.parth2857@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activeThreshold = new Date(now.getTime() - 90000);

    const [liveCount, activeSessions, todayVisitors, _returningVisitors] = await Promise.all([
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
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.pageView.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: todayStart },
          userId: { not: null },
        },
      }),
    ]);

    const todayCount = todayVisitors.length;
    const anonymousCount = todayVisitors.filter((v) => !v.userId).length;
    const uniqueCount = todayCount - (anonymousCount > 0 ? 1 : 0);

    const hourlyViews = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: todayStart } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    });

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
        pagesViewed: s.pagesViewed,
        lastActiveAt: s.lastActiveAt,
        startedAt: s.startedAt,
      })),
      todayVisitors: uniqueCount,
      anonymousVisitors: anonymousCount > 0 ? 1 : 0,
      topPages: hourlyViews.map((p) => ({ path: p.path, count: p._count.path })),
    });
  } catch (e) {
    console.error("Visitors API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
