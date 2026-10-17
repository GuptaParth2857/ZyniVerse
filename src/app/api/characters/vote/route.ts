import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Vote totals are public, non-personalized reads. Anonymous responses get a
// shared-cache TTL so Vercel's CDN answers repeat views without a function
// invocation; the POST below always reads the DB so a voter sees their own
// change immediately.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
};

// Batched stats read. The anime detail page mounts one CharacterVoteWidget per
// character (~25) and each used to fire its own uncached DB route. A single
// /api/characters/vote?ids=1,2,3 request now answers all of them — one query
// instead of ~25 invocations * 3 queries per page view.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ids") || "";
  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ).slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json({ votes: {} }, { headers: CACHE_HEADERS });
  }

  const grouped = await prisma.characterVote.groupBy({
    by: ["characterId"],
    where: { characterId: { in: ids } },
    _sum: { vote: true },
    _count: { _all: true },
  });

  const votes: Record<string, { totalVotes: number; voterCount: number }> = {};
  for (const g of grouped) {
    votes[String(g.characterId)] = {
      totalVotes: g._sum.vote ?? 0,
      voterCount: g._count._all,
    };
  }

  return NextResponse.json({ votes }, { headers: CACHE_HEADERS });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { characterId, mediaId, vote } = await req.json();
  if (!characterId || !mediaId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.characterVote.findUnique({
    where: { userId_characterId: { userId: session.user.id, characterId } },
  });

  if (existing) {
    await prisma.characterVote.update({ where: { id: existing.id }, data: { vote: vote ?? 1 } });
  } else {
    await prisma.characterVote.create({
      data: { userId: session.user.id, characterId, mediaId, vote: vote ?? 1 },
    });
  }

  const total = await prisma.characterVote.aggregate({ where: { characterId }, _sum: { vote: true } });
  const count = await prisma.characterVote.count({ where: { characterId } });

  return NextResponse.json({ success: true, totalVotes: total._sum.vote || 0, voterCount: count });
}
