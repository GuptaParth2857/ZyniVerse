import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

const ANON_USERNAME = "anonymous";

async function getOrCreateAnonymousUser() {
  let anon = await prisma.user.findUnique({ where: { username: ANON_USERNAME } });
  if (!anon) {
    anon = await prisma.user.create({
      data: {
        email: "anonymous@zyniverse.in",
        username: ANON_USERNAME,
        avatar: null,
      },
    });
  }
  return anon.id;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const animeId = searchParams.get("animeId");
    const userId = searchParams.get("userId");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isPublic: true };
    if (animeId) where.animeId = parseInt(animeId);
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { quote: { contains: search, mode: "insensitive" } },
        { character: { contains: search, mode: "insensitive" } },
        { animeTitle: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = sort === "popular"
      ? { likesCount: "desc" as const }
      : sort === "trending"
        ? { viewsCount: "desc" as const }
        : { createdAt: "desc" as const };

    const [moments, total] = await Promise.all([
      prisma.moment.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { likes: true } },
        },
      }),
      prisma.moment.count({ where }),
    ]);

    return NextResponse.json({
      moments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch moments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId: requestedUserId, animeId, animeTitle, animeCover, quote, character, episode, timestamp, style } = body;

    if (!animeId || !animeTitle || !quote || !character) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userId = requestedUserId;
    if (!userId || userId === "current-user") {
      userId = await getOrCreateAnonymousUser();
    }

    const moment = await prisma.moment.create({
      data: {
        userId,
        animeId: parseInt(animeId),
        animeTitle,
        animeCover: animeCover || null,
        quote,
        character,
        episode: episode || null,
        timestamp: timestamp || null,
        style: style || "classic",
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    return NextResponse.json(moment, { status: 201 });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to save moment" }, { status: 500 });
  }
}
