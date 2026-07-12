import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dedupedFetch } from "@/lib/wiki-cache";

const USER_AGENT = "ZyniVerse/1.0";

async function fetchFromWikipedia(slug: string) {
  const title = slug.replace(/_/g, " ");

  const [summaryRes, contentRes] = await Promise.all([
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6000) }
    ),
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(title)}&explaintext=1&format=json&origin=*&exlimit=1&exintro=0&exchars=5000`,
      { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6000) }
    ),
  ]);

  if (!summaryRes.ok) return null;

  const summary = await summaryRes.json();
  const contentData = await contentRes.json();
  const pages = contentData.query?.pages;
  const pageId = Object.keys(pages || {})[0];
  const extract = pages?.[pageId]?.extract || summary.extract || "";

  return {
    id: `wiki-${summary.pageid}`,
    title: summary.title,
    slug: summary.title.replace(/ /g, "_"),
    content: extract,
    summary: summary.description || null,
    category: "guide",
    tags: "",
    version: 1,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    editor: { id: "wikipedia", username: "Wikipedia", avatar: null },
    _count: { history: 0 },
    isExternal: true,
    coverImage: summary.thumbnail?.source || null,
    sourceUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.wikiPage.findUnique({
    where: { slug },
    include: {
      editor: { select: { id: true, username: true, avatar: true } },
      _count: { select: { history: true } },
    },
  });

  if (page && page.isPublished) {
    const resp = NextResponse.json({ page });
    resp.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return resp;
  }

  try {
    const wikiPage = await dedupedFetch(
      `wiki:detail:${slug}`,
      () => fetchFromWikipedia(slug),
      10 * 60 * 1000
    );
    if (wikiPage) {
      const resp = NextResponse.json({ page: wikiPage });
      resp.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
      return resp;
    }
  } catch {
    // Wikipedia fetch failed
  }

  return NextResponse.json({ error: "Page not found" }, { status: 404 });
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
