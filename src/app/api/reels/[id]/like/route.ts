import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const reel = await prisma.reel.findUnique({ where: { id } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const existing = await prisma.reelLike.findUnique({
      where: { userId_reelId: { userId: session.user.id, reelId: id } },
    });

    if (existing) {
      await prisma.reelLike.delete({ where: { id: existing.id } });
      const count = await prisma.reelLike.count({ where: { reelId: id } });
      return NextResponse.json({ liked: false, likesCount: count });
    }

    await prisma.reelLike.create({ data: { userId: session.user.id, reelId: id } });
    const count = await prisma.reelLike.count({ where: { reelId: id } });
    return NextResponse.json({ liked: true, likesCount: count });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
