import { describe, it, expect, vi, beforeEach } from "vitest";
import { getIndianVoiceActors, searchVoiceActors, getVoiceActor } from "@/lib/voice-actors";

const MOCK_STAFF_SEARCH = {
  data: {
    Page: {
      staff: [
        {
          id: 100001,
          name: { full: "Rajesh Khattar", native: "राजेश खट्टर" },
          image: { large: "https://example.com/rk.jpg", medium: null },
          primaryOccupations: ["Voice Actor"],
          gender: "Male",
          description: "An Indian voice actor.",
        },
      ],
      pageInfo: { total: 1, hasNextPage: false },
    },
  },
};

const MOCK_STAFF_BASIC = {
  data: {
    Staff: {
      id: 100001,
      name: { full: "Rajesh Khattar", native: "राजेश खट्टर" },
      image: { large: "https://example.com/rk.jpg", medium: null },
      description: "An Indian voice actor.",
      age: 45,
      dateOfBirth: { year: 1979, month: 5, day: 15 },
      homeTown: "Mumbai",
    },
  },
};

function mockFetchOk(data: unknown) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getIndianVoiceActors", () => {
  it("returns voice actors with correct structure", async () => {
    const actors = await getIndianVoiceActors();
    expect(Array.isArray(actors)).toBe(true);
    expect(actors.length).toBeGreaterThan(0);

    for (const va of actors) {
      expect(va).toHaveProperty("id");
      expect(va).toHaveProperty("name");
      expect(va).toHaveProperty("image");
      expect(va).toHaveProperty("roles");
      expect(va).toHaveProperty("isIndian");
      expect(va.isIndian).toBe(true);
      expect(Array.isArray(va.roles)).toBe(true);
    }
  });

  it("all bios start with 'Community-sourced' or 'AniList-verified'", async () => {
    const actors = await getIndianVoiceActors();
    for (const va of actors) {
      if (va.bio) {
        expect(va.bio.startsWith("Community-sourced") || va.bio.startsWith("AniList-verified")).toBe(true);
      }
    }
  });

  it("returns actors with roles having correct language", async () => {
    const actors = await getIndianVoiceActors();
    for (const va of actors) {
      for (const role of va.roles) {
        expect(role).toHaveProperty("animeId");
        expect(role).toHaveProperty("animeTitle");
        expect(role).toHaveProperty("characterName");
        expect(role).toHaveProperty("language");
        expect(["Hindi", "Tamil", "Telugu"]).toContain(role.language);
      }
    }
  });
});

describe("searchVoiceActors", () => {
  it("searches and returns actors", async () => {
    mockFetchOk(MOCK_STAFF_SEARCH);
    const result = await searchVoiceActors("Rajesh");
    expect(result).toHaveProperty("actors");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.actors)).toBe(true);
  });
});

describe("getVoiceActor", () => {
  it("requires staff basic + media data", async () => {
    mockFetchOk(MOCK_STAFF_BASIC);
    mockFetchOk({ data: { Staff: { staffMedia: { edges: [] } } } });
    const actor = await getVoiceActor(100001);
    expect(actor).toHaveProperty("name");
    expect(actor).toHaveProperty("id");
  });
});
