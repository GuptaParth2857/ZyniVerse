import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * `trackPageViewBatch` is the only path the browser tracker uses (it always
 * posts a `batch` array), and until 2026-10-23 it updated `lastActiveAt` but
 * never `pagesViewed`. Every session row therefore showed 0 pages, which made
 * the admin visitor panel unable to separate a real visitor from a
 * JS-running bot that never delivered a page view (~1,000 such rows/day).
 *
 * These tests lock the per-session increment in place.
 */

const mocks = vi.hoisted(() => ({
  createMany: vi.fn(async () => ({ count: 1 })),
  create: vi.fn(async () => ({})),
  updateMany: vi.fn(async () => ({ count: 1 })),
  upsert: vi.fn(async () => ({})),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pageView: { createMany: mocks.createMany, create: mocks.create, count: vi.fn(async () => 0) },
    userSession: { updateMany: mocks.updateMany },
    siteCounter: { upsert: mocks.upsert, findUnique: vi.fn(async () => null) },
  },
}));

import { trackPageViewBatch } from "@/lib/analytics";

describe("trackPageViewBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments pagesViewed by the number of views per session", async () => {
    await trackPageViewBatch([
      { path: "/a", sessionId: "s1" },
      { path: "/b", sessionId: "s1" },
      { path: "/c", sessionId: "s2" },
      { path: "/d", sessionId: null },
    ]);

    expect(mocks.updateMany).toHaveBeenCalledTimes(2);

    const calls = mocks.updateMany.mock.calls as unknown as Array<
      [{ where: { sessionId: string }; data: { pagesViewed: { increment: number } } }]
    >;
    const bySession = new Map(calls.map(([arg]) => [arg.where.sessionId, arg.data.pagesViewed.increment]));

    expect(bySession.get("s1")).toBe(2);
    expect(bySession.get("s2")).toBe(1);
  });

  it("still bumps the all-time page-view counter by the batch size", async () => {
    await trackPageViewBatch([
      { path: "/a", sessionId: "s1" },
      { path: "/b", sessionId: "s1" },
    ]);

    const arg = (mocks.upsert.mock.calls[0] as unknown as [{
      where: { key: string };
      update: { value: { increment: bigint } };
      create: { value: bigint };
    }])[0];

    expect(arg.where.key).toBe("pageviews");
    expect(arg.update.value.increment).toBe(BigInt(2));
  });

  it("does nothing for an empty batch", async () => {
    await trackPageViewBatch([]);
    expect(mocks.createMany).not.toHaveBeenCalled();
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });
});
