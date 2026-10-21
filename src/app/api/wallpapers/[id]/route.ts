import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function GET_inner(_req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ wallpaper });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.wallpaper.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, imageUrl, thumbnailUrl, animeTitle, animeId, resolution, category, tags } = await req.json();

  const updated = await prisma.wallpaper.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl: thumbnailUrl || null }),
      ...(animeTitle !== undefined && { animeTitle: animeTitle || null }),
      ...(animeId !== undefined && { animeId: animeId ? parseInt(animeId) : null }),
      ...(resolution !== undefined && { resolution: resolution || null }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags }),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ wallpaper: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.wallpaper.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.wallpaper.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
