import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

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
  const { id: fanArtId } = await params;
  const fanArt = await prisma.fanArt.findUnique({ where: { id: fanArtId } });
  if (!fanArt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.fanArtLike.findUnique({
    where: { fanArtId_userId: { fanArtId, userId } },
  });

  const result = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.fanArtLike.delete({ where: { id: existing.id } });
      const updated = await tx.fanArt.update({
        where: { id: fanArtId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false, likes: updated.likes };
    } else {
      await tx.fanArtLike.create({
        data: { fanArtId, userId },
      });
      const updated = await tx.fanArt.update({
        where: { id: fanArtId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true, likes: updated.likes };
    }
  });

  return NextResponse.json(result);
}
