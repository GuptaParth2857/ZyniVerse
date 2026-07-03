import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: { id: true, username: true } },
          _count: { select: { comments: true, savedBy: true } },
        },
      },
    },
  });

  return NextResponse.json({
    saved: saved.map((s) => ({
      ...s.post,
      commentCount: s.post._count.comments,
      saveCount: s.post._count.savedBy,
      isSaved: true,
      savedAt: s.createdAt,
      _count: undefined,
    })),
  });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedPost.create({
    data: { userId: session.user.id, postId },
  });
  return NextResponse.json({ saved: true });
}
