import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: activityId } = await params;
  const { type } = await req.json();
  if (!type || !["heart", "fire", "laugh"].includes(type)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });

  const existing = await prisma.activityReaction.findUnique({
    where: { userId_activityId_type: { userId: session.user.id, activityId, type } },
  });

  if (existing) {
    await prisma.activityReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.activityReaction.create({
      data: { userId: session.user.id, activityId, type },
    });
  }

  const reactionCounts = await prisma.activityReaction.groupBy({
    by: ["type"],
    where: { activityId },
    _count: { type: true },
  });

  const myReactions = await prisma.activityReaction.findMany({
    where: { userId: session.user.id, activityId },
    select: { type: true },
  });

  return NextResponse.json({
    reactions: Object.fromEntries(
      reactionCounts.map((r) => [r.type, r._count.type])
    ),
    myReactions: myReactions.map((r) => r.type),
  });
}
