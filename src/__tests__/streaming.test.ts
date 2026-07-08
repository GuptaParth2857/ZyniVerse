import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getStreamingSources,
} from "@/lib/streaming";

describe("getStreamingSources", () => {
  it("returns sources for exact title match", () => {
    const sources = getStreamingSources("One Piece");
    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0]).toHaveProperty("name");
    expect(sources[0]).toHaveProperty("url");
    expect(sources[0]).toHaveProperty("region");
  });

  it("returns empty array for empty title", () => {
    expect(getStreamingSources("")).toEqual([]);
  });

  it("is case insensitive", () => {
    const lower = getStreamingSources("naruto");
    const upper = getStreamingSources("NARUTO");
    expect(lower.length).toBeGreaterThan(0);
    expect(upper.length).toBeGreaterThan(0);
    expect(lower[0].name).toBe(upper[0].name);
  });

  it("matches partial titles like 'Attack on Titan' via 'Attack' prefix", () => {
    const sources = getStreamingSources("Attack on Titan");
    expect(sources.length).toBeGreaterThan(0);
  });

  it("matches via alias (JJK -> Jujutsu Kaisen)", () => {
    const byAlias = getStreamingSources("JJK");
    const byFull = getStreamingSources("Jujutsu Kaisen");
    expect(byAlias.length).toBeGreaterThan(0);
    expect(byFull.length).toBeGreaterThan(0);
    expect(byAlias[0].name).toBe(byFull[0].name);
  });

  it("deduplicates platforms from different titles", () => {
    const sources = getStreamingSources("One Piece");
    const names = sources.map((s) => s.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("each source has valid type", () => {
    const sources = getStreamingSources("Naruto");
    for (const s of sources) {
      expect(["subscription", "free", "ads"]).toContain(s.type);
    }
  });

  it("returns empty for unknown anime", () => {
    expect(getStreamingSources("Some Totally Fake Anime 12345")).toEqual([]);
  });
});
