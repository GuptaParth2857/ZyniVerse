import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, referralCount: true },
    });

    if (!user?.referralCode) {
      const code = session.user.email?.split("@")[0]?.toLowerCase() + Math.random().toString(36).slice(2, 6);
      await prisma.user.update({ where: { id: session.user.id }, data: { referralCode: code } });
      user!.referralCode = code;
      user!.referralCount = 0;
    }

    const points = await prisma.userPoints.findUnique({ where: { userId: session.user.id } });

    return NextResponse.json({
      code: user!.referralCode,
      count: user!.referralCount,
      xpEarned: points?.points ?? 0,
      level: points?.level ?? 1,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
