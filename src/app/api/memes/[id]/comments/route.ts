import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { id } = await params;
  const meme = await prisma.meme.findUnique({ where: { id } });
  if (!meme) {
    return NextResponse.json({ error: "Meme not found" }, { status: 404 });
  }

  const comments = await prisma.memeComment.findMany({
    where: { memeId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const meme = await prisma.meme.findUnique({ where: { id } });
  if (!meme) {
    return NextResponse.json({ error: "Meme not found" }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.memeComment.create({
      data: { memeId: id, userId, content: content.trim() },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    await tx.meme.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  });

  return NextResponse.json({ comment: result });
}
