import { describe, it, expect } from "vitest";
import { TIERS, getTierColor, getTierData } from "@/lib/tierlist";

describe("TIERS", () => {
  it("has exactly 6 tiers (S/A/B/C/D/F)", () => {
    expect(TIERS).toHaveLength(6);
    expect(TIERS.map((t) => t.tier)).toEqual(["S", "A", "B", "C", "D", "F"]);
  });

  it("each tier has required fields", () => {
    for (const t of TIERS) {
      expect(t).toHaveProperty("label");
      expect(t).toHaveProperty("color");
      expect(t).toHaveProperty("description");
      expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("getTierColor", () => {
  it("returns color for valid tier", () => {
    expect(getTierColor("S")).toBe("#FF7F7F");
    expect(getTierColor("F")).toBe("#BF7FFF");
  });

  it("returns fallback for invalid tier", () => {
    expect(getTierColor("Z")).toBe("#888");
  });
});

describe("getTierData", () => {
  it("returns tier data for valid tier", () => {
    const data = getTierData("S");
    expect(data).toBeDefined();
    expect(data!.description).toContain("Peak Fiction");
  });

  it("returns undefined for invalid tier", () => {
    expect(getTierData("Z")).toBeUndefined();
  });
});
