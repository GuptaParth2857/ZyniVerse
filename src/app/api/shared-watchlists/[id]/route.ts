import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function getWatchlistWithAccess(id: string) {
  const watchlist = await prisma.sharedWatchlist.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      items: { orderBy: { order: "asc" } },
      _count: { select: { items: true } },
    },
  });
  return watchlist;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const watchlist = await getWatchlistWithAccess(id);
  if (!watchlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session?.user?.id;
  const isMember = !!userId && (
    watchlist.ownerId === userId ||
    watchlist.members.some((m) => m.userId === userId)
  );
  if (!isMember) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  return NextResponse.json({ watchlist });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await prisma.sharedWatchlist.findUnique({ where: { id } });
  if (!watchlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (watchlist.ownerId !== session.user.id) return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const { title, description } = await req.json();

  const updated = await prisma.sharedWatchlist.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  });

  return NextResponse.json({ watchlist: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await prisma.sharedWatchlist.findUnique({ where: { id } });
  if (!watchlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (watchlist.ownerId !== session.user.id) return NextResponse.json({ error: "Owner only" }, { status: 403 });

  await prisma.sharedWatchlist.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
