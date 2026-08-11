import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { createActivity } from "@/lib/activity";
import { autoCompleteAnimeForChallenge } from "@/lib/challenges";
import { checkAndAwardAchievement } from "@/lib/achievements-server";
import { resolveUserId } from "@/lib/resolve-user";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ items: [] });

  const items = await prisma.listEntry.findMany({
    where: { userId },
    select: {
      mediaId: true, type: true, status: true, progress: true, total: true, score: true,
      scoreStory: true, scoreArt: true, scoreSound: true, scoreCharacters: true, scoreEnjoyment: true,
    },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, type, action, status, mediaTitle, mediaImage, score, subScores } = await req.json();

  if (action === "rate") {
    const computed = computeScore(score, subScores);
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: {
        score: computed,
        scoreStory: subScores?.story ?? null,
        scoreArt: subScores?.art ?? null,
        scoreSound: subScores?.sound ?? null,
        scoreCharacters: subScores?.characters ?? null,
        scoreEnjoyment: subScores?.enjoyment ?? null,
      },
      create: {
        userId, mediaId, type: type || "ANIME", status: "PLANNING", progress: 0, total: 0,
        score: computed,
        scoreStory: subScores?.story ?? null,
        scoreArt: subScores?.art ?? null,
        scoreSound: subScores?.sound ?? null,
        scoreCharacters: subScores?.characters ?? null,
        scoreEnjoyment: subScores?.enjoyment ?? null,
      },
    });
    return NextResponse.json({ ok: true, score: computed });
  }

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

function computeScore(score: number | null | undefined, subScores?: Record<string, number> | null): number | null {
  const scores = [
    subScores?.story,
    subScores?.art,
    subScores?.sound,
    subScores?.characters,
    subScores?.enjoyment,
  ].filter((s): s is number => typeof s === "number" && s >= 1 && s <= 10);

  if (scores.length > 0) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    if (scores.length === 5) return avg;
    if (typeof score === "number" && score >= 1 && score <= 10) return score;
    return avg;
  }
  if (typeof score === "number" && score >= 1 && score <= 10) return score;
  return null;
}
