import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fanArt = await prisma.fanArt.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!fanArt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ fanArt });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.fanArt.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, animeTitle, animeId, character, imageUrl, artType, tags } = await req.json();

  const updated = await prisma.fanArt.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(animeTitle !== undefined && { animeTitle: animeTitle || null }),
      ...(animeId !== undefined && { animeId: animeId ? parseInt(animeId) : null }),
      ...(character !== undefined && { character: character || null }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(artType !== undefined && { artType }),
      ...(tags !== undefined && { tags }),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ fanArt: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.fanArt.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.fanArt.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
