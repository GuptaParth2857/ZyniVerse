import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { createActivity } from "@/lib/activity";
import { autoCompleteAnimeForChallenge } from "@/lib/challenges";
import { checkAndAwardAchievement } from "@/lib/achievements";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  const items = await prisma.listEntry.findMany({
    where: { userId: session.user.id },
    select: { mediaId: true, type: true, status: true, progress: true, total: true, score: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, type, action, status, mediaTitle, mediaImage } = await req.json();

  if (action === "add" && status) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId: session.user.id, mediaId } },
      update: { status, type: type || "ANIME" },
      create: { userId: session.user.id, mediaId, type: type || "ANIME", status, progress: 0, total: 0 },
    });

    autoCompleteAnimeForChallenge(session.user.id, mediaId, mediaTitle || "Unknown", mediaImage, "anime").catch(() => {});

    if (status === "COMPLETED") {
      checkCompletedAchievements(session.user.id).catch(() => {});
    }

    if (["COMPLETED", "CURRENT", "PLANNING", "DROPPED", "PAUSED", "REWATCHING"].includes(status)) {
      await createActivity({
        userId: session.user.id,
        type: status,
        mediaId,
        mediaTitle,
        mediaImage,
      });
    }
  } else if (action === "remove") {
    await prisma.listEntry.deleteMany({
      where: { userId: session.user.id, mediaId },
    });
  } else if (action === "update" && status) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId: session.user.id, mediaId } },
      update: { status, progress: status === "COMPLETED" ? { increment: 1 } : undefined },
      create: { userId: session.user.id, mediaId, type: type || "ANIME", status, progress: 0, total: 0 },
    });

    if (status === "COMPLETED") {
      autoCompleteAnimeForChallenge(session.user.id, mediaId, mediaTitle || "Unknown", mediaImage, "anime").catch(() => {});
      checkCompletedAchievements(session.user.id).catch(() => {});
    }

    if (["COMPLETED", "CURRENT", "PLANNING", "DROPPED", "PAUSED", "REWATCHING"].includes(status)) {
      await createActivity({
        userId: session.user.id,
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
