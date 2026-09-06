import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { tips: true } },
    },
  });

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ profile });
}
