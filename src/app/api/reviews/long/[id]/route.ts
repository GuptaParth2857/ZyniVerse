import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const review = await prisma.longReview.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        ...(userId
          ? { votes: { where: { userId }, select: { value: true } } }
          : {}),
      },
    });

    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { votes, ...rest } = review as typeof review & { votes?: { value: number }[] };

    return NextResponse.json({
      review: { ...rest, userVote: votes?.[0]?.value ?? null },
    });
  } catch (e) {
    logError(e, "long-review-get");
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const existing = await prisma.longReview.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, content, rating } = await req.json();

    if (title != null && (title.trim().length < 3 || title.trim().length > 200)) {
      return NextResponse.json({ error: "Title must be 3-200 characters" }, { status: 400 });
    }

    if (content != null && (content.trim().length < 10 || content.trim().length > 5000)) {
      return NextResponse.json({ error: "Content must be 10-5000 characters" }, { status: 400 });
    }

    if (rating != null && (rating < 1 || rating > 10)) {
      return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title != null) updateData.title = title.trim();
    if (content != null) updateData.content = content.trim();
    if (rating !== undefined) updateData.rating = rating != null ? parseInt(rating) : null;

    const review = await prisma.longReview.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    return NextResponse.json({ review });
  } catch (e) {
    logError(e, "long-review-put");
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const existing = await prisma.longReview.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.longReview.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError(e, "long-review-delete");
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
