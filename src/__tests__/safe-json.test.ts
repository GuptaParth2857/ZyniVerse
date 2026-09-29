import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchJson, fetchList, ApiError } from "@/lib/safe-json";

/**
 * Regression tests for the blank-page bug.
 *
 * The pages used to do `fetch(url).then((r) => r.json())` with no `r.ok` check.
 * When an AniList-backed route 5xx'd, the body was `{"error":"..."}`, which got
 * stored where a list was expected, and the next render threw on `[...list]` —
 * a render-phase throw, so nothing caught it and the user saw a blank page.
 */

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }) as Response;

const realFetch = globalThis.fetch;
const fetchMock = vi.fn();

describe("safe-json", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  describe("fetchJson", () => {
    it("returns the parsed body on success", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ media: [{ id: 1 }] }));
      await expect(fetchJson("/api/anilist/seasonal")).resolves.toEqual({ media: [{ id: 1 }] });
    });

    it("throws a readable error instead of returning the error body on 503", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ error: "Anime data is temporarily unavailable. Please try again shortly." }, 503),
      );

      // The old code would have resolved with this object and crashed on render.
      await expect(fetchJson("/api/anilist/seasonal")).rejects.toThrow(ApiError);
      await expect(fetchJson("/api/anilist/seasonal")).rejects.toThrow(
        "Anime data is temporarily unavailable",
      );
    });

    it("does not throw when a success body is unparseable", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("Unexpected token <")),
      } as unknown as Response);
      await expect(fetchJson("/api/x")).resolves.toBeNull();
    });

    it("produces a friendly message for a 429 with a non-JSON body", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.reject(new SyntaxError("not json")),
      } as unknown as Response);
      await expect(fetchJson("/api/x")).rejects.toThrow(/Too many requests/);
    });
  });

  describe("fetchList", () => {
    it("passes a bare array through", async () => {
      fetchMock.mockResolvedValue(jsonResponse([{ id: 1 }]));
      await expect(fetchList("/api/anilist/popular")).resolves.toEqual([{ id: 1 }]);
    });

    it.each([
      ["media", { media: [{ id: 1 }] }],
      ["results", { results: [{ id: 2 }] }],
      ["characters", { characters: [{ id: 3 }] }],
    ])("unwraps the %s envelope", async (_key, body) => {
      fetchMock.mockResolvedValue(jsonResponse(body));
      await expect(fetchList("/api/x")).resolves.toHaveLength(1);
    });

    it("resolves to an empty array when a 200 has an unexpected shape", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ error: "weird" }));
      // The old code handed this object to setList, and `[...list]` threw
      // "list is not iterable" during render, blanking the page.
      const result = await fetchList("/api/x");
      expect(result).toEqual([]);
      expect(() => [...result]).not.toThrow();
    });

    it("propagates a 5xx rather than silently returning empty", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ error: "temporarily unavailable" }, 503));
      await expect(fetchList("/api/anilist/seasonal")).rejects.toThrow(ApiError);
    });
  });
});
