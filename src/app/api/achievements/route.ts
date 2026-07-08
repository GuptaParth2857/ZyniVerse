import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAllAchievements, getLevel, getNextLevelProgress } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId") || userId;

  const allAchievements = getAllAchievements();

  let userAchievements: { achievementId: string; earnedAt: Date; progress: number | null }[] = [];
  let userPoints = { points: 0, level: 1 };

  if (targetUserId) {
    const [earned, points] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId: targetUserId },
        select: { achievementId: true, earnedAt: true, progress: true },
      }),
      prisma.userPoints.findUnique({ where: { userId: targetUserId } }),
    ]);
    userAchievements = earned;
    if (points) userPoints = { points: points.points, level: points.level };
  }

  const achievementMap = new Map(userAchievements.map((a) => [a.achievementId, a]));

  const achievements = await prisma.achievement.findMany();
  const dbMap = new Map(achievements.map((a) => [a.code, a.id]));

  const result = allAchievements.map((a) => {
    const dbId = dbMap.get(a.code);
    const earned = dbId ? achievementMap.get(dbId) : undefined;
    return {
      ...a,
      earned: !!earned,
      earnedAt: earned?.earnedAt || null,
      progress: earned?.progress || 0,
    };
  });

  return NextResponse.json({
    achievements: result,
    points: userPoints.points,
    level: userPoints.level,
    nextLevel: getNextLevelProgress(userPoints.points),
  });
}
