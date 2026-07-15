import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ activities: [] });

  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { userId: { in: followingIds } },
        { type: { in: ["REVIEWED", "COMPLETED"] }, message: { not: null } },
      ],
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      reactions: {
        select: { type: true, userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const enriched = activities.map((a) => {
    const reactionCounts: Record<string, number> = {};
    for (const r of a.reactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    }
    return {
      ...a,
      reactions: reactionCounts,
      myReactions: a.reactions.filter((r) => r.userId === session.user!.id).map((r) => r.type),
    };
  });

  return NextResponse.json({ activities: enriched });
}
