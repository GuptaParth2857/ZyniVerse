import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cosplay = await prisma.cosplay.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });
  if (!cosplay) {
    return NextResponse.json({ error: "Cosplay not found" }, { status: 404 });
  }
  return NextResponse.json({ cosplay });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cosplay = await prisma.cosplay.findUnique({ where: { id } });
  if (!cosplay) {
    return NextResponse.json({ error: "Cosplay not found" }, { status: 404 });
  }
  if (cosplay.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, character, animeTitle, animeId, imageUrl, tags } = await req.json();
  const updated = await prisma.cosplay.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(character !== undefined && { character }),
      ...(animeTitle !== undefined && { animeTitle }),
      ...(animeId !== undefined && { animeId: animeId ? Number(animeId) : null }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(tags !== undefined && { tags }),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ cosplay: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cosplay = await prisma.cosplay.findUnique({ where: { id } });
  if (!cosplay) {
    return NextResponse.json({ error: "Cosplay not found" }, { status: 404 });
  }
  if (cosplay.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.cosplay.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
