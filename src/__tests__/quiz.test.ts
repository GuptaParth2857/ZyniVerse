import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDynamicQuiz, getDailyQuizDynamic } from "@/lib/quiz";

const MOCK_ANILIST_MEDIA = {
  data: {
    Page: {
      media: [
        {
          id: 21,
          title: { romaji: "One Piece", english: "One Piece" },
          coverImage: { large: "https://example.com/op.jpg" },
          studios: { nodes: [{ id: 1, name: "Toei Animation" }] },
          episodes: 1000,
          duration: 24,
          format: "TV",
          source: "MANGA",
          genres: ["Action", "Adventure"],
          startDate: { year: 1999 },
          averageScore: 85,
        },
        {
          id: 16498,
          title: { romaji: "Attack on Titan", english: null },
          coverImage: { large: null },
          studios: { nodes: [{ id: 2, name: "WIT Studio" }] },
          episodes: 75,
          duration: 24,
          format: "TV",
          source: "MANGA",
          genres: ["Action", "Drama"],
          startDate: { year: 2013 },
          averageScore: 90,
        },
      ],
    },
  },
};

const MOCK_CHARACTERS = { data: { Page: { media: [] } } };

function mockFetchOk(data: unknown) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateDynamicQuiz", () => {
  it("returns questions with correct structure", async () => {
    mockFetchOk(MOCK_ANILIST_MEDIA);
    mockFetchOk(MOCK_CHARACTERS);
    const questions = await generateDynamicQuiz("easy", "Studio", 3);
    expect(questions.length).toBeLessThanOrEqual(3);
    for (const q of questions) {
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("correctAnswer");
      expect(q).toHaveProperty("category");
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options).toContain(q.correctAnswer);
    }
  });
});

describe("getDailyQuizDynamic", () => {
  it("returns array of questions", async () => {
    mockFetchOk(MOCK_ANILIST_MEDIA);
    mockFetchOk(MOCK_CHARACTERS);
    mockFetchOk(MOCK_CHARACTERS);
    const quiz = await getDailyQuizDynamic();
    expect(Array.isArray(quiz)).toBe(true);
    expect(quiz.length).toBeGreaterThan(0);
    expect(quiz[0]).toHaveProperty("id");
    expect(quiz[0]).toHaveProperty("question");
  });

  it("questions have all required fields", async () => {
    mockFetchOk(MOCK_ANILIST_MEDIA);
    mockFetchOk(MOCK_CHARACTERS);
    mockFetchOk(MOCK_CHARACTERS);
    const quiz = await getDailyQuizDynamic();
    for (const q of quiz) {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("correctAnswer");
      expect(q).toHaveProperty("category");
      expect(q).toHaveProperty("difficulty");
    }
  });
});
