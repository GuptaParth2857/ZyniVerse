import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

async function GET_inner(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { id } = await params;
  const mediaId = Number(id);
  if (isNaN(mediaId)) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });

  const totalVotes = await prisma.fillerVote.count({ where: { mediaId } });
  const uniqueVoters = await prisma.fillerVote.groupBy({
    by: ["userId"],
    where: { mediaId },
  });

  const voteBreakdown = await prisma.fillerVote.groupBy({
    by: ["vote"],
    where: { mediaId },
    _count: { vote: true },
  });

  const breakdown: Record<string, number> = {};
  for (const v of voteBreakdown) {
    breakdown[v.vote] = v._count.vote;
  }

  return NextResponse.json({
    mediaId,
    totalVotes,
    uniqueVoters: uniqueVoters.length,
    breakdown,
  });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
