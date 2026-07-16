import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("[/api/profile] userId:", userId);

    const [user, userPoints] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          banner: true,
          themeColor: true,
          signature: true,
          bio: true,
          createdAt: true,
          entries: {
            select: {
              mediaId: true,
              type: true,
              status: true,
              progress: true,
              total: true,
              score: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: "desc" as const },
            take: 100,
          },
          _count: { select: { followers: true, following: true } },
        },
      }),
      prisma.userPoints.findUnique({ where: { userId } }),
    ]);

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    console.log("[/api/profile] user:", user.username, "entries:", user.entries.length, "points:", userPoints?.points);

    const [reviews, rawAchievements, activities] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
        take: 8,
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

    const achievements = rawAchievements
      .filter((ua) => ua.achievement != null)
      .map((ua) => ({
        code: ua.achievement.code,
        name: ua.achievement.name,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        points: ua.achievement.points,
        earnedAt: ua.earnedAt,
      }));

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
        reviews,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        level: userPoints?.level ?? 1,
        points: userPoints?.points ?? 0,
        achievements,
        recentActivity: activities.map((a) => ({
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
    console.error("[/api/profile] GET error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { banner, themeColor, signature, bio, avatar, username, currentPassword, newPassword } = await req.json();

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 3) {
        return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
      }
      if (username.trim().length > 30) {
        return NextResponse.json({ error: "Username must be 30 characters or less" }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
      }
      const existingUser = await prisma.user.findFirst({
        where: { username: username.trim(), id: { not: userId } },
      });
      if (existingUser) {
        return NextResponse.json({ error: "This username is already taken" }, { status: 400 });
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }

      const userWithPassword = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!userWithPassword?.password) {
        return NextResponse.json({ error: "No password set for this account" }, { status: 400 });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    const data: Record<string, string> = {};
    if (banner !== undefined) data.banner = banner;
    if (themeColor !== undefined) data.themeColor = themeColor;
    if (signature !== undefined) data.signature = signature;
    if (bio !== undefined) data.bio = bio;
    if (avatar !== undefined) data.avatar = avatar;
    if (username !== undefined) data.username = username.trim();

    const user = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[/api/profile] PATCH error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
