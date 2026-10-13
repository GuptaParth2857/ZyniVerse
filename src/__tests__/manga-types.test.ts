import { describe, it, expect, vi } from "vitest";

vi.stubGlobal("fetch", vi.fn());

import {
  inferMangaType,
  getMediaTypeLabel,
  MANGA_TYPE_OPTIONS,
} from "@/lib/manga";

describe("manga media-type helpers", () => {
  it("maps NOVEL format to light_novel", () => {
    expect(inferMangaType({ format: "NOVEL", countryOfOrigin: "JP" })).toBe(
      "light_novel",
    );
  });

  it("maps KR origin to manhwa", () => {
    expect(inferMangaType({ format: "MANGA", countryOfOrigin: "KR" })).toBe(
      "manhwa",
    );
  });

  it("maps CN origin to manhua", () => {
    expect(inferMangaType({ format: "MANGA", countryOfOrigin: "CN" })).toBe(
      "manhua",
    );
  });

  it("defaults JP / unknown origins to manga", () => {
    expect(inferMangaType({ format: "MANGA", countryOfOrigin: "JP" })).toBe(
      "manga",
    );
    expect(inferMangaType({})).toBe("manga");
  });

  it("exposes the filter options used by the browse + list chips", () => {
    const keys = MANGA_TYPE_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(["ALL", "manga", "manhwa", "manhua", "light_novel"]);
    expect(getMediaTypeLabel("light_novel")).toBe("Light Novel");
  });
});
