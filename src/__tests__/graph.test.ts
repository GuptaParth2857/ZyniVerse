import { describe, expect, it } from "vitest";
import {
  dedupe,
  degreesOfSeparation,
  neighbourhood,
  nodeId,
  parseNodeId,
  pruneDanglingEdges,
  shortestPaths,
  toAdjacency,
  type Graph,
  type GraphEdge,
} from "@/lib/graph";

const edge = (s: string, t: string, kind: GraphEdge["kind"] = "appears-in"): GraphEdge => ({
  source: s,
  target: t,
  kind,
  weight: 1,
});

// A small hand-built universe. `character:goku` reaches `anime:3` by two
// different 3-hop routes:
//   goku -> anime:2 -> boruto -> anime:3      (through a shared anime)
//   goku -> anime:9 -> yamato -> anime:3      (through another one)
// A 2-hop route does not exist, which is the assertion that matters: a naive
// "first path found wins" BFS would report 3 here too, but one that forgets to
// mark nodes seen would happily report a longer walk as a shorter one.
const chain: GraphEdge[] = [
  edge("anime:1", "character:goku"),
  edge("anime:2", "character:goku"),
  edge("anime:9", "character:goku"),
  edge("anime:2", "anime:1"),
  edge("anime:3", "character:yamato"),
  edge("anime:3", "character:boruto"),
  edge("anime:2", "character:boruto"),
  edge("anime:9", "character:yamato"),
];

describe("node ids", () => {
  it("namespaces so anime:20 and character:20 do not collide", () => {
    expect(nodeId("anime", 20)).toBe("anime:20");
    expect(nodeId("character", 20)).toBe("character:20");
  });

  it("round-trips", () => {
    expect(parseNodeId("anime:20")).toEqual({ type: "anime", raw: "20" });
  });

  it("rejects junk", () => {
    expect(parseNodeId("anime")).toBeNull();
    expect(parseNodeId("")).toBeNull();
    expect(parseNodeId("user:5")).toBeNull();
  });
});

describe("toAdjacency", () => {
  it("treats edges as undirected", () => {
    const adj = toAdjacency([edge("a", "b")]);
    expect(adj.get("a")?.has("b")).toBe(true);
    expect(adj.get("b")?.has("a")).toBe(true);
  });

  it("ignores self-loops", () => {
    expect(toAdjacency([edge("a", "a")]).size).toBe(0);
  });

  it("sorts neighbours so traversal is deterministic", () => {
    const adj = toAdjacency([edge("a", "z"), edge("a", "m"), edge("a", "b")]);
    expect([...adj.get("a")!]).toEqual(["b", "m", "z"]);
  });

  it("returns the same ordering regardless of input order", () => {
    const one = toAdjacency([edge("a", "c"), edge("a", "b")]);
    const two = toAdjacency([edge("a", "b"), edge("a", "c")]);
    expect([...one.get("a")!]).toEqual([...two.get("a")!]);
  });
});

describe("shortestPaths", () => {
  it("treats the same node as zero hops", () => {
    const r = shortestPaths(chain, "character:goku", "character:goku");
    expect(r).toEqual({ path: ["character:goku"], hops: 0, alternatives: [["character:goku"]] });
  });

  it("finds the direct route", () => {
    expect(shortestPaths(chain, "anime:1", "anime:2")!.hops).toBe(1);
  });

  it("prefers the shortest route, and 3 really is the shortest here", () => {
    const r = shortestPaths(chain, "character:goku", "anime:3")!;
    // 2 hops would need goku to share an anime with yamato, or to be in anime:3.
    expect(r.hops).toBe(3);
    expect(r.path).toHaveLength(r.hops + 1);
  });

  it("collects every equally short route", () => {
    const r = shortestPaths(chain, "character:goku", "anime:3")!;
    const shapes = r.alternatives.map((p) => p.join(">"));
    expect(shapes).toContain("character:goku>anime:2>character:boruto>anime:3");
    expect(shapes).toContain("character:goku>anime:9>character:yamato>anime:3");
    expect(r.alternatives).toHaveLength(2);
    expect(r.alternatives.every((p) => p.length === r.hops + 1)).toBe(true);
  });

  it("never reports a hop count below the true distance", () => {
    // Guards against a traversal that forgets its `seen` set and walks a cycle
    // while still claiming progress.
    for (const [a, b] of [
      ["anime:1", "anime:3"],
      ["character:goku", "anime:3"],
      ["character:boruto", "anime:9"],
    ] as const) {
      const hops = degreesOfSeparation(chain, a, b);
      expect(hops).not.toBeNull();
      expect(hops!).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns null for disconnected nodes", () => {
    expect(shortestPaths([edge("a", "b")], "a", "zzz")).toBeNull();
  });

  it("respects maxHops", () => {
    const long: GraphEdge[] = [edge("a", "b"), edge("b", "c"), edge("c", "d"), edge("d", "e")];
    expect(shortestPaths(long, "a", "e", { maxHops: 2 })).toBeNull();
    expect(shortestPaths(long, "a", "e", { maxHops: 4 })!.hops).toBe(4);
  });

  it("caps the number of alternatives", () => {
    const hub = "hub";
    const spokes = Array.from({ length: 20 }, (_, i) => edge(hub, `s${i}`));
    const many: GraphEdge[] = [edge("start", hub), ...spokes, edge("goal", hub)];
    const r = shortestPaths(many, "start", "goal", { maxPaths: 3 })!;
    expect(r.alternatives.length).toBeLessThanOrEqual(3);
  });

  it("walks the graph undirected, so anime finds its characters too", () => {
    expect(shortestPaths(chain, "anime:1", "character:goku")!.hops).toBe(1);
  });
});

describe("degreesOfSeparation", () => {
  it("agrees with shortestPaths", () => {
    for (const [a, b] of [
      ["anime:1", "anime:3"],
      ["character:goku", "anime:2"],
      ["anime:1", "character:boruto"],
    ] as const) {
      expect(degreesOfSeparation(chain, a, b)).toBe(shortestPaths(chain, a, b)!.hops);
    }
  });

  it("is zero for the same node and null when unreachable", () => {
    expect(degreesOfSeparation(chain, "anime:1", "anime:1")).toBe(0);
    expect(degreesOfSeparation([edge("a", "b")], "a", "q")).toBeNull();
  });
});

describe("neighbourhood", () => {
  const graph: Graph = {
    nodes: [
      { id: "anime:1", type: "anime", label: "One", weight: 1 },
      { id: "anime:2", type: "anime", label: "Two", weight: 1 },
      { id: "anime:3", type: "anime", label: "Three", weight: 1 },
      { id: "anime:9", type: "anime", label: "Nine", weight: 1 },
      { id: "character:goku", type: "character", label: "Goku", weight: 9 },
      { id: "character:yamato", type: "character", label: "Yamato", weight: 5 },
      { id: "character:boruto", type: "character", label: "Boruto", weight: 3 },
    ],
    edges: chain,
  };

  it("includes the centre at depth 0", () => {
    expect(neighbourhood(graph, "character:goku", 0).nodes.map((n) => n.id)).toEqual([
      "character:goku",
    ]);
  });

  it("only returns edges whose endpoints both survive", () => {
    const one = neighbourhood(graph, "character:goku", 1);
    const ids = new Set(one.nodes.map((n) => n.id));
    for (const e of one.edges) {
      expect(ids.has(e.source) && ids.has(e.target)).toBe(true);
    }
  });

  it("grows with depth", () => {
    const shallow = neighbourhood(graph, "anime:2", 1).nodes.length;
    const deep = neighbourhood(graph, "anime:2", 3).nodes.length;
    expect(deep).toBeGreaterThan(shallow);
  });

  it("honours the cap", () => {
    const wide: Graph = {
      nodes: Array.from({ length: 300 }, (_, i) => ({
        id: `n${i}`,
        type: "anime" as const,
        label: `N${i}`,
        weight: 1,
      })),
      edges: Array.from({ length: 299 }, (_, i) => edge("n0", `n${i + 1}`)),
    };
    expect(neighbourhood(wide, "n0", 5, 20).nodes.length).toBeLessThanOrEqual(20);
  });
});

describe("dedupe", () => {
  it("drops repeated nodes keeping first-seen order", () => {
    const g: Graph = {
      nodes: [
        { id: "a", type: "anime", label: "A", weight: 1 },
        { id: "b", type: "anime", label: "B", weight: 1 },
        { id: "a", type: "anime", label: "A again", weight: 2 },
      ],
      edges: [],
    };
    const out = dedupe(g);
    expect(out.nodes).toHaveLength(2);
    expect(out.nodes[0].label).toBe("A");
  });

  it("treats an edge as the same however it is oriented", () => {
    const g: Graph = {
      nodes: [
        { id: "a", type: "anime", label: "A", weight: 1 },
        { id: "b", type: "anime", label: "B", weight: 1 },
      ],
      edges: [edge("a", "b"), edge("b", "a")],
    };
    expect(dedupe(g).edges).toHaveLength(1);
  });

  it("keeps genuinely different edge kinds between the same pair", () => {
    const g: Graph = {
      nodes: [
        { id: "a", type: "anime", label: "A", weight: 1 },
        { id: "b", type: "anime", label: "B", weight: 1 },
      ],
      edges: [edge("a", "b", "appears-in"), edge("a", "b", "sequel")],
    };
    expect(dedupe(g).edges).toHaveLength(2);
  });
});

describe("pruneDanglingEdges", () => {
  it("removes edges pointing at nodes that are absent", () => {
    const g: Graph = {
      nodes: [{ id: "a", type: "anime", label: "A", weight: 1 }],
      edges: [edge("a", "ghost"), edge("ghost", "phantom")],
    };
    expect(pruneDanglingEdges(g).edges).toEqual([]);
  });
});