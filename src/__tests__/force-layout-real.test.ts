/**
 * The knowledge graph's flagship layout, on the actual data.
 *
 * Everything else in `force-layout.test.ts` is synthetic: stars, paths and
 * edgeless clouds. Those all cleared 31px minimum clearance at the time this was
 * written, while the real Naruto graph - which is what people actually open -
 * sat at 15px. A synthetic guard with 3x margin cannot catch a regression that
 * only shows up on a dense hub, so this fixture exists to pin that case down.
 *
 * Captured from `GET /api/graph?seed=anime:20&depth=2`: 27 nodes, 52 edges. The
 * values are post-normalisation prominences, so they stay meaningful even if the
 * raw AniList numbers move.
 */

import { describe, expect, it } from "vitest";
import {
  bounds,
  closestPair,
  seedLayout,
  settle,
  MIN_RADIUS,
  type LayoutEdge,
  type LayoutNode,
} from "@/lib/force-layout";

const VIEWPORT = { w: 800, h: 600 };

const NODES: LayoutNode[] = [
  { id: "anime:20", prominence: 1.0000 },
  { id: "character:14", prominence: 1.0000 },
  { id: "character:85", prominence: 0.9333 },
  { id: "anime:1735", prominence: 0.9000 },
  { id: "character:17", prominence: 0.8667 },
  { id: "character:13", prominence: 0.8000 },
  { id: "anime:97938", prominence: 0.8000 },
  { id: "character:2007", prominence: 0.7333 },
  { id: "anime:16870", prominence: 0.7000 },
  { id: "character:1662", prominence: 0.6667 },
  { id: "character:2423", prominence: 0.6000 },
  { id: "anime:30011", prominence: 0.6000 },
  { id: "character:1555", prominence: 0.5333 },
  { id: "anime:21220", prominence: 0.5000 },
  { id: "character:306", prominence: 0.4667 },
  { id: "character:145", prominence: 0.4000 },
  { id: "anime:13667", prominence: 0.4000 },
  { id: "character:307", prominence: 0.3333 },
  { id: "anime:2472", prominence: 0.3000 },
  { id: "character:1694", prominence: 0.2667 },
  { id: "character:2767", prominence: 0.2000 },
  { id: "anime:6325", prominence: 0.2000 },
  { id: "character:2455", prominence: 0.1333 },
  { id: "anime:19511", prominence: 0.1000 },
  { id: "character:2174", prominence: 0.0667 },
  { id: "character:728", prominence: 0.0000 },
  { id: "anime:155348", prominence: 0.0000 },
];

const EDGES: LayoutEdge[] = [
  { source: "character:14", target: "anime:20" },
  { source: "character:85", target: "anime:20" },
  { source: "character:17", target: "anime:20" },
  { source: "character:13", target: "anime:20" },
  { source: "character:2007", target: "anime:20" },
  { source: "character:1662", target: "anime:20" },
  { source: "character:2423", target: "anime:20" },
  { source: "character:1555", target: "anime:20" },
  { source: "character:306", target: "anime:20" },
  { source: "character:145", target: "anime:20" },
  { source: "character:307", target: "anime:20" },
  { source: "character:1694", target: "anime:20" },
  { source: "character:2767", target: "anime:20" },
  { source: "character:2455", target: "anime:20" },
  { source: "character:2174", target: "anime:20" },
  { source: "character:728", target: "anime:20" },
  { source: "character:14", target: "anime:1735" },
  { source: "character:14", target: "anime:97938" },
  { source: "character:14", target: "anime:30011" },
  { source: "character:14", target: "anime:13667" },
  { source: "character:14", target: "anime:19511" },
  { source: "character:14", target: "anime:155348" },
  { source: "character:85", target: "anime:1735" },
  { source: "character:85", target: "anime:97938" },
  { source: "character:85", target: "anime:16870" },
  { source: "character:85", target: "anime:30011" },
  { source: "character:85", target: "anime:13667" },
  { source: "character:85", target: "anime:2472" },
  { source: "character:17", target: "anime:1735" },
  { source: "character:17", target: "anime:97938" },
  { source: "character:17", target: "anime:16870" },
  { source: "character:17", target: "anime:30011" },
  { source: "character:17", target: "anime:21220" },
  { source: "character:17", target: "anime:13667" },
  { source: "character:13", target: "anime:1735" },
  { source: "character:13", target: "anime:97938" },
  { source: "character:13", target: "anime:16870" },
  { source: "character:13", target: "anime:30011" },
  { source: "character:13", target: "anime:21220" },
  { source: "character:13", target: "anime:13667" },
  { source: "character:2007", target: "anime:1735" },
  { source: "character:2007", target: "anime:97938" },
  { source: "character:2007", target: "anime:16870" },
  { source: "character:2007", target: "anime:30011" },
  { source: "character:2007", target: "anime:21220" },
  { source: "character:2007", target: "anime:13667" },
  { source: "character:1662", target: "anime:1735" },
  { source: "character:1662", target: "anime:97938" },
  { source: "character:1662", target: "anime:16870" },
  { source: "character:1662", target: "anime:30011" },
  { source: "character:1662", target: "anime:21220" },
  { source: "character:1662", target: "anime:6325" },
];

const SEED = "anime:20";

function seedAndSettle(nodes: readonly LayoutNode[], edges: readonly LayoutEdge[] = EDGES) {
  const parts = seedLayout(nodes, SEED);
  settle(parts, edges, { x: VIEWPORT.w / 2, y: VIEWPORT.h / 2 });
  return parts;
}

function layout() {
  return seedAndSettle(NODES);
}

describe("the real Naruto graph lays out legibly", () => {
  it("never lets two nodes touch, which is what makes it read as a graph", () => {
    // Measured 15.1px between character:13 and character:2007. The floor is 10
    // because below that two 26px cover images with their labels underneath stop
    // looking like two things and start looking like one. Before size-aware
    // repulsion this graph sat at 3.9px.
    const worst = closestPair(layout())!;
    expect(worst.clearance, `${worst.a} and ${worst.b}`).toBeGreaterThan(10);
  });

  it("fills the canvas rather than huddling in the middle", () => {
    const box = bounds(layout())!;
    expect(box.width).toBeGreaterThan(VIEWPORT.w * 0.3);
    expect(box.height).toBeGreaterThan(VIEWPORT.h * 0.3);
  });

  it("puts the seed at the centre, held in place", () => {
    const p = layout().get(SEED)!;
    expect(p.x).toBeCloseTo(VIEWPORT.w / 2, 5);
    expect(p.y).toBeCloseTo(VIEWPORT.h / 2, 5);
  });

  it("makes the seed the largest node on screen", () => {
    // The single most damaging regression on this page: the anime seed used to
    // arrive with weight 0, which made it the *smallest* disc while all sixteen
    // of its characters drew larger - the centre of the graph looking like its
    // least important member.
    const parts = layout();
    const seedR = parts.get(SEED)!.r;
    const others = [...parts.values()].filter((p) => !p.pinned).map((p) => p.r);
    expect(seedR).toBeGreaterThanOrEqual(Math.max(...others));
    expect(seedR).toBeGreaterThan(MIN_RADIUS);
  });

  it("gives nodes visibly different sizes", () => {
    // Nineteen of 27 nodes once fell under a 7px radius and were
    // indistinguishable specks. Twenty-one distinct sizes out of 27 is the
    // measured value for this payload.
    const radii = [...layout().values()].map((p) => Math.round(p.r * 100));
    expect(new Set(radii).size).toBeGreaterThan(15);
  });

  it("draws the same picture whatever order the nodes arrive in", () => {
    // Not just "twice in a row is the same" - the node list comes from BFS
    // discovery and AniList chooses that order, so a cache expiry could hand back
    // the same anime with its characters shuffled. Sorting by id inside
    // `seedLayout` is what makes a shared URL stable; this fails without it.
    const shuffled = [...NODES].reverse();
    const a = [...layout().values()].map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`);
    const b = [...seedAndSettle(shuffled).values()].map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`);
    expect(b).toEqual(a);
  });

  it("does not care how the edges are ordered either", () => {
    const flipped = EDGES.map((e) => ({ source: e.target, target: e.source })).reverse();
    const a = [...layout().values()].map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`);
    const b = [...seedAndSettle(NODES, flipped).values()].map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`);
    expect(b).toEqual(a);
  });
});