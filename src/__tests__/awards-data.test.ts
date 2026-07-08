import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAwardsByYear, AWARD_YEARS, CRUNCHYROLL_AWARDS } from "@/lib/awards-data";

describe("CRUNCHYROLL_AWARDS", () => {
  it("has correct structure", () => {
    expect(Array.isArray(CRUNCHYROLL_AWARDS)).toBe(true);
    expect(CRUNCHYROLL_AWARDS.length).toBeGreaterThan(0);
    for (const award of CRUNCHYROLL_AWARDS) {
      expect(award).toHaveProperty("year");
      expect(award).toHaveProperty("category");
      expect(award).toHaveProperty("winner");
      expect(award).toHaveProperty("malId");
      expect(typeof award.year).toBe("number");
      expect(typeof award.category).toBe("string");
      expect(typeof award.winner).toBe("string");
    }
  });
});

describe("getAwardsByYear", () => {
  it("returns awards for a specific year", () => {
    const awards = getAwardsByYear(2024);
    expect(Array.isArray(awards)).toBe(true);
    for (const a of awards) {
      expect(a.year).toBe(2024);
    }
  });

  it("returns empty array for year with no data", () => {
    const awards = getAwardsByYear(1990);
    expect(awards).toEqual([]);
  });
});

describe("AWARD_YEARS", () => {
  it("returns sorted years array (descending)", () => {
    expect(Array.isArray(AWARD_YEARS)).toBe(true);
    expect(AWARD_YEARS.length).toBeGreaterThan(0);
    for (let i = 1; i < AWARD_YEARS.length; i++) {
      expect(AWARD_YEARS[i]).toBeLessThan(AWARD_YEARS[i - 1]);
    }
  });
});
