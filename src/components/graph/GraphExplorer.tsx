"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import EntityPicker, { type EntityPick } from "@/components/graph/EntityPicker";
import type { GraphEdge, GraphNode } from "@/lib/graph";

// The canvas is the only thing here that needs a real 2D surface; skipping SSR
// keeps the first paint from shipping an empty <canvas> that immediately jumps.
const GraphCanvas = dynamic(() => import("@/components/graph/GraphCanvas"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[58vh] min-h-[380px] items-center justify-center rounded-xl border text-sm"
      style={{ borderColor: "var(--color-line)", color: "var(--color-mute)" }}
    >
      Preparing the canvas…
    </div>
  ),
});

interface Payload {
  seed: string;
  centre: GraphNode | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  total: number;
  budget: number;
  failures: number;
  depth: number;
  depthForced?: boolean;
  to?: string;
  hops?: number | null;
  routes?: string[][] | null;
  hint?: string;
  error?: string;
}

const PRESETS: Array<{ label: string; seed: string; to?: string }> = [
  { label: "Naruto → Boruto", seed: "anime:20", to: "anime:97938" },
  { label: "Gojo → Goku", seed: "character:987", to: "character:1582" },
  { label: "Naruto → One Piece", seed: "anime:20", to: "anime:21" },
  { label: "Luffy only", seed: "character:1313" },
];

export default function GraphPage() {
  const router = useRouter();

  // Naruto is the most connected thing on AniList, so the first picture is
  // never sparse. Lazy initial value rather than an effect: an effect that
  // sets state on mount costs an extra render pass before anything is drawn.
  const [seed, setSeed] = useState<EntityPick | null>(() => ({
    id: "anime:20",
    label: "Naruto",
    sub: "Anime",
    image: null,
  }));
  const [target, setTarget] = useState<EntityPick | null>(null);
  const [depth, setDepth] = useState<1 | 2>(1);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const seedId = seed?.id ?? "";
  const targetId = target?.id ?? "";

  useEffect(() => {
    if (!seedId) return;
    let cancelled = false;
    // Legitimate effect case: this mirrors an external system (the /api/graph
    // endpoint) and its pending flag has no other place to live, since the
    // request is keyed on three inputs rather than one event.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    const qs = new URLSearchParams({ seed: seedId, depth: String(depth) });
    if (targetId) qs.set("to", targetId);

    fetch(`/api/graph?${qs}`)
      .then(async (r) => {
        const body = (await r.json()) as Payload;
        if (cancelled) return;
        if (!r.ok) {
          setError(body.error ?? `Request failed (${r.status})`);
          setData(null);
          return;
        }
        setData(body);
        // Keep the URL shareable without going through the router, which would
        // re-render the whole route and restart the canvas for a query change.
        window.history.replaceState(null, "", `/graph?${qs}`);
      })
      .catch(() => {
        if (!cancelled) setError("Network error while building the graph.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [seedId, targetId, depth]);

  const go = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const bestRoute = data?.routes?.[0] ?? null;
  const routeLabels = bestRoute
    ? bestRoute.map((id) => data?.nodes.find((n) => n.id === id)?.label ?? id.replace(":", " #"))
    : [];
  // A route can only be highlighted if every hop made it into the view.
  const routeDrawable = bestRoute !== null && bestRoute.every((id) => data?.nodes.some((n) => n.id === id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Knowledge <span style={{ color: "var(--color-cyan)" }}>Graph</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--color-mute)" }}>
          Pick a character or a show, then measure how many steps it is from something else. Two characters
          are never linked directly — they are connected by the shows they share, which is exactly what makes
          the distance interesting.
        </p>
      </header>

      <section className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
            Start from
          </span>
          <EntityPicker
            value={seed}
            onChange={setSeed}
            placeholder="Search a character or anime…"
            accent="var(--color-cyan)"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
            Degrees to (optional)
          </span>
          <EntityPicker
            value={target}
            onChange={setTarget}
            placeholder="Compare against…"
            accent="var(--color-amber)"
            enabled={Boolean(seedId)}
          />
        </label>

        <div className="flex items-end">
          <div
            className="flex rounded-lg border p-0.5"
            style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
            role="group"
            aria-label="Expansion depth"
          >
            {([1, 2] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                aria-pressed={depth === d}
                className="rounded-md px-3 py-2 text-xs font-medium"
                style={
                  depth === d
                    ? { background: "var(--color-violet)", color: "#fff" }
                    : { color: "var(--color-mute)" }
                }
              >
                Depth {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
          Try
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setSeed({ id: p.seed, label: p.label, sub: "", image: null });
              setTarget(p.to ? { id: p.to, label: "…", sub: "", image: null } : null);
            }}
            className="rounded-full border px-3 py-1 text-xs transition hover:border-white/30"
            style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
          >
            {p.label}
          </button>
        ))}
      </section>

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "rgba(255,45,120,0.4)", background: "rgba(255,45,120,0.08)", color: "var(--color-ink)" }}
        >
          {error}
        </div>
      )}

      {data && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs" style={{ color: "var(--color-mute)" }}>
          <span>
            <strong style={{ color: "var(--color-ink)" }}>{data.nodes.length}</strong> nodes drawn
            {data.total > data.nodes.length && (
              <>
                {" "}of{" "}
                <strong style={{ color: "var(--color-ink)" }}>{data.total}</strong> loaded
              </>
            )}
          </span>
          <span>
            AniList budget <strong style={{ color: "var(--color-ink)" }}>{data.budget}</strong> requests
          </span>
          {data.failures > 0 && (
            <span style={{ color: "var(--color-amber)" }}>
              {data.failures} expansion{data.failures === 1 ? "" : "s"} failed — the graph is incomplete
            </span>
          )}
          {data.depthForced && (
            <span style={{ color: "var(--color-violet)" }}>
              depth widened to {data.depth} so the route fits
            </span>
          )}
          {loading && <span style={{ color: "var(--color-cyan)" }}>rebuilding…</span>}
        </div>
      )}

      {data && data.hops !== undefined && (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            borderColor: routeDrawable ? "rgba(255,176,32,0.45)" : "var(--color-line)",
            background: "var(--color-panel)",
          }}
        >
          {data.hops === null ? (
            <>
              <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                No route found
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-mute)" }}>
                {data.hint}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                {data.hops === 0 ? (
                  <>You picked the same node.</>
                ) : (
                  <>
                    <span style={{ color: "var(--color-amber)" }}>{data.hops}</span> degree
                    {data.hops === 1 ? "" : "s"} of separation
                    {data.routes && data.routes.length > 1 && (
                      <span style={{ color: "var(--color-mute)" }}>
                        {" "}
                        · {data.routes.length} equally short routes
                      </span>
                    )}
                  </>
                )}
              </p>
              {routeLabels.length > 1 && (
                <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {routeLabels.map((label, i) => (
                    <li key={`${label}-${i}`} className="flex items-center gap-1.5">
                      {i > 0 && <span style={{ color: "var(--color-mute)" }}>→</span>}
                      <span
                        className="rounded px-2 py-0.5"
                        style={{
                          background: i === 0 || i === routeLabels.length - 1 ? "rgba(255,176,32,0.14)" : "rgba(255,255,255,0.05)",
                          color: "var(--color-ink)",
                        }}
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-2 text-[11px]" style={{ color: "var(--color-mute)" }}>
                Measured inside the {data.total} nodes we could afford to fetch, not across the whole catalogue —
                a longer route may exist one AniList request further out.
              </p>
            </>
          )}
        </div>
      )}

      {data ? (
        <GraphCanvas
          nodes={data.nodes}
          edges={data.edges}
          seed={data.seed}
          route={routeDrawable ? bestRoute : null}
          onNavigate={go}
        />
      ) : (
        <div
          className="flex h-[58vh] min-h-[380px] items-center justify-center rounded-xl border text-sm"
          style={{ borderColor: "var(--color-line)", color: "var(--color-mute)" }}
        >
          {loading ? "Building the graph…" : "Pick a starting point to begin."}
        </div>
      )}

      {data && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            Everything in this picture
          </h2>
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {[...data.nodes]
              .sort((a, b) => b.weight - a.weight)
              .map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href ?? "#"}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:border-white/25"
                    style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: n.type === "anime" ? "var(--color-cyan)" : "var(--color-magenta)" }}
                    />
                    <span className="min-w-0 flex-1 truncate">{n.label}</span>
                    <span className="shrink-0 text-[11px]" style={{ color: "var(--color-mute)" }}>
                      {n.type}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </main>
  );
}