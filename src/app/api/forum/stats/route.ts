import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalThreads, totalMembers, postsToday] = await Promise.all([
    prisma.forumThread.count({ where: { isDeleted: false } }),
    prisma.user.count(),
    prisma.forumPost.count({ where: { createdAt: { gte: startOfToday } } }),
  ]);

  let onlineCount = 0;
  try {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    onlineCount = await prisma.user.count({ where: { lastSeen: { gte: twoMinAgo } } });
  } catch {
    onlineCount = 0;
  }

  return NextResponse.json({ totalThreads, totalMembers, postsToday, onlineCount });
}
