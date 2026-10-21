import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import { withPrivateCache, withPublicCache } from "@/lib/api-cache";

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

  // The visitor's own like / vote / ownership is fetched separately from
  // /api/viewer-state, so a public list can be served from the CDN cache. A
  // private list is only visible to its owner and must never be shared.
  const res = NextResponse.json({
    list: { ...list, itemCount: list._count.items, _count: undefined },
  });
  return list.isPublic ? withPublicCache(res) : withPrivateCache(res);
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

  const { title, description, type, isPublic, isFeatured, sortOrder, category, items } = await req.json();

  const featuredAllowed = isAdminEmail(session.user?.email);

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
        isFeatured: featuredAllowed ? (isFeatured ?? existing.isFeatured) : existing.isFeatured,
        sortOrder: sortOrder ?? existing.sortOrder,
        category: category !== undefined ? (category?.trim() ?? "") : existing.category,
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
