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

    const [
      totalUsers,
      todayUsers,
      pendingFeedback,
      todayPageViews,
      liveVisitors,
      recentFeedback,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.feedback.count({ where: { status: "pending" } }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.userSession.count({
        where: {
          isActive: true,
          lastActiveAt: { gte: new Date(now.getTime() - 90000) },
        },
      }),
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
    ]);

    return NextResponse.json({
      totalUsers,
      todayUsers,
      pendingFeedback,
      todayPageViews,
      liveVisitors,
      recentFeedback,
      recentUsers,
    });
  } catch (e) {
    console.error("Admin overview error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
