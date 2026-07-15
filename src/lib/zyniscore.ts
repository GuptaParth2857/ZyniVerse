import { prisma } from "./prisma";

const MIN_VOTES = 50;
const GLOBAL_MEAN = 6.5;
const VERIFIED_WEIGHT = 1.5;
const PARTIAL_WEIGHT = 1.2;
const UNVERIFIED_WEIGHT = 0.5;
const NEW_ACCOUNT_WEIGHT = 0.3;
const NEW_ACCOUNT_DAYS = 7;

export interface ScoreResult {
  weightedScore: number;
  bayesianScore: number;
  totalVotes: number;
  verifiedVotes: number;
  distribution: number[];
  averageRating: number;
}

function computeWeight(
  isVerified: boolean,
  episodeProgress: number,
  totalEpisodes: number,
  accountAgeDays: number
): number {
  if (accountAgeDays < NEW_ACCOUNT_DAYS) return NEW_ACCOUNT_WEIGHT;
  if (isVerified) return VERIFIED_WEIGHT;
  if (totalEpisodes > 0 && episodeProgress / totalEpisodes >= 0.75) return PARTIAL_WEIGHT;
  return UNVERIFIED_WEIGHT;
}

function bayesianAverage(r: number, n: number, m: number, C: number): number {
  return (n / (n + m)) * r + (m / (n + m)) * C;
}

function computeDistribution(ratings: { rating: number }[]): number[] {
  const dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const r of ratings) {
    const bucket = Math.min(Math.max(Math.round(r.rating) - 1, 0), 9);
    dist[bucket]++;
  }
  return dist;
}

export async function computeZyniScore(mediaId: number): Promise<ScoreResult> {
  const ratings = await prisma.rating.findMany({
    where: { mediaId },
    select: { rating: true, weight: true, isVerified: true },
  });

  if (ratings.length === 0) {
    return {
      weightedScore: 0,
      bayesianScore: 0,
      totalVotes: 0,
      verifiedVotes: 0,
      distribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      averageRating: 0,
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  let verifiedCount = 0;

  for (const r of ratings) {
    const weight = r.weight || UNVERIFIED_WEIGHT;
    weightedSum += r.rating * weight;
    totalWeight += weight;
    if (r.isVerified) verifiedCount++;
  }

  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const bayesian = bayesianAverage(weightedScore, ratings.length, MIN_VOTES, GLOBAL_MEAN);
  const distribution = computeDistribution(ratings);

  const result: ScoreResult = {
    weightedScore: Math.round(weightedScore * 100) / 100,
    bayesianScore: Math.round(bayesian * 100) / 100,
    totalVotes: ratings.length,
    verifiedVotes: verifiedCount,
    distribution,
    averageRating: Math.round(weightedScore * 100) / 100,
  };

  await prisma.zyniScore.upsert({
    where: { mediaId },
    update: {
      weightedScore: result.weightedScore,
      bayesianScore: result.bayesianScore,
      totalVotes: result.totalVotes,
      verifiedVotes: result.verifiedVotes,
      sumRatings: weightedSum,
    },
    create: {
      mediaId,
      weightedScore: result.weightedScore,
      bayesianScore: result.bayesianScore,
      totalVotes: result.totalVotes,
      verifiedVotes: result.verifiedVotes,
      sumRatings: weightedSum,
    },
  });

  return result;
}

export async function getZyniScore(mediaId: number): Promise<ScoreResult> {
  const cached = await prisma.zyniScore.findUnique({ where: { mediaId } });
  if (cached && Date.now() - cached.updatedAt.getTime() < 3600000) {
    const ratings = await prisma.rating.findMany({
      where: { mediaId },
      select: { rating: true },
    });
    return {
      weightedScore: cached.weightedScore,
      bayesianScore: cached.bayesianScore,
      totalVotes: cached.totalVotes,
      verifiedVotes: cached.verifiedVotes,
      distribution: computeDistribution(ratings),
      averageRating: cached.totalVotes > 0 ? cached.sumRatings / cached.totalVotes : 0,
    };
  }
  return computeZyniScore(mediaId);
}

export async function submitRating(
  userId: string,
  mediaId: number,
  rating: number
): Promise<ScoreResult> {
  const clampedRating = Math.min(Math.max(rating, 1), 10);

  const listEntry = await prisma.listEntry.findUnique({
    where: { userId_mediaId: { userId, mediaId } },
  });

  const isVerified =
    listEntry?.status === "COMPLETED" ||
    (listEntry?.total ? listEntry.progress / listEntry.total >= 0.75 : false);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  const accountAgeDays = user
    ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const weight = computeWeight(isVerified, listEntry?.progress || 0, listEntry?.total || 0, accountAgeDays);

  await prisma.rating.upsert({
    where: { userId_mediaId: { userId, mediaId } },
    update: { rating: clampedRating, weight, isVerified },
    create: { userId, mediaId, rating: clampedRating, weight, isVerified },
  });

  return computeZyniScore(mediaId);
}

export async function getBatchZyniScores(
  mediaIds: number[]
): Promise<Map<number, ScoreResult>> {
  const scores = await prisma.zyniScore.findMany({
    where: { mediaId: { in: mediaIds } },
  });

  const allRatings = await prisma.rating.findMany({
    where: { mediaId: { in: mediaIds } },
    select: { mediaId: true, rating: true },
  });

  const ratingsByMedia = new Map<number, { rating: number }[]>();
  for (const r of allRatings) {
    const arr = ratingsByMedia.get(r.mediaId) || [];
    arr.push(r);
    ratingsByMedia.set(r.mediaId, arr);
  }

  const map = new Map<number, ScoreResult>();
  for (const s of scores) {
    const ratings = ratingsByMedia.get(s.mediaId) || [];
    map.set(s.mediaId, {
      weightedScore: s.weightedScore,
      bayesianScore: s.bayesianScore,
      totalVotes: s.totalVotes,
      verifiedVotes: s.verifiedVotes,
      distribution: computeDistribution(ratings),
      averageRating: s.totalVotes > 0 ? s.sumRatings / s.totalVotes : 0,
    });
  }
  return map;
}
