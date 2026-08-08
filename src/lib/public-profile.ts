import { prisma } from "./prisma";

export interface PublicProfileActivity {
  id: string;
  type: string;
  mediaId: number | null;
  mediaTitle: string | null;
  mediaImage: string | null;
  message: string | null;
  createdAt: string;
}

export interface PublicProfileData {
  userId: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  signature: string | null;
  themeColor: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  level: number;
  points: number;
  stats: {
    total: number;
    completed: number;
    current: number;
    planning: number;
    episodesWatched: number;
    meanScore: number;
  };
  activities: PublicProfileActivity[];
}

export async function getPublicProfileData(userId: string): Promise<PublicProfileData | null> {
  const [user, userPoints, entries, friendsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        banner: true,
        bio: true,
        themeColor: true,
        signature: true,
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    }),
    prisma.userPoints.findUnique({ where: { userId } }),
    prisma.listEntry.findMany({
      where: { userId },
      select: { type: true, status: true, progress: true, score: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.friendRequest.count({
      where: {
        OR: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      },
    }),
  ]);

  if (!user) return null;

  const animeEntries = entries.filter((e) => e.type === "ANIME");
  const scored = animeEntries.filter((e) => e.score && e.score > 0);
  const meanScore =
    scored.length === 0
      ? 0
      : Math.round((scored.reduce((s, e) => s + (e.score || 0), 0) / scored.length) * 10) / 10;

  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, type: true, mediaId: true, mediaTitle: true, mediaImage: true, message: true, createdAt: true },
  });

  return {
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    signature: user.signature,
    themeColor: user.themeColor,
    createdAt: user.createdAt.toISOString(),
    followersCount: user._count.followers,
    followingCount: user._count.following,
    friendsCount,
    level: userPoints?.level ?? 1,
    points: userPoints?.points ?? 0,
    stats: {
      total: entries.length,
      completed: entries.filter((e) => e.status === "COMPLETED").length,
      current: entries.filter((e) => e.status === "CURRENT").length,
      planning: entries.filter((e) => e.status === "PLANNING").length,
      episodesWatched: entries.reduce((s, e) => s + (e.progress || 0), 0),
      meanScore,
    },
    activities: activities.map((a) => ({
      id: a.id,
      type: a.type,
      mediaId: a.mediaId,
      mediaTitle: a.mediaTitle,
      mediaImage: a.mediaImage,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}
