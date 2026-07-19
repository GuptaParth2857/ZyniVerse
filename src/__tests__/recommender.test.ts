import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/anilist", () => ({
  getTrending: vi.fn(),
  getAnimeDetailFull: vi.fn(),
  searchMedia: vi.fn(),
  getMediaBatch: vi.fn(),
  bestTitle: (title: { romaji?: string; english?: string } | undefined) => title?.romaji || title?.english || "Unknown",
}));

import { getTrending, getAnimeDetailFull, searchMedia } from "@/lib/anilist";
import {
  getTrendingRecs,
  getGenreBasedRecs,
  getPersonalizedRecs,
  getSimilarAnime,
} from "@/lib/recommender";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockResolvedValue(fn: any, value: unknown) {
  fn.mockResolvedValue(value);
}

const sampleMedia = {
  id: 1,
  title: { romaji: "Test Anime", english: "Test Anime" },
  coverImage: { extraLarge: "https://example.com/image.jpg", large: "", medium: "" },
  format: "TV",
  episodes: 24,
  genres: ["Action", "Fantasy"],
  tags: [{ name: "Shounen" }],
  popularity: 50000,
  trending: 100,
  nextAiringEpisode: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTrendingRecs", () => {
  it("returns recommendations from trending anime", async () => {
    mockResolvedValue(getTrending, [sampleMedia]);
    const recs = await getTrendingRecs();
    expect(recs).toHaveLength(1);
    expect(recs[0]).toHaveProperty("title", "Test Anime");
    expect(recs[0]).toHaveProperty("score");
    expect(recs[0]).toHaveProperty("reason", "Trending now");
  });

  it("returns empty array when getTrending fails", async () => {
    vi.mocked(getTrending).mockRejectedValue(new Error("fail"));
    const recs = await getTrendingRecs();
    expect(recs).toEqual([]);
  });
});

describe("getGenreBasedRecs", () => {
  it("returns empty array for empty genres", async () => {
    const recs = await getGenreBasedRecs([]);
    expect(recs).toEqual([]);
  });

  it("handles searchMedia returning data", async () => {
    mockResolvedValue(searchMedia, { media: [sampleMedia] });
    const recs = await getGenreBasedRecs(["Action"]);
    expect(Array.isArray(recs)).toBe(true);
  });
});

describe("getPersonalizedRecs", () => {
  it("falls back to trending when no list entries", async () => {
    mockResolvedValue(prisma.listEntry.findMany, []);
    mockResolvedValue(getTrending, [sampleMedia]);
    const recs = await getPersonalizedRecs("u1");
    expect(Array.isArray(recs)).toBe(true);
  });
});

describe("getSimilarAnime", () => {
  it("returns empty array when getAnimeDetailFull fails", async () => {
    mockResolvedValue(getAnimeDetailFull, Promise.reject(new Error("fail")));
    const recs = await getSimilarAnime(1);
    expect(recs).toEqual([]);
  });
});
