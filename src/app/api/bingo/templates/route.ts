import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

export async function GET() {
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