import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function getMemberRole(watchlistId: string, userId: string) {
  const member = await prisma.sharedWatchlistMember.findUnique({
    where: { watchlistId_userId: { watchlistId, userId } },
  });
  return member?.role || null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (!role) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const items = await prisma.sharedWatchlistItem.findMany({
    where: { watchlistId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (!role || role === "viewer") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { mediaId, mediaTitle, mediaImage, note } = await req.json();
  if (!mediaId || !mediaTitle?.trim()) return NextResponse.json({ error: "mediaId and mediaTitle required" }, { status: 400 });

  const maxOrder = await prisma.sharedWatchlistItem.aggregate({
    where: { watchlistId: id },
    _max: { order: true },
  });

  const item = await prisma.sharedWatchlistItem.upsert({
    where: { watchlistId_mediaId: { watchlistId: id, mediaId: Number(mediaId) } },
    update: { note: note?.trim() || null },
    create: {
      watchlistId: id,
      mediaId: Number(mediaId),
      mediaTitle: mediaTitle.trim(),
      mediaImage: mediaImage || null,
      addedBy: session.user.id,
      note: note?.trim() || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (!role || role === "viewer") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { mediaId } = await req.json();
  if (!mediaId) return NextResponse.json({ error: "mediaId required" }, { status: 400 });

  await prisma.sharedWatchlistItem.deleteMany({
    where: { watchlistId: id, mediaId: Number(mediaId) },
  });

  return NextResponse.json({ success: true });
}
