import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Returns achievements earned after `after` (ISO) or in the last 48h.
// Client tracks a cursor (localStorage) so it only toasts genuinely new ones.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ toasts: [] });

  const userId = session.user.id;
  const after = req.nextUrl.searchParams.get("after");
  const gte = after && !isNaN(Date.parse(after)) ? new Date(after) : new Date(Date.now() - 48 * 60 * 60 * 1000);

  const rows = await prisma.userAchievement.findMany({
    where: { userId, earnedAt: { gte } },
    include: { achievement: true },
    orderBy: { earnedAt: "asc" },
    take: 25,
  });

  const toasts = rows.map((r) => ({
    earnedAt: r.earnedAt.toISOString(),
    name: r.achievement.name,
    icon: r.achievement.icon,
    description: r.achievement.description,
    points: r.achievement.points,
    category: r.achievement.category,
  }));

  // Also surface recent level-up notifications so those toast too
  const levelUps = await prisma.notification.findMany({
    where: { userId, type: "SYSTEM", title: { contains: "Level Up" }, createdAt: { gte } },
    orderBy: { createdAt: "asc" },
    take: 5,
    select: { body: true, createdAt: true },
  });

  return NextResponse.json({
    toasts,
    levelUps: levelUps.map((n) => ({ createdAt: n.createdAt.toISOString(), body: n.body })),
  });
}