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
  if (start) where.createdAt = { ...where.createdAt as object, gte: start } as any;
  if (end) where.createdAt = { ...where.createdAt as object, lte: end } as any;

  const clicks = await prisma.affiliateClick.count({ where });
  const estimatedRevenue = clicks * 0.05;

  return NextResponse.json({ clicks, estimatedRevenue });
}
