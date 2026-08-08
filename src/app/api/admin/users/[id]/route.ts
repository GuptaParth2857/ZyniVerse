import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getMediaBatch, bestTitle } from "@/lib/anilist";

function getRank(points: number) {
  if (points >= 10000) return { name: "Grandmaster", color: "#FF6B00", tier: 7 };
  if (points >= 5000) return { name: "Heroic", color: "#FF4444", tier: 6 };
  if (points >= 2500) return { name: "Diamond", color: "#B9F2FF", tier: 5 };
  if (points >= 1000) return { name: "Platinum", color: "#00D4FF", tier: 4 };
  if (points >= 500) return { name: "Gold", color: "#FFD700", tier: 3 };
  if (points >= 100) return { name: "Silver", color: "#C0C0C0", tier: 2 };
  return { name: "Bronze", color: "#CD7F32", tier: 1 };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        banner: true,
        themeColor: true,
        signature: true,
        provider: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [pointsData, achievements, counts, entries] = await Promise.all([
      prisma.userPoints.findUnique({ where: { userId: id }, select: { points: true, level: true } }),
      prisma.userAchievement.findMany({
        where: { userId: id },
        orderBy: { earnedAt: "desc" },
        include: { achievement: { select: { code: true, name: true, icon: true, category: true, points: true } } },
      }),
      prisma.listEntry.aggregate({ where: { userId: id }, _count: true }),
      prisma.listEntry.findMany({
        where: { userId: id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { mediaId: true, status: true, score: true, progress: true, total: true },
      }),
    ]);

    const [mangaCount, reviewCount, followerCount, followingCount] = await Promise.all([
      prisma.mangaEntry.count({ where: { userId: id } }),
      prisma.review.count({ where: { userId: id } }),
      prisma.follow.count({ where: { followingId: id } }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    const mediaList = await getMediaBatch(entries.map((e) => e.mediaId));
    const titleMap = new Map(mediaList.map((m) => [m.id, bestTitle(m.title)]));
    const enrichedEntries = entries.map((e) => ({
      ...e,
      title: titleMap.get(e.mediaId) || `#${e.mediaId}`,
    }));

    const points = pointsData?.points || 0;
    const rank = getRank(points);

    return NextResponse.json({
      user: {
        ...user,
        userPoints: pointsData,
        userAchievements: achievements,
        _count: {
          entries: counts._count,
          mangaEntries: mangaCount,
          reviews: reviewCount,
          followers: followerCount,
          following: followingCount,
        },
        entries: enrichedEntries,
        rank,
      },
    });
  } catch (e) {
    console.error("Admin user detail error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
