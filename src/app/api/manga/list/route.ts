import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiLimiter } from "@/lib/rate-limiter";
import { autoCompleteAnimeForChallenge } from "@/lib/challenges";
import { checkAndAwardAchievement } from "@/lib/achievements-server";
export const dynamic = "force-dynamic";

const MANGA_SUBTYPES = ["manga", "light_novel", "manhwa", "manhua"] as const;

export async function GET(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ entries: [] });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const sort = searchParams.get("sort") || "updated";
  const query = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(48, Math.max(1, Number(searchParams.get("perPage")) || 24));

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "ALL") where.status = status;
  if (type && type !== "ALL") where.subType = type;
  if (query) where.title = { contains: query, mode: "insensitive" };

  const orderBy: Prisma.MangaEntryOrderByWithRelationInput[] =
    sort === "title"
      ? [{ title: "asc" }]
      : sort === "score"
        ? [{ score: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }]
        : sort === "chapters"
          ? [{ chapters: "desc" }, { updatedAt: "desc" }]
          : [{ updatedAt: "desc" }];

  const [entries, total, grouped] = await Promise.all([
    prisma.mangaEntry.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.mangaEntry.count({ where }),
    // Per-status totals for this user, so the browse hero and the My List
    // filter chips can show accurate counts without extra round-trips.
    prisma.mangaEntry.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  let overallTotal = 0;
  for (const g of grouped) {
    const n = g._count?._all ?? 0;
    counts[g.status] = n;
    overallTotal += n;
  }

  return NextResponse.json({
    entries,
    page,
    perPage,
    total,
    hasMore: page * perPage < total,
    counts,
    overallTotal,
  });
}

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, title, coverImage, status, chapters, volumes, totalChapters, totalVolumes, score, subType } = await req.json();
  if (!mediaId || !title) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const resolvedSubType = MANGA_SUBTYPES.includes(subType) ? subType : undefined;

  const entry = await prisma.mangaEntry.upsert({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
    update: {
      title, coverImage, status: status || "PLANNING",
      chapters: chapters ?? 0, volumes: volumes ?? 0,
      totalChapters, totalVolumes, score,
      ...(resolvedSubType && { subType: resolvedSubType }),
      ...(status === "READING" && { startedAt: new Date() }),
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
    create: {
      userId: session.user.id, mediaId, title, coverImage,
      status: status || "PLANNING", chapters: chapters ?? 0, volumes: volumes ?? 0,
      totalChapters, totalVolumes, score,
      ...(resolvedSubType && { subType: resolvedSubType }),
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
  const rateCheck = await apiLimiter.middleware(req);
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
