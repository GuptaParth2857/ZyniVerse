import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tierList = await prisma.tierList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { votes: true } },
    },
  });

  if (!tierList) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    tierList: { ...tierList, voteCount: tierList._count.votes, _count: undefined },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.tierList.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, isPublic, items } = await req.json();

  const tierList = await prisma.$transaction(async (tx) => {
    await tx.tierListItem.deleteMany({ where: { tierListId: id } });

    return tx.tierList.update({
      where: { id },
      data: {
        title: title?.trim() ?? existing.title,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        isPublic: isPublic ?? existing.isPublic,
        items: {
          create: (items || []).map((item: { tier: string; mediaId: number; mediaTitle: string; mediaImage?: string }, i: number) => ({
            tier: item.tier,
            mediaId: item.mediaId,
            mediaTitle: item.mediaTitle,
            mediaImage: item.mediaImage || null,
            order: i,
          })),
        },
      },
      include: {
        items: { orderBy: { order: "asc" } },
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { votes: true } },
      },
    });
  });

  return NextResponse.json({
    tierList: { ...tierList, voteCount: tierList._count.votes, _count: undefined },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.tierList.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.tierList.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
