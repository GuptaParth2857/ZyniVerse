import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = { isPublished: true };
  if (category) where.category = category;
  if (search) where.title = { contains: search };

  const [pages, total] = await Promise.all([
    prisma.wikiPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, slug: true, summary: true, category: true,
        tags: true, version: true, updatedAt: true, createdAt: true,
        editor: { select: { id: true, username: true } },
        _count: { select: { history: true } },
      },
    }),
    prisma.wikiPage.count({ where }),
  ]);

  return NextResponse.json({ pages, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, summary, category, tags } = await req.json();

  if (!title || !content || !category) {
    return NextResponse.json({ error: "Title, content, and category required" }, { status: 400 });
  }

  const validCategories = ["anime", "manga", "character", "studio", "genre", "guide", "help"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const page = await prisma.wikiPage.create({
    data: {
      title: title.trim(),
      slug,
      content: content.trim(),
      summary: summary || null,
      category,
      tags: tags || "",
      lastEditorId: session.user.id,
      version: 1,
    },
    include: {
      editor: { select: { id: true, username: true, avatar: true } },
    },
  });

  await prisma.wikiPageHistory.create({
    data: {
      pageId: page.id,
      editorId: session.user.id,
      version: 1,
      title: page.title,
      content: page.content,
      summary: page.summary,
    },
  });

  return NextResponse.json({ page }, { status: 201 });
}
