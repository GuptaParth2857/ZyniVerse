import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { logError } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { value } = await req.json();

    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: "Value must be 1 or -1" }, { status: 400 });
    }

    const review = await prisma.longReview.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await prisma.longReviewVote.findUnique({
      where: { reviewId_userId: { reviewId: id, userId: session.user.id } },
    });

    if (existing && existing.value === value) {
      await prisma.longReviewVote.delete({ where: { id: existing.id } });
      const increment = value === 1 ? -1 : 1;
      const updated = await prisma.longReview.update({
        where: { id },
        data: { upvotes: { increment } },
        select: { upvotes: true },
      });
      return NextResponse.json({ userVote: null, upvotes: updated.upvotes });
    }

    if (existing) {
      await prisma.longReviewVote.update({
        where: { id: existing.id },
        data: { value },
      });
      const increment = value === 1 ? 2 : -2;
      const updated = await prisma.longReview.update({
        where: { id },
        data: { upvotes: { increment } },
        select: { upvotes: true },
      });
      return NextResponse.json({ userVote: value, upvotes: updated.upvotes });
    }

    await prisma.longReviewVote.create({
      data: { reviewId: id, userId: session.user.id, value },
    });

    const increment = value === 1 ? 1 : -1;
    const updated = await prisma.longReview.update({
      where: { id },
      data: { upvotes: { increment } },
      select: { upvotes: true },
    });

    return NextResponse.json({ userVote: value, upvotes: updated.upvotes });
  } catch (e) {
    logError(e, "long-review-vote");
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
