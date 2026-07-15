import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await req.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "items must be an array" }, { status: 400 });
  }

  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.mediaId || !item.status) {
      skipped++;
      continue;
    }

    const existing = await prisma.listEntry.findFirst({
      where: { userId: session.user.id, mediaId: item.mediaId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.listEntry.create({
      data: {
        userId: session.user.id,
        mediaId: item.mediaId,
        type: "ANIME",
        status: item.status,
        progress: item.progress ?? 0,
        score: item.score ?? null,
        total: 0,
      },
    });

    imported++;
  }

  return NextResponse.json({ imported, skipped });
}
