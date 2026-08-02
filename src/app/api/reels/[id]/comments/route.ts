import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.reelComment.findMany({
      where: { reelId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
    return NextResponse.json({ comments });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const body = await req.json();
    const content = String(body.content || "").trim().slice(0, 500);
    if (!content) {
      return NextResponse.json({ error: "Comment required" }, { status: 400 });
    }

    const reel = await prisma.reel.findUnique({ where: { id }, select: { id: true } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const comment = await prisma.reelComment.create({
      data: { reelId: id, userId: session.user.id, content },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
