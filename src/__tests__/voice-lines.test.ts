import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDynamicRandomVoiceLine,
  getDynamicVoiceLines,
  getDynamicQuoteOfTheDay,
} from "@/lib/voice-lines";

function mockFetchOk(data: unknown) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function mockFetchFail() {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("API error"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDynamicRandomVoiceLine", () => {
  it("returns a voice line from API with correct structure", async () => {
    mockFetchOk({ anime: "Naruto", character: "Naruto Uzumaki", quote: "Believe it!" });
    const line = await getDynamicRandomVoiceLine();
    expect(line).toHaveProperty("id");
    expect(line).toHaveProperty("character");
    expect(line).toHaveProperty("animeTitle");
    expect(line).toHaveProperty("line");
    expect(line).toHaveProperty("language");
    expect(line).toHaveProperty("type");
    expect(typeof line.line).toBe("string");
    expect(line.line.length).toBeGreaterThan(0);
  });

  it("falls back to static data when API fails", async () => {
    mockFetchFail();
    const line = await getDynamicRandomVoiceLine();
    expect(line).toHaveProperty("id");
    expect(line).toHaveProperty("line");
    expect(line.line.length).toBeGreaterThan(0);
  });
});

describe("getDynamicVoiceLines", () => {
  it("returns static lines filtered by search, appends API results", async () => {
    mockFetchOk([
      { anime: "Naruto", character: "Naruto", quote: "Believe it!" },
      { anime: "Naruto", character: "Sasuke", quote: "I'll kill you." },
    ]);
    const lines = await getDynamicVoiceLines("Naruto");
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines[0]).toHaveProperty("animeTitle");
  });

  it("returns only static lines when API fails", async () => {
    mockFetchFail();
    const lines = await getDynamicVoiceLines("Pokemon");
    expect(Array.isArray(lines)).toBe(true);
    for (const l of lines) {
      expect(l.line.toLowerCase()).toContain("pokemon");
    }
  });

  it("filters by animeId", async () => {
    const lines = await getDynamicVoiceLines(undefined, 21);
    for (const l of lines) {
      expect(l.animeId).toBe(21);
    }
  });
});

describe("getDynamicQuoteOfTheDay", () => {
  it("returns a VoiceLine from API", async () => {
    mockFetchOk({ anime: "One Piece", character: "Luffy", quote: "I'm gonna be king!" });
    const quote = await getDynamicQuoteOfTheDay();
    expect(quote).toHaveProperty("id");
    expect(quote).toHaveProperty("character");
    expect(quote).toHaveProperty("line");
    expect(typeof quote.line).toBe("string");
    expect(quote.line.length).toBeGreaterThan(0);
  });

  it("falls back to static data when API fails", async () => {
    mockFetchFail();
    const quote = await getDynamicQuoteOfTheDay();
    expect(quote).toHaveProperty("id");
    expect(quote).toHaveProperty("line");
    expect(quote.line.length).toBeGreaterThan(0);
  });
});
