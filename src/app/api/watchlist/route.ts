import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { createActivity } from "@/lib/activity";
import { autoCompleteAnimeForChallenge } from "@/lib/challenges";
import { checkAndAwardAchievement } from "@/lib/achievements";
import { resolveUserId } from "@/lib/resolve-user";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ items: [] });

  const items = await prisma.listEntry.findMany({
    where: { userId },
    select: { mediaId: true, type: true, status: true, progress: true, total: true, score: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, type, action, status, mediaTitle, mediaImage } = await req.json();

  if (action === "add" && status) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: { status, type: type || "ANIME" },
      create: { userId, mediaId, type: type || "ANIME", status, progress: 0, total: 0 },
    });

    autoCompleteAnimeForChallenge(userId, mediaId, mediaTitle || "Unknown", mediaImage, "anime").catch(() => {});

    if (status === "COMPLETED") {
      checkCompletedAchievements(userId).catch(() => {});
    }

    if (["COMPLETED", "CURRENT", "PLANNING", "DROPPED", "PAUSED", "REWATCHING"].includes(status)) {
      await createActivity({
        userId,
        type: status,
        mediaId,
        mediaTitle,
        mediaImage,
      });
    }
  } else if (action === "remove") {
    await prisma.listEntry.deleteMany({
      where: { userId, mediaId },
    });
  } else if (action === "update" && status) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: { status, progress: status === "COMPLETED" ? { increment: 1 } : undefined },
      create: { userId, mediaId, type: type || "ANIME", status, progress: 0, total: 0 },
    });

    if (status === "COMPLETED") {
      autoCompleteAnimeForChallenge(userId, mediaId, mediaTitle || "Unknown", mediaImage, "anime").catch(() => {});
      checkCompletedAchievements(userId).catch(() => {});
    }

    if (["COMPLETED", "CURRENT", "PLANNING", "DROPPED", "PAUSED", "REWATCHING"].includes(status)) {
      await createActivity({
        userId,
        type: status,
        mediaId,
        mediaTitle,
        mediaImage,
      });
    }
  }
  return NextResponse.json({ ok: true });
}

async function checkCompletedAchievements(userId: string) {
  const count = await prisma.listEntry.count({
    where: { userId, status: "COMPLETED" },
  });
  if (count >= 1) checkAndAwardAchievement(userId, "FIRST_STEP").catch(() => {});
  if (count >= 10) checkAndAwardAchievement(userId, "TENTH_ANIME").catch(() => {});
  if (count >= 50) checkAndAwardAchievement(userId, "FIFTY_ANIME").catch(() => {});
  if (count >= 100) checkAndAwardAchievement(userId, "CENTURY_CLUB").catch(() => {});
}
