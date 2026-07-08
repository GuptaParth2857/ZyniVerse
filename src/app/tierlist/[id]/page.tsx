import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TierListDisplay from "@/components/TierListDisplay";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const tierList = await prisma.tierList.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!tierList) return { title: "Not Found" };

  return {
    title: `${tierList.title} — Anime Tier List | ZyniVerse`,
    description: tierList.description || `View ${tierList.title} anime tier list`,
  };
}

export default async function TierListPage({ params }: Props) {
  const { id } = await params;

  const tierList = await prisma.tierList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { votes: true } },
    },
  });

  if (!tierList) notFound();

  const serialized = {
    ...tierList,
    createdAt: tierList.createdAt.toISOString(),
    voteCount: tierList._count.votes,
  };

  return <TierListDisplay tierList={serialized} />;
}
