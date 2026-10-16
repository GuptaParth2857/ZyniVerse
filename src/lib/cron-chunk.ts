import { NextResponse } from "next/server";

/**
 * Soft time budget for chunked cron routes.
 *
 * Vercel Hobby caps a serverless function at 60s (`maxDuration = 60`), so a
 * cron route that does unbounded work gets killed mid-flight and the caller
 * sees a 504 instead of a result. Chunked routes stop themselves before that
 * cap and hand the caller a `nextQuery` to resume with; the GitHub Actions
 * scheduler walks those chunks in a loop (see `.github/workflows/cron.yml`).
 *
 * Every chunk must make progress, so callers should always run at least one
 * unit of work even when the budget is already exhausted - otherwise a
 * `nextQuery` that never advances would spin the caller forever.
 */
export const CRON_BUDGET_MS = 40_000;

export function createCronBudget(budgetMs: number = CRON_BUDGET_MS) {
  const startedAt = Date.now();
  return {
    elapsedMs: () => Date.now() - startedAt,
    /** Is there room to start one more unit of work that takes about `minMs`? */
    hasTime: (minMs = 8_000) => Date.now() - startedAt + minMs < budgetMs,
  };
}

export type CronBudget = ReturnType<typeof createCronBudget>;

/**
 * JSON envelope for chunked crons. `nextQuery` is the raw query string (no
 * leading `?`) the scheduler should call next, or `null` when the job is done.
 */
export function cronJson(
  body: Record<string, unknown>,
  nextQuery: string | null = null,
  status = 200
): NextResponse {
  return NextResponse.json({ ...body, nextQuery }, { status });
}

/** Clamp a `step` search param into `[0, max]`, defaulting to 0. */
export function readStep(raw: string | null, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), max);
}
