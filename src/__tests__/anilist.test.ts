import { describe, it, expect } from "vitest";
import { bestTitle } from "@/lib/anilist";

describe("bestTitle", () => {
  it("returns english title when available", () => {
    expect(bestTitle({ english: "Attack on Titan", romaji: "Shingeki no Kyojin", native: "進撃の巨人" })).toBe("Attack on Titan");
  });

  it("falls back to romaji when no english", () => {
    expect(bestTitle({ romaji: "Shingeki no Kyojin", native: "進撃の巨人" })).toBe("Shingeki no Kyojin");
  });

  it("falls back to native when no english or romaji", () => {
    expect(bestTitle({ native: "進撃の巨人" })).toBe("進撃の巨人");
  });

  it("returns Untitled for null", () => {
    expect(bestTitle(null)).toBe("Untitled");
  });

  it("returns Untitled for undefined", () => {
    expect(bestTitle(undefined)).toBe("Untitled");
  });

  it("returns Untitled for empty object", () => {
    expect(bestTitle({})).toBe("Untitled");
  });

  it("prefers userPreferred over other fields", () => {
    expect(bestTitle({ userPreferred: "AOT", english: "Attack on Titan", romaji: "Shingeki" })).toBe("AOT");
  });
});
