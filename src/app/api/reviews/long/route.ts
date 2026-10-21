import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { logError } from "@/lib/logger";
import { notifyAllWebhooks } from "@/lib/webhook-dispatcher";
import { awardForReason } from "@/lib/economy";
import { withPublicCache } from "@/lib/api-cache";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const sort = searchParams.get("sort") || "top";

    if (!mediaId) return NextResponse.json({ error: "mediaId is required" }, { status: 400 });

    const where = { mediaId: parseInt(mediaId) };
    const orderBy = sort === "recent"
      ? { createdAt: "desc" as const }
      : { upvotes: "desc" as const };

    const [reviews, total] = await Promise.all([
      prisma.longReview.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.longReview.count({ where }),
    ]);

    // The visitor's own review vote is fetched separately from
    // /api/viewer-state, so this response is identical for everyone and can be
    // served from the CDN.
    const res = NextResponse.json({
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return withPublicCache(res);
  } catch (e) {
    logError(e, "long-reviews-get");
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { mediaId, mediaTitle, mediaImage, title, content, rating } = await req.json();

    if (!mediaId || !mediaTitle?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields (mediaId, mediaTitle, title, content)" }, { status: 400 });
    }

    if (title.trim().length < 3 || title.trim().length > 200) {
      return NextResponse.json({ error: "Title must be 3-200 characters" }, { status: 400 });
    }

    if (content.trim().length < 10 || content.trim().length > 5000) {
      return NextResponse.json({ error: "Content must be 10-5000 characters" }, { status: 400 });
    }

    if (rating != null && (rating < 1 || rating > 10)) {
      return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
    }

    const review = await prisma.longReview.create({
      data: {
        userId: session.user.id,
        mediaId: parseInt(mediaId),
        mediaTitle: mediaTitle.trim(),
        mediaImage: mediaImage || null,
        title: title.trim(),
        content: content.trim(),
        rating: rating != null ? parseInt(rating) : null,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    notifyAllWebhooks("review.created", {
      reviewId: review.id,
      mediaId: review.mediaId,
      mediaTitle: review.mediaTitle,
      rating: review.rating,
      userId: session.user.id,
    });

    awardForReason(session.user.id, "REVIEW_CREATED", review.id).catch(() => {});

    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    logError(e, "long-reviews-post");
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
