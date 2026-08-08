import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (featured === "true") where.isFeatured = true;
    if (featured === "false") where.isFeatured = false;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [feedbacks, total, allTotal, pending, replied, resolved, featuredCount, today] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          replies: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { id: true, username: true, avatar: true } } },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.feedback.count({ where }),
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: "pending" } }),
      prisma.feedback.count({ where: { status: "replied" } }),
      prisma.feedback.count({ where: { status: "resolved" } }),
      prisma.feedback.count({ where: { isFeatured: true } }),
      prisma.feedback.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);

    const userIds = Array.from(new Set(feedbacks.map((f) => f.userId).filter((id): id is string => Boolean(id))));
    const userMap = new Map<string, { username: string; avatar: string | null }>();
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, avatar: true },
      });
      for (const u of users) userMap.set(u.id, { username: u.username, avatar: u.avatar });
    }

    return NextResponse.json({
      feedbacks: feedbacks.map((f) => ({
        ...f,
        author: f.userId ? userMap.get(f.userId) || null : null,
      })),
      total,
      allTotal,
      stats: {
        total: allTotal,
        pending,
        replied,
        resolved,
        featured: featuredCount,
        today,
      },
    });
  } catch (e) {
    console.error("Admin feedback list error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
