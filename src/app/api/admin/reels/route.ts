import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reels = await prisma.reel.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        reports: { select: { reason: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { likes: true, comments: true, reports: true } },
      },
    });

    const data = reels.map((r) => ({
      ...r,
      reportCount: r._count.reports,
      likesCount: r._count.likes,
      commentsCount: r._count.comments,
    }));

    return NextResponse.json({ reels: data });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}
