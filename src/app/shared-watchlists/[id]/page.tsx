import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import SharedWatchlistDetail from "@/components/SharedWatchlistDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const watchlist = await prisma.sharedWatchlist.findUnique({
    where: { id },
    include: { owner: { select: { username: true } } },
  });
  if (!watchlist) return { title: "Not Found" };
  return {
    title: `${watchlist.title} — Shared Watchlist | ZyniVerse`,
    description: watchlist.description || `Shared watchlist by @${watchlist.owner.username}`,
  };
}

export default async function SharedWatchlistDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const watchlist = await prisma.sharedWatchlist.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      items: { orderBy: { order: "asc" } },
      _count: { select: { items: true } },
    },
  });

  if (!watchlist) notFound();

  const userId = session?.user?.id;
  if (!userId) notFound();

  const membership = watchlist.members.find((m) => m.userId === userId);
  if (!membership && watchlist.ownerId !== userId) notFound();

  const serialized = {
    ...watchlist,
    createdAt: watchlist.createdAt.toISOString(),
    updatedAt: watchlist.updatedAt.toISOString(),
    items: watchlist.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    members: watchlist.members.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
    })),
  };

  return (
    <SharedWatchlistDetail
      watchlist={serialized}
      isOwner={watchlist.ownerId === userId}
      isEditor={membership?.role === "editor" || watchlist.ownerId === userId}
      currentUserId={userId}
    />
  );
}
