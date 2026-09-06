import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId, amount, message, anonymous } = await req.json();
  if (!creatorId || !amount || amount <= 0) {
    return NextResponse.json({ error: "creatorId and positive amount required" }, { status: 400 });
  }

  const creator = await prisma.creatorProfile.findUnique({ where: { id: creatorId } });
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  if (creator.userId === session.user.id) return NextResponse.json({ error: "Cannot tip yourself" }, { status: 400 });

  const tip = await prisma.tip.create({
    data: {
      creatorId,
      senderId: session.user.id,
      amount: Math.round(Number(amount)),
      currency: "INR",
      message: message?.trim() || null,
      anonymous: !!anonymous,
    },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorId },
    data: { totalTips: { increment: Math.round(Number(amount)) } },
  });

  return NextResponse.json({ tip });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "received";

  if (type === "sent") {
    const tips = await prisma.tip.findMany({
      where: { senderId: session.user.id },
      include: {
        creator: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ tips });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ tips: [] });

  const tips = await prisma.tip.findMany({
    where: { creatorId: profile.id },
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ tips });
}
