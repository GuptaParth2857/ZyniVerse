import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const userId = session.user.id;

  const [profile, entries, progress, reviews, longReviews, mangaEntries, lists, tierLists,
    moments, reels, cosplays, fanArts, memes, blogPosts, forumThreads,
    userPoints, dailyLogin, streakFreeze, quizScores, animeFollows] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listEntry.findMany({ where: { userId } }),
    prisma.episodeProgress.findMany({ where: { userId } }),
    prisma.review.findMany({ where: { userId } }),
    prisma.longReview.findMany({ where: { userId } }),
    prisma.mangaEntry.findMany({ where: { userId } }),
    prisma.userList.findMany({ where: { userId } }),
    prisma.tierList.findMany({ where: { userId } }),
    prisma.moment.findMany({ where: { userId } }),
    prisma.reel.findMany({ where: { userId } }),
    prisma.cosplay.findMany({ where: { userId } }),
    prisma.fanArt.findMany({ where: { userId } }),
    prisma.meme.findMany({ where: { userId } }),
    prisma.blogPost.findMany({ where: { userId } }),
    prisma.forumThread.findMany({ where: { userId } }),
    prisma.userPoints.findUnique({ where: { userId } }),
    prisma.dailyLogin.findUnique({ where: { userId } }),
    prisma.streakFreeze.findUnique({ where: { userId } }),
    prisma.quizScore.findMany({ where: { userId } }),
    prisma.animeFollow.findMany({ where: { userId } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    zyniverse: profile,
    watchlistEntries: entries,
    episodeProgress: progress,
    reviews,
    longReviews,
    mangaEntries: mangaEntries,
    lists,
    tierLists,
    moments,
    reels,
    cosplays,
    fanArts,
    memes,
    blogPosts,
    forumThreads,
    points: userPoints,
    dailyLogin,
    streakFreeze,
    quizScores,
    animeFollows,
  };

  const filename = `zyniverse-data-${userId.slice(0, 8)}-${Date.now()}.json`;
  const body = JSON.stringify(data, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
