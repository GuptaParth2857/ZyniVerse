import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, non-personalized stats. Shared-cache it so repeat character views are
// served by the CDN instead of re-running these aggregate queries (a remote
// pooler round-trip is ~750ms, and this used to be 3 queries per view).
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ characterId: string }> }) {
  const { characterId } = await params;
  const id = parseInt(characterId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid characterId" }, { status: 400 });

  const [grouped, topVoters] = await Promise.all([
    prisma.characterVote.groupBy({
      by: ["characterId"],
      where: { characterId: id },
      _sum: { vote: true },
      _count: { _all: true },
    }),
    prisma.characterVote.findMany({
      where: { characterId: id },
      orderBy: { vote: "desc" },
      take: 5,
      include: { user: { select: { id: true, username: true, avatar: true } } },
    }),
  ]);

  const stat = grouped[0];
  return NextResponse.json(
    {
      totalVotes: stat?._sum.vote || 0,
      voterCount: stat?._count._all || 0,
      topVoters,
    },
    { headers: CACHE_HEADERS },
  );
}
