"use client";

import { useState, useEffect } from "react";
import { getAdsForLocation, type AdPlacement } from "@/lib/ads";

const PLACEMENT_TYPES: AdPlacement["type"][] = ["native", "banner", "sidebar", "in-content", "footer"];
const NETWORKS: AdPlacement["network"][] = ["adsterra", "direct"];

interface AdStats {
  impressions: number;
  clicks: number;
  ctr: string;
  topPlacements: { placement: string; impressions: number; clicks: number }[];
}

export default function AdManager() {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
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
  });

  useEffect(() => {
    fetch("/api/admin/ads/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    const stored = localStorage.getItem("zyniverse_ads");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlacements(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const toggleActive = (id: string) => {
    setPlacements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const addPlacement = () => {
    const ad: AdPlacement = {
      id: newAd.id || `custom-${Date.now()}`,
      type: newAd.type,
      network: newAd.network,
      code: newAd.code,
      location: newAd.location,
      isActive: newAd.isActive,
      dimensions: { width: newAd.width, height: newAd.height },
    };
    setPlacements((prev) => [...prev, ad]);
    setShowForm(false);
    setNewAd({ id: "", type: "banner", network: "adsterra", code: "", location: "", isActive: true, width: 300, height: 250 });
  };

  const removePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">Impressions</p>
          <p className="mt-1 text-2xl font-bold font-mono text-[var(--color-cyan)]">
            {stats?.impressions?.toLocaleString() || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">Clicks</p>
          <p className="mt-1 text-2xl font-bold font-mono text-[var(--color-magenta)]">
            {stats?.clicks?.toLocaleString() || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">CTR</p>
          <p className="mt-1 text-2xl font-bold font-mono text-[var(--color-violet)]">
            {stats?.ctr || "—"}%
          </p>
        </div>
      </div>

      {/* Top Placements */}
      {stats?.topPlacements && stats.topPlacements.length > 0 && (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h3 className="font-display text-sm font-bold mb-4">Top Placements</h3>
          <div className="space-y-2">
            {stats.topPlacements.map((p) => (
              <div key={p.placement} className="flex items-center justify-between text-xs">
                <span className="font-mono text-[var(--color-mute)]">{p.placement}</span>
                <div className="flex gap-4">
                  <span className="text-[var(--color-cyan)]">{p.impressions} impressions</span>
                  <span className="text-[var(--color-magenta)]">{p.clicks} clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placements List */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold">Ad Placements</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-[var(--color-cyan)] px-3 py-1.5 text-xs font-bold text-black hover:opacity-90 transition"
          >
            {showForm ? "Cancel" : "+ Add Placement"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">ID</label>
                <input
                  value={newAd.id}
                  onChange={(e) => setNewAd({ ...newAd, id: e.target.value })}
                  placeholder="unique-id"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">Location</label>
                <input
                  value={newAd.location}
                  onChange={(e) => setNewAd({ ...newAd, location: e.target.value })}
                  placeholder="page-location"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">Type</label>
                <select
                  value={newAd.type}
                  onChange={(e) => setNewAd({ ...newAd, type: e.target.value as AdPlacement["type"] })}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                >
                  {PLACEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">Network</label>
                <select
                  value={newAd.network}
                  onChange={(e) => setNewAd({ ...newAd, network: e.target.value as AdPlacement["network"] })}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                >
                  {NETWORKS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">Width</label>
                <input
                  type="number"
                  value={newAd.width}
                  onChange={(e) => setNewAd({ ...newAd, width: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">Height</label>
                <input
                  type="number"
                  value={newAd.height}
                  onChange={(e) => setNewAd({ ...newAd, height: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1">Ad Code</label>
              <textarea
                value={newAd.code}
                onChange={(e) => setNewAd({ ...newAd, code: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)] font-mono"
                placeholder="<script>...</script>"
              />
            </div>
            <button
              onClick={addPlacement}
              className="rounded-lg bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition"
            >
              Add Placement
            </button>
          </div>
        )}

        {placements.length === 0 ? (
          <p className="text-xs text-[var(--color-mute)] text-center py-4">
            No custom placements yet. Add one above.
          </p>
        ) : (
          <div className="space-y-2">
            {placements.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{p.id}</p>
                  <p className="text-[10px] text-[var(--color-mute)]">
                    {p.location} · {p.type} · {p.network}
                    {p.dimensions && ` · ${p.dimensions.width}x${p.dimensions.height}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(p.id)}
                    className={`rounded px-2 py-1 text-[10px] font-semibold ${
                      p.isActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => removePlacement(p.id)}
                    className="rounded px-2 py-1 text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
