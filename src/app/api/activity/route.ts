import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getActivityFeed, getUserActivity, enrichActivities } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const targetUserId = searchParams.get("userId");

    if (targetUserId) {
      const [rawActivities, total] = await Promise.all([
        getUserActivity(targetUserId, limit, offset),
        prisma.activity.count({ where: { userId: targetUserId } }),
      ]);
      const activities = await enrichActivities(rawActivities);
      return NextResponse.json({ activities, total, fallback: false });
    }

    const fetchGlobal = async () => {
      const rawActivities = await prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: { user: { select: { id: true, username: true, avatar: true } } },
      });
      const filtered = rawActivities.filter((a) => a.user !== null);
      const total = await prisma.activity.count();
      const activities = await enrichActivities(filtered);
      return { activities, total };
    };

    const session = await auth();
    if (!session?.user?.id) {
      const { activities, total } = await fetchGlobal();
      return NextResponse.json({ activities, total, fallback: true });
    }

    const followCount = await prisma.follow.count({ where: { followerId: session.user.id } });
    if (followCount === 0) {
      const { activities, total } = await fetchGlobal();
      return NextResponse.json({ activities, total, fallback: true });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    const [rawActivities, total] = await Promise.all([
      getActivityFeed(session.user.id, limit, offset),
      prisma.activity.count({
        where: { userId: { in: following.map((f) => f.followingId) } },
      }),
    ]);
    const activities = await enrichActivities(rawActivities);

    return NextResponse.json({ activities, total, fallback: false });
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json({ activities: [], total: 0, fallback: true }, { status: 500 });
  }
}
