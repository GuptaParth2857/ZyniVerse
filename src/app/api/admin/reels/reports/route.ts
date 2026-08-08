import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reported = await prisma.reelReport.groupBy({
      by: ["reelId"],
      _count: { _all: true },
      orderBy: { _count: { reelId: "desc" } },
      take: 50,
    });

    const reelIds = reported.map((r) => r.reelId);
    const reels = await prisma.reel.findMany({
      where: { id: { in: reelIds } },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        reports: { select: { reason: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const data = reported
      .map((r) => {
        const reel = reels.find((x) => x.id === r.reelId);
        if (!reel) return null;
        return {
          ...reel,
          reportCount: r._count._all,
          likesCount: reel._count.likes,
          commentsCount: reel._count.comments,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ reels: data });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
