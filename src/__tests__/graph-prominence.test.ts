import { describe, expect, it } from "vitest";
import { normaliseProminence, type Weighed } from "@/lib/graph";

/**
 * Node sizing was the reason the graph looked broken.
 *
 * Raw AniList numbers were plotted against a single maximum, but characters
 * report `favourites` (tops out near 21,000) while anime report `popularity`
 * (runs past 600,000). On a real 27-node Naruto graph that left 19 of 27 nodes
 * under a 7px radius - indistinguishable dots - and the seed, sent with
 * `weight: 0`, was the smallest of the lot despite being the hub every edge
 * radiates from.
 */

const n = (id: string, type: Weighed["type"], weight: number): Weighed => ({
  id,
  type,
  weight,
});

describe("normaliseProminence", () => {
  it("puts every node in 0..1", () => {
    const scores = normaliseProminence([
      n("anime:1", "anime", 0),
      n("anime:2", "anime", 613_958),
      n("character:1", "character", 1_773),
      n("character:2", "character", 21_395),
    ]);
    for (const [, score] of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it("gives the most and least prominent of a type 1 and 0", () => {
    const scores = normaliseProminence([
      n("character:a", "character", 100),
      n("character:b", "character", 200),
      n("character:c", "character", 300),
    ]);
    expect(scores.get("character:a")).toBe(0);
    expect(scores.get("character:b")).toBe(0.5);
    expect(scores.get("character:c")).toBe(1);
  });

  it("makes a character and an anime comparable when both are top of their type", () => {
    // The whole point: without per-type normalisation these two would be 21,395
    // against 613,958 and the character would be a speck.
    const scores = normaliseProminence([
      n("anime:top", "anime", 613_958),
      n("anime:low", "anime", 50_000),
      n("character:top", "character", 21_395),
      n("character:low", "character", 1_773),
    ]);
    expect(scores.get("anime:top")).toBe(1);
    expect(scores.get("character:top")).toBe(1);
    expect(scores.get("anime:low")).toBe(0);
    expect(scores.get("character:low")).toBe(0);
  });

  it("keeps the spread within one type instead of flattening it", () => {
    // A min/max ratio would put every long-tail node near 0; ranks do not.
    const scores = normaliseProminence([
      n("character:a", "character", 1),
      n("character:b", "character", 2),
      n("character:c", "character", 3),
      n("character:d", "character", 21_395),
    ]);
    const values = [...scores.values()].sort((a, b) => a - b);
    expect(values).toEqual([0, 1 / 3, 2 / 3, 1]);
  });

  it("treats a single node of a type as fully prominent", () => {
    const scores = normaliseProminence([
      n("anime:only", "anime", 42),
      n("character:a", "character", 10),
      n("character:b", "character", 20),
    ]);
    expect(scores.get("anime:only")).toBe(1);
  });

  it("treats identically-weighted siblings as equal rather than arbitrary", () => {
    // AniList reports several characters with the same favourites count. Ranking
    // them 0, 0.5, 1 by array position would invent prominence that is not there.
    const scores = normaliseProminence([
      n("character:a", "character", 500),
      n("character:b", "character", 500),
      n("character:c", "character", 500),
    ]);
    expect([...scores.values()]).toEqual([1, 1, 1]);
  });

  it("is deterministic", () => {
    const nodes = [
      n("character:b", "character", 20),
      n("character:a", "character", 20),
      n("character:c", "character", 10),
    ];
    const a = normaliseProminence(nodes);
    const b = normaliseProminence([...nodes].reverse());
    // Input order must not change the answer, or a shared URL redraws differently.
    expect([...a.entries()].sort()).toEqual([...b.entries()].sort());
  });

  describe("the seed", () => {
    it("is never the least prominent node in the picture", () => {
      // The regression that made the graph look wrong: weight 0 for the seed.
      const scores = normaliseProminence(
        [
          n("anime:20", "anime", 0),
          n("character:14", "character", 21_395),
          n("character:85", "character", 20_461),
          n("character:17", "character", 18_141),
        ],
        { seed: "anime:20" }
      );
      const seed = scores.get("anime:20")!;
      expect(seed).toBeGreaterThan(0);
      for (const id of ["character:14", "character:85", "character:17"]) {
        expect(seed, `seed must outrank ${id}`).toBeGreaterThanOrEqual(scores.get(id)!);
      }
    });

    it("honours a custom floor", () => {
      const scores = normaliseProminence(
        [n("anime:20", "anime", 0), n("anime:9", "anime", 900)],
        { seed: "anime:20", seedFloor: 0.95 }
      );
      expect(scores.get("anime:20")).toBe(0.95);
    });

    it("does not demote a seed that is already prominent", () => {
      const scores = normaliseProminence(
        [n("anime:a", "anime", 900_000), n("anime:b", "anime", 10)],
        { seed: "anime:a", seedFloor: 0.7 }
      );
      expect(scores.get("anime:a")).toBe(1);
    });

    it("ignores a seed that is not in the graph", () => {
      expect(() =>
        normaliseProminence([n("anime:a", "anime", 5)], { seed: "anime:ghost" })
      ).not.toThrow();
    });
  });

  it("handles an empty graph", () => {
    expect(normaliseProminence([]).size).toBe(0);
  });

  it("does not mutate its input", () => {
    const nodes = [n("character:a", "character", 10), n("character:b", "character", 20)];
    const copy = nodes.map((x) => ({ ...x }));
    normaliseProminence(nodes, { seed: "character:a" });
    expect(nodes).toEqual(copy);
  });

  it("assigns a score to every node", () => {
    const nodes = [
      n("anime:1", "anime", 10),
      n("anime:2", "anime", 20),
      n("character:1", "character", 30),
    ];
    const scores = normaliseProminence(nodes);
    expect(scores.size).toBe(nodes.length);
  });
});