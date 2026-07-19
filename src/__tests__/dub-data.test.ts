import { describe, it, expect } from "vitest";
import { UPCOMING_DUBS, getDubsByStatus, getAllDubs } from "@/lib/dub-data";

describe("UPCOMING_DUBS", () => {
  it("has at least 20 entries", () => {
    expect(UPCOMING_DUBS.length).toBeGreaterThanOrEqual(20);
  });

  it("each dub has valid status", () => {
    const valid = ["Airing", "Upcoming", "Completed"];
    for (const d of UPCOMING_DUBS) {
      expect(d).toHaveProperty("title");
      expect(d).toHaveProperty("type");
      expect(d).toHaveProperty("releaseDate");
      expect(d).toHaveProperty("status");
      expect(d).toHaveProperty("episodes");
      expect(valid).toContain(d.status);
      expect(d.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("getDubsByStatus", () => {
  it("returns only entries with matching status", () => {
    const airing = getDubsByStatus("Airing");
    for (const d of airing) {
      expect(d.status).toBe("Airing");
    }
    expect(airing.length).toBeGreaterThan(0);
  });

  it("returns entries sorted by release date ascending", () => {
    const all = getDubsByStatus("Airing");
    for (let i = 1; i < all.length; i++) {
      expect(new Date(all[i].releaseDate).getTime()).toBeGreaterThanOrEqual(
        new Date(all[i - 1].releaseDate).getTime()
      );
    }
  });

  it("returns empty array for non-existent status", () => {
    const result = getDubsByStatus("Unknown" as "Airing" | "Upcoming" | "Completed");
    expect(result).toEqual([]);
  });
});

describe("getAllDubs", () => {
  it("returns all dubs sorted by release date", () => {
    const all = getAllDubs();
    expect(all.length).toBe(UPCOMING_DUBS.length);
    for (let i = 1; i < all.length; i++) {
      expect(new Date(all[i].releaseDate).getTime()).toBeGreaterThanOrEqual(
        new Date(all[i - 1].releaseDate).getTime()
      );
    }
  });
});
