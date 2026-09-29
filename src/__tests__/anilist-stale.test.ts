import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * AniList failures must degrade to stale data, never to an empty array.
 *
 * AniList rate-limits at 30 req/min per IP and a `next build` prerenders ~860
 * pages from a single IP, so the build is guaranteed to hit that ceiling. The
 * homepage used to map the resulting rejection to `[]`, which baked an empty
 * hero into the static HTML and shipped it from the CDN for hours with no error
 * logged anywhere.
 *
 * Expired cache entries are therefore retained for STALE_TTL and served when
 * the live fetch fails.
 */

const realFetch = globalThis.fetch;
const fetchMock = vi.fn();

const okResponse = (data: unknown) =>
  ({ ok: true, status: 200, json: () => Promise.resolve({ data }) }) as Response;

const errResponse = (status: number) =>
  ({ ok: false, status, headers: new Headers(), text: () => Promise.resolve("") }) as Response;

describe("AniList serves stale data when the live fetch fails", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("keeps serving the last good payload after the cache goes stale", async () => {
    const { getTrending, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    const cached = { Page: { media: [{ id: 1 }, { id: 2 }] } };
    const cachedMedia = [{ id: 1 }, { id: 2 }];

    // First call succeeds and populates the cache.
    fetchMock.mockResolvedValueOnce(okResponse(cached));
    await expect(getTrending(5)).resolves.toEqual(cachedMedia);

    // Well past the 5-minute fresh window (CACHE_TTL), AniList rate-limits.
    const realNow = Date.now;
    Date.now = () => realNow() + 60 * 60 * 1000;
    try {
      fetchMock.mockResolvedValue(errResponse(429));

      // Before the fix this rejected, and the caller turned it into [].
      await expect(getTrending(5)).resolves.toEqual(cachedMedia);
    } finally {
      Date.now = realNow;
    }
  });

  it("still throws when there is no stale copy to fall back on", async () => {
    const { getTrending, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    fetchMock.mockResolvedValue(errResponse(429));
    await expect(getTrending(13)).rejects.toThrow(/Rate limited|unavailable/);
  });

  it("serves the consolidated homepage query from stale data as one payload", async () => {
    const { getHomepageData, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    const cached = {
      trending: { media: [{ id: 1 }] },
      popular: { media: [{ id: 2 }] },
      upcoming: { media: [] },
      topRated: { media: [{ id: 3 }] },
    };

    // All four rails now come from one round trip, so a rate limit can no
    // longer partially blank the homepage.
    fetchMock.mockResolvedValueOnce(okResponse(cached));
    await expect(getHomepageData({ trending: 4 })).resolves.toEqual({
      trending: [{ id: 1 }],
      popular: [{ id: 2 }],
      upcoming: [],
      topRated: [{ id: 3 }],
    });

    const realNow = Date.now;
    Date.now = () => realNow() + 60 * 60 * 1000;
    try {
      fetchMock.mockResolvedValue(errResponse(429));
      const stale = await getHomepageData({ trending: 4 });
      expect(stale.trending).toEqual([{ id: 1 }]);
      expect(stale.topRated).toEqual([{ id: 3 }]);
    } finally {
      Date.now = realNow;
    }
  });

  it("fills missing sections with empty arrays instead of crashing", async () => {
    const { getHomepageData, clearAnilistCache } = await import("@/lib/anilist");
    clearAnilistCache();

    // Partial response — guards against a shape change upstream blanking the
    // page with a TypeError instead of degrading.
    fetchMock.mockResolvedValueOnce(okResponse({ trending: { media: [{ id: 7 }] } }));

    const data = await getHomepageData();
    expect(data.trending).toEqual([{ id: 7 }]);
    expect(data.popular).toEqual([]);
    expect(data.upcoming).toEqual([]);
    expect(data.topRated).toEqual([]);
  });
});
