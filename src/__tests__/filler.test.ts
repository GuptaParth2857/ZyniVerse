import { describe, it, expect } from "vitest";
import { getFillerData } from "@/lib/filler";

describe("getFillerData", () => {
  it("fetches and returns filler data array", async () => {
    const data = await getFillerData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    const first = data[0];
    expect(first).toHaveProperty("slug");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("mappings");
    expect(first.mappings).toHaveProperty("anilist_id");
    expect(first).toHaveProperty("episodes");
    expect(Array.isArray(first.episodes)).toBe(true);
  });

  it("episodes have correct structure", async () => {
    const data = await getFillerData();
    const naruto = data.find((s) => s.slug === "naruto");
    if (!naruto) return;

    expect(naruto.title).toBe("Naruto");
    expect(naruto.mappings.anilist_id).toBeGreaterThan(0);

    const ep = naruto.episodes[0];
    expect(ep).toHaveProperty("episode");
    expect(ep).toHaveProperty("title");
    expect(ep).toHaveProperty("type");
    expect(["manga-canon", "filler", "mixed-manga", "anime-canon"]).toContain(ep.type);
  });

  it("finds one piece by anilist id", async () => {
    const data = await getFillerData();
    const op = data.find((s) => s.mappings.anilist_id === 21);
    expect(op).toBeDefined();
    expect(op!.slug).toBe("one-piece");
  });
});
