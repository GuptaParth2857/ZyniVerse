import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; version: string }> }) {
  const { slug, version } = await params;

  const wikiPage = await prisma.wikiPage.findUnique({ where: { slug } });
  if (!wikiPage) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const historyEntry = await prisma.wikiPageHistory.findFirst({
    where: { pageId: wikiPage.id, version: parseInt(version) },
    include: {
      editor: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!historyEntry) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  return NextResponse.json({ entry: historyEntry });
}
