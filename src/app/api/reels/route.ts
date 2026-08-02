import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const userId = searchParams.get("userId");
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const orderBy =
      sort === "popular"
        ? { views: "desc" as const }
        : { createdAt: "desc" as const };

    const [reels, total] = await Promise.all([
      prisma.reel.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.reel.count({ where }),
    ]);

    let likedReelIds: Set<string> = new Set();
    if (session?.user?.id) {
      const ids = reels.map((r) => r.id);
      if (ids.length > 0) {
        const myLikes = await prisma.reelLike.findMany({
          where: { userId: session.user.id, reelId: { in: ids } },
          select: { reelId: true },
        });
        likedReelIds = new Set(myLikes.map((l) => l.reelId));
      }
    }

    const data = reels.map((r) => ({
      id: r.id,
      videoUrl: r.videoUrl,
      thumbnailUrl: r.thumbnailUrl,
      caption: r.caption,
      duration: r.duration,
      views: r.views,
      createdAt: r.createdAt,
      likesCount: r._count.likes,
      commentsCount: r._count.comments,
      likedByMe: likedReelIds.has(r.id),
      user: r.user,
    }));

    return NextResponse.json({
      reels: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoUrl, thumbnailUrl, caption, duration } = body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    const reel = await prisma.reel.create({
      data: {
        userId: session.user.id,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        caption: caption ? String(caption).slice(0, 500) : null,
        duration: Math.max(0, Math.min(180, parseInt(duration || "0") || 0)),
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json(
      {
        id: reel.id,
        videoUrl: reel.videoUrl,
        thumbnailUrl: reel.thumbnailUrl,
        caption: reel.caption,
        duration: reel.duration,
        views: reel.views,
        createdAt: reel.createdAt,
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
        user: reel.user,
      },
      { status: 201 }
    );
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to save reel" }, { status: 500 });
  }
}
