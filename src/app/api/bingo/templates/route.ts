import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

async function GET_inner() {
  try {
    const templates = await prisma.bingoTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { usesCount: "desc" }, { updatedAt: "desc" }],
      take: 20,
      select: {
        id: true,
        title: true,
        emoji: true,
        description: true,
        squares: true,
        isFeatured: true,
        usesCount: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ templates });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
