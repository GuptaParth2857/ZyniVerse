import { describe, it, expect } from "vitest";
import { buildWatchOrder } from "@/lib/watch-order";
import type { MediaAnimeFull } from "@/lib/anilist";

function anime(overrides: Partial<MediaAnimeFull> = {}): MediaAnimeFull {
  return {
    id: 100,
    title: { romaji: "Main Anime", english: "Main Anime" },
    coverImage: { large: "main.jpg" },
    format: "TV",
    episodes: 12,
    status: "FINISHED",
    averageScore: 80,
    startDate: { year: 2021, month: 1, day: 10 },
    ...overrides,
  } as MediaAnimeFull;
}

function edge(
  id: number,
  title: string,
  relationType: string,
  opts: {
    format?: string;
    startDate?: { year: number; month?: number; day?: number };
    type?: string;
  } = {},
) {
  return {
    id: 500 + id,
    relationType,
    node: {
      id,
      title: { romaji: title },
      coverImage: { large: `${title}.jpg` },
      format: opts.format ?? "TV",
      episodes: 12,
      type: opts.type ?? "ANIME",
      status: "FINISHED",
      averageScore: 75,
      startDate: opts.startDate ?? { year: 2000 + id, month: 1, day: 1 },
    },
  } as unknown as NonNullable<MediaAnimeFull["relations"]>["edges"][number];
}

describe("buildWatchOrder", () => {
  it("orders release order by start date: prequels → main → sequels", () => {
    const main = anime();
    const guide = buildWatchOrder(main, [
      edge(10, "Season 0", "PREQUEL", { startDate: { year: 2010 } }),
      edge(20, "Season 2", "SEQUEL", { startDate: { year: 2022 } }),
      edge(11, "Interlude", "PREQUEL", { startDate: { year: 2015 } }),
    ]);

    expect(guide.releaseOrder.map((e) => e.id)).toEqual([10, 11, 100, 20]);
  });

  it("dedupes duplicate relation ids", () => {
    const guide = buildWatchOrder(anime(), [
      edge(10, "Season 0", "PREQUEL", { startDate: { year: 2010 } }),
      edge(10, "Season 0 dup", "PREQUEL", { startDate: { year: 2010 } }),
    ]);

    expect(guide.totalEntries).toBe(2);
    expect(guide.releaseOrder.filter((e) => e.id === 10)).toHaveLength(1);
  });

  it("skips non-ANIME relation nodes (e.g. manga adaptation)", () => {
    const guide = buildWatchOrder(anime(), [
      edge(30, "Manga", "ADAPTATION", { type: "MANGA" }),
      edge(20, "Season 2", "SEQUEL", { startDate: { year: 2022 } }),
    ]);

    expect(guide.releaseOrder.map((e) => e.id)).toEqual([100, 20]);
    expect(guide.sections.map((s) => s.group)).toEqual(["main", "sequel"]);
  });

  it("groups entries into sections", () => {
    const guide = buildWatchOrder(anime(), [
      edge(10, "Prequel", "PREQUEL", { startDate: { year: 2010 } }),
      edge(15, "Season 2", "SEQUEL", { startDate: { year: 2022 } }),
      edge(20, "Movie", "SIDE_STORY", { format: "MOVIE", startDate: { year: 2021, month: 6 } }),
      edge(30, "Spin", "SPIN_OFF", { startDate: { year: 2023 } }),
      edge(40, "Alt", "ALTERNATIVE", { startDate: { year: 2018 } }),
    ]);

    const groups = guide.sections.map((s) => s.group);
    expect(groups).toEqual(["prequel", "main", "sequel", "side", "spinoff", "alternative"]);
    expect(guide.sections[0].entries.map((e) => e.id)).toEqual([10]);
    expect(guide.sections[3].entries.map((e) => e.id)).toEqual([20]);
  });

  it("adds a smart placement note for movies released between seasons", () => {
    const guide = buildWatchOrder(anime(), [
      edge(10, "Season 0", "PREQUEL", { startDate: { year: 2019 } }),
      edge(20, "Season 2", "SEQUEL", { startDate: { year: 2022 } }),
      edge(21, "The Movie", "SIDE_STORY", { format: "MOVIE", startDate: { year: 2021, month: 6 } }),
    ]);

    const movie = guide.releaseOrder.find((e) => e.id === 21);
    expect(movie?.note).toContain("Watch after Main Anime");
    expect(movie?.note).toContain("before Season 2");
    expect(guide.movieCount).toBe(1);
  });

  it("marks entries without a date last but keeps main grouped", () => {
    const guide = buildWatchOrder(anime(), [
      edge(20, "Season 2", "SEQUEL", { startDate: { year: 2022 } }),
      edge(50, "Mystery Sequel", "SEQUEL", { startDate: undefined as never }),
    ]);

    const ids = guide.releaseOrder.map((e) => e.id);
    expect(ids).toEqual([100, 20, 50]);
  });

  it("counts movies and specials", () => {
    const guide = buildWatchOrder(anime(), [
      edge(20, "Movie", "SIDE_STORY", { format: "MOVIE", startDate: { year: 2021, month: 6 } }),
      edge(21, "OVA", "SIDE_STORY", { format: "OVA", startDate: { year: 2021, month: 9 } }),
      edge(22, "Special", "SUMMARY", { format: "SPECIAL", startDate: { year: 2021, month: 12 } }),
    ]);

    expect(guide.movieCount).toBe(3);
  });
});
