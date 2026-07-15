import { prisma } from "./prisma";

interface CommunityTagResult {
  id: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  score: number;
  myVote: number;
}

export async function getCommunityTags(
  mediaId: number,
  userId?: string
): Promise<CommunityTagResult[]> {
  const tags = await prisma.communityTag.findMany({
    where: { mediaId, isApproved: true },
    include: {
      votes: userId
        ? { where: { userId }, select: { vote: true } }
        : false,
    },
    orderBy: { score: "desc" },
  });

  return tags.map((t) => ({
    id: t.id,
    tag: t.tag,
    upvotes: t.upvotes,
    downvotes: t.downvotes,
    score: t.score,
    myVote: userId && Array.isArray(t.votes) && t.votes.length > 0 ? t.votes[0].vote : 0,
  }));
}

export async function createCommunityTag(
  mediaId: number,
  tag: string,
  userId: string
): Promise<CommunityTagResult> {
  const normalized = tag.trim().toLowerCase();
  if (normalized.length < 2 || normalized.length > 30) {
    throw new Error("Tag must be 2-30 characters");
  }

  const existing = await prisma.communityTag.findUnique({
    where: { mediaId_tag: { mediaId, tag: normalized } },
  });

  if (existing) {
    return voteOnTag(existing.id, userId, 1);
  }

  const created = await prisma.$transaction([
    prisma.communityTag.create({
      data: {
        mediaId,
        tag: normalized,
        createdBy: userId,
        upvotes: 1,
        score: 1,
      },
    }),
  ]);

  const newTag = created[0];
  await prisma.tagVote2.create({
    data: { userId, communityTagId: newTag.id, vote: 1 },
  });

  return {
    id: newTag.id,
    tag: newTag.tag,
    upvotes: newTag.upvotes,
    downvotes: newTag.downvotes,
    score: newTag.score,
    myVote: 1,
  };
}

export async function voteOnTag(
  communityTagId: string,
  userId: string,
  vote: number
): Promise<CommunityTagResult> {
  const clampedVote = vote === -1 || vote === 0 || vote === 1 ? vote : 0;

  const existingVote = await prisma.tagVote2.findUnique({
    where: { userId_communityTagId: { userId, communityTagId } },
  });

  if (existingVote) {
    if (existingVote.vote === clampedVote) {
      await prisma.tagVote2.delete({
        where: { id: existingVote.id },
      });
    } else {
      await prisma.tagVote2.update({
        where: { id: existingVote.id },
        data: { vote: clampedVote },
      });
    }
  } else if (clampedVote !== 0) {
    await prisma.tagVote2.create({
      data: { userId, communityTagId, vote: clampedVote },
    });
  }

  const allVotes = await prisma.tagVote2.findMany({
    where: { communityTagId },
  });

  const upvotes = allVotes.filter((v) => v.vote === 1).length;
  const downvotes = allVotes.filter((v) => v.vote === -1).length;
  const score = upvotes - downvotes;

  await prisma.communityTag.update({
    where: { id: communityTagId },
    data: { upvotes, downvotes, score },
  });

  const tag = await prisma.communityTag.findUnique({
    where: { id: communityTagId },
    include: {
      votes: { where: { userId }, select: { vote: true } },
    },
  });

  return {
    id: tag!.id,
    tag: tag!.tag,
    upvotes: tag!.upvotes,
    downvotes: tag!.downvotes,
    score: tag!.score,
    myVote: tag!.votes.length > 0 ? tag!.votes[0].vote : 0,
  };
}

export async function moderateTag(
  communityTagId: string,
  isApproved: boolean
): Promise<void> {
  await prisma.communityTag.update({
    where: { id: communityTagId },
    data: { isApproved },
  });
}

export async function getTrendingTags(limit = 20): Promise<
  { tag: string; mediaCount: number; totalScore: number }[]
> {
  const tags = await prisma.communityTag.groupBy({
    by: ["tag"],
    where: { isApproved: true },
    _count: { id: true },
    _sum: { score: true },
    orderBy: { _sum: { score: "desc" } },
    take: limit,
  });

  return tags.map((t) => ({
    tag: t.tag,
    mediaCount: t._count.id,
    totalScore: t._sum.score || 0,
  }));
}
