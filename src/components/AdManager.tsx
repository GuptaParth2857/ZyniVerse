"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdPlacement } from "@/lib/ads";

const PLACEMENT_TYPES: AdPlacement["type"][] = ["native", "banner", "sidebar", "in-content", "footer", "socialbar"];
const NETWORKS: AdPlacement["network"][] = ["adsterra", "adsense", "direct"];
const RENDER_MODES: AdPlacement["renderMode"][] = ["iframe-sync", "native-async", "socialbar-sync", "raw"];

const NETWORK_META: Record<string, { label: string; color: string }> = {
  adsterra: { label: "Adsterra", color: "#ff6b3d" },
  adsense: { label: "AdSense", color: "#ffcc00" },
  direct: { label: "Direct", color: "#29f2e0" },
};

const TYPE_META: Record<string, { label: string; color: string }> = {
  native: { label: "Native", color: "#29f2e0" },
  banner: { label: "Banner", color: "#00d4ff" },
  sidebar: { label: "Sidebar", color: "#8a5cff" },
  "in-content": { label: "In-Content", color: "#ff69b4" },
  footer: { label: "Footer", color: "#ffcc00" },
  socialbar: { label: "Social Bar", color: "#22c55e" },
};

const BAR_COLORS = ["#00d4ff", "#ff2d78", "#8a5cff", "#22c55e", "#ffb020", "#ff69b4", "#29f2e0"];

function networkMeta(network: string) {
  return NETWORK_META[network] || { label: network, color: "#29f2e0" };
}

function typeMeta(type: string) {
  return TYPE_META[type] || { label: type, color: "#29f2e0" };
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const start = performance.now();
    const from = 0;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
            <div className="h-3 w-20 rounded bg-white/5" />
            <div className="mt-3 h-7 w-24 rounded bg-white/5" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
        <div className="h-4 w-40 rounded bg-white/5" />
        <div className="mt-8 h-32 rounded bg-white/5" />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
  display,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  sub?: string;
  display?: string;
}) {
  const n = useCountUp(value);
  return (
    <div className="neon-feature-card rounded-xl p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">{label}</p>
        <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold font-mono" style={{ color }}>
        {display ?? n.toLocaleString("en-IN")}
        {sub && <span className="ml-1 text-xs font-medium text-[var(--color-mute)]">{sub}</span>}
      </p>
    </div>
  );
}

interface AdStats {
  impressions: number;
  clicks: number;
  impressionsLast7: number;
  clicksLast7: number;
  ctr: string;
  topPlacements: { placement: string; impressions: number; clicks: number }[];
  daily: { date: string; label: string; count: number }[];
}

interface ApiPlacement {
  id: string;
  type: string;
  network: string;
  code: string;
  location: string;
  isActive: boolean;
  width: number | null;
  height: number | null;
  renderMode: string | null;
}

function toPlacement(p: ApiPlacement): AdPlacement {
  return {
    id: p.id,
    type: p.type as AdPlacement["type"],
    network: p.network as AdPlacement["network"],
    code: p.code,
    location: p.location,
    isActive: p.isActive,
    dimensions: p.width && p.height ? { width: p.width, height: p.height } : undefined,
    renderMode: (p.renderMode as AdPlacement["renderMode"]) || undefined,
  };
}

export default function AdManager() {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newAd, setNewAd] = useState({
    id: "",
    type: "banner" as AdPlacement["type"],
    network: "adsterra" as AdPlacement["network"],
    code: "",
    location: "",
    isActive: true,
    width: 300,
    height: 250,
    renderMode: "iframe-sync" as AdPlacement["renderMode"],
  });

  const loadPlacements = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ads/placements");
      if (!res.ok) throw new Error("Failed to load placements");
      const data = await res.json();
      setPlacements((data.placements || []).map(toPlacement));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load placements");
    }
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [statsRes, placementsRes] = await Promise.all([
        fetch("/api/admin/ads/stats"),
        fetch("/api/admin/ads/placements"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (placementsRes.ok) setPlacements((await placementsRes.json()).placements.map(toPlacement));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/admin/ads/stats"), fetch("/api/admin/ads/placements")])
      .then(async ([statsRes, placementsRes]) => {
        const s = statsRes.ok ? await statsRes.json() : null;
        const p = placementsRes.ok ? await placementsRes.json() : null;
        if (cancelled) return;
        if (s) setStats(s);
        if (p) setPlacements(p.placements.map(toPlacement));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleActive = async (id: string) => {
    const target = placements.find((p) => p.id === id);
    if (!target) return;
    setSaving(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/ads/placements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !target.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await loadPlacements();
      setToast(target.isActive ? "Placement deactivated" : "Placement activated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update placement");
    } finally {
      setSaving(null);
    }
  };

  const addPlacement = async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/ads/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newAd.id || `custom-${Date.now()}`,
          type: newAd.type,
          network: newAd.network,
          code: newAd.code,
          location: newAd.location,
          isActive: newAd.isActive,
          width: newAd.width,
          height: newAd.height,
          renderMode: newAd.renderMode,
        }),
      });
      if (!res.ok) throw new Error("Failed to add placement");
      await loadPlacements();
      setShowForm(false);
      setNewAd({ id: "", type: "banner", network: "adsterra", code: "", location: "", isActive: true, width: 300, height: 250, renderMode: "iframe-sync" });
      setToast("Placement added");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add placement");
    }
  };

  const removePlacement = async (id: string) => {
    setSaving(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ads/placements?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadPlacements();
      setToast("Placement removed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete placement");
    } finally {
      setSaving(null);
    }
  };

  const daily = stats?.daily || [];
  const maxDaily = Math.max(...daily.map((d) => d.count), 1);
  const top = stats?.topPlacements || [];
  const maxTop = Math.max(...top.map((p) => p.impressions), 1);

  const inputClass =
    "w-full rounded-lg neon-rgb-border bg-[var(--color-void)]/60 px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none transition-colors placeholder:text-[var(--color-mute)]/60";
  const selectClass =
    "w-full appearance-none rounded-lg neon-rgb-border bg-[var(--color-void)]/60 px-3 py-2 text-xs text-[var(--color-ink)] focus:outline-none transition-colors";
  const labelClass = "mb-1 block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-lg neon-rgb-border bg-[var(--color-void)]/60 px-3 py-2 text-xs font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
        >
          <span className={`inline-block h-2 w-2 rounded-full bg-[var(--color-cyan)] ${loading ? "animate-ping" : ""}`} />
          Refresh
        </button>
      </div>

      {toast && (
        <div className="rounded-lg neon-rgb-border bg-[var(--color-void)]/80 px-4 py-2.5 text-xs text-[var(--color-cyan)]">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👁️" label="Impressions" value={stats?.impressions || 0} color="var(--color-cyan)" />
            <StatCard icon="🖱️" label="Clicks" value={stats?.clicks || 0} color="var(--color-magenta)" />
            <StatCard
              icon="🎯"
              label="CTR"
              value={0}
              color="var(--color-violet)"
              sub="%"
              display={stats?.ctr ?? "0.00"}
            />
            <StatCard icon="🔥" label="Last 7 Days" value={stats?.impressionsLast7 || 0} color="var(--color-amber)" />
          </div>

          {/* Daily chart */}
          <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
              <h2 className="font-display text-lg font-bold">Impressions · Last 14 Days</h2>
              <span className="ml-auto text-[10px] font-mono text-[var(--color-mute)]">
                {stats?.impressions.toLocaleString("en-IN")} total
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-40">
              {daily.map((d, i) => (
                <div key={d.date} className="group relative flex-1 flex items-end h-full">
                  <div
                    className="w-full rounded-t-md transition-all duration-700 ease-out group-hover:bg-[var(--color-cyan)]"
                    style={{
                      height: d.count > 0 ? `${Math.max((d.count / maxDaily) * 100, 6)}%` : "3%",
                      background: d.count > 0 ? "var(--color-cyan)" : "rgba(255,255,255,0.08)",
                      opacity: d.count > 0 ? 0.85 : 1,
                      transitionDelay: `${i * 40}ms`,
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-black/90 border border-[var(--color-line)] px-2 py-1 text-[10px] font-mono text-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {d.label}: {d.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--color-mute)]">
              <span>{daily[0]?.label}</span>
              <span>{daily[daily.length - 1]?.label}</span>
            </div>
          </div>

          {/* Top placements */}
          {top.length > 0 && (
            <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
                <h2 className="font-display text-lg font-bold">Top Placements</h2>
              </div>
              <div className="space-y-4">
                {top.map((p, i) => {
                  const pct = Math.round((p.impressions / maxTop) * 100);
                  const color = BAR_COLORS[i % BAR_COLORS.length];
                  return (
                    <div key={p.placement}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-mono text-[var(--color-text)]">{p.placement}</span>
                        <span className="shrink-0 font-mono text-[var(--color-mute)]">
                          <span style={{ color }}>{p.impressions.toLocaleString("en-IN")}</span>
                          <span className="mx-1.5 text-[var(--color-line)]">·</span>
                          {p.clicks} clicks
                          <span className="ml-2 text-[10px]">{pct}%</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: "100%",
                            background: `linear-gradient(90deg, ${color}55, ${color})`,
                            boxShadow: `0 0 12px ${color}66`,
                          }}
                        />
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(pct, 3)}%`,
                            background: `linear-gradient(90deg, ${color}55, ${color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Placements list */}
      <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[var(--color-violet)]" />
            <h2 className="font-display text-lg font-bold">Ad Placements</h2>
            <span className="rounded-full border border-[var(--color-line)] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] text-[var(--color-mute)]">
              {placements.length}
            </span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg neon-rgb-border bg-[var(--color-void)]/60 px-4 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-black transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Placement"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg neon-rgb-border bg-[var(--color-void)]/60 p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>ID</label>
                <input
                  value={newAd.id}
                  onChange={(e) => setNewAd({ ...newAd, id: e.target.value })}
                  placeholder="unique-id"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  value={newAd.location}
                  onChange={(e) => setNewAd({ ...newAd, location: e.target.value })}
                  placeholder="homepage / sidebar / banner / native..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={newAd.type}
                  onChange={(e) => setNewAd({ ...newAd, type: e.target.value as AdPlacement["type"] })}
                  className={selectClass}
                >
                  {PLACEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Network</label>
                <select
                  value={newAd.network}
                  onChange={(e) => setNewAd({ ...newAd, network: e.target.value as AdPlacement["network"] })}
                  className={selectClass}
                >
                  {NETWORKS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Width</label>
                <input
                  type="number"
                  value={newAd.width}
                  onChange={(e) => setNewAd({ ...newAd, width: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Height</label>
                <input
                  type="number"
                  value={newAd.height}
                  onChange={(e) => setNewAd({ ...newAd, height: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Render Mode</label>
                <select
                  value={newAd.renderMode}
                  onChange={(e) => setNewAd({ ...newAd, renderMode: e.target.value as AdPlacement["renderMode"] })}
                  className={selectClass}
                >
                  {RENDER_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Ad Code</label>
              <textarea
                value={newAd.code}
                onChange={(e) => setNewAd({ ...newAd, code: e.target.value })}
                rows={3}
                className={`${inputClass} font-mono`}
                placeholder="<script>...</script>"
              />
            </div>
            <button
              onClick={addPlacement}
              disabled={!newAd.code.trim()}
              className="rounded-lg neon-rgb-border bg-[var(--color-void)]/60 px-4 py-2 text-xs font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black transition-colors disabled:opacity-40"
            >
              Add Placement
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-4 text-center text-xs text-[var(--color-mute)]">Loading placements...</p>
        ) : placements.length === 0 ? (
          <p className="py-4 text-center text-xs text-[var(--color-mute)]">
            No placements configured yet. Add one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {placements.map((p) => {
              const nMeta = networkMeta(p.network);
              const tMeta = typeMeta(p.type);
              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg neon-rgb-border bg-[var(--color-void)]/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">{p.id}</p>
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ color: tMeta.color, borderColor: `${tMeta.color}40`, background: `${tMeta.color}12` }}
                      >
                        {tMeta.label}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ color: nMeta.color, borderColor: `${nMeta.color}40`, background: `${nMeta.color}12` }}
                      >
                        {nMeta.label}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-[var(--color-mute)]">
                      {p.location}
                      {p.dimensions && ` · ${p.dimensions.width}x${p.dimensions.height}`}
                      {p.renderMode && ` · ${p.renderMode}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(p.id)}
                      disabled={saving === p.id}
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors disabled:opacity-40 ${
                        p.isActive
                          ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {saving === p.id ? "..." : p.isActive ? "● Active" : "○ Inactive"}
                    </button>
                    <button
                      onClick={() => removePlacement(p.id)}
                      disabled={saving === p.id}
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
