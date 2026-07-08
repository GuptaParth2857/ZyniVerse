import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lists = await prisma.userList.findMany({
    where: { isFeatured: true, isPublic: true },
    orderBy: { sortOrder: "asc" },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      items: { select: { mediaImage: true }, take: 4, orderBy: { order: "asc" } },
      _count: { select: { items: true } },
    },
  });

  const result = lists.map((l) => ({
    ...l,
    itemCount: l._count.items,
    coverImages: l.items.map((i) => i.mediaImage).filter(Boolean) as string[],
    _count: undefined,
    items: undefined,
  }));

  return NextResponse.json({ lists: result });
}
