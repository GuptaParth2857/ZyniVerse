import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, threadId, vote } = await req.json();

  if (!postId && !threadId) {
    return NextResponse.json({ error: "postId or threadId is required" }, { status: 400 });
  }

  if (vote !== 1 && vote !== -1) {
    return NextResponse.json({ error: "Vote must be 1 or -1" }, { status: 400 });
  }

  if (postId) {
    const existing = await prisma.forumVote.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    });

    if (existing) {
      if (existing.vote === vote) {
        await prisma.forumVote.delete({ where: { id: existing.id } });
        return NextResponse.json({ vote: null });
      }
      const updated = await prisma.forumVote.update({
        where: { id: existing.id },
        data: { vote },
      });
      return NextResponse.json({ vote: updated });
    }

    const created = await prisma.forumVote.create({
      data: { postId, userId: session.user.id, vote },
    });
    return NextResponse.json({ vote: created }, { status: 201 });
  }

  if (threadId) {
    const existing = await prisma.forumVote.findUnique({
      where: { threadId_userId: { threadId, userId: session.user.id } },
    });

    if (existing) {
      if (existing.vote === vote) {
        await prisma.forumVote.delete({ where: { id: existing.id } });
        return NextResponse.json({ vote: null });
      }
      const updated = await prisma.forumVote.update({
        where: { id: existing.id },
        data: { vote },
      });
      return NextResponse.json({ vote: updated });
    }

    const created = await prisma.forumVote.create({
      data: { threadId, userId: session.user.id, vote },
    });
    return NextResponse.json({ vote: created }, { status: 201 });
  }
}
