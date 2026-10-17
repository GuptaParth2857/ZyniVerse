import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

// Per-user like state for a single cosplay. Kept separate from the public
// `/api/cosplay/[id]` read (which is cached and shared between visitors) so a
// guest never sees another user's like flag.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cosplayId } = await params;
  const session = await auth();

  const headers = { "Cache-Control": "private, no-store" };
  if (!session?.user?.id) {
    return NextResponse.json({ liked: false }, { headers });
  }

  const existing = await prisma.cosplayLike.findUnique({
    where: { cosplayId_userId: { cosplayId, userId: session.user.id } },
    select: { id: true },
  });

  return NextResponse.json({ liked: !!existing }, { headers });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: cosplayId } = await params;
  const cosplay = await prisma.cosplay.findUnique({ where: { id: cosplayId } });
  if (!cosplay) {
    return NextResponse.json({ error: "Cosplay not found" }, { status: 404 });
  }

  const existing = await prisma.cosplayLike.findUnique({
    where: { cosplayId_userId: { cosplayId, userId } },
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
        data: { cosplayId, userId },
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
