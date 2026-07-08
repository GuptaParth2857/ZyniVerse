import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { autoCompleteAnimeForChallenge } from "@/lib/challenges";
import { checkAndAwardAchievement } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ entries: [] });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("perPage")) || 20));

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "ALL") where.status = status;

  const [entries, total] = await Promise.all([
    prisma.mangaEntry.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.mangaEntry.count({ where }),
  ]);

  return NextResponse.json({ entries, page, perPage, total, hasMore: page * perPage < total });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, title, coverImage, status, chapters, volumes, totalChapters, totalVolumes, score } = await req.json();
  if (!mediaId || !title) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const entry = await prisma.mangaEntry.upsert({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
    update: {
      title, coverImage, status: status || "PLANNING",
      chapters: chapters ?? 0, volumes: volumes ?? 0,
      totalChapters, totalVolumes, score,
      ...(status === "READING" && { startedAt: new Date() }),
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
    create: {
      userId: session.user.id, mediaId, title, coverImage,
      status: status || "PLANNING", chapters: chapters ?? 0, volumes: volumes ?? 0,
      totalChapters, totalVolumes, score,
    },
  });

  if (status === "COMPLETED") {
    autoCompleteAnimeForChallenge(session.user.id, mediaId, title, coverImage, "manga").catch(() => {});
    const count = await prisma.mangaEntry.count({
      where: { userId: session.user.id, status: "COMPLETED" },
    });
    if (count >= 5) checkAndAwardAchievement(session.user.id, "BOOKWORM").catch(() => {});
  }

  return NextResponse.json({ entry });
}

export async function DELETE(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId } = await req.json();
  if (!mediaId) return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });

  await prisma.mangaEntry.deleteMany({
    where: { userId: session.user.id, mediaId },
  });

  return NextResponse.json({ ok: true });
}
