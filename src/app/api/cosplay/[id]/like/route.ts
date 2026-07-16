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

  const { id: cosplayId } = await params;
  const cosplay = await prisma.cosplay.findUnique({ where: { id: cosplayId } });
  if (!cosplay) {
    return NextResponse.json({ error: "Cosplay not found" }, { status: 404 });
  }

  const existing = await prisma.cosplayLike.findUnique({
    where: { cosplayId_userId: { cosplayId, userId: session.user.id } },
  });

  const result = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.cosplayLike.delete({ where: { id: existing.id } });
      const updated = await tx.cosplay.update({
        where: { id: cosplayId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false, likes: updated.likes };
    } else {
      await tx.cosplayLike.create({
        data: { cosplayId, userId: session.user.id },
      });
      const updated = await tx.cosplay.update({
        where: { id: cosplayId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true, likes: updated.likes };
    }
  });

  return NextResponse.json(result);
}
