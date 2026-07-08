import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const list = await prisma.userList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { items: true } },
    },
  });

  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!list.isPublic && list.userId !== session?.user?.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let isLiked = false;
  if (session?.user?.id) {
    const like = await prisma.userListLike.findUnique({
      where: { listId_userId: { listId: id, userId: session.user.id } },
    });
    isLiked = !!like;
  }

  return NextResponse.json({
    list: { ...list, itemCount: list._count.items, _count: undefined },
    isOwner: session?.user?.id === list.userId,
    isLiked,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.userList.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, type, isPublic, isFeatured, sortOrder, items } = await req.json();

  const list = await prisma.$transaction(async (tx) => {
    if (items) {
      await tx.userListItem.deleteMany({ where: { listId: id } });
    }

    return tx.userList.update({
      where: { id },
      data: {
        title: title?.trim() ?? existing.title,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        type: type ?? existing.type,
        isPublic: isPublic ?? existing.isPublic,
        isFeatured: isFeatured ?? existing.isFeatured,
        sortOrder: sortOrder ?? existing.sortOrder,
        items: items ? {
          create: (items as Array<{ mediaId: number; mediaTitle: string; mediaImage?: string; mediaType: string; note?: string }>).map((item, i) => ({
            mediaId: item.mediaId,
            mediaTitle: item.mediaTitle,
            mediaImage: item.mediaImage || null,
            mediaType: item.mediaType,
            note: item.note || null,
            order: i,
          })),
        } : undefined,
      },
      include: {
        items: { orderBy: { order: "asc" } },
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { items: true } },
      },
    });
  });

  return NextResponse.json({ list: { ...list, itemCount: list._count.items, _count: undefined } });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.userList.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.userList.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
