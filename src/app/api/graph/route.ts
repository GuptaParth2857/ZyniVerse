import { NextRequest, NextResponse } from "next/server";
import { getAnimeCharacters, getCharacter, bestTitle } from "@/lib/anilist";
import {
  dedupe,
  degreesOfSeparation,
  neighbourhood,
  nodeId,
  parseNodeId,
  pruneDanglingEdges,
  shortestPaths,
  type Graph,
  type GraphEdge,
  type GraphNode,
} from "@/lib/graph";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * What a builder hands back. `failures` counts expansions that threw, and it is
 * surfaced to the client on purpose: a silent partial graph reads as "that is
 * all these characters share" when it actually means "we ran out of AniList
 * budget", which is a very different answer.
 */
interface Built {
  nodes: GraphNode[];
  edges: GraphEdge[];
  failures: number;
}

/**
 * AniList allows 30 requests/minute and this app runs ~500 prerendered pages
 * through the same client, so an unbounded graph walk would starve every other
 * route (and push the shared client into degraded mode, which serves stale
 * data). One expansion costs exactly one request, so the budget is
 * MAX_EXPANSIONS + 1.
 *
 * The in-memory AniList cache in `gql` has a 5-minute TTL, so repeat visits to
 * a popular seed are free. Raising this constant is the first thing to try if
 * the graph feels shallow, but not before the budget is measured.
 */
const MAX_EXPANSIONS = 6;

const CHARACTERS_PER_ANIME = 8;
const MEDIA_PER_CHARACTER = 14;

/**
 * AniList returns `name.userPreferred` but the declared `CharacterEdge.node`
 * type omits it, so read it through a permissive shape rather than casting at
 * every call site.
 */
function nameOf(
  name: { full?: string; native?: string; userPreferred?: string } | null | undefined,
  fallback = "Unknown"
): string {
  return name?.userPreferred || name?.full || name?.native || fallback;
}

function seedOf(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Accept the friendly `naruto`, `20`, `gojo` too, not just `anime:20`.
  if (trimmed.includes(":")) return trimmed;
  if (/^\d+$/.test(trimmed)) return nodeId("anime", Number(trimmed));
  return trimmed.toLowerCase().startsWith("character:")
    ? trimmed
    : nodeId("anime", trimmed);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const seed = seedOf(params.get("seed"));
  const to = seedOf(params.get("to"));
  const depth = params.get("depth") === "2" ? 2 : 1;

  if (!seed) {
    return NextResponse.json({ error: "Pass ?seed=anime:20 or ?seed=character:1234" }, { status: 400 });
  }
  const parsed = parseNodeId(seed);
  if (!parsed || !/^\d+$/.test(parsed.raw)) {
    return NextResponse.json({ error: "Seed must include a numeric AniList id." }, { status: 400 });
  }

  const target = to ? parseNodeId(to) : null;
  if (to && (!target || !/^\d+$/.test(target.raw))) {
    return NextResponse.json({ error: "?to= also needs a numeric AniList id." }, { status: 400 });
  }

  let viewDepth = depth;

  let built: Built;
  try {
    built = parsed.type === "character" ? await fromCharacter(parsed.raw) : await fromAnime(parsed.raw);
  } catch {
    return NextResponse.json(
      { error: "Could not load that seed from AniList. It may not exist, or AniList is rate limiting us." },
      { status: 502 }
    );
  }

  const cleaned = pruneDanglingEdges(dedupe({ nodes: built.nodes, edges: built.edges }));
  if (cleaned.nodes.length === 0) {
    return NextResponse.json({ error: "That seed has no connections we can show." }, { status: 404 });
  }

  // Resolve the target hop count before slicing the view, so a route the API
  // promises to return is always drawable by the page. Filtering first would
  // leave the highlight spanning nodes that were never sent.
  let hops: number | null = null;
  let routes: string[][] | null = null;
  if (to) {
    hops = degreesOfSeparation(cleaned.edges, seed, to, 4);
    if (hops !== null) {
      routes = shortestPaths(cleaned.edges, seed, to, { maxHops: 4, maxPaths: 6 })?.alternatives ?? null;
      if (hops > viewDepth) viewDepth = hops;
    }
  }

  const view = neighbourhood(cleaned, seed, viewDepth);
  const centre = cleaned.nodes.find((n) => n.id === seed);

  const payload: Record<string, unknown> = {
    seed,
    centre,
    nodes: view.nodes,
    edges: view.edges,
    total: cleaned.nodes.length,
    budget: MAX_EXPANSIONS + 1,
    failures: built.failures,
    depth: viewDepth,
  };

  if (to) {
    payload.to = to;
    payload.hops = hops;
    payload.routes = routes;
    // AniList only gives us a neighbourhood, not the whole catalogue, so "not
    // connected" really means "not connected within what we could afford to
    // fetch". Say so rather than pretending the two are the same.
    payload.exhaustive = false;
    payload.hint =
      hops === null
        ? `No route within 4 hops inside the ${cleaned.nodes.length} nodes we could load (AniList budget is ${MAX_EXPANSIONS + 1} requests).`
        : undefined;
    payload.depthForced = hops !== null && viewDepth > depth;
  }

  return NextResponse.json(payload);
}

/** Character seed: their anime, then the cast of the most popular of those. */
async function fromCharacter(id: string): Promise<Built> {
  const detail = await getCharacter(id);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let failures = 0;

  const cid = nodeId("character", detail.id);
  nodes.push({
    id: cid,
    type: "character",
    label: nameOf(detail.name),
    href: `/character/${detail.id}`,
    image: detail.image?.large ?? detail.image?.medium ?? null,
    weight: detail.favourites ?? 0,
  });

  const media = [...(detail.media?.edges ?? [])]
    .filter((e) => e.node)
    .sort((a, b) => (b.node.popularity ?? 0) - (a.node.popularity ?? 0))
    .slice(0, MEDIA_PER_CHARACTER);

  for (const e of media) {
    const aid = nodeId("anime", e.node.id);
    nodes.push({
      id: aid,
      type: "anime",
      label: bestTitle(e.node.title),
      href: `/anime/${e.node.id}`,
      image: e.node.coverImage?.large ?? null,
      weight: e.node.popularity ?? 0,
    });
    edges.push({ source: cid, target: aid, kind: "appears-in", weight: 1 });
  }

  await Promise.all(
    media.slice(0, MAX_EXPANSIONS).map(async (e) => {
      try {
        const res = await getAnimeCharacters(e.node.id, 1, CHARACTERS_PER_ANIME);
        // Recomputed here rather than closed over: `aid` above is scoped to the
        // loop body, and referencing it from this callback threw a
        // ReferenceError that the catch below silently swallowed, so every
        // expansion failed and the graph came back as one flat cast list.
        const aid = nodeId("anime", e.node.id);
        for (const edge of res.edges ?? []) {
          const other = edge.node;
          if (!other) continue;
          const oid = nodeId("character", other.id);
          nodes.push({
            id: oid,
            type: "character",
            label: nameOf(other.name, edge.name),
            href: `/character/${other.id}`,
            image: other.image?.large ?? other.image?.medium ?? null,
            weight: other.favourites ?? 0,
          });
          // The bridge that makes "six degrees" possible at all: two characters
          // never link directly, they share a show.
          edges.push({ source: oid, target: aid, kind: "appears-in", weight: 1 });
        }
      } catch {
        failures++;
      }
    })
  );

  return { nodes, edges, failures };
}

/** Anime seed: its cast, then the other shows those characters appear in. */
async function fromAnime(id: string): Promise<Built> {
  const res = await getAnimeCharacters(id, 1, 25);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let failures = 0;

  const aid = nodeId("anime", res.id);
  nodes.push({
    id: aid,
    type: "anime",
    label: bestTitle(res.title),
    href: `/anime/${res.id}`,
    image: res.coverImage?.large ?? null,
    weight: 0,
  });

  const cast = [...(res.edges ?? [])]
    .filter((e) => e.node)
    .sort((a, b) => (b.node.favourites ?? 0) - (a.node.favourites ?? 0))
    .slice(0, 16);

  for (const e of cast) {
    const other = e.node;
    const cid = nodeId("character", other.id);
    nodes.push({
      id: cid,
      type: "character",
      label: nameOf(other.name, e.name),
      href: `/character/${other.id}`,
      image: other.image?.large ?? other.image?.medium ?? null,
      weight: other.favourites ?? 0,
    });
    edges.push({ source: cid, target: aid, kind: "appears-in", weight: 1 });
  }

  await Promise.all(
    cast.slice(0, MAX_EXPANSIONS).map(async (e) => {
      try {
        const detail = await getCharacter(e.node.id);
        // Same scoping trap as `fromCharacter`: `cid` is local to the loop body
        // above, so it has to be recomputed inside this callback.
        const cid = nodeId("character", e.node.id);
        const others = [...(detail.media?.edges ?? [])]
          .filter((m) => m.node && m.node.id !== Number(id))
          .sort((a, b) => (b.node.popularity ?? 0) - (a.node.popularity ?? 0))
          .slice(0, 6);
        for (const m of others) {
          const otherId = nodeId("anime", m.node.id);
          nodes.push({
            id: otherId,
            type: "anime",
            label: bestTitle(m.node.title),
            href: `/anime/${m.node.id}`,
            image: m.node.coverImage?.large ?? null,
            weight: m.node.popularity ?? 0,
          });
          edges.push({ source: cid, target: otherId, kind: "appears-in", weight: 1 });
        }
      } catch {
        failures++;
      }
    })
  );

  return { nodes, edges, failures };
}