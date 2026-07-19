import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getActivityFeed, getUserActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const targetUserId = searchParams.get("userId");

    if (targetUserId) {
      const [activities, total] = await Promise.all([
        getUserActivity(targetUserId, limit, offset),
        prisma.activity.count({ where: { userId: targetUserId } }),
      ]);
      return NextResponse.json({ activities, total });
    }

    const session = await auth();
    if (!session?.user?.id) {
      const rawActivities = await prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: { user: { select: { id: true, username: true, avatar: true } } },
      });
      const activities = rawActivities.filter((a) => a.user !== null);
      const total = await prisma.activity.count();
      return NextResponse.json({ activities, total });
    }

    const followCount = await prisma.follow.count({ where: { followerId: session.user.id } });
    let total = 0;
    if (followCount > 0) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      total = await prisma.activity.count({
        where: { userId: { in: following.map((f) => f.followingId) } },
      });
    }

    const activities = await getActivityFeed(session.user.id, limit, offset);

    return NextResponse.json({ activities, total });
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json({ activities: [], total: 0 }, { status: 500 });
  }
}
