import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardEconomy, EARN_RATES } from "@/lib/economy";
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
    // Fixed coin leg of the reward, shown before the claim so the button can
    // advertise what it pays. XP is streak-scaled and computed server-side.
    coinReward: EARN_RATES.DAILY_LOGIN.coins,
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

  // Compute the streak, but do not consume a freeze yet: the award below is the
  // point of no return, and a duplicate (retry / race) must not burn a freeze.
  let streak = 1;
  let usedFreeze = false;
  if (daily?.lastClaimed) {
    if (isConsecutive(daily.lastClaimed)) {
      streak = daily.streak + 1;
    } else if (frozen && frozen.count > 0) {
      // freeze saves the previous streak; the claim continues it
      streak = daily.streak + 1;
      usedFreeze = true;
    }
    // else: break -> restart at 1
  }

  const streakBonus = Math.min(streak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  const xpEarned = DAILY_BASE_XP + streakBonus;

  // XP + coins both flow through the economy ledger. The day key is the
  // idempotency ref, so a double-submit pays once even though the once-per-day
  // check above is only a fast path (not a lock).
  const award = await awardEconomy(
    userId,
    "DAILY_LOGIN",
    { xp: xpEarned, coins: EARN_RATES.DAILY_LOGIN.coins },
    dayKey(now)
  );
  if (award.duplicate) {
    return NextResponse.json(
      { error: "Already claimed today. Come back tomorrow!", already: true, streak: daily?.streak ?? 0 },
      { status: 409 }
    );
  }

  if (usedFreeze) {
    await prisma.streakFreeze.update({ where: { userId }, data: { count: { decrement: 1 } } });
  }
  if (award.leveledUp && award.newLevel) {
    void createNotification({
      userId,
      type: "SYSTEM",
      title: "Level Up!",
      body: `You reached level ${award.newLevel} 🎉`,
      link: "/profile",
    });
  }

  const totalXpAwarded = (daily?.totalXpAwarded || 0) + award.xp;
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
    body: `You earned ${award.xp} XP and ${award.coins} coins. Current login streak: ${streak} day${streak > 1 ? "s" : ""}.`,
    link: "/profile",
  });

  return NextResponse.json({
    xp: award.xp,
    coins: award.coins,
    streak,
    usedFreeze,
    totalXpAwarded,
    remainingFreezes: afterFreeze?.count ?? (frozen?.count ?? 0),
  });
}