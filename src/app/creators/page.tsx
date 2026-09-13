import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CreatorsPageClient from "./CreatorsPageClient";

export const metadata = {
  title: "Creators — ZyniVerse",
  description: "Discover and support your favorite content creators",
};

export default async function Page() {
  const session = await auth();

  const creators = await prisma.creatorProfile.findMany({
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { tips: true } },
    },
    orderBy: { totalTips: "desc" },
    take: 50,
  });

  const totals = await prisma.creatorProfile.aggregate({ _sum: { totalTips: true } });
  const tipRows = (await prisma.tip.count().catch(() => 0)) || 0;

  const serialized = creators.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <CreatorsPageClient
      creators={serialized}
      isLoggedIn={!!session?.user?.id}
      currentUserId={session?.user?.id || null}
      stats={{
        totalCreators: creators.length,
        totalReceived: totals._sum.totalTips || 0,
        totalTips: tipRows,
      }}
    />
  );
}