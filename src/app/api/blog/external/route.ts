import { NextRequest, NextResponse } from "next/server";
import { dedupedFetch } from "@/lib/wiki-cache";

const USER_AGENT = "ZyniVerse/1.0";

interface DevToArticle {
  id: number;
  title: string;
  slug: string;
  description: string;
  body_markdown: string;
  body_html: string;
  cover_image: string;
  social_image: string;
  tag_list: string[];
  published_at: string;
  user: { username: string; profile_image: string; name: string };
  page_views_count: number;
  positive_reactions_count: number;
  comments_count: number;
  url: string;
  reading_time_minutes: number;
}

async function fetchDevToArticle(id: string): Promise<DevToArticle | null> {
  try {
    const realId = id.replace("devto-", "");
    const res = await fetch(`https://dev.to/api/articles/${realId}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const article = await dedupedFetch(
    `blog:devto:article:${id}`,
    () => fetchDevToArticle(id),
    30 * 60 * 1000
  );

  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const post = {
    id: `devto-${article.id}`,
    title: article.title,
    slug: article.slug + "-devto-" + article.id,
    excerpt: article.description || null,
    content: article.body_markdown || article.body_html || article.description || "",
    coverImage: article.cover_image || article.social_image || null,
    tags: (article.tag_list || []).slice(0, 5).join(","),
    publishedAt: article.published_at || new Date().toISOString(),
    user: { username: article.user?.username || "dev.to", avatar: article.user?.profile_image || null },
    viewCount: article.page_views_count || 0,
    likeCount: article.positive_reactions_count || 0,
    commentCount: article.comments_count || 0,
    isExternal: true,
    url: article.url,
    readingTime: article.reading_time_minutes || 5,
  };

  return NextResponse.json({ post });
}
