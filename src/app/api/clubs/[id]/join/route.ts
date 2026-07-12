import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  const existing = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 400 });

  if (club.isPrivate) {
    const existingReq = await prisma.clubJoinRequest.findUnique({
      where: { clubId_userId: { clubId: id, userId: session.user.id } },
    });
    if (existingReq) return NextResponse.json({ error: "Join request already pending" }, { status: 400 });

    const request = await prisma.clubJoinRequest.create({
      data: { clubId: id, userId: session.user.id },
    });

    if (club.ownerId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: club.ownerId,
          type: "CLUB",
          title: "Join Request",
          body: `Someone requested to join "${club.name}"`,
          link: `/clubs/${club.slug}`,
        },
      });
    }

    return NextResponse.json({ request }, { status: 201 });
  }

  await prisma.clubMember.create({
    data: { clubId: id, userId: session.user.id, role: "member" },
  });
  await prisma.club.update({ where: { id }, data: { memberCount: { increment: 1 } } });

  if (club.ownerId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: club.ownerId,
        type: "CLUB",
        title: "New Member",
        body: `Someone joined "${club.name}"`,
        link: `/clubs/${club.slug}`,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: "CLUB",
      title: `Welcome to ${club.name}`,
      body: `You are now a member of "${club.name}"`,
      link: `/clubs/${club.slug}`,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  if (club.ownerId === session.user.id) return NextResponse.json({ error: "Owner cannot leave" }, { status: 400 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 400 });

  await prisma.clubMember.delete({ where: { id: member.id } });
  await prisma.club.update({ where: { id }, data: { memberCount: { decrement: 1 } } });

  return NextResponse.json({ success: true });
}
