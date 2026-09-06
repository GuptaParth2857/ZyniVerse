import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const value = Number(body.value);

  const rec = await prisma.mediaRecommendation.findUnique({ where: { id } });
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (value !== 1 && value !== -1) return NextResponse.json({ error: "value must be 1 or -1" }, { status: 400 });

  const existing = await prisma.mediaRecommendationVote.findUnique({
    where: { recommendationId_userId: { recommendationId: id, userId } },
  });

  let deltaUp = 0;
  let deltaDown = 0;

  if (existing) {
    if (existing.value === value) {
      await prisma.mediaRecommendationVote.delete({ where: { id: existing.id } });
      if (value === 1) deltaUp = -1;
      else deltaDown = -1;
    } else {
      await prisma.mediaRecommendationVote.update({ where: { id: existing.id }, data: { value } });
      if (value === 1) {
        deltaUp = 1;
        deltaDown = -1;
      } else {
        deltaUp = -1;
        deltaDown = 1;
      }
    }
  } else {
    await prisma.mediaRecommendationVote.create({ data: { recommendationId: id, userId, value } });
    if (value === 1) deltaUp = 1;
    else deltaDown = 1;
  }

  const updated = await prisma.mediaRecommendation.update({
    where: { id },
    data: { upvotes: { increment: deltaUp }, downvotes: { increment: deltaDown } },
    select: { upvotes: true, downvotes: true },
  });

  return NextResponse.json({ upvotes: updated.upvotes, downvotes: updated.downvotes });
}