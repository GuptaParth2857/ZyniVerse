import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activeThreshold = new Date(now.getTime() - 90000);

    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const weekAgo = days[0];

    const [
      totalUsers,
      todayUsers,
      pendingFeedback,
      todayPageViews,
      liveVisitors,
      totalPageViews,
      todaySessions,
      recentFeedback,
      recentUsers,
      feedbackStats,
      recentSignupsRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.feedback.count({ where: { status: "pending" } }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.userSession.count({
        where: {
          isActive: true,
          lastActiveAt: { gte: activeThreshold },
        },
      }),
      prisma.pageView.count(),
      prisma.userSession.count({ where: { startedAt: { gte: todayStart } } }),
      prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          message: true,
          status: true,
          isFeatured: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          username: true,
          avatar: true,
          createdAt: true,
        },
      }),
      (async () => {
        const [pending, replied, resolved, featured, today] = await Promise.all([
          prisma.feedback.count({ where: { status: "pending" } }),
          prisma.feedback.count({ where: { status: "replied" } }),
          prisma.feedback.count({ where: { status: "resolved" } }),
          prisma.feedback.count({ where: { isFeatured: true } }),
          prisma.feedback.count({ where: { createdAt: { gte: todayStart } } }),
        ]);
        return { pending, replied, resolved, featured, today };
      })(),
      prisma.user.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
    ]);

    const weeklySignups = days.map((d, i) => {
      const next = i === days.length - 1 ? new Date(now.getTime() + 1000) : days[i + 1];
      return {
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count: recentSignupsRaw.filter((u) => u.createdAt >= d && u.createdAt < next).length,
      };
    });

    return NextResponse.json({
      totalUsers,
      todayUsers,
      pendingFeedback,
      todayPageViews,
      liveVisitors,
      totalPageViews,
      todaySessions,
      feedbackStats,
      weeklySignups,
      recentFeedback,
      recentUsers,
    });
  } catch (e) {
    console.error("Admin overview error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
