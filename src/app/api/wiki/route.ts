import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dedupedFetch } from "@/lib/wiki-cache";

interface WikiEntry {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string;
  tags: string;
  version: number;
  updatedAt: string;
  editor: { id: string; username: string };
  _count: { history: number };
  isExternal?: boolean;
  coverImage?: string | null;
}

const USER_AGENT = "ZyniVerse/1.0";
const MAX_LIMIT = 50;

function buildWikiUrl(q: string, limit: number): string {
  return `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=${limit}&exlimit=max&prop=pageimages|extracts&exintro&explaintext&pithumbsize=400&format=json&origin=*`;
}

function parseWikiPages(pagesObj: any, category: string): WikiEntry[] {
  return Object.values(pagesObj)
    .sort((a: any, b: any) => (a.index || 0) - (b.index || 0))
    .map((item: any) => ({
      id: `wiki-${item.pageid}`,
      title: item.title,
      slug: item.title.replace(/ /g, "_"),
      summary: (item.extract || "").slice(0, 300),
      coverImage: item.thumbnail?.source || null,
      category: category || "wiki",
      tags: "",
      version: 1,
      updatedAt: new Date().toISOString(),
      editor: { id: "wikipedia", username: "Wikipedia" },
      _count: { history: 0 },
      isExternal: true,
    }));
}

const FALLBACK_TITLES = "Naruto|Attack_on_Titan|One_Piece|Demon_Slayer:_Kimetsu_no_Yaiba|Jujutsu_Kaisen";

async function fetchWikipediaSearch(q: string, limit: number): Promise<WikiEntry[]> {
  const url = buildWikiUrl(q, Math.min(limit, MAX_LIMIT));
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const pagesObj = data.query?.pages;
  if (!pagesObj) return [];
  const entries = parseWikiPages(pagesObj, "");
  return entries;
}

async function fetchFallback(): Promise<WikiEntry[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&exlimit=max&explaintext&pithumbsize=400&format=json&origin=*&titles=${FALLBACK_TITLES}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pagesObj = data.query?.pages;
    if (!pagesObj) return [];
    return parseWikiPages(pagesObj, "wiki");
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const rawLimit = parseInt(searchParams.get("limit") || "20");
  const limit = Math.min(rawLimit, MAX_LIMIT);

  let dbPages: WikiEntry[] = [];
  let total = 0;

  const where: any = { isPublished: true, lastEditorId: { not: "system-bot" } };
  if (category) where.category = category;
  if (search) where.title = { contains: search };

  const [dbResults, dbTotal] = await Promise.all([
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

  dbPages = dbResults.map((p: any) => ({ ...p, updatedAt: p.updatedAt.toISOString() }));
  total = dbTotal;

  let wikiPages: WikiEntry[] = [];
  const effectiveSearch = search || category || "";

  if (effectiveSearch) {
    const term = category && !search ? category : search!;
    const q = encodeURIComponent(term + (search && category && category !== "guide" && category !== "help" ? ` ${category}` : ""));
    const cacheKey = `wiki:search:${q}:${limit}`;

    try {
      wikiPages = await dedupedFetch(cacheKey, () => fetchWikipediaSearch(q, limit));
    } catch {
      // Wikipedia search failed
    }
  }

  if (wikiPages.length === 0 && !search && !category) {
    wikiPages = await fetchFallback();
  }

  const remaining = limit - dbPages.length;
  const merged = [...dbPages, ...wikiPages].slice(0, limit);
  const _shownWiki = Math.max(0, remaining - (merged.length - dbPages.length));
  const wikiCount = Math.min(wikiPages.length, Math.max(0, limit - dbPages.length));

  const response = NextResponse.json({ pages: merged, total: total + wikiCount, page, limit });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return response;
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
