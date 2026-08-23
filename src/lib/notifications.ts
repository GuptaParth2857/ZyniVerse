import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

interface NotificationCreate {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}

export async function createNotification(data: NotificationCreate) {
  const notification = await prisma.notification.create({ data });
  void sendPushToUser(data.userId, {
    title: data.title,
    body: data.body,
    link: data.link,
    tag: notification.id,
  }).catch(() => {});
  return notification;
}

export async function getNotifications(userId: string, limit = 50, offset = 0) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function createAiringAlert(userId: string, mediaId: number, episode: number, airingAt: Date) {
  return prisma.airingAlert.upsert({
    where: { userId_mediaId_episode: { userId, mediaId, episode } },
    update: { airingAt },
    create: { userId, mediaId, episode, airingAt },
  });
}

export async function getAiringAlerts(userId: string) {
  return prisma.airingAlert.findMany({
    where: { userId, airingAt: { gte: new Date() }, notified: false },
    orderBy: { airingAt: "asc" },
  });
}
