import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevel } from "@/lib/achievements";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

const DAILY_BASE_XP = 10;
const STREAK_BONUS_PER_DAY = 2;
const MAX_STREAK_BONUS = 30;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function isConsecutive(last: Date, ref?: Date): boolean {
  const refDate = ref || new Date();
  const lastMid = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const refMid = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diff = Math.round((refMid.getTime() - lastMid.getTime()) / 86400000);
  return diff === 1;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ authenticated: false });

  const userId = session.user.id;
  const now = new Date();
  const daily = await prisma.dailyLogin.findUnique({ where: { userId } });
  const frozen = await prisma.streakFreeze.findUnique({ where: { userId } });

  const claimedToday = daily?.lastClaimed ? dayKey(daily.lastClaimed) === dayKey(now) : false;

  return NextResponse.json({
    authenticated: true,
    streak: daily?.streak ?? 0,
    totalClaims: daily?.totalClaims ?? 0,
    totalXpAwarded: daily?.totalXpAwarded ?? 0,
    claimedToday,
    freezes: frozen?.count ?? 0,
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to claim your daily bonus." }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();

  const daily = await prisma.dailyLogin.findUnique({ where: { userId } });
  const frozen = await prisma.streakFreeze.findUnique({ where: { userId } });

  // Can't claim twice in one day
  if (daily?.lastClaimed && dayKey(daily.lastClaimed) === dayKey(now)) {
    return NextResponse.json(
      { error: "Already claimed today. Come back tomorrow!", already: true, streak: daily.streak },
      { status: 409 }
    );
  }

  // Compute streak. If yesterday not active and no freeze, streak resets to 1.
  let streak = 1;
  let usedFreeze = false;
  if (daily?.lastClaimed) {
    if (isConsecutive(daily.lastClaimed)) {
      streak = daily.streak + 1;
    } else if (frozen && frozen.count > 0) {
      // freeze saves the previous streak; claim continues it
      streak = daily.streak + 1;
      usedFreeze = true;
      await prisma.streakFreeze.update({ where: { userId }, data: { count: { decrement: 1 } } });
    }
    // else: break -> restart at 1
  }

  const streakBonus = Math.min(streak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  const xpEarned = DAILY_BASE_XP + streakBonus;

  // Award XP
  const up = await prisma.userPoints.upsert({
    where: { userId },
    update: { points: { increment: xpEarned } },
    create: { userId, points: xpEarned, level: 1 },
  });
  const newLevel = getLevel(up.points);
  if (newLevel !== up.level) {
    await prisma.userPoints.update({ where: { userId }, data: { level: newLevel } });
    void createNotification({
      userId,
      type: "SYSTEM",
      title: "Level Up!",
      body: `You reached level ${newLevel} 🎉`,
      link: "/profile",
    });
  }

  const totalXpAwarded = (daily?.totalXpAwarded || 0) + xpEarned;
  await prisma.dailyLogin.upsert({
    where: { userId },
    update: { streak, lastClaimed: now, totalClaims: { increment: 1 }, totalXpAwarded },
    create: { userId, streak, lastClaimed: now, totalClaims: 1, totalXpAwarded },
  });

  // Re-read freezes (may have changed if a freeze was consumed)
  const afterFreeze = usedFreeze ? await prisma.streakFreeze.findUnique({ where: { userId } }) : null;

  void createNotification({
    userId,
    type: "SYSTEM",
    title: "Daily Bonus Claimed 🔥",
    body: `You earned ${xpEarned} XP. Current login streak: ${streak} day${streak > 1 ? "s" : ""}.`,
    link: "/profile",
  });

  return NextResponse.json({
    xp: xpEarned,
    streak,
    usedFreeze,
    totalXpAwarded,
    remainingFreezes: afterFreeze?.count ?? (frozen?.count ?? 0),
  });
}