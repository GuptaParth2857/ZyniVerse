import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PublicProfile from "@/components/PublicProfile";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { title: "User Not Found | ZyniVerse" };
  return {
    title: `${user.username} — Profile | ZyniVerse`,
    description: user.bio || `View ${user.username}'s anime profile on ZyniVerse.`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const session = await auth();

  if (session?.user?.id && session.user.id === userId) {
    redirect("/profile");
  }

  const [user, userPoints, entries, friendsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        banner: true,
        bio: true,
        themeColor: true,
        signature: true,
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    }),
    prisma.userPoints.findUnique({ where: { userId } }),
    prisma.listEntry.findMany({
      where: { userId },
      select: { type: true, status: true, progress: true, score: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.friendRequest.count({
      where: {
        OR: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      },
    }),
  ]);

  if (!user) notFound();

  const animeEntries = entries.filter((e) => e.type === "ANIME");
  const stats = {
    total: entries.length,
    completed: entries.filter((e) => e.status === "COMPLETED").length,
    current: entries.filter((e) => e.status === "CURRENT").length,
    planning: entries.filter((e) => e.status === "PLANNING").length,
    episodesWatched: entries.reduce((s, e) => s + (e.progress || 0), 0),
    meanScore: (() => {
      const scored = animeEntries.filter((e) => e.score && e.score > 0);
      if (scored.length === 0) return 0;
      return Math.round((scored.reduce((s, e) => s + (e.score || 0), 0) / scored.length) * 10) / 10;
    })(),
  };

  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, type: true, mediaId: true, mediaTitle: true, mediaImage: true, message: true, createdAt: true },
  });

  return (
    <PublicProfile
      userId={user.id}
      username={user.username}
      avatar={user.avatar}
      banner={user.banner}
      bio={user.bio}
      signature={user.signature}
      themeColor={user.themeColor}
      createdAt={user.createdAt.toISOString()}
      followersCount={user._count.followers}
      followingCount={user._count.following}
      friendsCount={friendsCount}
      level={userPoints?.level ?? 1}
      points={userPoints?.points ?? 0}
      stats={stats}
      activities={activities.map((a) => ({
        id: a.id,
        type: a.type,
        mediaId: a.mediaId,
        mediaTitle: a.mediaTitle,
        mediaImage: a.mediaImage,
        message: a.message,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
