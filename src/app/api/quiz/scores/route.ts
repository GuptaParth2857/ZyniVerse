import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, difficulty, score, totalQuestions, timeTaken, xpEarned, isDaily } = await req.json();
  if (!category || !difficulty || score === undefined || !totalQuestions) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const quizScore = await prisma.quizScore.create({
    data: {
      userId: session.user.id,
      category,
      difficulty,
      score,
      totalQuestions,
      timeTaken: timeTaken ?? null,
      xpEarned: xpEarned ?? 0,
      isDaily: isDaily ?? false,
    },
  });

  return NextResponse.json({ id: quizScore.id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;

  const scores = await prisma.quizScore.findMany({
    where,
    orderBy: [{ score: "desc" }, { xpEarned: "desc" }],
    take: limit * 3,
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  const grouped = new Map<string, { user: { id: string; username: string; avatar: string | null }; bestScore: number; bestXp: number; category: string; difficulty: string; date: Date }>();

  for (const s of scores) {
    const existing = grouped.get(s.userId);
    if (!existing || s.score > existing.bestScore || (s.score === existing.bestScore && s.xpEarned > existing.bestXp)) {
      grouped.set(s.userId, {
        user: s.user,
        bestScore: s.score,
        bestXp: s.xpEarned,
        category: s.category,
        difficulty: s.difficulty,
        date: s.createdAt,
      });
    }
  }

  const result = Array.from(grouped.values())
    .sort((a, b) => b.bestScore - a.bestScore || b.bestXp - a.bestXp)
    .slice(0, limit);

  return NextResponse.json({ scores: result });
}
