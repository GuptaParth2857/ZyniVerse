import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export interface ActivityCreate {
  userId: string;
  type: string;
  mediaId?: number;
  mediaTitle?: string;
  mediaImage?: string;
  message?: string;
}

export async function createActivity(data: ActivityCreate) {
  const activity = await prisma.activity.create({ data });

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: data.userId },
      select: { followerId: true },
    });

    for (const follower of followers) {
      await createNotification({
        userId: follower.followerId,
        type: "ACTIVITY",
        title: "New Activity",
        body: data.message || `${data.type} activity`,
        link: "/activity",
      });
    }
  } catch {}

  return activity;
}

export async function getActivityFeed(userId: string, limit = 20, offset = 0) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = follows.map((f) => f.followingId);
  if (followingIds.length === 0) return [];

  return prisma.activity.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });
}

export async function getUserActivity(userId: string, limit = 20, offset = 0) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });
}
