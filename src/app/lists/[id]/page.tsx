import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import UserListDetail from "@/components/UserListDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const list = await prisma.userList.findUnique({
    where: { id },
    include: { user: { select: { username: true } } },
  });

  if (!list) return { title: "Not Found" };

  return {
    title: `${list.title} — by @${list.user.username}`,
    description: list.description || `View ${list.title} by @${list.user.username}`,
    openGraph: {
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
      title: `${list.title} — by @${list.user.username}`,
      description: list.description || `View ${list.title} by @${list.user.username}`,
    },
  };
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const list = await prisma.userList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { items: true } },
    },
  });

  if (!list) notFound();
  if (!list.isPublic && list.userId !== session?.user?.id) notFound();

  let isLiked = false;
  let voteValue = 0;
  if (session?.user?.id) {
    const like = await prisma.userListLike.findUnique({
      where: { listId_userId: { listId: id, userId: session.user.id } },
    });
    isLiked = !!like;
    const vote = await prisma.listVote.findUnique({
      where: { listId_userId: { listId: id, userId: session.user.id } },
    });
    voteValue = vote?.value ?? 0;
  }

  const { _count, ...listData } = list;
  const serialized = {
    ...listData,
    createdAt: list.createdAt.toISOString(),
    itemCount: list._count.items,
  };

  const serializedItems = list.items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <UserListDetail
      list={serialized}
      items={serializedItems}
      isOwner={session?.user?.id === list.userId}
      isLiked={isLiked}
      voteValue={voteValue}
    />
  );
}
