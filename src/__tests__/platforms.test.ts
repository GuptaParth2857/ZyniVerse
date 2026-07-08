import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPlatformByName,
  getAnimeStreamingPlatforms,
  PLATFORMS,
} from "@/lib/platforms";

describe("PLATFORMS", () => {
  it("has expected platform keys", () => {
    expect(PLATFORMS).toHaveProperty("crunchyroll");
    expect(PLATFORMS).toHaveProperty("netflix");
    expect(PLATFORMS).toHaveProperty("prime");
    expect(PLATFORMS).toHaveProperty("disney");
  });

  it("each platform has valid fields", () => {
    for (const [key, p] of Object.entries(PLATFORMS)) {
      expect(p.id).toBe(key);
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("color");
      expect(p).toHaveProperty("gradient");
      expect(p).toHaveProperty("url");
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("getPlatformByName", () => {
  it("matches Crunchyroll", () => {
    expect(getPlatformByName("Crunchyroll")?.id).toBe("crunchyroll");
  });

  it("matches Netflix", () => {
    expect(getPlatformByName("Netflix")?.id).toBe("netflix");
  });

  it("matches Amazon Prime via 'prime' or 'amazon'", () => {
    expect(getPlatformByName("Amazon Prime Video")?.id).toBe("prime");
    expect(getPlatformByName("Prime Video")?.id).toBe("prime");
  });

  it("matches Disney+ Hotstar", () => {
    expect(getPlatformByName("Disney+ Hotstar")?.id).toBe("disney");
  });

  it("is case insensitive", () => {
    expect(getPlatformByName("CRUNCHYROLL")?.id).toBe("crunchyroll");
    expect(getPlatformByName("netflix")?.id).toBe("netflix");
  });

  it("returns undefined for unknown platform", () => {
    expect(getPlatformByName("Unknown Platform")).toBeUndefined();
  });
});

describe("getAnimeStreamingPlatforms", () => {
  it("maps streaming entries to platforms", () => {
    const result = getAnimeStreamingPlatforms([
      { site: "Crunchyroll", url: "https://crunchyroll.com/test" },
      { site: "Netflix", url: "https://netflix.com/test" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].platform.id).toBe("crunchyroll");
    expect(result[1].platform.id).toBe("netflix");
  });

  it("deduplicates platforms", () => {
    const result = getAnimeStreamingPlatforms([
      { site: "Crunchyroll", url: "https://crunchyroll.com/a" },
      { site: "Crunchyroll", url: "https://crunchyroll.com/b" },
    ]);
    expect(result).toHaveLength(1);
  });

  it("returns empty array for undefined input", () => {
    expect(getAnimeStreamingPlatforms(undefined)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(getAnimeStreamingPlatforms([])).toEqual([]);
  });
});
