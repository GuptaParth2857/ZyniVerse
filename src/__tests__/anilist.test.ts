import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubGlobal("fetch", vi.fn());

function createMockFetch(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data }),
  });
}

beforeEach(() => {
  vi.mocked(fetch).mockReset();
});

describe("AniList API", () => {
  it("handles rate limiting error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Rate limited by AniList — try again later."));

    const { clearAnilistCache, getTrending } = await import("@/lib/anilist");
    clearAnilistCache();

    await expect(getTrending(5)).rejects.toThrow("Rate limited");
  });

  it("parses trending anime response", async () => {
    const mockData = {
      Page: {
        media: [
          {
            id: 1,
            title: { romaji: "Test Anime", english: null, native: null, userPreferred: "Test Anime" },
            coverImage: { extraLarge: null, large: "https://example.com/cover.jpg", medium: null, color: null },
            bannerImage: null,
            description: null,
            type: "ANIME",
            format: "TV",
            status: "FINISHED",
            episodes: 12,
            duration: 24,
            chapters: null,
            volumes: null,
            countryOfOrigin: "JP",
            isLicensed: true,
            source: "ORIGINAL",
            genres: ["Action"],
            averageScore: 80,
            meanScore: null,
            popularity: 1000,
            trending: 500,
            favourites: 100,
            tags: [],
            startDate: { year: 2024, month: 1, day: 1 },
            endDate: null,
            season: "WINTER",
            seasonYear: 2024,
            seasonInt: 20241,
            studios: { nodes: [] },
            trailer: null,
            siteUrl: "https://anilist.co/anime/1",
            nextAiringEpisode: null,
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockData }),
    } as any);

    const { clearAnilistCache, getTrending } = await import("@/lib/anilist");
    clearAnilistCache();
    const result = await getTrending(5);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].title.romaji).toBe("Test Anime");
  });

  it("caches responses to avoid duplicate API calls", async () => {
    const mockData = {
      Page: {
        media: [
          {
            id: 2,
            title: { romaji: "Cached Anime", english: null, native: null, userPreferred: "Cached Anime" },
            coverImage: { extraLarge: null, large: null, medium: null, color: null },
            bannerImage: null,
            description: null,
            type: "ANIME",
            format: "TV",
            status: "FINISHED",
            episodes: null,
            duration: null,
            chapters: null,
            volumes: null,
            countryOfOrigin: null,
            isLicensed: null,
            source: null,
            genres: [],
            averageScore: null,
            meanScore: null,
            popularity: null,
            trending: null,
            favourites: null,
            tags: [],
            studios: { nodes: [] },
            trailer: null,
            siteUrl: null,
            nextAiringEpisode: null,
          },
        ],
      },
    };

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockData }),
    } as any);

    const { clearAnilistCache, getTrending, getAnilistCacheStats } = await import("@/lib/anilist");
    clearAnilistCache();

    await getTrending(5);
    await getTrending(5);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const stats = getAnilistCacheStats();
    expect(stats.size).toBeGreaterThan(0);
  });
});
