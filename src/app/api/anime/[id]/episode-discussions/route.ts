import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import { apiLimiter } from "@/lib/rate-limiter";

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mediaId = Number(id);
  if (isNaN(mediaId)) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const episode = Math.max(1, Number(searchParams.get("episode")) || 1);

  const comments = await prisma.episodeThreadComment.findMany({
    where: { mediaId, episode },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { id } = await params;
  const mediaId = Number(id);
  if (isNaN(mediaId)) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to join the discussion" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const episode = Math.max(1, Number(body.episode) || 1);
  const content = sanitize(body.content || "");
  if (!content) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });

  const comment = await prisma.episodeThreadComment.create({
    data: { mediaId, episode, userId, content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
