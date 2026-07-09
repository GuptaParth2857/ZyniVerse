import { prisma } from "./prisma";

export interface PollData {
  id: string;
  title: string;
  description: string | null;
  createdById: string;
  isActive: boolean;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  options: PollOptionData[];
  createdBy?: { id: string; username: string; avatar: string | null };
  userVote?: string | null;
}

export interface PollOptionData {
  id: string;
  label: string;
  image: string | null;
  _count?: { votes: number };
}

export async function createPoll(
  userId: string,
  title: string,
  options: string[],
  description?: string,
  endsAt?: string,
): Promise<PollData> {
  const poll = await prisma.poll.create({
    data: {
      title,
      description: description || null,
      endsAt: endsAt ? new Date(endsAt) : null,
      createdById: userId,
      options: {
        create: options.map((label) => ({ label })),
      },
    },
    include: { options: true, createdBy: { select: { id: true, username: true, avatar: true } } },
  });
  return poll as unknown as PollData;
}

export async function getPolls(activeOnly = false, page = 1, perPage = 20) {
  const where = activeOnly ? { isActive: true } : {};
  const [polls, total] = await Promise.all([
    prisma.poll.findMany({
      where,
      include: {
        options: { include: { _count: { select: { votes: true } } } },
        createdBy: { select: { id: true, username: true, avatar: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.poll.count({ where }),
  ]);
  return { polls: polls as unknown as PollData[], total, page, perPage };
}

export async function getPollById(pollId: string, userId?: string) {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      createdBy: { select: { id: true, username: true, avatar: true } },
      _count: { select: { votes: true } },
    },
  });
  if (!poll) return null;

  let userVote: string | null = null;
  if (userId) {
    const vote = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
    userVote = vote?.optionId || null;
  }

  return { ...poll, userVote } as unknown as PollData & { userVote: string | null };
}

export async function votePoll(pollId: string, optionId: string, userId: string) {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll || !poll.isActive) throw new Error("Poll not active");
  if (poll.endsAt && new Date() > poll.endsAt) throw new Error("Poll has ended");

  const option = await prisma.pollOption.findUnique({ where: { id: optionId } });
  if (!option || option.pollId !== pollId) throw new Error("Invalid option");

  await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId } },
    update: { optionId },
    create: { pollId, optionId, userId },
  });

  return getPollById(pollId, userId);
}

export async function deletePoll(pollId: string, userId: string) {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) throw new Error("Poll not found");
  if (poll.createdById !== userId) throw new Error("Not authorized");
  await prisma.poll.delete({ where: { id: pollId } });
}
