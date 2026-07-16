import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const club = await prisma.club.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
        orderBy: { joinedAt: "asc" },
      },
      posts: {
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      },
      events: {
        include: {
          members: {
            include: { user: { select: { id: true, username: true, avatar: true } } },
          },
        },
        orderBy: { startTime: "asc" },
      },
      _count: { select: { members: true, posts: true, joinRequests: true } },
    },
  });

  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  return NextResponse.json({ club });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  const isOwner = club.ownerId === session.user.id;
  const isAdmin = member?.role === "admin";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, rules, category, isPrivate, coverImage, icon } = await req.json();

  const updated = await prisma.club.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(rules !== undefined ? { rules } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(isPrivate !== undefined ? { isPrivate } : {}),
      ...(coverImage !== undefined ? { coverImage } : {}),
      ...(icon !== undefined ? { icon } : {}),
    },
  });

  return NextResponse.json({ club: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
  if (club.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.club.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
