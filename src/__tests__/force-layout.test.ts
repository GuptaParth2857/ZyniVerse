import { describe, expect, it } from "vitest";
import {
  bounds,
  closestPair,
  DEFAULT_TUNING,
  isSettled,
  maxDisplacement,
  MAX_RADIUS,
  MIN_RADIUS,
  seedLayout,
  settle,
  stepLayout,
  type Particle,
} from "@/lib/force-layout";

const CENTRE = { x: 400, y: 300 };

/**
 * Node ids carry their type in the real graph (`anime:20`), and sizing is
 * normalised per type upstream, so these stand in for post-normalisation input:
 * prominence already in 0..1.
 */
function nodeList(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `n${i}`,
    prominence: (i % 5) / 4,
  }));
}

/** A star: one hub joined to everything, the shape most anime graphs take. */
function starEdges(n: number) {
  return Array.from({ length: n - 1 }, (_, i) => ({ source: "n0", target: `n${i + 1}` }));
}

function finiteEverywhere(parts: Map<string, Particle>): boolean {
  return [...parts.values()].every(
    (p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.vx) && Number.isFinite(p.vy)
  );
}

describe("seedLayout", () => {
  it("is deterministic", () => {
    // A shared /graph URL must always draw the same picture, otherwise every
    // visit looks like a different graph and no bug is reproducible.
    const a = seedLayout(nodeList(12), "n0");
    const b = seedLayout(nodeList(12), "n0");
    expect([...a.entries()].map(([id, p]) => [id, p.x, p.y])).toEqual(
      [...b.entries()].map(([id, p]) => [id, p.x, p.y])
    );
  });

  it("pins only the seed", () => {
    const parts = seedLayout(nodeList(5), "n3");
    expect(parts.get("n3")?.pinned).toBe(true);
    expect([...parts.values()].filter((p) => p.pinned)).toHaveLength(1);
  });

  it("starts every node at rest", () => {
    for (const p of seedLayout(nodeList(8), "n0").values()) {
      expect(p.vx).toBe(0);
      expect(p.vy).toBe(0);
    }
  });

  it("spreads nodes out instead of stacking them", () => {
    const parts = seedLayout(nodeList(30), "n0");
    const pair = closestPair(parts);
    expect(pair).not.toBeNull();
    expect(pair!.distance).toBeGreaterThan(0);
  });

  it("scales radius with prominence", () => {
    const parts = seedLayout(
      [
        { id: "big", prominence: 1 },
        { id: "small", prominence: 0 },
      ],
      "big"
    );
    // The full 0..1 range is used, and prominence 0 still gets a visible disc -
    // a node with zero size is indistinguishable from a missing one.
    expect(parts.get("big")!.r).toBe(MAX_RADIUS);
    expect(parts.get("small")!.r).toBe(MIN_RADIUS);
    expect(parts.get("big")!.r).toBeGreaterThan(parts.get("small")!.r * 2);
  });

  it("keeps a zero-prominence node drawable", () => {
    // The seed arriving with weight 0 is exactly how Naruto rendered as the
    // smallest thing in the graph. The floor stops that being invisible.
    const parts = seedLayout([{ id: "seed", prominence: 0 }], "seed");
    expect(parts.get("seed")!.r).toBe(MIN_RADIUS);
    expect(parts.get("seed")!.r).toBeGreaterThan(0);
  });

  it("clamps out-of-range and NaN prominence instead of propagating it", () => {
    const parts = seedLayout(
      [
        { id: "over", prominence: 4 },
        { id: "under", prominence: -3 },
        { id: "nan", prominence: Number.NaN },
      ],
      "over"
    );
    // A NaN radius spreads into every coordinate for the rest of the run.
    expect(parts.get("over")!.r).toBe(MAX_RADIUS);
    expect(parts.get("under")!.r).toBe(MIN_RADIUS);
    expect(Number.isFinite(parts.get("nan")!.r)).toBe(true);
    for (const p of parts.values()) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });

  it("survives a single node and an empty graph", () => {
    expect(seedLayout([{ id: "only", prominence: 1 }], "only").size).toBe(1);
    expect(seedLayout([], "nothing").size).toBe(0);
  });

  it("gives every node a usable radius", () => {
    for (const p of seedLayout(nodeList(40), "n0").values()) {
      expect(p.r).toBeGreaterThanOrEqual(MIN_RADIUS);
      expect(p.r).toBeLessThanOrEqual(MAX_RADIUS);
    }
  });
});

describe("stepLayout", () => {
  it("cools alpha every frame", () => {
    const parts = seedLayout(nodeList(6), "n0");
    const next = stepLayout(parts, starEdges(6), 1, CENTRE);
    expect(next).toBeLessThan(1);
    expect(stepLayout(parts, starEdges(6), next, CENTRE)).toBeLessThan(next);
  });

  it("stops stepping once alpha reaches the floor", () => {
    const parts = seedLayout(nodeList(4), "n0");
    const settled = stepLayout(parts, [], DEFAULT_TUNING.alphaFloor, CENTRE);
    expect(settled).toBe(DEFAULT_TUNING.alphaFloor);
  });

  it("does nothing when the graph is empty", () => {
    const next = stepLayout(new Map(), [], 1, CENTRE);
    expect(next).toBeLessThan(1);
  });

  it("holds the pinned node exactly at the centre", () => {
    const parts = seedLayout(nodeList(12), "n0");
    // Nudge the seed off-centre; a pin has to win over every force.
    parts.get("n0")!.x = 999;
    parts.get("n0")!.y = -999;
    stepLayout(parts, starEdges(12), 1, CENTRE);
    expect(parts.get("n0")!.x).toBe(CENTRE.x);
    expect(parts.get("n0")!.y).toBe(CENTRE.y);
  });

  it("never lets a node exceed the per-frame step cap", () => {
    // Two nodes on the same pixel is the classic way to make a force layout
    // produce Infinity and then NaN everywhere.
    const parts = new Map<string, Particle>([
      ["a", { x: 0, y: 0, vx: 0, vy: 0, r: 8, pinned: false }],
      ["b", { x: 0, y: 0, vx: 0, vy: 0, r: 8, pinned: false }],
    ]);
    stepLayout(parts, [], 1, CENTRE);
    // The clamp renormalises and multiplies, so the result lands a float-epsilon
    // over the cap rather than exactly on it.
    expect(Math.hypot(parts.get("a")!.vx, parts.get("a")!.vy)).toBeLessThanOrEqual(
      DEFAULT_TUNING.maxStep * (1 + 1e-9)
    );
  });

  it("separates coincident nodes without producing NaN", () => {
    const parts = new Map<string, Particle>(
      Array.from({ length: 6 }, (_, i) => [
        `n${i}`,
        { x: 0, y: 0, vx: 0, vy: 0, r: 8, pinned: false } as Particle,
      ])
    );
    for (let i = 0; i < 40; i++) stepLayout(parts, [], 1, CENTRE);
    expect(finiteEverywhere(parts)).toBe(true);
    const spread = closestPair(parts)!;
    expect(spread.distance).toBeGreaterThan(0);
  });

  it("pushes overlapping nodes apart", () => {
    const parts = new Map<string, Particle>([
      ["a", { x: 400, y: 300, vx: 0, vy: 0, r: 10, pinned: false }],
      ["b", { x: 402, y: 300, vx: 0, vy: 0, r: 10, pinned: false }],
    ]);
    const before = Math.hypot(parts.get("b")!.x - parts.get("a")!.x, parts.get("b")!.y - parts.get("a")!.y);
    stepLayout(parts, [], 1, CENTRE);
    const after = Math.hypot(parts.get("b")!.x - parts.get("a")!.x, parts.get("b")!.y - parts.get("a")!.y);
    expect(after).toBeGreaterThan(before);
  });

  it("reps distant nodes too, not only overlapping ones", () => {
    // Repulsion that stops at a close-range cutoff collapses the sparse parts of
    // a graph into the centre, because a node with no edges then feels nothing
    // but gravity. Measured on a 30-node hub graph this was the difference
    // between a 243x235 blob and a 466x475 layout in an 800x600 viewport.
    const noGravity = { ...DEFAULT_TUNING, gravity: 0 };
    const parts = new Map<string, Particle>([
      ["a", { x: 100, y: 300, vx: 0, vy: 0, r: 6, pinned: false }],
      ["b", { x: 700, y: 300, vx: 0, vy: 0, r: 6, pinned: false }],
    ]);
    stepLayout(parts, [], 1, CENTRE, noGravity);
    // `a` is left of `b`, so the push pushes `a` further left and `b` further right.
    expect(parts.get("a")!.x).toBeLessThan(100);
    expect(parts.get("b")!.x).toBeGreaterThan(700);
  });

  it("pushes distant nodes apart more weakly than close ones", () => {
    // 1/d^2 has to decay, or the layout would expand without limit.
    const noGravity = { ...DEFAULT_TUNING, gravity: 0 };
    const spread = (distance: number) => {
      const parts = new Map<string, Particle>([
        ["a", { x: 300, y: 300, vx: 0, vy: 0, r: 6, pinned: false }],
        ["b", { x: 300 + distance, y: 300, vx: 0, vy: 0, r: 6, pinned: false }],
      ]);
      stepLayout(parts, [], 1, CENTRE, noGravity);
      return parts.get("b")!.vx;
    };
    expect(Math.abs(spread(20))).toBeGreaterThan(Math.abs(spread(200)));
  });

  describe("size-aware repulsion", () => {
    // 320px apart, which keeps the force well under `maxStep`. Closer and both
    // sizes saturate the per-frame clamp and every comparison reads 14.
    const pair = (aR: number, bR: number, tuning: Partial<typeof DEFAULT_TUNING> = {}) => {
      const parts = new Map<string, Particle>([
        ["a", { x: 300, y: 300, vx: 0, vy: 0, r: aR, pinned: false }],
        ["b", { x: 620, y: 300, vx: 0, vy: 0, r: bR, pinned: false }],
      ]);
      stepLayout(parts, [], 1, CENTRE, { ...DEFAULT_TUNING, gravity: 0, ...tuning });
      return Math.abs(parts.get("b")!.vx);
    };

    it("pushes two large nodes harder than two small ones at the same distance", () => {
      // The reason size enters the force at all: a purely positional force makes
      // a 52px cover image and a 14px dot interchangeable, so the biggest nodes
      // in the picture were also the ones that ended up touching.
      expect(pair(MAX_RADIUS, MAX_RADIUS)).toBeGreaterThan(pair(MIN_RADIUS, MIN_RADIUS));
    });

    it("orders pairs by the sum of their radii", () => {
      // The governing property. A big node paired with a tiny one must feel the
      // combined weight of the two, which is why the sums here are deliberately
      // far apart: (26,7) sums to 33 and (16,16) to 32, so the mixed pair is
      // correctly pushed marginally harder, and picking those two as the test
      // case would assert an ordering that is simply not true.
      const bigBig = pair(MAX_RADIUS, MAX_RADIUS);
      const midMid = pair(16, 16);
      const smallSmall = pair(MIN_RADIUS, MIN_RADIUS);
      expect(bigBig).toBeGreaterThan(midMid);
      expect(midMid).toBeGreaterThan(smallSmall);
    });

    it("leaves an average pair at exactly the size-blind force", () => {
      // The normalisation exists so enabling this cannot silently retune the
      // whole layout: only the relative spacing of big against small moves.
      const avgPair = (MAX_RADIUS + MIN_RADIUS) / 2;
      const blind = pair(avgPair, avgPair, { sizeTerm: 0 });
      expect(pair(avgPair, avgPair)).toBeCloseTo(blind, 6);
    });

    it("can be switched off, restoring purely positional repulsion", () => {
      const blind = pair(MAX_RADIUS, MAX_RADIUS, { sizeTerm: 0 });
      expect(pair(MAX_RADIUS, MAX_RADIUS)).toBeGreaterThan(blind);
    });

    it("still acts at every distance, so an isolated node feels the field", () => {
      // The property that makes size-awareness safe to add: unlike a close-range
      // cutoff, it does not switch the force off far away.
      const far = (r: number) => {
        const parts = new Map<string, Particle>([
          ["a", { x: 100, y: 300, vx: 0, vy: 0, r, pinned: false }],
          ["b", { x: 700, y: 300, vx: 0, vy: 0, r, pinned: false }],
        ]);
        stepLayout(parts, [], 1, CENTRE, { ...DEFAULT_TUNING, gravity: 0 });
        return Math.abs(parts.get("b")!.vx);
      };
      expect(far(MAX_RADIUS)).toBeGreaterThan(0);
      expect(far(MAX_RADIUS)).toBeGreaterThan(far(MIN_RADIUS));
    });
  });

  it("draws an over-stretched edge back together", () => {
    const parts = new Map<string, Particle>([
      ["a", { x: 50, y: 300, vx: 0, vy: 0, r: 6, pinned: false }],
      ["b", { x: 900, y: 300, vx: 0, vy: 0, r: 6, pinned: false }],
    ]);
    stepLayout(parts, [{ source: "a", target: "b" }], 1, CENTRE);
    // `a` sits left of centre and `b` right of it, so the spring pulls `b` left.
    expect(parts.get("b")!.vx).toBeLessThan(0);
    expect(parts.get("a")!.vx).toBeGreaterThan(0);
  });

  it("ignores an edge referencing a node that is not present", () => {
    const parts = seedLayout(nodeList(3), "n0");
    expect(() =>
      stepLayout(parts, [{ source: "n0", target: "ghost" }], 1, CENTRE)
    ).not.toThrow();
    expect(finiteEverywhere(parts)).toBe(true);
  });

  it("keeps every value finite over a long run", () => {
    const parts = seedLayout(nodeList(40), "n0");
    settle(parts, starEdges(40), CENTRE);
    expect(finiteEverywhere(parts)).toBe(true);
  });
});

describe("settle", () => {
  it("converges", () => {
    const parts = seedLayout(nodeList(20), "n0");
    const frames = settle(parts, starEdges(20), CENTRE);
    expect(frames).toBeGreaterThan(0);
    expect(frames).toBeLessThanOrEqual(1200);
  });

  it("comes to rest rather than oscillating", () => {
    const parts = seedLayout(nodeList(24), "n0");
    const edges = starEdges(24);
    let alpha = 1;
    while (!isSettled(alpha)) alpha = stepLayout(parts, edges, alpha, CENTRE);

    // Once cooled, the loop parks itself: further frames must not move anything.
    // Without the alphaFloor check in stepLayout, a settled graph would keep
    // drifting and the canvas would burn a frame budget forever.
    const snapshot = new Map([...parts].map(([id, p]) => [id, { ...p }]));
    expect(stepLayout(parts, edges, alpha, CENTRE)).toBe(alpha);
    expect(maxDisplacement(snapshot, parts)).toBe(0);
  });

  it("is reproducible from the same seed", () => {
    const a = seedLayout(nodeList(16), "n0");
    const b = seedLayout(nodeList(16), "n0");
    settle(a, starEdges(16), CENTRE);
    settle(b, starEdges(16), CENTRE);
    expect([...a].map(([id, p]) => [id, p.x, p.y])).toEqual([...b].map(([id, p]) => [id, p.x, p.y]));
  });

  it("respects a frame budget instead of spinning forever", () => {
    const parts = seedLayout(nodeList(10), "n0");
    expect(settle(parts, starEdges(10), CENTRE, DEFAULT_TUNING, 25)).toBe(25);
  });

  it("keeps the whole graph inside a sane region of the viewport", () => {
    const parts = seedLayout(nodeList(30), "n0");
    settle(parts, starEdges(30), CENTRE);
    for (const p of parts.values()) {
      expect(Math.abs(p.x - CENTRE.x)).toBeLessThan(4000);
      expect(Math.abs(p.y - CENTRE.y)).toBeLessThan(4000);
    }
  });

  // The canvas is 800x600 at rest. Measured settled sizes for the current tuning,
  // for scale:
  //
  //   shape         n   width  height   w/800  h/600   minClearance
  //   hub star     12     289     304    0.36   0.51        48.3
  //   no edges     12     318     346    0.40   0.58        55.8
  //   path         12     329     315    0.41   0.53        44.9
  //   hub star     30     455     452    0.57   0.75        40.2
  //   no edges     30     580     561    0.73   0.94        54.3
  //   path         30     550     579    0.69   0.96        36.0
  //   hub star     60     608     607    0.76   1.01        24.2
  //   no edges     60     774     778    0.97   1.30        40.6
  //   path         60     716     747    0.90   1.25        34.5
  //
  // Note the 60-node shapes exceeding 1.0. That is deliberate and is why the
  // canvas fits the settled layout to the viewport rather than assuming it fits:
  // there is no repulsion value that keeps every shape inside 800x600 while also
  // keeping the crowded cases readable. Clipping nodes silently was the previous
  // behaviour.
  //
  // The smallest real case is the 12-node hub star at 0.36/0.51, so 0.25 leaves
  // headroom for retuning without turning this into a change-detector.
  //
  // These synthetic shapes are NOT enough on their own: their worst clearance is
  // 27px, while the real 27-node Naruto graph settles to 15px. `force-layout-real`
  // pins that one down - see the note at the top of that file.
  //
  // Verified by mutation: reinstating the close-range repulsion cutoff fails the
  // three "spreads 12 nodes" cases and the clearance test below. The 30- and
  // 60-node cases still pass under the cutoff, because a collapsed 30-node layout
  // is 243x235 - still above 0.25 of the viewport. Small graphs are where the
  // collapse is worst relative to a fixed canvas, so they are what guard it.
  const VIEWPORT = { w: 800, h: 600 };

  const SHAPES: Array<[string, (n: number) => Array<{ source: string; target: string }>]> = [
    ["hub star", starEdges],
    ["no edges at all", () => []],
    [
      "path",
      (n) => Array.from({ length: n - 1 }, (_, i) => ({ source: `n${i}`, target: `n${i + 1}` })),
    ],
    [
      "six disconnected stars",
      (n) => {
        const per = Math.floor(n / 6);
        const out: Array<{ source: string; target: string }> = [];
        for (let s = 0; s < 6; s++) {
          for (let k = 1; k < per; k++) out.push({ source: `n${s * per}`, target: `n${s * per + k}` });
        }
        return out;
      },
    ],
  ];

  for (const n of [12, 30, 60]) {
    for (const [name, edges] of SHAPES) {
      it(`spreads ${n} nodes across the viewport (${name})`, () => {
        const parts = seedLayout(nodeList(n), "n0");
        settle(parts, edges(n), CENTRE);
        const box = bounds(parts)!;
        expect(box.width).toBeGreaterThan(VIEWPORT.w * 0.25);
        expect(box.height).toBeGreaterThan(VIEWPORT.h * 0.25);
        expect(box.width).toBeLessThan(VIEWPORT.w * 3);
        expect(box.height).toBeLessThan(VIEWPORT.h * 3);
      });
    }
  }

  it("separates every pair by at least their radii, at every size", () => {
    // Measured minimum clearance across these shapes and sizes is 39px, so 10
    // has ample margin. Zero overlap is not enough on its own: labels are drawn
    // under each node at r+5, and two nodes 2px apart still read as one blob.
    for (const n of [10, 25, 50]) {
      for (const [name, edges] of SHAPES) {
        const parts = seedLayout(nodeList(n), "n0");
        settle(parts, edges(n), CENTRE);
        const worst = closestPair(parts)!;
        expect(worst.clearance, `${n} nodes (${name}): ${worst.a} and ${worst.b} are too close`).toBeGreaterThan(10);
      }
    }
  });

  it("handles a single isolated node", () => {
    const parts = seedLayout([{ id: "only", prominence: 1 }], "only");
    expect(() => settle(parts, [], CENTRE)).not.toThrow();
    expect(finiteEverywhere(parts)).toBe(true);
  });
});

describe("isSettled", () => {
  it("is false at the start and true at the floor", () => {
    expect(isSettled(1)).toBe(false);
    expect(isSettled(DEFAULT_TUNING.alphaFloor)).toBe(true);
    expect(isSettled(0)).toBe(true);
  });
});

describe("maxDisplacement", () => {
  it("reports zero when nothing moved", () => {
    const p = new Map([["a", { x: 1, y: 2, vx: 0, vy: 0, r: 5, pinned: false }]]);
    expect(maxDisplacement(p, new Map([["a", { ...p.get("a")! }]]))).toBe(0);
  });

  it("reports the largest move", () => {
    const before = new Map([
      ["a", { x: 0, y: 0, vx: 0, vy: 0, r: 5, pinned: false }],
      ["b", { x: 0, y: 0, vx: 0, vy: 0, r: 5, pinned: false }],
    ]);
    const after = new Map([
      ["a", { x: 3, y: 4, vx: 0, vy: 0, r: 5, pinned: false }],
      ["b", { x: 0, y: 0, vx: 0, vy: 0, r: 5, pinned: false }],
    ]);
    expect(maxDisplacement(before, after)).toBeCloseTo(5);
  });

  it("ignores nodes present in only one snapshot", () => {
    const before = new Map([["a", { x: 0, y: 0, vx: 0, vy: 0, r: 5, pinned: false }]]);
    expect(() => maxDisplacement(before, new Map())).not.toThrow();
    expect(maxDisplacement(before, new Map())).toBe(0);
  });
});