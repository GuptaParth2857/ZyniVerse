import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REASONS = [
  "inappropriate",
  "spam",
  "harassment",
  "copyright",
  "misinformation",
  "spoiler",
  "other",
] as const;

const VALID_TYPES = new Set([
  "POST",
  "COMMENT",
  "MEME",
  "FANART",
  "CLIP",
  "COSPLAY",
  "REVIEW",
  "LONG_REVIEW",
  "BLOG",
  "WIKI",
  "FORUM_THREAD",
  "FORUM_POST",
  "CLUB_POST",
  "CLUB_COMMENT",
  "REEL_COMMENT",
  "MOMENT",
  "REEL",
]);

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contentType = body?.contentType as string;
  const contentId = body?.contentId as string;
  const reason = body?.reason as string;
  const note = (body?.note as string | undefined)?.slice(0, 500);
  const authorId = body?.authorId as string | undefined;

  if (!contentType || !VALID_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }
  if (!contentId || typeof contentId !== "string") {
    return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
  }
  if (!reason || !(REASONS as readonly string[]).includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const existing = await prisma.contentReport.findUnique({
    where: { contentType_contentId_userId: { contentType, contentId, userId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already reported" }, { status: 409 });
  }

  await prisma.contentReport.create({
    data: {
      contentType,
      contentId,
      authorId: authorId || null,
      userId,
      reason,
      note: note || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}