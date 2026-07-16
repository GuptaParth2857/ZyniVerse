import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dedupedFetch } from "@/lib/wiki-cache";
import { hasValidAnimeTag, getAnimeTagError } from "@/lib/blog-tags";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "post";
}

interface ExternalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string;
  publishedAt: string;
  user: { username: string; avatar: string | null };
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isExternal: boolean;
  url: string;
}

const USER_AGENT = "ZyniVerse/1.0";
const MAX_LIMIT = 50;

async function fetchDevToPosts(tag: string): Promise<ExternalPost[]> {
  const res = await fetch(
    `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=20`,
    { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((a: any) => ({
    id: `devto-${a.id}`,
    title: a.title,
    slug: a.slug + "-devto-" + a.id,
    excerpt: a.description || null,
    content: a.description || "",
    coverImage: a.cover_image || a.social_image || null,
    tags: (a.tag_list || []).slice(0, 5).join(","),
    publishedAt: a.published_at || new Date().toISOString(),
    user: { username: a.user?.username || "dev.to", avatar: a.user?.profile_image || null },
    viewCount: a.page_views_count || 0,
    likeCount: a.positive_reactions_count || 0,
    commentCount: a.comments_count || 0,
    isExternal: true,
    url: a.url,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const userId = searchParams.get("userId");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const rawLimit = parseInt(searchParams.get("limit") || "12");
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const sort = searchParams.get("sort") || "recent";

  const where: Record<string, unknown> = { isDraft: false, isDeleted: false };

  if (slug) where.slug = slug;
  if (userId) where.userId = userId;
  if (tag) where.tags = { contains: tag };
  if (search) where.OR = [
    { title: { contains: search } },
    { content: { contains: search } },
  ];

  const orderBy = sort === "popular" ? { viewCount: "desc" as const } : { publishedAt: "desc" as const };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: where as any,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.blogPost.count({ where: where as any }),
  ]);

  const dbItems = posts.map((p) => ({
    ...p,
    commentCount: p._count.comments,
    likeCount: p._count.likes,
    _count: undefined,
    isExternal: false,
    url: `/blog/${p.slug}`,
  }));

  // Fetch external posts (only on listing, not for specific slug/userId)
  let externalItems: ExternalPost[] = [];
  if (!slug && !userId) {
    try {
      const searchTag = tag || "anime";
      externalItems = await dedupedFetch(
        `blog:devto:${searchTag}`,
        () => fetchDevToPosts(searchTag),
        10 * 60 * 1000
      );
    } catch {
      // External fetch failed
    }
  }

  const merged = [...dbItems, ...externalItems].slice(0, limit);

  const response = NextResponse.json({ posts: merged, total: total + externalItems.length, hasMore: page * limit < total + externalItems.length });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return response;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, excerpt, coverImage, tags, isDraft } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Missing title or content" }, { status: 400 });

  if (!isDraft && !hasValidAnimeTag(tags || "")) {
    return NextResponse.json({ error: getAnimeTagError() }, { status: 400 });
  }

  let slug = slugify(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.blogPost.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt?.trim() || null,
      coverImage: coverImage?.trim() || null,
      tags: tags?.trim() || "",
      isDraft: isDraft !== false,
      publishedAt: isDraft ? null : new Date(),
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
