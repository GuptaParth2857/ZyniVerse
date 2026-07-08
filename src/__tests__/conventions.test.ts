import { describe, it, expect } from "vitest";
import {
  getConventions,
  getConventionById,
  getCities,
  getStates,
  getConventionsMeta,
} from "@/lib/conventions";

describe("getConventions", () => {
  it("returns all conventions when no filters", () => {
    const all = getConventions();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    for (const c of all) {
      expect(c).toHaveProperty("id");
      expect(c).toHaveProperty("name");
      expect(c).toHaveProperty("city");
      expect(c).toHaveProperty("state");
      expect(c).toHaveProperty("startDate");
      expect(c).toHaveProperty("endDate");
      expect(c).toHaveProperty("status");
      expect(c).toHaveProperty("tags");
    }
  });

  it("filters by city", () => {
    const delhi = getConventions({ city: "Delhi" });
    expect(delhi.length).toBeGreaterThan(0);
    for (const c of delhi) {
      expect(c.city.toLowerCase()).toContain("delhi");
    }
  });

  it("filters by state", () => {
    const mh = getConventions({ state: "Maharashtra" });
    expect(mh.length).toBeGreaterThan(0);
    for (const c of mh) {
      expect(c.state).toBe("Maharashtra");
    }
  });

  it("filters by status", () => {
    const upcoming = getConventions({ status: "upcoming" });
    expect(upcoming.length).toBeGreaterThan(0);
    for (const c of upcoming) {
      expect(c.status).toBe("upcoming");
    }
  });

  it("filters by month", () => {
    const july = getConventions({ month: 7 });
    expect(july.length).toBeGreaterThan(0);
    for (const c of july) {
      const m = new Date(c.startDate).getMonth() + 1;
      expect(m).toBe(7);
    }
  });

  it("filters by year", () => {
    const thisYear = getConventions({ year: 2026 });
    expect(thisYear.length).toBeGreaterThan(0);
    for (const c of thisYear) {
      expect(new Date(c.startDate).getFullYear()).toBe(2026);
    }
  });

  it("returns empty array for non-matching filters", () => {
    const result = getConventions({ city: "NonExistentCity" });
    expect(result).toEqual([]);
  });
});

describe("getConventionById", () => {
  it("returns convention by id", () => {
    const c = getConventionById("comic-con-delhi-jul");
    expect(c).toBeDefined();
    expect(c!.name).toContain("Comic Con Delhi");
  });

  it("returns undefined for non-existent id", () => {
    const c = getConventionById("non-existent");
    expect(c).toBeUndefined();
  });
});

describe("getCities", () => {
  it("returns sorted unique cities", () => {
    const cities = getCities();
    expect(Array.isArray(cities)).toBe(true);
    expect(cities.length).toBeGreaterThan(0);
    expect(cities).toEqual([...cities].sort());
    expect(cities).toContain("Delhi");
    expect(cities).toContain("Mumbai");
  });
});

describe("getStates", () => {
  it("returns sorted unique states", () => {
    const states = getStates();
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBeGreaterThan(0);
    expect(states).toEqual([...states].sort());
    expect(states).toContain("Maharashtra");
    expect(states).toContain("Delhi");
  });
});

describe("getConventionsMeta", () => {
  it("returns metadata with disclaimer", () => {
    const meta = getConventionsMeta();
    expect(meta).toHaveProperty("disclaimer");
    expect(meta).toHaveProperty("lastUpdated");
    expect(meta).toHaveProperty("source");
    expect(meta.source).toBe("community-sourced");
    expect(typeof meta.disclaimer).toBe("string");
    expect(meta.disclaimer.length).toBeGreaterThan(50);
  });
});
