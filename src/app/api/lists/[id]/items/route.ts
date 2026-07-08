import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const list = await prisma.userList.findUnique({ where: { id }, select: { id: true, isPublic: true, userId: true } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await auth();
  if (!list.isPublic && list.userId !== session?.user?.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await prisma.userListItem.findMany({
    where: { listId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const list = await prisma.userList.findUnique({ where: { id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (list.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { mediaId, mediaTitle, mediaImage, mediaType, note } = await req.json();
  if (!mediaId || !mediaTitle || !mediaType) return NextResponse.json({ error: "mediaId, mediaTitle, and mediaType are required" }, { status: 400 });

  const existing = await prisma.userListItem.findUnique({
    where: { listId_mediaId: { listId: id, mediaId } },
  });
  if (existing) return NextResponse.json({ error: "Item already in list" }, { status: 409 });

  const maxOrder = await prisma.userListItem.aggregate({
    where: { listId: id },
    _max: { order: true },
  });

  const item = await prisma.userListItem.create({
    data: {
      listId: id,
      mediaId,
      mediaTitle,
      mediaImage: mediaImage || null,
      mediaType,
      note: note || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const list = await prisma.userList.findUnique({ where: { id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (list.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const mediaId = searchParams.get("mediaId");
  if (!mediaId) return NextResponse.json({ error: "mediaId query param is required" }, { status: 400 });

  await prisma.userListItem.deleteMany({
    where: { listId: id, mediaId: parseInt(mediaId) },
  });

  return NextResponse.json({ ok: true });
}
