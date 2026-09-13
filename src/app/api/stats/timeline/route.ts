import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getMediaBatch } from "@/lib/anilist";

const SEASON_MAP: Record<number, string> = {
  1: "winter", 2: "winter", 3: "spring", 4: "spring", 5: "spring",
  6: "summer", 7: "summer", 8: "summer", 9: "fall", 10: "fall", 11: "fall", 12: "winter",
};

function getSeason(month: number): string {
  return SEASON_MAP[month] || "winter";
}

function getSeasonalHours(episodes: { watchedAt: Date }[]): number {
  let total = 0;
  for (const ep of episodes) {
    const month = new Date(ep.watchedAt).getMonth() + 1;
    const season = getSeason(month);
    if (season === "summer" || season === "winter") {
      total += 24;
    } else {
      total += 22;
    }
  }
  return Math.round((total / 60) * 10) / 10;
}

function calculateStreaks(watchDays: string[]): { currentStreak: number; longestStreak: number } {
  if (watchDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sorted = [...new Set(watchDays)].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let longestStreak = 1;
  let currentStreak = 0;

  if (sorted[0] === todayStr || sorted[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diffMs = prev.getTime() - curr.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let tempStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
}

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const episodes = await prisma.episodeProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "asc" },
    select: { mediaId: true, episode: true, title: true, watchedAt: true },
  });

  if (episodes.length === 0) {
    return NextResponse.json({
      months: [],
      overall: {
        totalAnime: 0,
        totalEpisodes: 0,
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        mostActiveMonth: null,
      },
    });
  }

  const grouped: Record<string, typeof episodes> = {};
  for (const ep of episodes) {
    const d = new Date(ep.watchedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ep);
  }

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const months = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, eps]) => {
      const [yearStr, monthStr] = key.split("-");
      const year = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      const monthName = MONTH_NAMES[monthNum - 1];

      const animeMap: Record<number, { mediaId: number; title: string; episodeCount: number; coverImage: string | null }> = {};
      for (const ep of eps) {
        if (!animeMap[ep.mediaId]) {
          animeMap[ep.mediaId] = { mediaId: ep.mediaId, title: `Anime #${ep.mediaId}`, episodeCount: 0, coverImage: null };
        }
        animeMap[ep.mediaId].episodeCount++;
        if (ep.title) {
          animeMap[ep.mediaId].title = ep.title;
        }
      }

      const topAnime = Object.values(animeMap)
        .sort((a, b) => b.episodeCount - a.episodeCount)
        .slice(0, 5);

      const totalHours = getSeasonalHours(eps);

      return {
        month: monthName,
        monthNum,
        year,
        season: getSeason(monthNum),
        episodes: eps.length,
        animeCount: Object.keys(animeMap).length,
        topAnime,
        totalHours,
      };
    });

  const allWatchDays = episodes.map((ep) => new Date(ep.watchedAt).toISOString().split("T")[0]);
  const { currentStreak, longestStreak } = calculateStreaks(allWatchDays);

  const uniqueIds = [...new Set(months.flatMap((m) => m.topAnime.map((a) => a.mediaId)))];
  const mediaMap = new Map<number, { title: string; coverImage: string | null }>();
  try {
    const chunks: number[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 50) chunks.push(uniqueIds.slice(i, i + 50));
    const batches = await Promise.all(chunks.map((chunk) => getMediaBatch(chunk)));
    for (const batch of batches) {
      for (const m of batch) {
        mediaMap.set(m.id, {
          title: m.title?.english || m.title?.romaji || m.title?.native || "",
          coverImage: m.coverImage?.large || m.coverImage?.medium || null,
        });
      }
    }
  } catch (e) {
    console.error("Timeline media enrichment failed:", e);
  }

  for (const month of months) {
    for (const a of month.topAnime) {
      const resolved = mediaMap.get(a.mediaId);
      if (resolved?.title) a.title = resolved.title;
      a.coverImage = resolved?.coverImage ?? null;
    }
  }

  const uniqueAnime = new Set(episodes.map((e) => e.mediaId));
  const totalHours = months.reduce((sum, m) => sum + m.totalHours, 0);
  const mostActive = months.reduce((best, m) => (m.episodes > (best?.episodes ?? 0) ? m : best), months[0]);

  return NextResponse.json({
    months,
    overall: {
      totalAnime: uniqueAnime.size,
      totalEpisodes: episodes.length,
      totalHours: Math.round(totalHours * 10) / 10,
      currentStreak,
      longestStreak,
      mostActiveMonth: mostActive
        ? { month: mostActive.month, year: mostActive.year, episodes: mostActive.episodes }
        : null,
    },
  });
}
