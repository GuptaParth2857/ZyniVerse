import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { NextRequest, NextResponse } from "next/server";

async function GET_inner(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
