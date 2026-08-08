import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeDailyMetrics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: { date: string; status: string }[] = [];

  const backfillDate = new Date(now);
  backfillDate.setDate(backfillDate.getDate() - 14);
  for (let i = 0; i <= 14; i++) {
    const d = new Date(backfillDate);
    d.setDate(backfillDate.getDate() + i);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (startOfDay > now) break;

    try {
      const existing = await prisma.retentionMetric.findUnique({ where: { date: startOfDay } });
      if (existing) {
        results.push({ date: startOfDay.toISOString().slice(0, 10), status: "exists" });
        continue;
      }
      const metric = await computeDailyMetrics(startOfDay);
      results.push({ date: startOfDay.toISOString().slice(0, 10), status: metric ? "computed" : "failed" });
    } catch (error) {
      results.push({ date: startOfDay.toISOString().slice(0, 10), status: `error: ${String(error).slice(0, 80)}` });
    }
  }

  return NextResponse.json({
    success: true,
    today: now.toISOString().slice(0, 10),
    results,
    timestamp: now.toISOString(),
  });
}
