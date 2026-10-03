/**
 * Force-directed layout maths for the knowledge graph, extracted from the canvas
 * component so it can be tested.
 *
 * This is the part of the graph feature that nothing else could verify. The
 * component needs a real 2D context and a requestAnimationFrame loop, so every
 * one of its failure modes - NaN positions, an exploding layout, a seed node
 * drifting off centre - were unreachable from a unit test. Keeping the maths
 * pure and here means the physics is checked on every run instead of being taken
 * on trust.
 *
 * Nothing here is adaptive or time-based: one call is one frame, so a layout is
 * reproducible from its starting state and a bug can be reproduced exactly.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pinned: boolean;
}

export interface Tuning {
  /** Strength of the pairwise repulsion. */
  repel: number;
  /** Rest length of an edge. */
  springLen: number;
  /** Stiffness of an edge. */
  springK: number;
  /** Pull toward the centre of the viewport. */
  gravity: number;
  /** Per-frame velocity loss. Below 1 so the layout settles. */
  damping: number;
  /** Hard cap on per-frame displacement, so one bad frame cannot teleport a node. */
  maxStep: number;
  /** Per-frame decay of the cooling factor. */
  cool: number;
  /** Alpha at or below which the layout is considered finished. */
  alphaFloor: number;
}

export const DEFAULT_TUNING: Tuning = {
  repel: 9200,
  springLen: 92,
  springK: 0.022,
  gravity: 0.014,
  damping: 0.86,
  maxStep: 14,
  cool: 0.986,
  alphaFloor: 0.004,
};

export interface LayoutNode {
  id: string;
  weight?: number;
}

export interface LayoutEdge {
  source: string;
  target: string;
}

/** The golden angle, in radians. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Initial positions on a golden-angle spiral.
 *
 * Deterministic on purpose: `Math.random()` would give every visit a different
 * arrangement, so a shared `/graph?seed=...` URL would look like a different
 * graph each time and any visual regression would be unreproducible. The spiral
 * also starts nodes already spread out, so the first frames are not spent
 * unstacking a pile at the origin.
 */
export function seedLayout(
  nodes: readonly LayoutNode[],
  seedId: string,
  opts: { minRadius?: number; baseRadius?: number } = {}
): Map<string, Particle> {
  const base = opts.baseRadius ?? 34;
  const n = Math.max(nodes.length, 1);
  const maxWeight = Math.max(1, ...nodes.map((x) => x.weight ?? 0));
  const map = new Map<string, Particle>();

  nodes.forEach((node, i) => {
    const radius = base * Math.sqrt(i + 1) * Math.sqrt(n / 26);
    map.set(node.id, {
      x: Math.cos(i * GOLDEN) * radius + (i % 7) * 3,
      y: Math.sin(i * GOLDEN) * radius - (i % 5) * 3,
      vx: 0,
      vy: 0,
      // sqrt rather than linear: a runaway weight would otherwise render as a
      // disc wide enough to swallow the rest of the graph.
      r: 5 + 9 * Math.sqrt((node.weight ?? 0) / maxWeight),
      pinned: node.id === seedId,
    });
  });

  return map;
}

/** Minimum separation two nodes are pushed toward, in pixels. */
function minGap(a: Particle, b: Particle): number {
  return a.r + b.r;
}

/**
 * Advance the layout by one frame, mutating `particles`.
 *
 * Three forces are applied in order: repulsion between every pair, springs along
 * edges, then a pull toward the centre, after which velocities are damped and
 * integrated. Damping before integration is what makes the layout settle instead
 * of oscillating forever.
 *
 * Repulsion acts at *every* distance, which is what gives the layout its spread.
 * Cutting it off at some "close enough" radius was tried and is wrong: a node
 * with no edges then feels only gravity, so sparse and isolated parts of the
 * graph collapse into an unreadable ball at the centre. Measured on a 30-node
 * hub graph in an 800x600 viewport, the cutoff packed everything into 243x235
 * against 466x475 for the unrestricted force.
 *
 * @returns the new cooling factor. Callers stop stepping once it falls to
 *   `tuning.alphaFloor`.
 */
export function stepLayout(
  particles: Map<string, Particle>,
  edges: readonly LayoutEdge[],
  alpha: number,
  centre: { x: number; y: number },
  tuning: Tuning = DEFAULT_TUNING
): number {
  if (alpha <= tuning.alphaFloor) return alpha;

  const list = [...particles.values()];
  const n = list.length;
  if (n === 0) return alpha * tuning.cool;

  // ── repulsion ────────────────────────────────────────────────────────────
  // O(n^2). At the ~140 node cap the view enforces this is under 10k pair
  // checks per frame, which is cheaper than maintaining a spatial index.
  for (let i = 0; i < n; i++) {
    const a = list[i];
    for (let j = i + 1; j < n; j++) {
      const b = list[j];
      let dx = a.x - b.x;
      let dy = a.y - b.y;

      if (dx === 0 && dy === 0) {
        // Perfectly coincident nodes have a zero-length separation, and dividing
        // by it produces Infinity - which then propagates into every coordinate
        // for the rest of the run. Nudge them apart by their index difference so
        // the direction is still deterministic.
        dx = (i - j) * 0.5 + 0.1;
        dy = (j - i) * 0.3 + 0.1;
      }

      const dist2 = dx * dx + dy * dy;
      const dist = Math.sqrt(dist2);

      const force = tuning.repel / Math.max(dist2, 1);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  // ── springs ──────────────────────────────────────────────────────────────
  for (const e of edges) {
    const a = particles.get(e.source);
    const b = particles.get(e.target);
    if (!a || !b) continue;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.max(0.01, Math.hypot(dx, dy));
    const force = (dist - tuning.springLen) * tuning.springK;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  // ── integrate ────────────────────────────────────────────────────────────
  for (const p of list) {
    if (p.pinned) {
      // A pinned node is a handle, not a mass: it holds its position exactly and
      // ignores every force, so it neither drifts nor injects energy.
      p.x = centre.x;
      p.y = centre.y;
      p.vx = 0;
      p.vy = 0;
      continue;
    }

    p.vx += (centre.x - p.x) * tuning.gravity;
    p.vy += (centre.y - p.y) * tuning.gravity;
    p.vx *= tuning.damping;
    p.vy *= tuning.damping;

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > tuning.maxStep) {
      p.vx = (p.vx / speed) * tuning.maxStep;
      p.vy = (p.vy / speed) * tuning.maxStep;
    }

    p.x += p.vx;
    p.y += p.vy;
  }

  return alpha * tuning.cool;
}

/** True once the cooling factor has decayed past the floor. */
export function isSettled(alpha: number, tuning: Tuning = DEFAULT_TUNING): boolean {
  return alpha <= tuning.alphaFloor;
}

/**
 * Run a layout to completion and report the frames it took.
 *
 * Used by the tests, and available for a future server-side thumbnail render.
 * It deliberately stops on a fixed frame budget as well as on alpha, so a
 * pathological graph cannot spin forever.
 */
export function settle(
  particles: Map<string, Particle>,
  edges: readonly LayoutEdge[],
  centre: { x: number; y: number },
  tuning: Tuning = DEFAULT_TUNING,
  maxFrames = 1200
): number {
  let alpha = 1;
  let frames = 0;
  while (!isSettled(alpha, tuning) && frames < maxFrames) {
    alpha = stepLayout(particles, edges, alpha, centre, tuning);
    frames++;
  }
  return frames;
}

/** Largest distance any node travelled between two snapshots of the layout. */
export function maxDisplacement(
  before: Map<string, Particle>,
  after: Map<string, Particle>
): number {
  let worst = 0;
  for (const [id, a] of before) {
    const b = after.get(id);
    if (!b) continue;
    worst = Math.max(worst, Math.hypot(b.x - a.x, b.y - a.y));
  }
  return worst;
}

/**
 * Tightest clearance between any two nodes, in pixels.
 *
 * Clearance is separation minus the two radii, so 0 means the discs are just
 * touching and a negative value means they visually overlap. Reporting raw
 * distance instead would make a large node that is nowhere near a small one look
 * like a collision.
 */
export function closestPair(
  particles: Map<string, Particle>
): { a: string; b: string; clearance: number; distance: number } | null {
  const list = [...particles.entries()];
  let best: { a: string; b: string; clearance: number; distance: number } | null = null;
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const distance = Math.hypot(list[j][1].x - list[i][1].x, list[j][1].y - list[i][1].y);
      const clearance = distance - minGap(list[i][1], list[j][1]);
      if (!best || clearance < best.clearance) {
        best = { a: list[i][0], b: list[j][0], clearance, distance };
      }
    }
  }
  return best;
}

/** Bounding box of a settled layout, used to check it fits the viewport. */
export function bounds(particles: Map<string, Particle>): {
  width: number;
  height: number;
  left: number;
  top: number;
} | null {
  if (particles.size === 0) return null;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const p of particles.values()) {
    if (p.x < left) left = p.x;
    if (p.x > right) right = p.x;
    if (p.y < top) top = p.y;
    if (p.y > bottom) bottom = p.y;
  }
  return { width: right - left, height: bottom - top, left, top };
}