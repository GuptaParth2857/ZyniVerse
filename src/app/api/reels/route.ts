import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getReelsFeed, invalidateReelsFeed } from "@/lib/reels-feed";
export const dynamic = "force-dynamic";

const JSON_HEADERS = { "Cache-Control": "private, max-age=7" };

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const payload = await getReelsFeed({
      page: Math.max(1, parseInt(searchParams.get("page") || "1")),
      limit: Math.min(
        30,
        Math.max(1, parseInt(searchParams.get("limit") || "10")),
      ),
      userId: searchParams.get("userId"),
      username: searchParams.get("username"),
      sort: searchParams.get("sort") || "newest",
      following: searchParams.get("following") === "1",
      viewerId: session?.user?.id ?? null,
    });

    return NextResponse.json(payload, { headers: JSON_HEADERS });
  } catch (e) {
    logError(e);
    return NextResponse.json(
      { error: "Failed to fetch reels" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoUrl, thumbnailUrl, caption, duration, animeId, animeTitle } =
      body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }
    if (!/^https?:\/\//i.test(videoUrl)) {
      return NextResponse.json(
        { error: "videoUrl must be an http(s) URL" },
        { status: 400 },
      );
    }
    const safeThumbnail =
      typeof thumbnailUrl === "string" && /^https?:\/\//i.test(thumbnailUrl)
        ? thumbnailUrl
        : null;

    const reel = await prisma.reel.create({
      data: {
        userId: session.user.id,
        videoUrl,
        thumbnailUrl: safeThumbnail,
        caption: caption ? String(caption).slice(0, 500) : null,
        duration: Math.max(0, Math.min(180, parseInt(duration || "0") || 0)),
        animeId: Number.isInteger(animeId) ? (animeId as number) : null,
        animeTitle:
          animeTitle && typeof animeTitle === "string"
            ? String(animeTitle).slice(0, 120)
            : null,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    invalidateReelsFeed();
    if (reel.animeId) {
      revalidatePath(`/anime/${reel.animeId}`);
    }

    return NextResponse.json(
      {
        id: reel.id,
        videoUrl: reel.videoUrl,
        thumbnailUrl: reel.thumbnailUrl,
        caption: reel.caption,
        duration: reel.duration,
        views: reel.views,
        animeId: reel.animeId,
        animeTitle: reel.animeTitle,
        createdAt: reel.createdAt,
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
        user: reel.user,
      },
      { status: 201 },
    );
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to save reel" }, { status: 500 });
  }
}
