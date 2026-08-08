import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dedupedFetch } from "@/lib/wiki-cache";
import { proxyImageUrl } from "@/lib/avatar-src";

const USER_AGENT = "ZyniVerse/1.0";

function rewriteWikiHtml(html: string): string {
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<link[^>]*>/gi, "");
  out = out.replace(/<div class="shortdescription[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
  out = out.replace(/<span class="mw-editsection"[^>]*>[\s\S]*?<\/span>/gi, "");
  out = out.replace(/<div class="mw-empty-elt"[^>]*>[\s\S]*?<\/div>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  out = out.replace(/\bsrcset="[^"]*"/g, "");
  out = out.replace(/\bsrc="\/\//g, 'src="https://');
  out = out.replace(/<img([^>]*)\bsrc="([^"]+)"/g, (_m, attrs: string, url: string) => {
    const proxied = proxyImageUrl(url) || url;
    return `<img${attrs} src="${proxied}"`;
  });
  out = out.replace(/<img[^>]*referrerpolicy="[^"]*"/g, (m) => m.replace(/\sreferrerpolicy="[^"]*"/, ""));
  return out;
}

async function fetchFromWikipedia(slug: string) {
  const title = slug.replace(/_/g, " ");

  const [summaryRes, contentRes] = await Promise.all([
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6000) }
    ),
    fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${encodeURIComponent(title)}&format=json&formatversion=2&disableeditsection=1&disabletoc=1&disablelimitreport=1&origin=*`,
      { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(12000) }
    ),
  ]);

  if (!summaryRes.ok) return null;

  const summary = await summaryRes.json();
  const contentData = await contentRes.json();
  const parse = contentData.parse;

  let contentHtml = "";
  if (parse && typeof parse.text === "string") {
    contentHtml = rewriteWikiHtml(parse.text);
  }

  return {
    id: `wiki-${summary.pageid}`,
    title: summary.title,
    slug: summary.title.replace(/ /g, "_"),
    content: summary.extract || "",
    contentHtml,
    summary: summary.description || null,
    category: "guide",
    tags: "",
    version: 1,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    editor: { id: "wikipedia", username: "Wikipedia", avatar: null },
    _count: { history: 0 },
    isExternal: true,
    coverImage: proxyImageUrl(summary.thumbnail?.source || null),
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
    const resp = NextResponse.json({
      page: {
        ...page,
        coverImage: proxyImageUrl(page.coverImage),
      },
    });
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
