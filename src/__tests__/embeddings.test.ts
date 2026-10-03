import { describe, expect, it } from "vitest";
import {
  buildEmbedInput,
  contentHash,
  cosine,
  docEmbedKey,
  EMBED_DIMS,
  MAX_EMBED_CHARS,
  MIN_SIMILARITY,
  normalize,
  queryEmbedKey,
  rank,
} from "@/lib/embeddings";

describe("normalize", () => {
  it("produces a unit vector", () => {
    const v = normalize([3, 4]);
    expect(Math.hypot(...v)).toBeCloseTo(1, 12);
  });

  it("leaves an already-normalised vector alone", () => {
    expect(normalize([1, 0, 0])).toEqual([1, 0, 0]);
  });

  it("returns zeros for a zero vector rather than NaN", () => {
    // A NaN here silently poisons every comparison it enters.
    const out = normalize([0, 0, 0]);
    expect(out).toEqual([0, 0, 0]);
    expect(out.every(Number.isFinite)).toBe(true);
  });

  it("survives a vector containing Infinity", () => {
    const out = normalize([Infinity, 1]);
    expect(out.every(Number.isFinite)).toBe(true);
  });

  it("preserves direction", () => {
    expect(cosine([3, 4], normalize([6, 8]))).toBeCloseTo(1, 12);
  });
});

describe("cosine", () => {
  it("is 1 for identical vectors regardless of magnitude", () => {
    expect(cosine([1, 2, 3], [10, 20, 30])).toBeCloseTo(1, 12);
  });

  it("is -1 for opposite vectors", () => {
    expect(cosine([1, 0], [-1, 0])).toBeCloseTo(-1, 12);
  });

  it("is 0 for orthogonal vectors", () => {
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0, 12);
  });

  it("returns 0 for empty input", () => {
    expect(cosine([], [])).toBe(0);
    expect(cosine([1], [])).toBe(0);
  });

  it("refuses to compare vectors of different widths", () => {
    // Comparing a prefix would invent similarity between two different models.
    expect(cosine([1, 0, 0], [1, 0])).toBe(0);
  });

  it("is 0 when either side is a zero vector", () => {
    expect(cosine([0, 0], [1, 1])).toBe(0);
  });

  it("never exceeds 1", () => {
    const v = Array.from({ length: EMBED_DIMS }, (_, i) => Math.sin(i) * 1e6);
    expect(cosine(v, v)).toBeLessThanOrEqual(1);
  });

  it("ranks a near-match above a far one", () => {
    const a = normalize([1, 0.1, 0]);
    const b = normalize([0, 1, 0.1]);
    const c = normalize([-1, -0.1, 0]);
    expect(cosine(a, a)).toBeGreaterThan(cosine(a, b));
    expect(cosine(a, b)).toBeGreaterThan(cosine(a, c));
  });
});

describe("contentHash", () => {
  it("is deterministic", () => {
    expect(contentHash("abc")).toBe(contentHash("abc"));
  });

  it("differs for different input", () => {
    expect(contentHash("abc")).not.toBe(contentHash("abd"));
  });

  it("is case sensitive", () => {
    expect(contentHash("Ring")).not.toBe(contentHash("ring"));
  });
});

describe("docEmbedKey", () => {
  it("encodes source, id and content hash", () => {
    const k = docEmbedKey("wiki", "slug-1", "deadbeef");
    expect(k).toContain("embed:doc:");
    expect(k).toContain("wiki");
    expect(k).toContain("slug-1");
    expect(k).toContain("deadbeef");
  });

  it("includes the model and dimensionality so stale vectors cannot be reused", () => {
    // Silently mixing a 3072-dim vector into a 768-dim comparison is the kind
    // of bug that returns confident nonsense instead of failing.
    expect(docEmbedKey("wiki", "s", "h")).toMatch(/@768$/);
  });

  it("changes when the content changes", () => {
    expect(docEmbedKey("wiki", "s", contentHash("a"))).not.toBe(docEmbedKey("wiki", "s", contentHash("b")));
  });

  it("does not collide across sources", () => {
    expect(docEmbedKey("wiki", "x", "h")).not.toBe(docEmbedKey("blog", "x", "h"));
  });
});

describe("queryEmbedKey", () => {
  it("is case and whitespace insensitive", () => {
    expect(queryEmbedKey("Hello   World")).toBe(queryEmbedKey("hello world"));
  });

  it("differs for different queries", () => {
    expect(queryEmbedKey("a")).not.toBe(queryEmbedKey("b"));
  });
});

describe("buildEmbedInput", () => {
  it("leads with the title", () => {
    expect(buildEmbedInput({ title: "Ring of Power", body: "text" }).startsWith("Ring of Power")).toBe(true);
  });

  it("appends tags", () => {
    const out = buildEmbedInput({ title: "T", body: "b", tags: "fantasy, elves" });
    expect(out).toContain("Tags: fantasy, elves");
  });

  it("normalises ragged tag separators", () => {
    // Split on commas *and* whitespace, then rejoin canonically, so "a b, c"
    // and "a, b, c" cannot end up as two different cache keys for one document.
    expect(buildEmbedInput({ title: "T", body: "b", tags: "a b, c" })).toContain("Tags: a, b, c");
    expect(buildEmbedInput({ title: "T", body: "b", tags: "a b, c" })).toBe(
      buildEmbedInput({ title: "T", body: "b", tags: "a, b, c" })
    );
  });

  it("caps output length", () => {
    const out = buildEmbedInput({ title: "T", body: "x".repeat(50_000) });
    expect(out.length).toBeLessThanOrEqual(MAX_EMBED_CHARS);
  });

  it("always keeps the whole title even for a huge body", () => {
    const out = buildEmbedInput({ title: "Important", body: "x".repeat(50_000) });
    expect(out.startsWith("Important")).toBe(true);
  });

  it("is deterministic", () => {
    const doc = { title: "T", body: "b", tags: "x" };
    expect(buildEmbedInput(doc)).toBe(buildEmbedInput(doc));
  });

  it("survives an empty body", () => {
    expect(() => buildEmbedInput({ title: "Only a title", body: "" })).not.toThrow();
  });
});

describe("rank", () => {
  const items = [
    { id: "a", vector: normalize([1, 0]) },
    { id: "b", vector: normalize([0.9, 0.1]) },
    { id: "c", vector: normalize([0, 1]) },
    { id: "d", vector: normalize([-1, 0]) },
  ];

  it("orders by descending similarity", () => {
    const out = rank(normalize([1, 0]), items);
    expect(out.map((s) => s.item.id)).toEqual(["a", "b"]);
  });

  it("drops matches below the threshold", () => {
    const out = rank(normalize([1, 0]), items);
    expect(out.every((s) => s.score >= MIN_SIMILARITY)).toBe(true);
    expect(out.map((s) => s.item.id)).not.toContain("d");
  });

  it("returns nothing when the query shares nothing with the corpus", () => {
    expect(rank(normalize([0, 1]), items.filter((i) => i.id === "d"))).toEqual([]);
  });

  it("honours the limit", () => {
    expect(rank(normalize([1, 0]), items, 1)).toHaveLength(1);
  });

  it("breaks ties on id so results are stable", () => {
    const tied = [
      { id: "zz", vector: normalize([1, 1]) },
      { id: "aa", vector: normalize([1, 1]) },
    ];
    const first = rank(normalize([1, 0]), tied).map((s) => s.item.id);
    const second = rank(normalize([1, 0]), [...tied].reverse()).map((s) => s.item.id);
    expect(first).toEqual(second);
    expect(first[0]).toBe("aa");
  });

  it("honours a custom threshold", () => {
    // a and b are both within 0.99 of the query; only a clears 0.995.
    expect(rank(normalize([1, 0]), items, 20, 0.99).map((s) => s.item.id)).toEqual(["a", "b"]);
    expect(rank(normalize([1, 0]), items, 20, 0.995).map((s) => s.item.id)).toEqual(["a"]);
  });

  it("returns an empty list for an empty corpus", () => {
    expect(rank(normalize([1, 0]), [])).toEqual([]);
  });

  it("is empty when the query vector is zero", () => {
    expect(rank([0, 0], items)).toEqual([]);
  });
});