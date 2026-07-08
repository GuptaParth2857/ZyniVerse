import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDynamicDoujinshi, getDynamicDoujinshiById, getDoujinshi, getDoujinshiById, getParodies, getCircles } from "@/lib/doujinshi-data";

function mockFetchFail() {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("API error"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDynamicDoujinshi", () => {
  it("starts from static data when API fails (no search)", async () => {
    mockFetchFail();
    const entries = await getDynamicDoujinshi();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty("id");
    expect(entries[0]).toHaveProperty("title");
    expect(entries[0]).toHaveProperty("description");
    expect(entries[0]).toHaveProperty("externalUrl");
    expect(entries[0]).toHaveProperty("parody");
  });

  it("falls back to static-only when no search term + API fails", async () => {
    mockFetchFail();
    const entries = await getDynamicDoujinshi();
    expect(entries.length).toBeGreaterThanOrEqual(30);
  });
});

describe("getDynamicDoujinshiById", () => {
  it("finds from static data for non-MangaDex IDs", async () => {
    const entry = await getDynamicDoujinshiById("touhou-01");
    expect(entry).toBeDefined();
    expect(entry).toHaveProperty("title");
  });

  it("returns undefined for non-existent id", async () => {
    const entry = await getDynamicDoujinshiById("nonexistent-id");
    expect(entry).toBeUndefined();
  });
});

describe("getDoujinshi (static)", () => {
  it("returns all entries when no filters", () => {
    const all = getDoujinshi();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    for (const d of all) {
      expect(d).toHaveProperty("id");
      expect(d).toHaveProperty("title");
      expect(d).toHaveProperty("circle");
      expect(d).toHaveProperty("parody");
    }
  });

  it("filters by search term", () => {
    const filtered = getDoujinshi("Touhou");
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("filters by parody", () => {
    const filtered = getDoujinshi(undefined, "Original");
    expect(filtered.length).toBeGreaterThan(0);
    for (const d of filtered) {
      expect(d.parody.toLowerCase()).toBe("original");
    }
  });
});

describe("getDoujinshiById (static)", () => {
  it("returns entry by string id", () => {
    const entry = getDoujinshiById("touhou-01");
    expect(entry).toBeDefined();
    expect(entry!.id).toBe("touhou-01");
  });

  it("returns undefined for non-existent id", () => {
    const entry = getDoujinshiById("nonexistent");
    expect(entry).toBeUndefined();
  });
});

describe("getParodies", () => {
  it("returns sorted unique parodies", () => {
    const parodies = getParodies();
    expect(Array.isArray(parodies)).toBe(true);
    expect(parodies.length).toBeGreaterThan(0);
    expect(parodies).toEqual([...parodies].sort());
  });
});

describe("getCircles", () => {
  it("returns sorted unique circles", () => {
    const circles = getCircles();
    expect(Array.isArray(circles)).toBe(true);
    expect(circles.length).toBeGreaterThan(0);
    expect(circles).toEqual([...circles].sort());
  });
});
