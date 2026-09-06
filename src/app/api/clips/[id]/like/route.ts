import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: clipId } = await params;
  const clip = await prisma.sceneClip.findUnique({ where: { id: clipId } });
  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  const existing = await prisma.sceneClipLike.findUnique({
    where: { clipId_userId: { clipId, userId } },
  });

  const result = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.sceneClipLike.delete({ where: { id: existing.id } });
      const updated = await tx.sceneClip.update({
        where: { id: clipId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false, likes: updated.likes };
    } else {
      await tx.sceneClipLike.create({
        data: { clipId, userId },
      });
      const updated = await tx.sceneClip.update({
        where: { id: clipId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true, likes: updated.likes };
    }
  });

  return NextResponse.json(result);
}
