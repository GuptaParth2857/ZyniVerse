import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function GET_inner() {
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

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
