import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { awardForReason } from "@/lib/economy";
export const dynamic = "force-dynamic";

async function GET_inner(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, username: true } } },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, content } = await req.json();
  if (!postId || !content?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { postId, userId: session.user.id, content: content.trim() },
    include: { author: { select: { id: true, username: true } } },
  });

  // One award per comment (ref = comment id), fire-and-forget so a ledger
  // hiccup never fails the comment the user just wrote.
  awardForReason(session.user.id, "COMMENT_POSTED", comment.id).catch(() => {});

  return NextResponse.json({ comment }, { status: 201 });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
