import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import UserListDetail from "@/components/UserListDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const list = await prisma.userList.findUnique({ where: { id }, select: { title: true } });
  if (!list) return { title: "Not Found" };
  return { title: `Edit ${list.title} | ZyniVerse` };
}

export default async function EditListPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const list = await prisma.userList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { items: true } },
    },
  });

  if (!list) notFound();
  if (list.userId !== session.user.id) notFound();

  let isLiked = false;
  const like = await prisma.userListLike.findUnique({
    where: { listId_userId: { listId: id, userId: session.user.id } },
  });
  isLiked = !!like;

  const serialized = {
    ...list,
    createdAt: list.createdAt.toISOString(),
    itemCount: list._count.items,
    _count: undefined as any,
  };

  const serializedItems = list.items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <UserListDetail
      list={serialized}
      items={serializedItems}
      isOwner={true}
      isLiked={isLiked}
    />
  );
}
