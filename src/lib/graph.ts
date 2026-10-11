/**
 * Knowledge-graph primitives for "six degrees of anime".
 *
 * Everything in this file is pure: no network, no React, no Prisma. The API
 * route assembles a graph from AniList and hands it to these functions; the
 * page renders whatever comes back. Keeping the traversal logic pure is what
 * makes it testable, and the traversal *is* the product here - a pretty canvas
 * is worthless if the path it claims to find does not actually exist.
 */

export type NodeType = "character" | "anime" | "studio" | "genre";

export interface GraphNode {
  /** Namespaced and stable: `character:1234`, `anime:20`, `studio:1`. */
  id: string;
  type: NodeType;
  label: string;
  href?: string;
  image?: string | null;
  /**
   * How prominent this node is (AniList popularity or favourites). Used for
   * sizing and for ordering expansion, not for traversal priority.
   */
  weight: number;
}

export type EdgeKind =
  | "appears-in"
  | "voiced-by"
  | "related"
  | "same-studio"
  | "same-genre"
  | "sequel"
  | "prequel";

export interface GraphEdge {
  source: string;
  target: string;
  kind: EdgeKind;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Namespaced id helper, so `anime:20` and `character:20` never collide. */
export function nodeId(type: NodeType, id: number | string): string {
  return `${type}:${id}`;
}

export function parseNodeId(id: string): { type: NodeType; raw: string } | null {
  const at = id.indexOf(":");
  if (at <= 0) return null;
  const type = id.slice(0, at);
  if (type !== "character" && type !== "anime" && type !== "studio" && type !== "genre") {
    return null;
  }
  return { type, raw: id.slice(at + 1) };
}

/**
 * Undirected adjacency map.
 *
 * Relations are undirected on purpose: the interesting question is "how are
 * these connected", not "which arrow points where". Directed edges would make
 * `6 degrees` fail constantly, because a character *appears in* an anime but an
 * anime does not *appear in* a character.
 *
 * Neighbour lists are kept sorted so traversal order - and therefore which of
 * several equal-length paths is returned - is deterministic. Without this, two
 * identical requests can return different "shortest" paths, which is miserable
 * to cache and impossible to test.
 */
export function toAdjacency(edges: readonly GraphEdge[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    let set = adj.get(a);
    if (!set) {
      set = new Set();
      adj.set(a, set);
    }
    set.add(b);
  };
  for (const e of edges) {
    if (e.source === e.target) continue;
    link(e.source, e.target);
    link(e.target, e.source);
  }
  for (const set of adj.values()) {
    const sorted = [...set].sort();
    set.clear();
    for (const v of sorted) set.add(v);
  }
  return adj;
}

export interface PathResult {
  /** Node ids from `from` to `to`, inclusive. */
  path: string[];
  /** Number of hops. `0` means the same node. */
  hops: number;
  /** Every shortest path, when several tie. Capped for safety. */
  alternatives: string[][];
}

/**
 * Shortest path between two nodes, breadth first.
 *
 * Collects every minimal path rather than only the first one found, because
 * "Gojo is 3 hops from Naruto" is a much weaker answer than "here are the three
 * ways he gets there in 3 hops".
 */
export function shortestPaths(
  edges: readonly GraphEdge[],
  from: string,
  to: string,
  opts: { maxHops?: number; maxPaths?: number } = {}
): PathResult | null {
  const maxHops = opts.maxHops ?? 6;
  const maxPaths = opts.maxPaths ?? 8;

  if (from === to) return { path: [from], hops: 0, alternatives: [[from]] };

  const adj = toAdjacency(edges);
  if (!adj.has(from) || !adj.has(to)) return null;

  const found: string[][] = [];
  const queue: string[][] = [[from]];
  const seen = new Set<string>([from]);

  for (let depth = 0; depth < maxHops && found.length < maxPaths; depth++) {
    const next: string[][] = [];
    for (const path of queue) {
      const tail = path[path.length - 1];
      for (const neighbour of adj.get(tail) ?? []) {
        if (seen.has(neighbour)) continue;
        const extended = [...path, neighbour];
        if (neighbour === to) {
          found.push(extended);
          if (found.length >= maxPaths) break;
          continue;
        }
        next.push(extended);
      }
      if (found.length >= maxPaths) break;
    }
    // Everything at this depth is committed; only these may expand further.
    for (const p of next) seen.add(p[p.length - 1]);
    queue.length = 0;
    queue.push(...next);
    if (found.length > 0) break;
  }

  if (found.length === 0) return null;
  found.sort((a, b) => (a[a.length - 1] < b[b.length - 1] ? -1 : 1));
  return { path: found[0], hops: found[0].length - 1, alternatives: found };
}

/** Hop count only, or `null` when unreachable within `maxHops`. */
export function degreesOfSeparation(
  edges: readonly GraphEdge[],
  from: string,
  to: string,
  maxHops = 6
): number | null {
  if (from === to) return 0;
  const adj = toAdjacency(edges);
  if (!adj.has(from) || !adj.has(to)) return null;
  const seen = new Set<string>([from]);
  let frontier = [from];
  for (let depth = 1; depth <= maxHops; depth++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const n of adj.get(id) ?? []) {
        if (seen.has(n)) continue;
        if (n === to) return depth;
        seen.add(n);
        next.push(n);
      }
    }
    if (next.length === 0) return null;
    frontier = next;
  }
  return null;
}

/**
 * Every node within `depth` hops of `center`, plus the edges between them.
 *
 * This is what the canvas renders. Filtering to the neighbourhood matters: a
 * connected component can hold far more nodes than a visualisation can usefully
 * draw, and the edges leaving the neighbourhood are noise.
 */
export function neighbourhood(
  graph: Graph,
  center: string,
  depth: number,
  cap = 140
): Graph {
  const adj = toAdjacency(graph.edges);
  const keep = new Set<string>([center]);
  const seen = new Set<string>([center]);
  let frontier = [center];

  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const n of adj.get(id) ?? []) {
        if (seen.has(n)) continue;
        seen.add(n);
        if (keep.size < cap) {
          keep.add(n);
          next.push(n);
        }
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }

  const nodes = graph.nodes.filter((n) => keep.has(n.id));
  const edges = graph.edges.filter((e) => keep.has(e.source) && keep.has(e.target));
  return { nodes, edges };
}

/**
 * Merge duplicated nodes/edges while preserving first-seen order.
 *
 * BFS expansion visits the same character through several anime, and AniList
 * happily returns the same relation twice. Without this the canvas renders
 * stacked labels on identical coordinates.
 */
export function dedupe(graph: Graph): Graph {
  const nodes: GraphNode[] = [];
  const nodeIds = new Set<string>();
  for (const n of graph.nodes) {
    if (nodeIds.has(n.id)) continue;
    nodeIds.add(n.id);
    nodes.push(n);
  }

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  for (const e of graph.edges) {
    const a = e.source < e.target ? e.source : e.target;
    const b = e.source < e.target ? e.target : e.source;
    const key = `${a}|${b}|${e.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push(e);
  }
  return { nodes, edges };
}

/** Drop edges that reference a node the graph does not contain. */
export function pruneDanglingEdges(graph: Graph): Graph {
  const ids = new Set(graph.nodes.map((n) => n.id));
  return { nodes: graph.nodes, edges: graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target)) };
}

/** Anything a prominence score can be derived from. */
export interface Weighed {
  id: string;
  type: NodeType;
  weight: number;
}

/**
 * Rescale prominence into 0..1 *within each node type*.
 *
 * The raw numbers cannot be compared across types. A character's `favourites`
 * tops out around 21,000 while an anime's `popularity` runs to 600,000+, so
 * plotting both against one maximum made every character collapse to the same
 * tiny dot: measured on a 27-node Naruto graph, 19 of 27 nodes landed under a
 * 7px radius and were indistinguishable. Normalising per type means the most
 * prominent character and the most prominent anime both reach 1.0, and the
 * spread within each type is preserved.
 *
 * Ranks rather than a min/max ratio, because these distributions are extremely
 * long-tailed - a single Naruto-scale anime would otherwise compress everything
 * else into the bottom 1% of the range.
 *
 * The seed is held at or above the 70th percentile of its own type. It is the
 * thing the user asked about and the hub every edge radiates from, so it must
 * not render as the smallest node on screen. That was happening for real: the
 * anime seed was sent with `weight: 0`, which put Naruto at the minimum radius
 * while all sixteen of its characters drew larger.
 */
export function normaliseProminence(
  nodes: readonly Weighed[],
  opts: { seed?: string; seedFloor?: number } = {}
): Map<string, number> {
  const out = new Map<string, number>();
  const seedFloor = opts.seedFloor ?? 0.7;

  const byType = new Map<NodeType, Weighed[]>();
  for (const n of nodes) {
    const list = byType.get(n.type);
    if (list) list.push(n);
    else byType.set(n.type, [n]);
  }

  for (const group of byType.values()) {
    // Ascending, ties broken by id so the same graph always sizes identically.
    const sorted = [...group].sort((a, b) => a.weight - b.weight || a.id.localeCompare(b.id));
    const distinct = new Set(sorted.map((n) => n.weight));

    for (let i = 0; i < sorted.length; i++) {
      // Every node of this type carries the same raw weight (a one-node graph, or
      // a type whose members AniList reports identically). There is no ranking
      // information to extract, so treat them as equally prominent rather than
      // letting position in the array decide.
      const score = distinct.size === 1 ? 1 : i / (sorted.length - 1);
      out.set(sorted[i].id, score);
    }
  }

  if (opts.seed) {
    const seedNode = nodes.find((n) => n.id === opts.seed);
    if (seedNode) out.set(opts.seed, Math.max(out.get(opts.seed) ?? 0, seedFloor));
  }

  return out;
}