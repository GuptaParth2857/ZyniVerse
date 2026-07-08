import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getActiveChallenges, getUpcomingChallenges, getPastChallenges } from "@/lib/challenges";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "active";
  const type = searchParams.get("type");
  const period = searchParams.get("period");
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

  const where: Record<string, unknown> = { isPublic: true };
  if (type) where.type = type;
  if (period) where.period = period;
  if (year) where.year = year;

  let challenges;
  if (filter === "upcoming") {
    challenges = await getUpcomingChallenges();
  } else if (filter === "past") {
    challenges = await getPastChallenges();
  } else {
    challenges = await getActiveChallenges();
  }

  if (type || period || year) {
    challenges = challenges.filter((c) => {
      if (type && c.type !== type) return false;
      if (period && c.period !== period) return false;
      if (year && c.year !== year) return false;
      return true;
    });
  }

  const challengesWithCounts = await Promise.all(
    challenges.map(async (c) => {
      const [_count] = await Promise.all([
        prisma.challenge.findUnique({ where: { id: c.id }, include: { _count: { select: { participants: true, entries: true } } } }),
      ]);
      return _count;
    })
  );

  return NextResponse.json({ challenges: challengesWithCounts });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, type, period, year, season, startDate, endDate, goalCount, isPublic, coverImage, rules } = body;

  if (!title || !type || !period || !startDate || !endDate || !goalCount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const challenge = await prisma.challenge.create({
    data: {
      title,
      description,
      type,
      period,
      year: year || null,
      season: season || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goalCount,
      isPublic: isPublic ?? true,
      createdBy: session.user.id,
      coverImage: coverImage || null,
      rules: rules || null,
    },
  });

  return NextResponse.json({ challenge }, { status: 201 });
}
