import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const games = await prisma.wordleGame.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalGames = games.length;
  const wins = games.filter((g) => g.won).length;
  const winPercentage = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  let currentStreak = 0;
  let maxStreak = 0;
  let streak = 0;
  for (let i = games.length - 1; i >= 0; i--) {
    if (games[i].won) {
      streak++;
      if (i === games.length - 1) currentStreak = streak;
    } else {
      maxStreak = Math.max(maxStreak, streak);
      streak = 0;
    }
  }
  maxStreak = Math.max(maxStreak, streak);

  const guessDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  games.filter((g) => g.won).forEach((g) => {
    const attempts = g.attempts;
    if (attempts >= 1 && attempts <= 6) {
      guessDistribution[attempts]++;
    }
  });

  return NextResponse.json({
    stats: {
      totalGames,
      wins,
      winPercentage,
      currentStreak,
      maxStreak,
      guessDistribution,
    },
    recentGames: games.slice(0, 10),
  });
}
