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
  const { id: wallpaperId } = await params;
  const wallpaper = await prisma.wallpaper.findUnique({ where: { id: wallpaperId } });
  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.wallpaperLike.findUnique({
    where: { wallpaperId_userId: { wallpaperId, userId } },
  });

  const result = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.wallpaperLike.delete({ where: { id: existing.id } });
      const updated = await tx.wallpaper.update({
        where: { id: wallpaperId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false, likes: updated.likes };
    } else {
      await tx.wallpaperLike.create({
        data: { wallpaperId, userId },
      });
      const updated = await tx.wallpaper.update({
        where: { id: wallpaperId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true, likes: updated.likes };
    }
  });

  return NextResponse.json(result);
}
