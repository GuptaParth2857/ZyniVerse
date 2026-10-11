import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { checkAndAwardAchievement } from "@/lib/achievements-server";
import { awardForReason } from "@/lib/economy";

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followingId } = await req.json();
  if (!followingId) return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
  if (followingId === session.user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: followingId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const alreadyFollowing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId } },
    select: { id: true },
  });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId } },
    update: {},
    create: { followerId: session.user.id, followingId },
  });

  // Pay only the first time this person is followed; re-following after an
  // unfollow is free (the ledger's dedupe key is the followed user's id).
  if (!alreadyFollowing) {
    awardForReason(session.user.id, "FOLLOW_PEER", followingId).catch(() => {});
  }

  const followingCount = await prisma.follow.count({ where: { followerId: session.user.id } });
  if (followingCount >= 10) checkAndAwardAchievement(session.user.id, "SOCIAL_BUTTERFLY").catch(() => {});

  const followerCount = await prisma.follow.count({ where: { followingId } });
  if (followerCount >= 50) checkAndAwardAchievement(followingId, "INFLUENCER").catch(() => {});

  return NextResponse.json({ following: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followingId } = await req.json();
  if (!followingId) return NextResponse.json({ error: "Missing followingId" }, { status: 400 });

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followingId },
  });

  return NextResponse.json({ following: false });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ following: [], followers: [] });

  const [following, followers] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    }),
    prisma.follow.findMany({
      where: { followingId: session.user.id },
      select: { followerId: true },
    }),
  ]);

  return NextResponse.json({
    following: following.map((f) => f.followingId),
    followers: followers.map((f) => f.followerId),
  });
}
