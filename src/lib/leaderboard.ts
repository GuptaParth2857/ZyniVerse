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
    }),
    prisma.userPoints.count({ where: { points: { gt: 0 } } }),
  ]);

  const userIds = rows.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      avatar: true,
      _count: { select: { userAchievements: true } },
    },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    entries: rows
      .filter((r) => userMap.has(r.userId))
      .map((r) => {
        const u = userMap.get(r.userId)!;
        return {
          userId: r.userId,
          username: u.username,
          avatar: u.avatar,
          points: r.points,
          level: r.level,
          achievements: u._count.userAchievements,
        };
      }),
    total,
  };
}
