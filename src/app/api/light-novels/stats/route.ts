import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

// Lightweight per-user aggregates so the browse page's hero stats and
// "Continue Reading" rail stay accurate even for large lists (the list
// endpoint caps perPage, which previously under-counted past 50 entries).
export async function GET(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ counts: {}, reading: [], total: 0 });

  const where = { userId: session.user.id, subType: "light_novel" };

  const [grouped, reading] = await Promise.all([
    prisma.mangaEntry.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.mangaEntry.findMany({
      where: { ...where, status: "READING" },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  const counts: Record<string, number> = {};
  let total = 0;
  for (const g of grouped) {
    counts[g.status] = g._count._all;
    total += g._count._all;
  }

  return NextResponse.json({ counts, reading, total });
}
