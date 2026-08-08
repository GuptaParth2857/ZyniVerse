import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

const REVENUE_PER_CLICK = 0.05;
const DAYS = 14;

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = parseInt(searchParams.get("range") || "30", 10);
  const days = Math.min(Math.max(isNaN(range) ? 30 : range, 7), 90);

  const now = new Date();
  const start = new Date(now.getTime() - days * 864e5);

  const [totalClicks, last7, last30, byPartner, byPage, recent, recentCreatedAt] = await Promise.all([
    prisma.affiliateClick.count(),
    prisma.affiliateClick.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 864e5) } } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: start } } }),
    prisma.affiliateClick.groupBy({ by: ["partner"], _count: { _all: true } }),
    prisma.affiliateClick.groupBy({ by: ["page"], _count: { _all: true } }),
    prisma.affiliateClick.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.affiliateClick.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
  ]);

  const partners = byPartner
    .map((row) => ({
      partner: row.partner,
      count: row._count._all,
      revenue: row._count._all * REVENUE_PER_CLICK,
    }))
    .sort((a, b) => b.count - a.count);

  const pages = byPage
    .map((row) => ({ page: row.page, count: row._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

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
    totalClicks,
    estimatedRevenue: totalClicks * REVENUE_PER_CLICK,
    clicksLast7: last7,
    clicksLast30: last30,
    byPartner: partners,
    byPage: pages,
    recent: recent.map((r) => ({
      id: r.id,
      partner: r.partner,
      page: r.page,
      createdAt: r.createdAt.toISOString(),
    })),
    daily,
  });
}
