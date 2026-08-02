import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

async function resolveUserId(userId: string) {
  if (!userId || userId === "current-user") {
    const anon = await prisma.user.findUnique({ where: { username: "anonymous" } });
    return anon?.id || null;
  }
  return userId;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: rawUserId } = await req.json();
    const userId = await resolveUserId(rawUserId);

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const existing = await prisma.momentLike.findUnique({
      where: { userId_momentId: { userId, momentId: id } },
    });

    if (existing) {
      await prisma.momentLike.delete({ where: { id: existing.id } });
      await prisma.moment.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      return NextResponse.json({ liked: false });
    }

    await prisma.momentLike.create({ data: { userId, momentId: id } });
    await prisma.moment.update({ where: { id }, data: { likesCount: { increment: 1 } } });
    return NextResponse.json({ liked: true });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
