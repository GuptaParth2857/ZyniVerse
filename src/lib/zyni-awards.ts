import { prisma } from "./prisma";

export const AWARD_CATEGORIES = [
  { id: "ANIME_OF_YEAR", name: "Anime of the Year", emoji: "🏆" },
  { id: "BEST_ACTION", name: "Best Action", emoji: "⚔️" },
  { id: "BEST_ROMANCE", name: "Best Romance", emoji: "💕" },
  { id: "BEST_COMEDY", name: "Best Comedy", emoji: "😂" },
  { id: "BEST_FANTASY", name: "Best Fantasy", emoji: "🧙" },
  { id: "BEST_DRAMA", name: "Best Drama", emoji: "🎭" },
  { id: "BEST_ANIMATION", name: "Best Animation", emoji: "🎨" },
  { id: "BEST_NEW_SERIES", name: "Best New Series", emoji: "✨" },
  { id: "BEST_SCORE", name: "Best Score", emoji: "🎵" },
  { id: "BEST_VILLAIN", name: "Best Villain", emoji: "😈" },
  { id: "BEST_CHARACTER", name: "Best Character", emoji: "👤" },
  { id: "BEST_OPENING", name: "Best Opening", emoji: "🎶" },
] as const;

export type AwardCategory = (typeof AWARD_CATEGORIES)[number]["id"];

interface AwardNomineeData {
  id: string;
  mediaId: number;
  title: string;
  image: string | null;
  votes: number;
  advanced: boolean;
  seed: number | null;
}

interface AwardData {
  id: string;
  year: number;
  category: string;
  categoryName: string;
  emoji: string;
  status: string;
  nominees: AwardNomineeData[];
}

export async function getAwardsForYear(year: number): Promise<AwardData[]> {
  const awards = await prisma.zyniAward.findMany({
    where: { year },
    include: {
      nominees: {
        include: {
          votes: true,
        },
      },
    },
    orderBy: { category: "asc" },
  });

  return awards.map((a) => {
    const cat = AWARD_CATEGORIES.find((c) => c.id === a.category);
    return {
      id: a.id,
      year: a.year,
      category: a.category,
      categoryName: cat?.name || a.category,
      emoji: cat?.emoji || "🏆",
      status: a.status,
      nominees: a.nominees.map((n) => ({
        id: n.id,
        mediaId: n.mediaId,
        title: n.title,
        image: n.image,
        votes: n.votes.length,
        advanced: n.advanced,
        seed: n.seed,
      })),
    };
  });
}

export async function createAwardCycle(year: number): Promise<void> {
  const existing = await prisma.zyniAward.findFirst({ where: { year } });
  if (existing) return;

  for (const cat of AWARD_CATEGORIES) {
    await prisma.zyniAward.create({
      data: {
        year,
        category: cat.id,
        title: cat.name,
        status: "nominating",
      },
    });
  }
}

export async function nominateMedia(
  year: number,
  category: string,
  mediaId: number,
  title: string,
  image?: string
): Promise<string> {
  const award = await prisma.zyniAward.findUnique({
    where: { year_category: { year, category } },
  });

  if (!award) throw new Error("Award cycle not found");
  if (award.status !== "nominating") throw new Error("Nominations are closed");

  const existing = await prisma.zyniAwardNominee.findFirst({
    where: { awardId: award.id, mediaId },
  });

  if (existing) throw new Error("Already nominated");

  const nominee = await prisma.zyniAwardNominee.create({
    data: { awardId: award.id, mediaId, title, image, round: 1 },
  });

  return nominee.id;
}

export async function castVote(
  year: number,
  category: string,
  nomineeId: string,
  userId: string,
  round: number = 2,
  bracketMatch?: string
): Promise<void> {
  const award = await prisma.zyniAward.findUnique({
    where: { year_category: { year, category } },
  });

  if (!award) throw new Error("Award cycle not found");

  await prisma.zyniAwardVote.upsert({
    where: {
      awardId_userId_round: { awardId: award.id, userId, round },
    },
    update: { nomineeId, bracketMatch: bracketMatch || null },
    create: {
      awardId: award.id,
      nomineeId,
      userId,
      round,
      bracketMatch: bracketMatch || null,
    },
  });
}

export async function getBracketData(
  year: number,
  category: string,
  round: number
): Promise<
  {
    matchId: string;
    seed1: number;
    seed2: number;
    nominee1: AwardNomineeData | null;
    nominee2: AwardNomineeData | null;
    winnerId: string | null;
  }[]
> {
  const award = await prisma.zyniAward.findUnique({
    where: { year_category: { year, category } },
    include: {
      nominees: {
        where: { round },
        include: { votes: { where: { round } } },
        orderBy: { seed: "asc" },
      },
    },
  });

  if (!award) throw new Error("Award cycle not found");

  const nominees = award.nominees.map((n) => ({
    id: n.id,
    mediaId: n.mediaId,
    title: n.title,
    image: n.image,
    votes: n.votes.length,
    advanced: n.advanced,
    seed: n.seed,
  }));

  const matches: {
    matchId: string;
    seed1: number;
    seed2: number;
    nominee1: AwardNomineeData | null;
    nominee2: AwardNomineeData | null;
    winnerId: string | null;
  }[] = [];

  for (let i = 0; i < nominees.length; i += 2) {
    const n1 = nominees[i];
    const n2 = nominees[i + 1] || null;

    const votes1 = n1?.votes || 0;
    const votes2 = n2?.votes || 0;

    let winnerId: string | null = null;
    if (n2 && votes1 !== votes2) {
      winnerId = votes1 > votes2 ? n1!.id : n2.id;
    }

    matches.push({
      matchId: `${category}_r${round}_m${Math.floor(i / 2)}`,
      seed1: n1?.seed || i + 1,
      seed2: n2?.seed || i + 2,
      nominee1: n1 || null,
      nominee2: n2,
      winnerId,
    });
  }

  return matches;
}

export async function advanceNominees(
  year: number,
  category: string,
  fromRound: number,
  winnerIds: string[]
): Promise<void> {
  const award = await prisma.zyniAward.findUnique({
    where: { year_category: { year, category } },
  });

  if (!award) throw new Error("Award cycle not found");

  const nextRound = fromRound + 1;

  for (const nomineeId of winnerIds) {
    const nominee = await prisma.zyniAwardNominee.findUnique({
      where: { id: nomineeId },
    });

    if (!nominee) continue;

    await prisma.zyniAwardNominee.update({
      where: { id: nomineeId },
      data: { advanced: true, round: nextRound },
    });
  }

  await prisma.zyniAward.update({
    where: { id: award.id },
    data: { status: nextRound >= 3 ? "bracket" : "voting" },
  });
}

export async function getLeaderboard(year: number): Promise<
  {
    category: string;
    categoryName: string;
    emoji: string;
    winner: { mediaId: number; title: string; image: string | null; votes: number } | null;
  }[]
> {
  const awards = await prisma.zyniAward.findMany({
    where: { year },
    include: {
      nominees: {
        where: { advanced: true },
        include: { votes: true },
        orderBy: { votes: { _count: "desc" } },
        take: 1,
      },
    },
  });

  return awards.map((a) => {
    const cat = AWARD_CATEGORIES.find((c) => c.id === a.category);
    const topNominee = a.nominees[0];
    return {
      category: a.category,
      categoryName: cat?.name || a.category,
      emoji: cat?.emoji || "🏆",
      winner: topNominee
        ? {
            mediaId: topNominee.mediaId,
            title: topNominee.title,
            image: topNominee.image,
            votes: topNominee.votes.length,
          }
        : null,
    };
  });
}
