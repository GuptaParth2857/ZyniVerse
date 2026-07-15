import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clubId } = await params;
  const bans = await prisma.clubBan.findMany({
    where: { clubId },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      banner: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bans });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId } = await params;
  const { userId, reason } = await req.json();

  const actor = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!actor) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  const existingBan = await prisma.clubBan.findUnique({
    where: { clubId_userId: { clubId, userId } },
  });
  if (existingBan) return NextResponse.json({ error: "Already banned" }, { status: 400 });

  await prisma.clubBan.create({
    data: { clubId, userId, bannedBy: session.user.id, reason },
  });

  const deleted = await prisma.clubMember.deleteMany({ where: { clubId, userId } });
  if (deleted.count > 0) {
    await prisma.club.update({
      where: { id: clubId },
      data: { memberCount: { decrement: 1 } },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId } = await params;
  const { banId } = await req.json();

  const actor = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!actor) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  await prisma.clubBan.delete({ where: { id: banId } });
  return NextResponse.json({ success: true });
}
