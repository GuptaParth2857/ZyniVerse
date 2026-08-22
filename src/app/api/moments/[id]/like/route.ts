import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { resolveUserId } from "@/lib/resolve-user";

async function getEffectiveUserId() {
  const sessionUserId = await resolveUserId();
  if (sessionUserId) return sessionUserId;
  const anon = await prisma.user.findUnique({ where: { username: "anonymous" } });
  return anon?.id || null;
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Derive the actor from the session (guests share the anonymous user).
    // Never trust a client-supplied userId.
    const userId = await getEffectiveUserId();

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
