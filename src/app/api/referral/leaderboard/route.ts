import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leaders = await prisma.user.findMany({
      where: { referralCount: { gt: 0 } },
      orderBy: { referralCount: "desc" },
      take: 20,
      select: { username: true, avatar: true, referralCount: true },
    });
    return NextResponse.json({ leaders });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}