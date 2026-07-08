import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mediaId = Number((await params).id);
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) {
    updateData.status = body.status;
    if (body.status === "READING") updateData.startedAt = new Date();
    if (body.status === "COMPLETED") updateData.completedAt = new Date();
  }
  if (body.score != null) updateData.score = body.score;
  if (body.totalChapters != null) updateData.totalChapters = body.totalChapters;
  if (body.totalVolumes != null) updateData.totalVolumes = body.totalVolumes;

  const entry = await prisma.mangaEntry.upsert({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
    update: updateData,
    create: {
      userId: session.user.id,
      mediaId,
      title: body.title || "Unknown",
      coverImage: body.coverImage,
      status: body.status || "PLANNING",
    },
  });

  return NextResponse.json({ entry });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mediaId = Number((await params).id);
  const body = await req.json();

  const existing = await prisma.mangaEntry.findUnique({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
  });
  if (!existing) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.chapters != null) data.chapters = Math.max(0, body.chapters);
  if (body.volumes != null) data.volumes = Math.max(0, body.volumes);

  const entry = await prisma.mangaEntry.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({ entry });
}
