import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        entries: { orderBy: { updatedAt: "desc" } },
        reviews: { include: { user: { select: { username: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
        _count: { select: { followers: true, following: true } },
        userAchievements: {
          include: { achievement: true },
          orderBy: { earnedAt: "desc" },
          take: 8,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id },
    });

    const stats = {
      total: user.entries.length,
      current: user.entries.filter((e) => e.status === "CURRENT").length,
      planning: user.entries.filter((e) => e.status === "PLANNING").length,
      completed: user.entries.filter((e) => e.status === "COMPLETED").length,
      dropped: user.entries.filter((e) => e.status === "DROPPED").length,
      paused: user.entries.filter((e) => e.status === "PAUSED").length,
      episodesWatched: user.entries.reduce((s, e) => s + (e.progress || 0), 0),
      meanScore: (() => {
        const scored = user.entries.filter((e) => e.score && e.score > 0);
        if (scored.length === 0) return 0;
        return Math.round(scored.reduce((s, e) => s + (e.score || 0), 0) / scored.length * 10) / 10;
      })(),
    };

    const topAnime = user.entries
      .filter((e) => e.type === "ANIME" && e.status === "COMPLETED" && e.score && e.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)
      .map((e) => ({ mediaId: e.mediaId, score: e.score, title: null as string | null, cover: null as string | null }));

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        banner: user.banner,
        themeColor: user.themeColor,
        signature: user.signature,
        bio: user.bio,
        createdAt: user.createdAt,
        entries: user.entries,
        reviews: user.reviews,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        level: userPoints?.level ?? 1,
        points: userPoints?.points ?? 0,
        achievements: user.userAchievements.map((ua) => ({
          code: ua.achievement.code,
          name: ua.achievement.name,
          icon: ua.achievement.icon,
          category: ua.achievement.category,
          points: ua.achievement.points,
          earnedAt: ua.earnedAt,
        })),
        recentActivity: user.activities.map((a) => ({
          id: a.id,
          type: a.type,
          mediaId: a.mediaId,
          mediaTitle: a.mediaTitle,
          mediaImage: a.mediaImage,
          message: a.message,
          createdAt: a.createdAt,
        })),
      },
      stats,
      topAnime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { banner, themeColor, signature, bio, avatar } = await req.json();
  const data: Record<string, string> = {};
  if (banner !== undefined) data.banner = banner;
  if (themeColor !== undefined) data.themeColor = themeColor;
  if (signature !== undefined) data.signature = signature;
  if (bio !== undefined) data.bio = bio;
  if (avatar !== undefined) data.avatar = avatar;

  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ user });
}
