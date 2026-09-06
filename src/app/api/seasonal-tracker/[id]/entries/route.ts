import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tracker = await prisma.seasonalTracker.findUnique({ where: { id } });
  if (!tracker) {
    return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
  }
  if (tracker.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { mediaId, mediaTitle, mediaImage, totalEpisodes } = await req.json();
  if (!mediaId || !mediaTitle) {
    return NextResponse.json({ error: "Missing mediaId or mediaTitle" }, { status: 400 });
  }

  const entry = await prisma.seasonalTrackerEntry.upsert({
    where: { trackerId_mediaId: { trackerId: id, mediaId: parseInt(mediaId) } },
    update: { totalEpisodes: totalEpisodes != null ? parseInt(totalEpisodes) : undefined },
    create: {
      trackerId: id,
      mediaId: parseInt(mediaId),
      mediaTitle,
      mediaImage: mediaImage || null,
      totalEpisodes: totalEpisodes != null ? parseInt(totalEpisodes) : null,
    },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tracker = await prisma.seasonalTracker.findUnique({ where: { id } });
  if (!tracker) {
    return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
  }
  if (tracker.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { mediaId } = await req.json();
  if (!mediaId) {
    return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });
  }

  await prisma.seasonalTrackerEntry.deleteMany({
    where: { trackerId: id, mediaId: parseInt(mediaId) },
  });

  return NextResponse.json({ success: true });
}
