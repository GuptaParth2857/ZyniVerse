import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export const messageInclude = {
  sender: { select: { id: true, username: true, avatar: true } },
  replyTo: {
    select: {
      id: true,
      content: true,
      isDeleted: true,
      deletedFor: true,
      sender: { select: { id: true, username: true } },
    },
  },
  reactions: {
    select: { id: true, userId: true, emoji: true, user: { select: { id: true, username: true } } },
  },
} satisfies Prisma.MessageInclude;

export async function broadcastToConversation(
  conversationId: string,
  excludeUserId: string,
  event: string,
  payload: unknown
) {
  const wsBase = process.env.NEXT_PUBLIC_WS_URL;
  if (!wsBase) return;
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: excludeUserId } },
    select: { userId: true },
  });
  if (participants.length === 0) return;

  const token = process.env.DM_BROADCAST_TOKEN;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["x-dm-token"] = token;
  for (const p of participants) {
    fetch(`${wsBase.replace(/\/$/, "")}/internal/dm-broadcast`, {
      method: "POST",
      headers,
      body: JSON.stringify({ recipientId: p.userId, event, payload }),
    }).catch(() => {});
  }
}

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
    deletedFor: string;
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

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyToId?: string
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) throw new Error("Not a participant of this conversation");

  if (replyToId) {
    const reply = await prisma.message.findFirst({
      where: { id: replyToId, conversationId },
      select: { id: true },
    });
    if (!reply) throw new Error("Reply message not found in this conversation");
  }

  return prisma.message.create({
    data: { conversationId, senderId, content, replyToId: replyToId || null },
    include: messageInclude,
  });
}

export async function getMessages(conversationId: string, limit = 50, before?: string) {
  const where: Prisma.MessageWhereInput = { conversationId };
  if (before) {
    const cursor = await prisma.message.findUnique({ where: { id: before } });
    if (cursor) where.createdAt = { lt: cursor.createdAt };
  }

  return prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: messageInclude,
  });
}

export async function toggleReaction(messageId: string, userId: string, emoji: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { conversationId: true },
  });
  if (!message) throw new Error("Message not found");

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: message.conversationId, userId } },
  });
  if (!participant) throw new Error("Not a participant of this conversation");

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
  });

  if (existing) await prisma.messageReaction.delete({ where: { id: existing.id } });
  else await prisma.messageReaction.create({ data: { messageId, userId, emoji } });

  return prisma.messageReaction.findMany({
    where: { messageId },
    select: { id: true, userId: true, emoji: true, user: { select: { id: true, username: true } } },
  });
}

export async function deleteMessage(messageId: string, userId: string, mode: "me" | "everyone") {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");

  if (mode === "everyone" && message.senderId !== userId) {
    throw new Error("Only the sender can delete for everyone");
  }

  if (mode === "everyone") {
    await prisma.message.update({ where: { id: messageId }, data: { isDeleted: true } });
  } else {
    const list = message.deletedFor ? message.deletedFor.split(",").filter(Boolean) : [];
    if (!list.includes(userId)) list.push(userId);
    await prisma.message.update({ where: { id: messageId }, data: { deletedFor: list.join(",") } });
  }

  return prisma.message.findUnique({ where: { id: messageId }, include: messageInclude });
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
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          isDeleted: true,
          deletedFor: true,
        },
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
