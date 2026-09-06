import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlists = await prisma.sharedWatchlist.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ watchlists });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const watchlist = await prisma.sharedWatchlist.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "owner" },
      },
    },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json({ watchlist });
}
