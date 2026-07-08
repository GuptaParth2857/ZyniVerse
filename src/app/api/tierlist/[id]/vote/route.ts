import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { vote } = await req.json();

  if (![1, -1].includes(vote)) {
    return NextResponse.json({ error: "Vote must be 1 (upvote) or -1 (downvote)" }, { status: 400 });
  }

  const tierList = await prisma.tierList.findUnique({ where: { id } });
  if (!tierList) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.tierListVote.findUnique({
    where: { tierListId_userId: { tierListId: id, userId: session.user.id } },
  });

  if (existing && existing.vote === vote) {
    await prisma.tierListVote.delete({ where: { id: existing.id } });
    const total = await prisma.tierListVote.count({ where: { tierListId: id } });
    return NextResponse.json({ vote: null, total });
  }

  const result = await prisma.tierListVote.upsert({
    where: { tierListId_userId: { tierListId: id, userId: session.user.id } },
    update: { vote },
    create: { tierListId: id, userId: session.user.id, vote },
  });

  const total = await prisma.tierListVote.count({ where: { tierListId: id } });

  return NextResponse.json({ vote: { vote: result.vote }, total });
}
