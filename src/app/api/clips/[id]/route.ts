import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

async function GET_inner(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clip = await prisma.sceneClip.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  await prisma.sceneClip.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json({ clip: { ...clip, views: clip.views + 1 } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const clip = await prisma.sceneClip.findUnique({ where: { id } });
  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }
  if (clip.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, imageUrl, videoUrl, mediaTitle, mediaId, timestamp, tags } = await req.json();
  const updated = await prisma.sceneClip.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(mediaTitle !== undefined && { mediaTitle }),
      ...(mediaId !== undefined && { mediaId: mediaId ? parseInt(mediaId) : null }),
      ...(timestamp !== undefined && { timestamp }),
      ...(tags !== undefined && { tags }),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ clip: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const clip = await prisma.sceneClip.findUnique({ where: { id } });
  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }
  if (clip.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.sceneClip.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
