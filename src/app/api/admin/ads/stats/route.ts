import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const DAYS = 14;

  const [impressions, clicks, impressionsLast7, clicksLast7, topPlacements, recentCreatedAt] = await Promise.all([
    prisma.adImpression.count(),
    prisma.adClick.count(),
    prisma.adImpression.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 864e5) } } }),
    prisma.adClick.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 864e5) } } }),
    prisma.adImpression.groupBy({
      by: ["placement"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.adImpression.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - DAYS * 864e5) } },
      select: { createdAt: true },
    }),
  ]);

  const clickData = await prisma.adClick.groupBy({
    by: ["placement"],
    _count: { id: true },
  });

  const clickMap = new Map(clickData.map((c) => [c.placement, c._count.id]));

  const top = topPlacements.map((p) => ({
    placement: p.placement,
    impressions: p._count.id,
    clicks: clickMap.get(p.placement) || 0,
  }));

  const dailyMap = new Map<string, number>();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 864e5);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const { createdAt } of recentCreatedAt) {
    const key = createdAt.toISOString().slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  }
  const daily = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    count,
  }));

  return NextResponse.json({
    impressions,
    clicks,
    impressionsLast7,
    clicksLast7,
    ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00",
    topPlacements: top,
    daily,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { action, placement, page } = body;

  if (!placement || !page) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (action === "impression") {
    await prisma.adImpression.create({
      data: {
        placement,
        page,
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "click") {
    await prisma.adClick.create({
      data: {
        placement,
        page,
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
