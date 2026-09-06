import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season");
  const year = searchParams.get("year");

  const where: { userId: string; season?: string; year?: number } = { userId: session.user.id };
  if (season) where.season = season;
  if (year) where.year = parseInt(year);

  const trackers = await prisma.seasonalTracker.findMany({
    where,
    include: { entries: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trackers });
}

export async function POST(req: NextRequest) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { season, year } = await req.json();
  if (!season || !year) {
    return NextResponse.json({ error: "Missing season or year" }, { status: 400 });
  }

  const tracker = await prisma.seasonalTracker.upsert({
    where: { userId_season_year: { userId: session.user.id, season, year: parseInt(year) } },
    update: {},
    create: { userId: session.user.id, season, year: parseInt(year) },
    include: { entries: true },
  });

  return NextResponse.json({ tracker });
}
