import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clubId } = await params;
  const events = await prisma.clubEvent.findMany({
    where: { clubId },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
    },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json({ events });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId } = await params;
  const { title, description, startTime, endTime, isVirtual, streamUrl } = await req.json();
  if (!title || !startTime) return NextResponse.json({ error: "title and startTime required" }, { status: 400 });

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!member) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  const event = await prisma.clubEvent.create({
    data: {
      clubId,
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      isVirtual: isVirtual || false,
      streamUrl: streamUrl || null,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId } = await params;
  const { eventId, title, description, startTime, endTime, isVirtual, streamUrl } = await req.json();

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!member) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  const existingEvent = await prisma.clubEvent.findUnique({ where: { id: eventId }, select: { clubId: true } });
  if (!existingEvent || existingEvent.clubId !== clubId) {
    return NextResponse.json({ error: "Event not found in this club" }, { status: 404 });
  }

  const event = await prisma.clubEvent.update({
    where: { id: eventId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
      ...(isVirtual !== undefined && { isVirtual }),
      ...(streamUrl !== undefined && { streamUrl }),
    },
  });

  return NextResponse.json({ event });
}
