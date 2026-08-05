import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ history: [] });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 30), 100);

  const chapters = await prisma.mangaChapter.findMany({
    where: { read: true, readAt: { not: null }, entry: { userId: session.user.id } },
    take: limit,
    orderBy: { readAt: "desc" },
    select: {
      chapter: true,
      title: true,
      readAt: true,
      entry: {
        select: {
          mediaId: true,
          title: true,
          coverImage: true,
          subType: true,
        },
      },
    },
  });

  return NextResponse.json({ history: chapters });
}
