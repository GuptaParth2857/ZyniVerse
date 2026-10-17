import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { createActivity } from "@/lib/activity";
import { checkAndAwardAchievement } from "@/lib/achievements-server";
export const dynamic = "force-dynamic";

// Public review list, no per-user fields. A short shared cache keeps popular
// anime pages from hitting the origin on every view; a 60s window is short
// enough that a freshly posted review shows up almost immediately.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { searchParams } = new URL(req.url);
  const mediaId = Number(searchParams.get("mediaId"));
  if (!mediaId) return NextResponse.json({ reviews: [] }, { headers: CACHE_HEADERS });

  const reviews = await prisma.review.findMany({
    where: { mediaId },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ reviews }, { headers: CACHE_HEADERS });
}

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, rating, comment, mediaTitle, mediaImage } = await req.json();
  if (!mediaId || rating == null || rating < 1 || rating > 10) return NextResponse.json({ error: "Missing or invalid fields (rating must be 1-10)" }, { status: 400 });

  const review = await prisma.review.upsert({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
    update: { rating, comment },
    create: { userId: session.user.id, mediaId, rating, comment },
  });

  await createActivity({
    userId: session.user.id,
    type: "REVIEWED",
    mediaId,
    mediaTitle,
    mediaImage,
    message: comment || `Rated ${rating}/10`,
  });

  const reviewCount = await prisma.review.count({ where: { userId: session.user.id } });
  if (reviewCount >= 1) checkAndAwardAchievement(session.user.id, "FIRST_REVIEW").catch(() => {});
  if (reviewCount >= 10) checkAndAwardAchievement(session.user.id, "TEN_REVIEWS").catch(() => {});

  return NextResponse.json({ review });
}
