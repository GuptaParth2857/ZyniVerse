import { prisma } from "./prisma";
import type { Challenge, ChallengeParticipant, ChallengeEntry } from "@prisma/client";

export type ChallengeWithCounts = Challenge & {
  _count?: { participants: number; entries: number };
};

export async function getActiveChallenges(): Promise<Challenge[]> {
  const now = new Date();
  return prisma.challenge.findMany({
    where: { isPublic: true, startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { endDate: "asc" },
  });
}

export async function getUpcomingChallenges(): Promise<Challenge[]> {
  const now = new Date();
  return prisma.challenge.findMany({
    where: { isPublic: true, startDate: { gt: now } },
    orderBy: { startDate: "asc" },
  });
}

export async function getPastChallenges(): Promise<Challenge[]> {
  const now = new Date();
  return prisma.challenge.findMany({
    where: { isPublic: true, endDate: { lt: now } },
    orderBy: { endDate: "desc" },
  });
}

export async function getChallenge(id: string): Promise<ChallengeWithCounts | null> {
  return prisma.challenge.findUnique({
    where: { id },
    include: { _count: { select: { participants: true, entries: true } } },
  });
}

export async function getChallengeWithDetails(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      _count: { select: { participants: true, entries: true } },
    },
  });
}

export async function joinChallenge(
  challengeId: string,
  userId: string,
  goalCount?: number
): Promise<void> {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new Error("Challenge not found");

  await prisma.challengeParticipant.upsert({
    where: { challengeId_userId: { challengeId, userId } },
    update: { goalCount: goalCount ?? challenge.goalCount },
    create: {
      challengeId,
      userId,
      goalCount: goalCount ?? challenge.goalCount,
    },
  });
}

export async function leaveChallenge(challengeId: string, userId: string): Promise<void> {
  await prisma.challengeParticipant.deleteMany({
    where: { challengeId, userId },
  });
}

export async function addChallengeEntry(
  challengeId: string,
  userId: string,
  entry: {
    mediaId: number;
    mediaTitle: string;
    mediaImage?: string;
    mediaType: "anime" | "manga";
    episodeCount?: number;
    chapterCount?: number;
  }
): Promise<void> {
  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (!participant) throw new Error("Not a participant of this challenge");

  await prisma.challengeEntry.upsert({
    where: { challengeId_userId_mediaId: { challengeId, userId, mediaId: entry.mediaId } },
    update: { mediaTitle: entry.mediaTitle, mediaImage: entry.mediaImage },
    create: {
      challengeId,
      userId,
      mediaId: entry.mediaId,
      mediaTitle: entry.mediaTitle,
      mediaImage: entry.mediaImage,
      mediaType: entry.mediaType,
      episodeCount: entry.episodeCount,
      chapterCount: entry.chapterCount,
    },
  });

  await updateProgress(challengeId, userId);
}

export async function removeChallengeEntry(
  challengeId: string,
  userId: string,
  mediaId: number
): Promise<void> {
  await prisma.challengeEntry.deleteMany({
    where: { challengeId, userId, mediaId },
  });

  await updateProgress(challengeId, userId);
}

export async function updateProgress(
  challengeId: string,
  userId: string
): Promise<number> {
  const count = await prisma.challengeEntry.count({
    where: { challengeId, userId },
  });

  await prisma.challengeParticipant.updateMany({
    where: { challengeId, userId },
    data: { progress: count },
  });

  return count;
}

export async function getLeaderboard(
  challengeId: string,
  limit = 50
): Promise<{ user: { id: string; username: string; avatar: string | null }; progress: number; goalCount: number; completedAt: Date | null }[]> {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
    orderBy: [{ progress: "desc" }, { completedAt: "asc" }],
    take: limit,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return participants.map((p) => ({
    user: p.user,
    progress: p.progress,
    goalCount: p.goalCount,
    completedAt: p.completedAt,
  }));
}

export async function getUserChallenges(userId: string) {
  const participations = await prisma.challengeParticipant.findMany({
    where: { userId },
    include: {
      challenge: {
        include: { _count: { select: { participants: true, entries: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return participations;
}

export async function getUserChallengeEntries(
  challengeId: string,
  userId: string
): Promise<ChallengeEntry[]> {
  return prisma.challengeEntry.findMany({
    where: { challengeId, userId },
    orderBy: { completedAt: "desc" },
  });
}

export async function getOrCreateYearlyChallenge(year: number): Promise<Challenge> {
  const existing = await prisma.challenge.findFirst({
    where: { type: "watch", period: "yearly", year },
  });
  if (existing) return existing;

  return prisma.challenge.create({
    data: {
      title: `Watch ${year === new Date().getFullYear() ? "X Anime in " : ""}${year}`,
      description: `Watch and complete anime throughout ${year}. Every completed anime counts toward your goal!`,
      type: "watch",
      period: "yearly",
      year,
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31, 23, 59, 59),
      goalCount: 12,
      isPublic: true,
      rules: `## Rules\n- Any anime completed within ${year} counts\n- Must set a personal goal when joining\n- Update your progress by adding entries throughout the year`,
    },
  });
}

export async function autoCompleteAnimeForChallenge(
  userId: string,
  mediaId: number,
  mediaTitle: string,
  mediaImage?: string,
  mediaType: "anime" | "manga" = "anime"
): Promise<void> {
  const now = new Date();
  const challenges = await prisma.challenge.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
      type: { in: [mediaType === "anime" ? "watch" : "read", "mixed", "custom"] },
      participants: { some: { userId } },
    },
    select: { id: true },
  });

  for (const challenge of challenges) {
    const existing = await prisma.challengeEntry.findUnique({
      where: { challengeId_userId_mediaId: { challengeId: challenge.id, userId, mediaId } },
    });
    if (!existing) {
      await prisma.challengeEntry.create({
        data: {
          challengeId: challenge.id,
          userId,
          mediaId,
          mediaTitle,
          mediaImage,
          mediaType,
        },
      });
      await updateProgress(challenge.id, userId);
    }
  }
}
