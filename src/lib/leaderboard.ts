import { prisma } from "./prisma";

export interface UserLeaderboardEntry {
  userId: string;
  username: string;
  avatar: string | null;
  points: number;
  level: number;
  achievements: number;
}

export async function getUserLeaderboard(
  limit = 50,
  offset = 0,
): Promise<{ entries: UserLeaderboardEntry[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.userPoints.findMany({
      where: { points: { gt: 0 } },
      orderBy: [{ points: "desc" }, { level: "desc" }],
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            _count: { select: { userAchievements: true } },
          },
        },
      },
    }),
    prisma.userPoints.count({ where: { points: { gt: 0 } } }),
  ]);

  return {
    entries: rows.map((r) => ({
      userId: r.userId,
      username: r.user.username,
      avatar: r.user.avatar,
      points: r.points,
      level: r.level,
      achievements: r.user._count.userAchievements,
    })),
    total,
  };
}
