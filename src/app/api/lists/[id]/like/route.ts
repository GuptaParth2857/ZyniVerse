import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const list = await prisma.userList.findUnique({ where: { id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.userListLike.findUnique({
    where: { listId_userId: { listId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.userListLike.delete({ where: { id: existing.id } }),
      prisma.userList.update({ where: { id }, data: { likes: { decrement: 1 } } }),
    ]);
    const updated = await prisma.userList.findUnique({ where: { id }, select: { likes: true } });
    return NextResponse.json({ liked: false, likes: updated?.likes ?? 0 });
  } else {
    await prisma.$transaction([
      prisma.userListLike.create({ data: { listId: id, userId: session.user.id } }),
      prisma.userList.update({ where: { id }, data: { likes: { increment: 1 } } }),
    ]);
    const updated = await prisma.userList.findUnique({ where: { id }, select: { likes: true } });
    return NextResponse.json({ liked: true, likes: updated?.likes ?? 0 });
  }
}
