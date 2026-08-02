import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ? new Date(searchParams.get("start")!) : undefined;
  const end = searchParams.get("end") ? new Date(searchParams.get("end")!) : undefined;

  const where: Prisma.AffiliateClickWhereInput = {};
  const createdAtFilter: Prisma.DateTimeFilter = {};
  if (start) createdAtFilter.gte = start;
  if (end) createdAtFilter.lte = end;
  if (start || end) where.createdAt = createdAtFilter;

  const clicks = await prisma.affiliateClick.count({ where });
  const estimatedRevenue = clicks * 0.05;

  return NextResponse.json({ clicks, estimatedRevenue });
}
