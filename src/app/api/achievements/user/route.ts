import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getNextLevelProgress } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || session.user.id;

  const [achievements, points] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.userPoints.findUnique({ where: { userId } }),
  ]);

  const userPoints = points ? { points: points.points, level: points.level } : { points: 0, level: 1 };

  return NextResponse.json({
    achievements,
    ...userPoints,
    nextLevel: getNextLevelProgress(userPoints.points),
  });
}
