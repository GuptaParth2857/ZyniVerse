import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getUserChallengeEntries, addChallengeEntry, removeChallengeEntry } from "@/lib/challenges";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challengeId = (await params).id;
  const entries = await getUserChallengeEntries(challengeId, session.user.id);

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challengeId = (await params).id;
  const body = await req.json();
  const { mediaId, mediaTitle, mediaImage, mediaType, episodeCount, chapterCount } = body;

  if (!mediaId || !mediaTitle || !mediaType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["anime", "manga"].includes(mediaType)) {
    return NextResponse.json({ error: "mediaType must be 'anime' or 'manga'" }, { status: 400 });
  }

  await addChallengeEntry(challengeId, session.user.id, {
    mediaId,
    mediaTitle,
    mediaImage,
    mediaType: mediaType as "anime" | "manga",
    episodeCount,
    chapterCount,
  });

  const progress = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId: session.user.id } },
    select: { progress: true, goalCount: true },
  });

  return NextResponse.json({ ok: true, progress });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challengeId = (await params).id;
  const { mediaId } = await req.json();

  if (!mediaId) return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });

  await removeChallengeEntry(challengeId, session.user.id, mediaId);

  return NextResponse.json({ ok: true });
}
