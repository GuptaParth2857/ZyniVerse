import { prisma } from "@/lib/prisma";
import { getUnifiedSuggestions } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ anime: [], manga: [], users: [], wiki: [], forum: [], blog: [] });
  }

  const like = { contains: q, mode: "insensitive" as const };

  const [anilist, users, wiki, forum, blog] = await Promise.allSettled([
    getUnifiedSuggestions(q),
    prisma.user.findMany({
      where: { username: like },
      select: { id: true, username: true, avatar: true },
      take: 4,
      orderBy: { username: "asc" },
    }),
    prisma.wikiPage.findMany({
      where: { isPublished: true, OR: [{ title: like }, { slug: like }] },
      select: { slug: true, title: true, summary: true, category: true },
      take: 3,
      orderBy: { title: "asc" },
    }),
    prisma.forumThread.findMany({
      where: { isDeleted: false, title: like },
      select: { id: true, title: true, animeTitle: true, viewCount: true, postCount: true },
      take: 3,
      orderBy: { postCount: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { isDraft: false, isDeleted: false, title: like },
      select: { slug: true, title: true, excerpt: true },
      take: 3,
      orderBy: { likeCount: "desc" },
    }),
  ]);

  return NextResponse.json({
    anime: anilist.status === "fulfilled" ? anilist.value.anime : [],
    manga: anilist.status === "fulfilled" ? anilist.value.manga : [],
    users: users.status === "fulfilled" ? users.value : [],
    wiki: wiki.status === "fulfilled" ? wiki.value : [],
    forum: forum.status === "fulfilled" ? forum.value : [],
    blog: blog.status === "fulfilled" ? blog.value : [],
  });
}
