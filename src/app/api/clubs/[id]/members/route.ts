import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const members = await prisma.clubMember.findMany({
    where: { clubId: id },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return NextResponse.json({ members });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  const caller = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  const isOwner = club.ownerId === session.user.id;
  const isAdmin = caller?.role === "admin";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await req.json();
  const validRoles = ["admin", "moderator", "member"];
  if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const target = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId } },
  });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.role === "owner") return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });

  const updated = await prisma.clubMember.update({
    where: { id: target.id },
    data: { role },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ member: updated });
}
