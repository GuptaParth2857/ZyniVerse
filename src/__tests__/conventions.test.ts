import { describe, it, expect, vi } from "vitest";
import {
  getConventions,
  getConventionById,
  getCities,
  getStates,
} from "@/lib/conventions";

const conventionMock = vi.hoisted(() => {
  const mk = (
    id: string,
    name: string,
    city: string,
    state: string,
    start: string,
    end: string,
    extra: Record<string, unknown> = {}
  ) => ({
    id,
    name,
    shortName: null,
    city,
    state,
    venue: "Test Venue",
    website: "https://example.com",
    ticketUrl: null,
    image: null,
    description: "desc",
    estimatedAttendance: null,
    status: "upcoming",
    organizers: [],
    tags: ["anime"],
    startDate: new Date(start),
    endDate: new Date(end),
    isPublic: true,
    ...extra,
  });

  const data = [
    mk("comic-con-delhi-jul", "Comic Con Delhi July 2026", "Delhi", "Delhi", "2026-07-10", "2026-07-12"),
    mk("anime-expo-delhi", "Anime Expo India Delhi", "Delhi", "Delhi", "2026-08-15", "2026-08-17"),
    mk("comic-con-mumbai", "Comic Con Mumbai", "Mumbai", "Maharashtra", "2026-08-28", "2026-08-30"),
    mk("bengaluru-anime-con", "Bengaluru Anime Con", "Bengaluru", "Karnataka", "2026-07-18", "2026-07-19"),
    mk("comic-con-pune", "Comic Con Pune", "Pune", "Maharashtra", "2026-11-20", "2026-11-22"),
  ];

  const matchWhere = (row: Record<string, any>, where: any): boolean => {
    if (!where) return true;
    for (const [key, val] of Object.entries<any>(where)) {
      if (key === "AND") {
        for (const group of val) {
          for (const [k2, cond] of Object.entries<any>(group)) {
            if (cond.gte && row[k2] < cond.gte) return false;
            if (cond.lt && row[k2] >= cond.lt) return false;
          }
        }
      } else if (val && typeof val === "object" && "contains" in val) {
        const field = String(row[key] ?? "");
        if (val.mode === "insensitive") {
          if (!field.toLowerCase().includes(String(val.contains).toLowerCase())) return false;
        } else if (!field.includes(String(val.contains))) return false;
      } else if (row[key] !== val) {
        return false;
      }
    }
    return true;
  };

  const findMany = vi.fn(async (args: any = {}) => {
    const { where, orderBy, distinct, select } = args;
    let rows = data.filter((r) => matchWhere(r, where));
    if (orderBy) {
      const [[field, dir]] = Object.entries<any>(orderBy);
      rows = [...rows].sort((a, b) => {
        const cmp = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;
        return dir === "desc" ? -cmp : cmp;
      });
    }
    if (distinct) {
      rows = rows.filter((r, i, arr) => arr.findIndex((x) => x[distinct[0]] === r[distinct[0]]) === i);
    }
    if (select) {
      return rows.map((r) => Object.fromEntries(Object.keys(select).map((k) => [k, r[k]])));
    }
    return rows;
  });
  const findUnique = vi.fn(async ({ where }: { where: { id: string } }) => data.find((r) => r.id === where.id) ?? null);
  const count = vi.fn(async () => data.length);
  return { findMany, findUnique, count };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    convention: {
      findMany: conventionMock.findMany,
      findUnique: conventionMock.findUnique,
      count: conventionMock.count,
    },
    $disconnect: vi.fn(),
  },
}));

describe("getConventions", () => {
  it("returns all conventions when no filters", async () => {
    const all = await getConventions();
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

  it("filters by city", async () => {
    const delhi = await getConventions({ city: "Delhi" });
    expect(delhi.length).toBeGreaterThan(0);
    for (const c of delhi) {
      expect(c.city.toLowerCase()).toContain("delhi");
    }
  });

  it("filters by state", async () => {
    const mh = await getConventions({ state: "Maharashtra" });
    expect(mh.length).toBeGreaterThan(0);
    for (const c of mh) {
      expect(c.state).toBe("Maharashtra");
    }
  });

  it("filters by status", async () => {
    const upcoming = await getConventions({ status: "upcoming" });
    expect(upcoming.length).toBeGreaterThan(0);
    for (const c of upcoming) {
      expect(c.status).toBe("upcoming");
    }
  });

  it("filters by month", async () => {
    const july = await getConventions({ month: 7 });
    expect(july.length).toBeGreaterThan(0);
    for (const c of july) {
      const m = new Date(c.startDate).getMonth() + 1;
      expect(m).toBe(7);
    }
  });

  it("filters by year", async () => {
    const thisYear = await getConventions({ year: 2026 });
    expect(thisYear.length).toBeGreaterThan(0);
    for (const c of thisYear) {
      expect(new Date(c.startDate).getFullYear()).toBe(2026);
    }
  });

  it("returns empty array for non-matching filters", async () => {
    const result = await getConventions({ city: "NonExistentCity" });
    expect(result).toEqual([]);
  });
});

describe("getConventionById", () => {
  it("returns convention by id", async () => {
    const c = await getConventionById("comic-con-delhi-jul");
    expect(c).toBeDefined();
    expect(c!.name).toContain("Comic Con Delhi");
  });

  it("returns null for non-existent id", async () => {
    const c = await getConventionById("non-existent");
    expect(c).toBeNull();
  });
});

describe("getCities", () => {
  it("returns sorted unique cities", async () => {
    const cities = await getCities();
    expect(Array.isArray(cities)).toBe(true);
    expect(cities.length).toBeGreaterThan(0);
    expect(cities).toEqual([...cities].sort());
    expect(cities).toContain("Delhi");
    expect(cities).toContain("Mumbai");
  });
});

describe("getStates", () => {
  it("returns sorted unique states", async () => {
    const states = await getStates();
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBeGreaterThan(0);
    expect(states).toEqual([...states].sort());
    expect(states).toContain("Maharashtra");
    expect(states).toContain("Delhi");
  });
});
