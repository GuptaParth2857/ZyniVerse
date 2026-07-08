import { describe, it, expect, vi, beforeEach } from "vitest";

function createNextRequest(url: string, init?: RequestInit): Request {
  return new Request(url, { ...init, headers: new Headers(init?.headers) });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/streaming", () => {
  it("returns 400 when title is missing", async () => {
    const { GET } = await import("@/app/api/streaming/route");
    const res = await GET(createNextRequest("http://localhost:3000/api/streaming"));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("title query parameter is required");
  });

  it("returns sources for a known anime", async () => {
    const { GET } = await import("@/app/api/streaming/route");
    const res = await GET(createNextRequest("http://localhost:3000/api/streaming?title=Naruto"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.sources.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown anime", async () => {
    const { GET } = await import("@/app/api/streaming/route");
    const res = await GET(createNextRequest("http://localhost:3000/api/streaming?title=UnknownAnime123"));
    const json = await res.json();
    expect(json.sources).toEqual([]);
  });
});

describe("GET /api/quiz/generate", () => {
  it("returns quiz questions stripped of correctAnswer", async () => {
    const { GET } = await import("@/app/api/quiz/generate/route");
    const res = await GET(createNextRequest("http://localhost:3000/api/quiz/generate"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.questions).toBeDefined();
    if (json.questions.length > 0) {
      expect(json.questions[0]).not.toHaveProperty("correctAnswer");
      expect(json.questions[0]).toHaveProperty("question");
      expect(json.questions[0]).toHaveProperty("options");
    }
  });

  it("respects count parameter", async () => {
    const { GET } = await import("@/app/api/quiz/generate/route");
    const res = await GET(createNextRequest("http://localhost:3000/api/quiz/generate?count=3"));
    const json = await res.json();
    expect(json.questions.length).toBeLessThanOrEqual(3);
  });
});
