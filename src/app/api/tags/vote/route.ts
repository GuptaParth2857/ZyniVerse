import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, tag, vote } = await req.json();
  if (!mediaId || !tag) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.tagVote.findUnique({
    where: { userId_mediaId_tag: { userId: session.user.id, mediaId, tag } },
  });

  if (existing) {
    await prisma.tagVote.update({ where: { id: existing.id }, data: { vote: vote ?? 1 } });
  } else {
    await prisma.tagVote.create({ data: { userId: session.user.id, mediaId, tag, vote: vote ?? 1 } });
  }

  return NextResponse.json({ success: true });
}
