import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeDailyMetrics } from "@/lib/analytics";
import { createCronBudget, cronJson } from "@/lib/cron-chunk";

export const revalidate = 0;
export const maxDuration = 60;

/** How many days back the daily rollup is backfilled. */
const BACKFILL_DAYS = 14;
/**
 * Each `computeDailyMetrics` day runs a dozen groupBy/count queries, so the
 * whole 15-day backfill in one invocation overran the 60s cap. The route now
 * fills a few days per call and returns a `skip` cursor for the rest.
 */
const DAYS_PER_RUN = 3;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const budget = createCronBudget();
  const url = new URL(req.url);
  const skip = Math.max(0, Math.floor(Number(url.searchParams.get("skip")) || 0));

  const now = new Date();
  // Oldest first, so the cursor walks forward deterministically. Dates are
  // local midnights because that is the retentionMetric.date key.
  const days: Date[] = [];
  for (let i = BACKFILL_DAYS; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (startOfDay > now) continue;
    days.push(startOfDay);
  }

  const results: { date: string; status: string }[] = [];
  let processed = 0;
  for (const startOfDay of days.slice(skip)) {
    // Always run the first unit so `skip` advances and the caller terminates.
    if (processed > 0 && (!budget.hasTime(12_000) || processed >= DAYS_PER_RUN)) break;
    processed++;

    const dateKey = startOfDay.toISOString().slice(0, 10);
    try {
      const existing = await prisma.retentionMetric.findUnique({ where: { date: startOfDay } });
      if (existing) {
        results.push({ date: dateKey, status: "exists" });
        continue;
      }
      const metric = await computeDailyMetrics(startOfDay);
      results.push({ date: dateKey, status: metric ? "computed" : "failed" });
    } catch (error) {
      console.error(`[cron] computeDailyMetrics failed for ${dateKey}:`, error);
      results.push({ date: dateKey, status: `error: ${String(error).slice(0, 80)}` });
    }
  }

  const nextSkip = skip + processed;
  const nextQuery = nextSkip < days.length ? `skip=${nextSkip}` : null;
  return cronJson(
    {
      success: true,
      today: now.toISOString().slice(0, 10),
      timestamp: now.toISOString(),
      from: skip,
      processed,
      total: days.length,
      elapsedMs: budget.elapsedMs(),
      results,
    },
    nextQuery
  );
}
