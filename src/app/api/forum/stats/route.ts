import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { prisma } from "@/lib/prisma";

// Dynamic, not ISR: forum stats are live DB counts; prerendering at build
// would freeze them and add a DB dependency to `next build`.
export const dynamic = "force-dynamic";

async function GET_inner() {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
