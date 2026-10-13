import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SharedWatchlistsPage from "./SharedWatchlistsClient";

export const metadata = {
  title: "Shared Watchlists",
  description: "Create and collaborate on watchlists with friends",
};

export default async function Page() {
  const session = await auth();

  const watchlists = session?.user?.id
    ? await prisma.sharedWatchlist.findMany({
        where: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
        include: {
          owner: { select: { id: true, username: true, avatar: true } },
          members: {
            include: { user: { select: { id: true, username: true, avatar: true } } },
          },
          _count: { select: { items: true } },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const serialized = watchlists.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));

  return <SharedWatchlistsPage watchlists={serialized} isLoggedIn={!!session?.user?.id} />;
}
