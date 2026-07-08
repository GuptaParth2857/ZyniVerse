import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const wikiPage = await prisma.wikiPage.findUnique({ where: { slug } });
  if (!wikiPage) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const [history, total] = await Promise.all([
    prisma.wikiPageHistory.findMany({
      where: { pageId: wikiPage.id },
      orderBy: { version: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        editor: { select: { id: true, username: true } },
      },
    }),
    prisma.wikiPageHistory.count({ where: { pageId: wikiPage.id } }),
  ]);

  return NextResponse.json({ history, total, page, limit });
}
