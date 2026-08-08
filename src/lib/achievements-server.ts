import { prisma } from "./prisma";
import { getAchievement, getLevel, type AchievementDef } from "./achievements";

export async function awardAchievement(userId: string, code: string, metadata?: string): Promise<void> {
  const achievement = getAchievement(code);
  if (!achievement) return;

  const dbAchievement = await prisma.achievement.upsert({
    where: { code },
    update: {},
    create: {
      code: achievement.code,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      criteria: JSON.stringify(achievement.criteria),
      points: achievement.points,
      isHidden: achievement.isHidden || false,
    },
  });

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: dbAchievement.id } },
  });
  if (existing) return;

  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: dbAchievement.id,
      metadata: metadata || null,
    },
  });

  await prisma.userPoints.upsert({
    where: { userId },
    update: { points: { increment: achievement.points } },
    create: { userId, points: achievement.points },
  });

  const userPoints = await prisma.userPoints.findUnique({ where: { userId } });
  if (userPoints) {
    const newLevel = getLevel(userPoints.points);
    if (newLevel !== userPoints.level) {
      await prisma.userPoints.update({
        where: { userId },
        data: { level: newLevel },
      });
    }
  }
}

export async function checkAndAwardAchievement(
  userId: string,
  event: string,
  data?: Record<string, unknown>
): Promise<AchievementDef | null> {
  const achievement = getAchievement(event);
  if (!achievement) return null;

  const existing = await prisma.userAchievement.findFirst({
    where: {
      userId,
      achievement: { code: event },
    },
  });
  if (existing) return null;

  await awardAchievement(userId, event, data ? JSON.stringify(data) : undefined);
  return achievement;
}

export async function getUserAchievements(userId: string) {
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: "desc" },
  });
  return achievements;
}

export async function getUserPoints(userId: string): Promise<{ points: number; level: number }> {
  const up = await prisma.userPoints.findUnique({ where: { userId } });
  return up ? { points: up.points, level: up.level } : { points: 0, level: 1 };
}

export async function checkActivityAchievements(userId: string): Promise<AchievementDef[]> {
  const awarded: AchievementDef[] = [];

  const genreActivities = await prisma.userActivity.findMany({
    where: { userId, genres: { isEmpty: false } },
    select: { genres: true },
  });
  const uniqueGenres = new Set<string>();
  for (const a of genreActivities) {
    if (Array.isArray(a.genres)) {
      for (const g of a.genres) uniqueGenres.add(g);
    }
  }
  if (uniqueGenres.size >= 10) {
    const r = await checkAndAwardAchievement(userId, "GENRE_EXPLORER", { genres: [...uniqueGenres] });
    if (r) awarded.push(r);
  }

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayActivities = await prisma.userActivity.findMany({
    where: { userId, createdAt: { gte: midnight } },
    select: { createdAt: true },
  });
  if (todayActivities.length >= 12) {
    const r = await checkAndAwardAchievement(userId, "ALL_NIGHTER", { count: todayActivities.length });
    if (r) awarded.push(r);
  }
  if (todayActivities.length >= 50) {
    const r = await checkAndAwardAchievement(userId, "BINGE_WATCHER", { count: todayActivities.length });
    if (r) awarded.push(r);
  }

  const nightActivities = await prisma.userActivity.findMany({
    where: {
      userId,
      action: { in: ["view_anime", "view_filler"] },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { createdAt: true },
  });
  let nightCount = 0;
  for (const a of nightActivities) {
    const h = a.createdAt.getHours();
    if (h >= 0 && h < 5) nightCount++;
  }
  if (nightCount >= 10) {
    const r = await checkAndAwardAchievement(userId, "NIGHT_OWL", { count: nightCount });
    if (r) awarded.push(r);
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dailyActivity = await prisma.userActivity.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  const activeDays = new Set<string>();
  for (const a of dailyActivity) {
    activeDays.add(a.createdAt.toISOString().split("T")[0]);
  }
  let maxStreak = 0;
  let currentStreak = 0;
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (activeDays.has(key)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  if (maxStreak >= 7) {
    const r = await checkAndAwardAchievement(userId, "WEEK_STREAK", { streak: maxStreak });
    if (r) awarded.push(r);
  }
  if (maxStreak >= 30) {
    const r = await checkAndAwardAchievement(userId, "MONTH_STREAK", { streak: maxStreak });
    if (r) awarded.push(r);
  }

  const completedEntries = await prisma.listEntry.findMany({
    where: { userId, status: "COMPLETED", type: "ANIME" },
    select: { mediaId: true },
  });
  if (completedEntries.length >= 5) {
    const { getMediaBatch } = await import("./anilist");
    const mediaIds = completedEntries.map((e) => e.mediaId);
    const batch1 = await getMediaBatch(mediaIds.slice(0, 50));
    const longAnime = batch1.filter((m) => (m.episodes ?? 0) >= 100);
    if (longAnime.length >= 5) {
      const r = await checkAndAwardAchievement(userId, "COMPLETIONIST", { count: longAnime.length });
      if (r) awarded.push(r);
    }
  }

  if (completedEntries.length >= 1) {
    const { getMediaBatch } = await import("./anilist");
    const mediaIds = completedEntries.map((e) => e.mediaId);
    const allBatch: { id: number; format?: string }[] = [];
    for (let i = 0; i < mediaIds.length; i += 50) {
      const batch = await getMediaBatch(mediaIds.slice(i, i + 50));
      allBatch.push(...batch);
    }
    const movies = allBatch.filter((m) => m.format === "MOVIE");
    if (movies.length >= 20) {
      const r = await checkAndAwardAchievement(userId, "MOVIE_BUFF", { count: movies.length });
      if (r) awarded.push(r);
    }
  }

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const chaptersRead = await prisma.mangaChapter.findMany({
    where: {
      entry: { userId },
      read: true,
      readAt: { gte: ninetyDaysAgo },
    },
    select: { readAt: true },
  });
  if (chaptersRead.length > 0) {
    const readDays = new Set<string>();
    for (const c of chaptersRead) {
      if (c.readAt) readDays.add(c.readAt.toISOString().split("T")[0]);
    }
    let readStreak = 0;
    let maxReadStreak = 0;
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (readDays.has(key)) {
        readStreak++;
        maxReadStreak = Math.max(maxReadStreak, readStreak);
      } else {
        readStreak = 0;
      }
    }
    if (maxReadStreak >= 30) {
      const r = await checkAndAwardAchievement(userId, "CHAPTER_A_DAY", { streak: maxReadStreak });
      if (r) awarded.push(r);
    }
  }

  if (chaptersRead.length >= 100) {
    const dailyChapters = new Map<string, number>();
    for (const c of chaptersRead) {
      if (c.readAt) {
        const key = c.readAt.toISOString().split("T")[0];
        dailyChapters.set(key, (dailyChapters.get(key) || 0) + 1);
      }
    }
    for (const [, count] of dailyChapters) {
      if (count >= 100) {
        const r = await checkAndAwardAchievement(userId, "SPEED_READER", { chaptersInDay: count });
        if (r) awarded.push(r);
        break;
      }
    }
  }

  const mangaCount = await prisma.mangaEntry.count({ where: { userId } });
  if (mangaCount >= 50) {
    const r = await checkAndAwardAchievement(userId, "COLLECTOR", { count: mangaCount });
    if (r) awarded.push(r);
  }

  const completedChallenge = await prisma.challengeParticipant.findFirst({
    where: { userId, completedAt: { not: null } },
  });
  if (completedChallenge) {
    const r = await checkAndAwardAchievement(userId, "CHALLENGER", { challengeId: completedChallenge.challengeId });
    if (r) awarded.push(r);
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } });
  if (user && user.createdAt.getFullYear() <= 2025) {
    const r = await checkAndAwardAchievement(userId, "EARLY_ADOPTER");
    if (r) awarded.push(r);
  }

  if (user) {
    const userCount = await prisma.user.count({
      where: { createdAt: { lte: user.createdAt } },
    });
    if (userCount <= 100) {
      const r = await checkAndAwardAchievement(userId, "FIRST_100", { position: userCount });
      if (r) awarded.push(r);
    }
  }

  return awarded;
}
