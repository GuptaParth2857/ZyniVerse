import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFillerData, clearFillerCache } from "@/lib/filler";

const MOCK_DATA = [
  {
    slug: "naruto",
    title: "Naruto",
    mappings: { anilist_id: 20, mal_id: 20 },
    episodes: [
      { episode: 1, title: "Enter: Naruto Uzumaki!", type: "manga-canon", aired_date: "2002-10-03" },
      { episode: 2, title: "My Name Is Konohamaru!", type: "manga-canon", aired_date: "2002-10-10" },
      { episode: 3, title: "Sasuke and Sakura: Friends or Foes?", type: "filler", aired_date: "2002-10-17" },
      { episode: 4, title: "Pass or Fail: Survival Test", type: "manga-canon", aired_date: "2002-10-24" },
    ],
  },
  {
    slug: "one-piece",
    title: "One Piece",
    mappings: { anilist_id: 21, mal_id: 21 },
    episodes: [
      { episode: 1, title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!", type: "manga-canon", aired_date: "1999-10-20" },
      { episode: 2, title: "The Great Swordsman Appears! Pirate Hunter Roronoa Zoro", type: "manga-canon", aired_date: "1999-11-17" },
    ],
  },
];

function mockFetchOk(data: unknown) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function mockFetchFail() {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: false,
    status: 404,
  } as Response);
}

beforeEach(() => {
  clearFillerCache();
});

describe("getFillerData", () => {
  it("fetches and returns filler data array", async () => {
    mockFetchOk(MOCK_DATA);
    const data = await getFillerData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);

    const first = data[0];
    expect(first).toHaveProperty("slug");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("mappings");
    expect(first.mappings).toHaveProperty("anilist_id");
    expect(first).toHaveProperty("episodes");
    expect(Array.isArray(first.episodes)).toBe(true);
  });

  it("caches data to avoid duplicate API calls", async () => {
    mockFetchOk(MOCK_DATA);
    await getFillerData();
    await getFillerData();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("episodes have correct structure", async () => {
    mockFetchOk(MOCK_DATA);
    const data = await getFillerData();
    const naruto = data.find((s) => s.slug === "naruto");
    expect(naruto).toBeDefined();
    expect(naruto!.title).toBe("Naruto");
    expect(naruto!.mappings.anilist_id).toBe(20);

    const ep = naruto!.episodes[0];
    expect(ep).toHaveProperty("episode");
    expect(ep).toHaveProperty("title");
    expect(ep).toHaveProperty("type");
    expect(["manga-canon", "filler", "mixed-manga", "anime-canon"]).toContain(ep.type);
  });

  it("finds one piece by anilist id", async () => {
    mockFetchOk(MOCK_DATA);
    const data = await getFillerData();
    const op = data.find((s) => s.mappings.anilist_id === 21);
    expect(op).toBeDefined();
    expect(op!.slug).toBe("one-piece");
  });

  it("throws when API returns non-ok", async () => {
    mockFetchFail();
    await expect(getFillerData()).rejects.toThrow("Failed to fetch filler data");
  });

  it("recovers from error if cache exists", async () => {
    mockFetchOk(MOCK_DATA);
    await getFillerData();

    clearFillerCache();
    mockFetchFail();
    await expect(getFillerData()).rejects.toThrow();
  });
});
