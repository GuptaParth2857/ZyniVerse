import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getAnimeNews, getSeasonalAnnouncements, getRecentReviews, getActivityFeed, getAllRSSNews } from "@/lib/news";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const period = searchParams.get("period") || "all";
  const season = searchParams.get("season") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

  const session = await auth();
  const userId = session?.user?.id;

  let news: Awaited<ReturnType<typeof getAnimeNews>> = [];

  if (type === "all" || type === "trending" || type === "airing") {
    const allNews = await getAnimeNews();
    if (type === "trending") news = allNews.filter((n) => n.type === "trending");
    else if (type === "airing") news = allNews.filter((n) => n.type === "airing");
    else news = allNews;
  }

  if (type === "all" || type === "seasonal") {
    const seasonal = await getSeasonalAnnouncements(season, year);
    news = [...news, ...seasonal];
  }

  if (type === "all" || type === "reviews") {
    const reviews = await getRecentReviews();
    news = [...news, ...reviews];
  }

  if (type === "all" || type === "activity") {
    const activity = await getActivityFeed(userId);
    news = [...news, ...activity];
  }

  if (type === "all" || type === "news") {
    const rssNews = await getAllRSSNews();
    news = [...news, ...rssNews];
  }

  if (period !== "all") {
    const now = Date.now();
    const cutoff =
      period === "today" ? now - 86400000 :
      period === "week" ? now - 7 * 86400000 :
      period === "month" ? now - 30 * 86400000 :
      0;
    news = news.filter((n) => new Date(n.publishedAt).getTime() > cutoff);
  }

  news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({ news }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
