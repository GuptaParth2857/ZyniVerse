"use client";

/**
 * Dependency-free force-directed canvas for the anime knowledge graph.
 *
 * No d3 / react-force-graph: pulling those in for ~120 nodes would add far more
 * bundle than the whole rest of this feature, and a force layout is about 80
 * lines of physics anyway. Everything runs in a single rAF loop against refs,
 * never React state, so the graph animates without re-rendering the tree.
 *
 * The physics itself lives in `@/lib/force-layout`, which is pure and unit
 * tested. This file owns only what genuinely needs a browser: the 2D context,
 * the rAF loop, and hit testing.
 */

import { useCallback, useEffect, useRef } from "react";
import type { GraphEdge, GraphNode } from "@/lib/graph";
import {
  isSettled,
  seedLayout,
  stepLayout,
  type Particle,
} from "@/lib/force-layout";

const TYPE_COLOR: Record<string, string> = {
  anime: "#29f2e0",
  character: "#ff2d78",
  studio: "#ffb020",
  genre: "#8a5cff",
};

const INK = "#f0eef8";
const MUTE = "#807ba3";
const LINE = "#1f1d33";
const ROUTE = "#ffb020";

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  seed: string;
  /** Node ids making up the highlighted route, in order. Null when not asked. */
  route: string[] | null;
  onNavigate: (href: string) => void;
}

export default function GraphCanvas({ nodes, edges, seed, route, onNavigate }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const parts = useRef<Map<string, Particle>>(new Map());
  const view = useRef({ w: 800, h: 600, scale: 1, ox: 0, oy: 0 });
  const alpha = useRef(1);
  const hover = useRef<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const pan = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  /** Read by the rAF loop so highlight state can change without a rebuild. */
  const routeRef = useRef<Set<string>>(new Set());
  const edgeRoute = useRef<Set<string>>(new Set());
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  // Rebuild the particle layout when the graph itself changes.
  useEffect(() => {
    // Seeded from a golden-angle spiral rather than Math.random() so the same
    // graph always settles into the same picture - otherwise every visit
    // reshuffles and a shared URL looks like a different graph each time.
    parts.current = seedLayout(nodes, seed);
    alpha.current = 1;
  }, [nodes, seed]);

  useEffect(() => {
    const set = new Set(route ?? []);
    routeRef.current = set;
    edgeRoute.current = new Set();
    for (let i = 0; i < (route?.length ?? 0) - 1; i++) {
      const a = route![i];
      const b = route![i + 1];
      edgeRoute.current.add(a < b ? `${a}|${b}` : `${b}|${a}`);
    }
    // Re-heat so the route "pops" into place instead of fading in on a frozen
    // canvas that has already stopped ticking.
    alpha.current = Math.max(alpha.current, 0.55);
  }, [route]);

  // Render loop. Repaints on demand: while alpha is alive, every frame; once
  // settled it parks and only redraws when something asks it to.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let alive = true;
    let dirty = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = Math.max(320, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.current.w = w;
      view.current.h = h;
      dirty = true;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const step = () => {
      const map = parts.current;
      const cx = view.current.w / 2;
      const cy = view.current.h / 2;

      alpha.current = stepLayout(map, edges, alpha.current, { x: cx, y: cy });

      // --- draw ---------------------------------------------------------
      ctx.clearRect(0, 0, view.current.w, view.current.h);
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, view.current.w, view.current.h);

      const hasRoute = routeRef.current.size > 0;

      // Pan/zoom lives in the transform, not in the particle coordinates.
      // Rescaling the particles instead would fight the physics every frame and
      // make dragged nodes drift away from the cursor.
      ctx.save();
      ctx.translate(view.current.ox, view.current.oy);
      ctx.scale(view.current.scale, view.current.scale);

      for (const e of edges) {
        const a = map.get(e.source);
        const b = map.get(e.target);
        if (!a || !b) continue;
        const key = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
        const lit = edgeRoute.current.has(key);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = lit ? ROUTE : hasRoute ? "rgba(32,30,51,0.75)" : LINE;
        ctx.lineWidth = lit ? 3 : 1.25;
        ctx.stroke();
      }

      const labelAll = map.size <= 34;
      for (const [id, p] of map) {
        const node = nodes.find((x) => x.id === id);
        const isSeed = id === seed;
        const onRoute = routeRef.current.has(id);
        const lit = isSeed || onRoute || hover.current === id;

        ctx.beginPath();
        ctx.arc(p.x, p.y, lit ? p.r + 2 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = TYPE_COLOR[node?.type ?? "anime"] ?? MUTE;
        ctx.globalAlpha = hasRoute && !lit ? 0.32 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isSeed || onRoute) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
          ctx.strokeStyle = isSeed ? INK : ROUTE;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        if ((labelAll || lit) && node) {
          ctx.font = lit ? "600 12px Inter, system-ui, sans-serif" : "11px Inter, system-ui, sans-serif";
          ctx.fillStyle = lit ? INK : MUTE;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          // Cancel the zoom so the font renders at a constant screen size.
          // Position is still in world units, so the label tracks the node.
          // Note we deliberately keep the parent's translate/scale and undo
          // only the scale factor - resetting the whole transform here would
          // also discard the devicePixelRatio ratio set up in resize().
          ctx.save();
          ctx.translate(p.x, p.y + p.r + 5 / view.current.scale);
          ctx.scale(1 / view.current.scale, 1 / view.current.scale);
          ctx.fillText(node.label.slice(0, 26), 0, 0);
          ctx.restore();
        }
      }

      ctx.restore();

      if (!isSettled(alpha.current) || dirty) {
        dirty = false;
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(step);
    };
    kick();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [nodes, edges, seed]);

  /** Screen -> world, so hit testing matches what is actually drawn. */
  const toWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - view.current.ox) / view.current.scale,
      y: (clientY - rect.top - view.current.oy) / view.current.scale,
    };
  }, []);

  const hitTest = useCallback(
    (x: number, y: number): string | null => {
      for (const [id, p] of parts.current) {
        if (Math.hypot(p.x - x, p.y - y) <= p.r + 7) return id;
      }
      return null;
    },
    []
  );

  return (
    <div
      ref={wrapRef}
      className="relative h-[58vh] min-h-[380px] w-full overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--color-line)", background: "var(--color-void)" }}
    >
      <canvas
        ref={canvasRef}
        className="block touch-none"
        onPointerDown={(e) => {
          const { x, y } = toWorld(e.clientX, e.clientY);
          const hit = hitTest(x, y);
          e.currentTarget.setPointerCapture(e.pointerId);
          if (hit) {
            const p = parts.current.get(hit)!;
            drag.current = { id: hit, dx: p.x - x, dy: p.y - y, moved: false };
            p.pinned = true;
          } else {
            pan.current = { x: e.clientX, y: e.clientY, ox: view.current.ox, oy: view.current.oy };
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) {
            const { x, y } = toWorld(e.clientX, e.clientY);
            const p = parts.current.get(d.id);
            if (p) {
              p.x = x + d.dx;
              p.y = y + d.dy;
              p.vx = 0;
              p.vy = 0;
            }
            d.moved = true;
            alpha.current = Math.max(alpha.current, 0.22);
            return;
          }
          if (pan.current) {
            view.current.ox = pan.current.ox + (e.clientX - pan.current.x);
            view.current.oy = pan.current.oy + (e.clientY - pan.current.y);
            return;
          }
          const { x, y } = toWorld(e.clientX, e.clientY);
          const hit = hitTest(x, y);
          if (hit !== hover.current) {
            hover.current = hit;
            alpha.current = Math.max(alpha.current, 0.12);
          }
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (d) {
            // Release keeps the node where the user put it, unless they never
            // actually moved, in which case it was a click.
            if (!d.moved) {
              const p = parts.current.get(d.id);
              if (p) p.pinned = d.id === seed;
              const node = nodes.find((x) => x.id === d.id);
              if (node?.href) onNavigateRef.current(node.href);
            }
            alpha.current = Math.max(alpha.current, 0.3);
          }
          drag.current = null;
          pan.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        onPointerLeave={() => {
          hover.current = null;
          drag.current = null;
          pan.current = null;
        }}
        onWheel={(e) => {
          const next = Math.min(3, Math.max(0.35, view.current.scale * (e.deltaY > 0 ? 0.92 : 1.08)));
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          // Zoom about the cursor, not the origin, or the graph slides away
          // from under the pointer as you scroll.
          view.current.ox = mx - ((mx - view.current.ox) / view.current.scale) * next;
          view.current.oy = my - ((my - view.current.oy) / view.current.scale) * next;
          view.current.scale = next;
          alpha.current = Math.max(alpha.current, 0.12);
        }}
        onDoubleClick={() => {
          view.current.scale = 1;
          view.current.ox = 0;
          view.current.oy = 0;
          alpha.current = 1;
        }}
      />

      <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap items-center gap-3 text-[11px]" style={{ color: "var(--color-mute)" }}>
        {(["anime", "character", "studio", "genre"] as const).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[t] }} />
            {t}
          </span>
        ))}
        <span className="opacity-70">drag to pin · scroll to zoom · double-click to reset</span>
      </div>
    </div>
  );
}