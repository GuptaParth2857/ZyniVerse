import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Degraded mode is per query key.
 *
 * It used to be a single module-level timestamp for the whole lambda, so one
 * 429 froze live fetching for every query on that instance for 2 minutes —
 * which, given 21 of 27 pages are client-rendered, blanked the whole site.
 */

const realFetch = globalThis.fetch;
const fetchMock = vi.fn();

const okResponse = (data: unknown) =>
  ({ ok: true, status: 200, json: () => Promise.resolve({ data }) }) as Response;

const errResponse = (status: number) =>
  ({ ok: false, status, headers: new Headers(), text: () => Promise.resolve("") }) as Response;

describe("AniList degraded mode is scoped per query key", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("does not let one rate-limited query break a different query", async () => {
    const { getTrending, getPopular, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    // Only the TRENDING_DESC sort fails. getPopular differs solely by its sort
    // argument, which is what makes it a separate cache key.
    fetchMock.mockImplementation((_url: string, init: { body?: string }) => {
      const body = init?.body ?? "";
      return body.includes("TRENDING_DESC")
        ? Promise.resolve(errResponse(429))
        : Promise.resolve(okResponse({ Page: { media: [] } }));
    });

    await expect(getTrending(5)).rejects.toThrow();

    // Before the fix this also rejected, because degraded mode was global.
    await expect(getPopular(30)).resolves.toEqual([]);
  });

  it("clears degraded cooldowns when the cache is cleared", async () => {
    const { getTrending, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    fetchMock.mockResolvedValueOnce(errResponse(429));
    await expect(getTrending(7)).rejects.toThrow();

    // A new key must not inherit the previous key's cooldown.
    clearAnilistCache();
    fetchMock.mockResolvedValue(okResponse({ Page: { media: [{ id: 9 }] } }));
    await expect(getTrending(8)).resolves.toHaveLength(1);
  });

  it("surfaces the upstream reason in the unavailable error", async () => {
    const { getTrending, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    fetchMock.mockResolvedValue(errResponse(429));
    await expect(getTrending(11)).rejects.toThrow(/Rate limited|unavailable/);
  });
});
