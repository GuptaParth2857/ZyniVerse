import { prisma } from "./prisma";

export interface ConversationWithDetails {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    userId: string;
    lastReadAt: Date;
    user: { id: string; username: string; avatar: string | null };
  }[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    isDeleted: boolean;
  } | null;
}

export async function getOrCreateConversation(userId1: string, userId2: string) {
  if (userId1 === userId2) throw new Error("Cannot create conversation with yourself");

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId1 } } },
        { participants: { some: { userId: userId2 } } },
      ],
    },
    include: { participants: true },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: userId1 },
          { userId: userId2 },
        ],
      },
    },
    include: { participants: true },
  });
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) throw new Error("Not a participant of this conversation");

  return prisma.message.create({
    data: { conversationId, senderId, content },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  });
}

export async function getMessages(conversationId: string, limit = 50, before?: string) {
  const where: any = { conversationId };
  if (before) {
    const cursor = await prisma.message.findUnique({ where: { id: before } });
    if (cursor) where.createdAt = { lt: cursor.createdAt };
  }

  return prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
    },
  });
}

export async function getConversations(userId: string): Promise<ConversationWithDetails[]> {
  const convos = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return convos.map((c) => ({
    ...c,
    lastMessage: c.messages[0] ?? null,
  }));
}

export async function getUnreadCounts(userId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });

  if (participants.length === 0) return [];

  const counts = await Promise.all(
    participants.map(async (p) => {
      const count = await prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: userId },
          createdAt: { gt: p.lastReadAt },
          isDeleted: false,
        },
      });
      return { conversationId: p.conversationId, count };
    })
  );

  return counts;
}

export async function markAsRead(conversationId: string, userId: string) {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function getUnreadTotal(userId: string) {
  const counts = await getUnreadCounts(userId);
  return counts.reduce((sum, c) => sum + c.count, 0);
}
