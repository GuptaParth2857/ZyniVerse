import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Retention budget for the Supabase free tier (500 MB database).
 *
 * Measured on 2026-10-21: the database was at 143 MB, of which 114.6 MB was
 * analytics + cache, and UserSession alone was 54.8 MB (123,897 rows, mostly
 * crawler traffic). The crawler flood peaked at 19.6k sessions/day, so a
 * 45-day window alone would have put UserSession at ~390 MB — the cap would
 * have been crossed with retention "enabled".
 *
 * These tests lock the shortened windows in place so a future change cannot
 * silently re-inflate the tables.
 */

const mocks = vi.hoisted(() => {
  const deleted = { count: 0 };
  return {
    deleted,
    pageViewDeleteMany: vi.fn(async (_args: unknown) => deleted),
    userSessionDeleteMany: vi.fn(async (_args: unknown) => deleted),
    userActivityDeleteMany: vi.fn(async (_args: unknown) => deleted),
    adImpressionDeleteMany: vi.fn(async (_args: unknown) => deleted),
    searchLogDeleteMany: vi.fn(async (_args: unknown) => deleted),
    siteCounterDeleteMany: vi.fn(async (_args: unknown) => deleted),
    aniListCount: vi.fn(async () => 0),
    aniListFindMany: vi.fn(async () => []),
    aniListDeleteMany: vi.fn(async (_args: unknown) => deleted),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pageView: { deleteMany: mocks.pageViewDeleteMany },
    userSession: { deleteMany: mocks.userSessionDeleteMany },
    userActivity: { deleteMany: mocks.userActivityDeleteMany },
    adImpression: { deleteMany: mocks.adImpressionDeleteMany },
    searchLog: { deleteMany: mocks.searchLogDeleteMany },
    siteCounter: { deleteMany: mocks.siteCounterDeleteMany },
    aniListCache: {
      count: mocks.aniListCount,
      findMany: mocks.aniListFindMany,
      deleteMany: mocks.aniListDeleteMany,
    },
  },
}));

import {
  pruneLogs,
  pruneBotCounters,
  pruneAniListCacheToCap,
  SESSION_RETENTION_DAYS,
  PAGEVIEW_RETENTION_DAYS,
  AD_RETENTION_DAYS,
  ACTIVITY_RETENTION_DAYS,
  SEARCH_LOG_RETENTION_DAYS,
  BOT_COUNTER_RETENTION_DAYS,
} from "@/lib/db-prune";

const DAY = 24 * 60 * 60 * 1000;

/** Read the `lt` cutoff a deleteMany was called with. */
function cutoffOf(call: unknown[]): number {
  const arg = call[0] as { where: { createdAt?: { lt: Date }; startedAt?: { lt: Date } } };
  const date = arg.where.createdAt?.lt ?? arg.where.startedAt?.lt;
  if (!date) throw new Error("no cutoff in the deleteMany call");
  return date.getTime();
}

describe("retention windows", () => {
  it("keeps the high-volume analytics tables on a short window", () => {
    expect(SESSION_RETENTION_DAYS).toBe(14);
    expect(PAGEVIEW_RETENTION_DAYS).toBe(14);
    expect(AD_RETENTION_DAYS).toBe(30);
    expect(ACTIVITY_RETENTION_DAYS).toBe(30);
    expect(SEARCH_LOG_RETENTION_DAYS).toBe(30);
    expect(BOT_COUNTER_RETENTION_DAYS).toBe(30);
  });

  it("never lets the raw window reach the old 45 days", () => {
    for (const days of [
      SESSION_RETENTION_DAYS,
      PAGEVIEW_RETENTION_DAYS,
      AD_RETENTION_DAYS,
      ACTIVITY_RETENTION_DAYS,
      SEARCH_LOG_RETENTION_DAYS,
      BOT_COUNTER_RETENTION_DAYS,
    ]) {
      expect(days).toBeLessThanOrEqual(30);
    }
  });
});

describe("pruneLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes each table with its own cutoff", async () => {
    const now = Date.now();
    await pruneLogs();

    expect(cutoffOf(mocks.pageViewDeleteMany.mock.calls[0])).toBeGreaterThanOrEqual(
      now - PAGEVIEW_RETENTION_DAYS * DAY
    );
    expect(cutoffOf(mocks.pageViewDeleteMany.mock.calls[0])).toBeLessThanOrEqual(
      now - PAGEVIEW_RETENTION_DAYS * DAY + 5000
    );
    expect(cutoffOf(mocks.userSessionDeleteMany.mock.calls[0])).toBeLessThanOrEqual(
      now - SESSION_RETENTION_DAYS * DAY + 5000
    );
    expect(cutoffOf(mocks.userActivityDeleteMany.mock.calls[0])).toBeLessThanOrEqual(
      now - ACTIVITY_RETENTION_DAYS * DAY + 5000
    );
    expect(cutoffOf(mocks.adImpressionDeleteMany.mock.calls[0])).toBeLessThanOrEqual(
      now - AD_RETENTION_DAYS * DAY + 5000
    );
    expect(cutoffOf(mocks.searchLogDeleteMany.mock.calls[0])).toBeLessThanOrEqual(
      now - SEARCH_LOG_RETENTION_DAYS * DAY + 5000
    );
  });

  it("trims sessions and page views harder than the rest", () => {
    expect(SESSION_RETENTION_DAYS).toBeLessThan(ACTIVITY_RETENTION_DAYS);
    expect(PAGEVIEW_RETENTION_DAYS).toBeLessThan(ACTIVITY_RETENTION_DAYS);
  });

  it("reports the number of deleted rows per table", async () => {
    const result = await pruneLogs();
    expect(Object.keys(result).sort()).toEqual(
      ["adImpression", "pageView", "searchLog", "userActivity", "userSession"].sort()
    );
  });
});

describe("pruneBotCounters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("only touches bot:* keys and leaves the all-time pageviews counter alone", async () => {
    await pruneBotCounters();

    const arg = mocks.siteCounterDeleteMany.mock.calls[0][0] as {
      where: { key: { startsWith: string }; updatedAt: { lt: Date } };
    };
    expect(arg.where.key.startsWith).toBe("bot:");
    expect(arg.where.updatedAt.lt).toBeInstanceOf(Date);
  });

  it("uses the bot counter TTL", async () => {
    const now = Date.now();
    await pruneBotCounters();
    const arg = mocks.siteCounterDeleteMany.mock.calls[0][0] as {
      where: { updatedAt: { lt: Date } };
    };    expect(arg.where.updatedAt.lt.getTime()).toBeLessThanOrEqual(
      now - BOT_COUNTER_RETENTION_DAYS * DAY + 5000
    );
  });
});

describe("pruneAniListCacheToCap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing while the cache is below the cap", async () => {
    mocks.aniListCount.mockResolvedValueOnce(120 as never);
    const res = await pruneAniListCacheToCap();
    expect(res.deleted).toBe(0);
    expect(mocks.aniListDeleteMany).not.toHaveBeenCalled();
  });

  it("evicts the oldest rows when the cache is over the cap", async () => {
    mocks.aniListCount.mockResolvedValueOnce(10_050 as never);
    mocks.aniListFindMany.mockResolvedValueOnce([
      { key: "a" },
      { key: "b" },
    ] as never);
    const res = await pruneAniListCacheToCap();
    expect(res.total).toBe(10_050);
    expect(mocks.aniListDeleteMany).toHaveBeenCalled();
  });
});
