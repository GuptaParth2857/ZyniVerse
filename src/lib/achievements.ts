import { prisma } from "./prisma";

export interface AchievementDef {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  criteria: { type: string; value: number };
  isHidden?: boolean;
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  { code: "FIRST_STEP", name: "First Anime", description: "Complete your first anime", icon: "🎬", category: "watching", points: 10, criteria: { type: "anime_completed", value: 1 } },
  { code: "TENTH_ANIME", name: "Getting Started", description: "Complete 10 anime", icon: "📺", category: "watching", points: 25, criteria: { type: "anime_completed", value: 10 } },
  { code: "FIFTY_ANIME", name: "Otaku in Training", description: "Complete 50 anime", icon: "🏆", category: "watching", points: 50, criteria: { type: "anime_completed", value: 50 } },
  { code: "CENTURY_CLUB", name: "Century Club", description: "Complete 100 anime", icon: "💯", category: "watching", points: 100, criteria: { type: "anime_completed", value: 100 } },
  { code: "BINGE_WATCHER", name: "Binge Watcher", description: "Watch 50 episodes in a day", icon: "🔥", category: "watching", points: 30, criteria: { type: "episodes_in_day", value: 50 } },
  { code: "NIGHT_OWL", name: "Night Owl", description: "Watch episodes after midnight 10 times", icon: "🌙", category: "watching", points: 20, criteria: { type: "night_watches", value: 10 } },
  { code: "WEEK_STREAK", name: "Weekly Warrior", description: "7 day watch streak", icon: "📅", category: "watching", points: 20, criteria: { type: "watch_streak", value: 7 } },
  { code: "MONTH_STREAK", name: "Monthly Master", description: "30 day watch streak", icon: "🗓️", category: "watching", points: 50, criteria: { type: "watch_streak", value: 30 } },
  { code: "GENRE_EXPLORER", name: "Genre Explorer", description: "Watch anime from 10 different genres", icon: "🧭", category: "watching", points: 30, criteria: { type: "genres_watched", value: 10 } },
  { code: "COMPLETIONIST", name: "Completionist", description: "Complete 5 anime with 100+ episodes each", icon: "✅", category: "watching", points: 75, criteria: { type: "long_anime_completed", value: 5 } },
  { code: "MOVIE_BUFF", name: "Movie Buff", description: "Complete 20 anime movies", icon: "🎥", category: "watching", points: 40, criteria: { type: "movies_completed", value: 20 } },
  { code: "SIMULCAST_FAN", name: "Simulcast Fan", description: "Watch 10 episodes within 24h of airing", icon: "⚡", category: "watching", points: 25, criteria: { type: "simulcast_watches", value: 10 } },
  { code: "ALL_NIGHTER", name: "All Nighter", description: "Watch 12+ episodes in a single day", icon: "🌅", category: "watching", points: 20, criteria: { type: "episodes_in_day", value: 12 } },
  { code: "BOOKWORM", name: "Bookworm", description: "Complete reading 5 manga/LN", icon: "📖", category: "reading", points: 20, criteria: { type: "reading_completed", value: 5 } },
  { code: "MANGA_LOVER", name: "Manga Lover", description: "Read 500 chapters", icon: "📚", category: "reading", points: 40, criteria: { type: "chapters_read", value: 500 } },
  { code: "LN_ENTHUSIAST", name: "LN Enthusiast", description: "Complete 5 light novels", icon: "📕", category: "reading", points: 30, criteria: { type: "ln_completed", value: 5 } },
  { code: "CHAPTER_A_DAY", name: "Chapter a Day", description: "Read at least 1 chapter for 30 consecutive days", icon: "📆", category: "reading", points: 50, criteria: { type: "read_streak", value: 30 } },
  { code: "COLLECTOR", name: "Collector", description: "Have 50+ entries in your reading list", icon: "🗃️", category: "reading", points: 25, criteria: { type: "reading_list_entries", value: 50 } },
  { code: "SPEED_READER", name: "Speed Reader", description: "Read 100 chapters in a day", icon: "💨", category: "reading", points: 35, criteria: { type: "chapters_in_day", value: 100 } },
  { code: "FIRST_REVIEW", name: "Critic", description: "Write your first review", icon: "✍️", category: "community", points: 10, criteria: { type: "reviews_written", value: 1 } },
  { code: "TEN_REVIEWS", name: "Voice of the Community", description: "Write 10 reviews", icon: "🗣️", category: "community", points: 30, criteria: { type: "reviews_written", value: 10 } },
  { code: "LIST_MAKER", name: "List Maker", description: "Create 5 custom lists", icon: "📋", category: "community", points: 20, criteria: { type: "lists_created", value: 5 } },
  { code: "FORUM_POSTER", name: "Conversation Starter", description: "Create 10 forum threads", icon: "💬", category: "community", points: 25, criteria: { type: "forum_threads", value: 10 } },
  { code: "HELPER", name: "Helpful Soul", description: "Reply to 50 forum posts", icon: "🤝", category: "community", points: 40, criteria: { type: "forum_replies", value: 50 } },
  { code: "CHALLENGER", name: "Challenger", description: "Complete a yearly challenge", icon: "🏅", category: "community", points: 50, criteria: { type: "challenge_completed", value: 1 } },
  { code: "SOCIAL_BUTTERFLY", name: "Social Butterfly", description: "Follow 10 users", icon: "🦋", category: "social", points: 15, criteria: { type: "users_followed", value: 10 } },
  { code: "POPULAR", name: "Popular", description: "Get 100 total likes on your lists", icon: "⭐", category: "social", points: 40, criteria: { type: "list_likes", value: 100 } },
  { code: "INFLUENCER", name: "Influencer", description: "Get 50 followers", icon: "👑", category: "social", points: 75, criteria: { type: "followers", value: 50 } },
  { code: "EARLY_ADOPTER", name: "Early Adopter", description: "Join ZyniVerse in first year", icon: "🚀", category: "milestone", points: 100, criteria: { type: "early_adopter", value: 1 }, isHidden: true },
  { code: "FIRST_100", name: "First 100", description: "Be among first 100 users", icon: "🥇", category: "milestone", points: 200, criteria: { type: "first_100", value: 1 }, isHidden: true },
];

export function getAllAchievements(): AchievementDef[] {
  return ALL_ACHIEVEMENTS;
}

export function getAchievement(code: string): AchievementDef | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.code === code);
}

export function getLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function getNextLevelProgress(points: number): { current: number; needed: number } {
  const currentLevel = getLevel(points);
  const currentLevelPoints = 100 * (currentLevel - 1) * (currentLevel - 1);
  const nextLevelPoints = 100 * currentLevel * currentLevel;
  return {
    current: points - currentLevelPoints,
    needed: nextLevelPoints - currentLevelPoints,
  };
}

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
