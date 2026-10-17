import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { invalidateCached } from "@/lib/wiki-cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const meme = await prisma.meme.findUnique({ where: { id } });
  if (!meme) {
    return NextResponse.json({ error: "Meme not found" }, { status: 404 });
  }

  const { value } = await req.json();
  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "Value must be 1 or -1" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.memeVote.findUnique({
      where: { memeId_userId: { memeId: id, userId } },
    });

    let upvotes = meme.upvotes;
    let downvotes = meme.downvotes;

    if (!existing) {
      await tx.memeVote.create({
        data: { memeId: id, userId, value },
      });
      if (value === 1) upvotes += 1;
      else downvotes += 1;
    } else if (existing.value === value) {
      await tx.memeVote.delete({ where: { id: existing.id } });
      if (value === 1) upvotes -= 1;
      else downvotes -= 1;
    } else {
      await tx.memeVote.update({
        where: { id: existing.id },
        data: { value },
      });
      if (value === 1) {
        upvotes += 1;
        downvotes -= 1;
      } else {
        downvotes += 1;
        upvotes -= 1;
      }
    }

    return tx.meme.update({
      where: { id },
      data: { upvotes, downvotes },
      select: { id: true, upvotes: true, downvotes: true, title: true },
    });
  });

  // Vote totals feed the "top" and "hot" sorts, so refresh those caches.
  invalidateCached("memes:");

  return NextResponse.json({ meme: updated });
}
