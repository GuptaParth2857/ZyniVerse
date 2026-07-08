import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.wikiPage.findUnique({
    where: { slug },
    include: {
      editor: { select: { id: true, username: true, avatar: true } },
      _count: { select: { history: true } },
    },
  });

  if (!page || !page.isPublished) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  return NextResponse.json({ page });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = await prisma.wikiPage.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const { title, content, summary, category, tags, isPublished } = await req.json();

  const newVersion = page.version + 1;

  const updated = await prisma.wikiPage.update({
    where: { slug },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(summary !== undefined ? { summary } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(isPublished !== undefined ? { isPublished } : {}),
      version: newVersion,
      lastEditorId: session.user.id,
    },
  });

  await prisma.wikiPageHistory.create({
    data: {
      pageId: page.id,
      editorId: session.user.id,
      version: newVersion,
      title: updated.title,
      content: updated.content,
      summary: updated.summary,
    },
  });

  return NextResponse.json({ page: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = await prisma.wikiPage.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  await prisma.wikiPage.delete({ where: { slug } });

  return NextResponse.json({ success: true });
}
