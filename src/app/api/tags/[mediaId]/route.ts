import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const votes = await prisma.tagVote.findMany({ where: { mediaId: id } });
  const aggregated: Record<string, { total: number; count: number }> = {};
  for (const v of votes) {
    if (!aggregated[v.tag]) aggregated[v.tag] = { total: 0, count: 0 };
    aggregated[v.tag].total += v.vote;
    aggregated[v.tag].count++;
  }
  const tags = Object.entries(aggregated)
    .map(([tag, data]) => ({ tag, score: Math.round((data.total / data.count) * 10) / 10, votes: data.count }))
    .sort((a, b) => b.votes - a.votes);

  return NextResponse.json({ tags });
}
