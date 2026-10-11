import { describe, it, expect } from "vitest";
import { dubsFromFeeds } from "@/lib/dub-data";
import type { DubFeedsResult } from "@/lib/dub-feeds";

function makeFeed(): DubFeedsResult {
  return {
    fetchedAt: "2026-10-11T16:00:00.000Z",
    sources: [
      {
        id: "muse-india",
        name: "Muse India",
        channelName: "Muse India",
        channelUrl: "https://www.youtube.com/channel/UCYYhAzgWuxPauRXdPpLAX3Q",
        fetchedAt: "2026-10-11T16:00:00.000Z",
        ok: true,
        entries: [
          {
            videoId: "a1",
            title: "JoJo's Bizarre Adventure (S4): Golden Wind - Episode 01 [Hindi Dub] | Muse IN",
            published: "2026-10-11T15:30:18+00:00",
            language: "Hindi",
            thumbnail: "https://i.ytimg.com/vi/a1/hqdefault.jpg",
            url: "https://www.youtube.com/watch?v=a1",
          },
          {
            videoId: "a2",
            title: "[Telugu Dub] SPY x FAMILY - Episode 40 (S3E03) | Muse IN",
            published: "2026-10-10T16:30:10+00:00",
            language: "Telugu",
            thumbnail: null,
            url: "https://www.youtube.com/watch?v=a2",
          },
        ],
      },
      {
        id: "ani-one-india",
        name: "Ani-One India",
        channelName: "Ani-One India",
        channelUrl: "https://www.youtube.com/channel/UC67pLBZ_z4Gd46t6mW7uHjA",
        fetchedAt: "2026-10-11T16:00:00.000Z",
        ok: true,
        entries: [
          {
            videoId: "b1",
            title: "⟪TAMIL DUB⟫ ⟪DEMON SLAYER⟫ Episode 4【Ani-One India】",
            published: "2026-10-09T09:00:00+00:00",
            language: "Tamil",
            thumbnail: null,
            url: "https://www.youtube.com/watch?v=b1",
          },
        ],
      },
      {
        id: "unreachable",
        name: "Unreachable Source",
        channelName: "Unreachable Source",
        channelUrl: "https://example.com",
        fetchedAt: "2026-10-11T16:00:00.000Z",
        ok: false,
        entries: [
          {
            videoId: "c1",
            title: "Should never appear",
            published: "2026-10-11T10:00:00+00:00",
            language: "Hindi",
            thumbnail: null,
            url: "https://www.youtube.com/watch?v=c1",
          },
        ],
      },
    ],
  };
}

describe("dubsFromFeeds", () => {
  it("maps real feed entries into DubEntry records", () => {
    const dubs = dubsFromFeeds(makeFeed());

    expect(dubs.length).toBe(3);
    for (const d of dubs) {
      expect(d).toHaveProperty("title");
      expect(d).toHaveProperty("type");
      expect(d.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.status).toBe("Airing");
      expect(d.url).toMatch(/^https:\/\/www\.youtube\.com\/watch/);
    }
    expect(dubs.map((d) => d.type)).toEqual(["Hindi Dub", "Telugu Dub", "Tamil Dub"]);
  });

  it("skips failed sources", () => {
    const dubs = dubsFromFeeds(makeFeed());
    expect(dubs.every((d) => !d.title.includes("Should never appear"))).toBe(true);
  });

  it("sorts by release date, newest first", () => {
    const dubs = dubsFromFeeds(makeFeed());
    for (let i = 1; i < dubs.length; i++) {
      expect(dubs[i - 1].releaseDate.localeCompare(dubs[i].releaseDate)).toBeGreaterThanOrEqual(0);
    }
    expect(dubs[0].releaseDate).toBe("2026-10-11");
  });

  it("skips entries without a valid date", () => {
    const feed = makeFeed();
    feed.sources[0].entries[0] = { ...feed.sources[0].entries[0], published: "not-a-date" };
    const dubs = dubsFromFeeds(feed);
    expect(dubs.every((d) => d.releaseDate !== "not-a-date")).toBe(true);
  });
});