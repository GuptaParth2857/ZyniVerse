import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Referral code required" }, { status: 400 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!referrer) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });

    if (referrer.id === session.user.id) return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.referredBy) return NextResponse.json({ error: "Already referred by someone" }, { status: 400 });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { referredBy: referrer.id },
    });

    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralCount: { increment: 1 } },
    });

    const referrerPoints = await prisma.userPoints.findUnique({ where: { userId: referrer.id } });
    if (referrerPoints) {
      await prisma.userPoints.update({
        where: { userId: referrer.id },
        data: { points: { increment: 100 } },
      });
    } else {
      await prisma.userPoints.create({ data: { userId: referrer.id, points: 100, level: 1 } });
    }

    const userPoints = await prisma.userPoints.findUnique({ where: { userId: session.user.id } });
    if (userPoints) {
      await prisma.userPoints.update({
        where: { userId: session.user.id },
        data: { points: { increment: 50 } },
      });
    } else {
      await prisma.userPoints.create({ data: { userId: session.user.id, points: 50, level: 1 } });
    }

    await prisma.notification.create({
      data: {
        userId: referrer.id,
        type: "SYSTEM",
        title: "New Referral!",
        body: `Someone joined ZyniVerse using your link. You earned 100 XP!`,
        link: "/earn",
      },
    });

    return NextResponse.json({ success: true, referrer: referrer.username, xpEarned: 50 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
