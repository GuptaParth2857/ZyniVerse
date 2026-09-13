import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDoujinshi, getDoujinshiById, getDoujinshiTags } from "@/lib/mangadex-api";

const SAMPLE_MANGA = {
  id: "abc-123",
  attributes: {
    title: { en: "Test Doujinshi" },
    description: { en: "A test entry." },
    originalLanguage: "ja",
    contentRating: "safe",
    tags: [{ id: "t1", attributes: { name: { en: "Comedy" }, group: "genre" } }],
    availableTranslatedLanguages: ["en", "ja"],
  },
  relationships: [
    { type: "cover_art", attributes: { fileName: "cover.png" } },
    { type: "author", attributes: { name: "Test Author" } },
  ],
};

describe("mangadex-api", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it("builds a MangaDex query with the doujinshi tag, genre filter, sort and search", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [SAMPLE_MANGA], total: 1 }),
    } as Response);

    await getDoujinshi({ search: "Naruto", limit: 20, sort: "latest", genres: ["Romance"] });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("api.mangadex.org/manga?");
    expect(decoded).toContain("includedTags[]=b13b2a48-c720-44a9-9c77-39c9979373fb");
    expect(decoded).toContain("includedTags[]=423e2eae-a7a2-4a8b-ac03-a8351462d71d");
    expect(decoded).toContain("order[latestUploadedChapter]=desc");
    expect(decoded).toContain("title=Naruto");
    expect(decoded).toContain("limit=20");
    expect(decoded).toContain("contentRating[]=safe");
  });

  it("parses list results into doujinshi entries", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [SAMPLE_MANGA], total: 1 }),
    } as Response);

    const { entries, total } = await getDoujinshi();

    expect(total).toBe(1);
    expect(entries[0]).toMatchObject({
      id: "abc-123",
      title: "Test Doujinshi",
      description: "A test entry.",
      artist: "Test Author",
      image: "https://uploads.mangadex.org/covers/abc-123/cover.png.256.jpg",
      externalUrl: "https://mangadex.org/title/abc-123",
      language: "ja",
      isTranslated: true,
    });
    expect(entries[0].tags).toEqual(["Comedy"]);
  });

  it("retries once on a 429 rate-limit response", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "0" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [SAMPLE_MANGA], total: 1 }),
      } as Response);

    const { total } = await getDoujinshi();
    expect(total).toBe(1);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it("throws when MangaDex returns a non-429 error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(getDoujinshi()).rejects.toThrow("MangaDex API error: 500");
  });

  it("gets a single entry by id and returns null when missing", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: SAMPLE_MANGA }),
    } as Response);
    const entry = await getDoujinshiById("abc-123");
    expect(entry?.title).toBe("Test Doujinshi");

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    } as Response);
    expect(await getDoujinshiById("missing")).toBeNull();
  });

  it("lists and sorts the available MangaDex tags", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [
            { attributes: { name: { en: "Comedy" } } },
            { attributes: { name: { en: "Action" } } },
            { attributes: {} },
          ],
        }),
    } as Response);

    const tags = await getDoujinshiTags();
    expect(tags).toEqual(["Action", "Comedy"]);
  });
});