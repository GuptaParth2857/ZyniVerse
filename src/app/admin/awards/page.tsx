"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

interface AdminAward {
  id: number;
  year: number;
  category: string;
  winner: string;
  platform: string;
  type: string;
  image?: string;
  malId?: number;
  anilistId?: number;
  source?: string;
  createdAt: string;
}

interface AwardsResponse {
  awards: AdminAward[];
  total: number;
  page: number;
  totalPages: number;
  years: number[];
  platforms: string[];
  types: string[];
}

type ToastKind = "success" | "error";
type Toast = { text: string; kind: ToastKind } | null;

const TYPE_STYLES: Record<string, string> = {
  anime: "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]",
  manga: "bg-green-500/10 text-green-400",
  "live-action": "bg-amber-500/10 text-amber-400",
  character: "bg-[var(--color-magenta)]/10 text-[var(--color-magenta)]",
  music: "bg-[var(--color-violet)]/10 text-[var(--color-violet)]",
};

const TYPE_ICONS: Record<string, string> = {
  anime: "🎬",
  manga: "📚",
  "live-action": "🎥",
  character: "🦸",
  music: "🎵",
};

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="overflow-hidden rounded-xl neon-feature-card group">
      <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }} />
      <div className="neon-glow rounded-xl" style={{ background: color }} />
      <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="h-[2px] w-full" style={{ background: color }} />
        <div className="p-5 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</span>
              <span className="text-lg">{icon}</span>
            </div>
            <p className="font-mono text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden">
      <div className="space-y-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-4 border-b border-[var(--color-line)]/50 animate-pulse">
            <div className="h-4 w-10 rounded bg-white/10" />
            <div className="h-5 w-28 rounded-full bg-white/10" />
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-4 w-56 rounded bg-white/10" />
            <div className="h-5 w-20 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAwardsPage() {
  const [data, setData] = useState<AwardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAward, setEditAward] = useState<AdminAward | null>(null);
  const [saving, setSaving] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    category: "",
    winner: "",
    platform: "Crunchyroll",
    type: "anime",
    image: "",
    malId: "",
    anilistId: "",
    source: "",
  });

  const showToast = useCallback((text: string, kind: ToastKind) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, kind });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (yearFilter) params.set("year", yearFilter);
    if (platformFilter) params.set("platform", platformFilter);
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", page.toString());
    params.set("limit", "50");

    fetch(`/api/admin/awards?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then(setData)
      .catch(() => showToast("Failed to load awards.", "error"))
      .finally(() => setLoading(false));
  }, [yearFilter, platformFilter, typeFilter, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    setLoading(true);
    load();
  };

  const handleFetchNow = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/awards/fetch", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast(
          `Fetched! Created ${json.created}, Updated ${json.updated}, Skipped ${json.skipped} (curated ${json.curated} seeded).`,
          "success"
        );
      } else {
        showToast(`Error: ${json.error}`, "error");
      }
      refresh();
    } catch {
      showToast("Fetch failed.", "error");
    }
    setFetching(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      year: parseInt(formData.year, 10),
      malId: formData.malId ? parseInt(formData.malId, 10) : null,
      anilistId: formData.anilistId ? parseInt(formData.anilistId, 10) : null,
      image: formData.image || null,
      source: formData.source || null,
    };

    const res = await fetch("/api/admin/awards", {
      method: editAward ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editAward ? { id: editAward.id, ...payload } : payload),
    });
    const json = await res.json().catch(() => null);

    if (res.ok) {
      showToast(editAward ? "Award updated." : "Award created.", "success");
      setShowAddModal(false);
      setEditAward(null);
      resetForm();
      refresh();
    } else {
      showToast(json?.error || "Save failed.", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (award: AdminAward) => {
    if (!confirm(`Delete "${award.winner}" (${award.category})?`)) return;
    const res = await fetch(`/api/admin/awards?id=${award.id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Award deleted.", "success");
      refresh();
    } else {
      showToast("Delete failed.", "error");
    }
  };

  const handleEdit = (award: AdminAward) => {
    setEditAward(award);
    setFormData({
      year: award.year.toString(),
      category: award.category,
      winner: award.winner,
      platform: award.platform,
      type: award.type,
      image: award.image || "",
      malId: award.malId?.toString() || "",
      anilistId: award.anilistId?.toString() || "",
      source: award.source || "",
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear().toString(),
      category: "",
      winner: "",
      platform: "Crunchyroll",
      type: "anime",
      image: "",
      malId: "",
      anilistId: "",
      source: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditAward(null);
    setShowAddModal(true);
  };

  const platforms = ["Crunchyroll", "Anime Trending", "MyAnimeList", "Anime News Network", "Newtype", "HIDIVE", "Saturn Awards", "Japan Academy Prize"];
  const types = ["anime", "manga", "live-action", "character", "music"];
  const stats = data
    ? [
        { label: "Total Awards", value: data.total.toLocaleString(), icon: "🏆", color: "#ffd700" },
        { label: "Years Covered", value: data.years.length.toString(), icon: "📅", color: "#29f2e0" },
        { label: "Platforms", value: data.platforms.length.toString(), icon: "📺", color: "#ff2d78" },
        { label: "Types", value: data.types.length.toString(), icon: "🗂️", color: "#8a5cff" },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin · Awards</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">Awards</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
            </span>
            {data ? `${data.total} total awards` : "Curated anime award winners"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFetchNow}
            disabled={fetching}
            className="inline-flex items-center gap-2 rounded-full neon-rgb-border px-4 py-2 text-xs font-bold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/5 disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {fetching ? "Fetching..." : "Fetch & Seed"}
          </button>
          <button
            onClick={openAddModal}
            className="rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black neon-rgb-border transition-all hover:scale-[1.02]"
          >
            + Add Award
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`mb-6 rounded-lg border px-4 py-2.5 text-sm ${
            toast.kind === "success"
              ? "border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setPage(1);
            setLoading(true);
          }}
          className="rounded-full neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm px-4 py-2 text-xs font-bold text-[var(--color-mute)] outline-none transition-colors hover:text-[var(--color-ink)]"
        >
          <option value="">All Years</option>
          {data?.years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={platformFilter}
          onChange={(e) => {
            setPlatformFilter(e.target.value);
            setPage(1);
            setLoading(true);
          }}
          className="rounded-full neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm px-4 py-2 text-xs font-bold text-[var(--color-mute)] outline-none transition-colors hover:text-[var(--color-ink)]"
        >
          <option value="">All Platforms</option>
          {data?.platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
            setLoading(true);
          }}
          className="rounded-full neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm px-4 py-2 text-xs font-bold text-[var(--color-mute)] outline-none transition-colors hover:text-[var(--color-ink)]"
        >
          <option value="">All Types</option>
          {data?.types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : !data || data.awards.length === 0 ? (
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-12 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-display text-lg font-bold">No awards yet</h3>
          <p className="mt-1 text-sm text-[var(--color-mute)] max-w-md mx-auto">
            Fetch &amp; Seed pulls verified winners (2022–2025 Crunchyroll Anime Awards) plus live scraping from the web.
          </p>
          <button
            onClick={handleFetchNow}
            disabled={fetching}
            className="mt-5 inline-flex items-center gap-2 rounded-full neon-rgb-border px-6 py-2.5 text-xs font-bold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/5 disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {fetching ? "Fetching..." : "Fetch & Seed Now"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                  <th className="px-5 py-3.5 font-medium">Year</th>
                  <th className="px-5 py-3.5 font-medium">Platform</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Winner</th>
                  <th className="px-5 py-3.5 font-medium">Type</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.awards.map((award) => (
                  <tr key={award.id} className="border-b border-[var(--color-line)]/50 transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-mono font-bold text-[var(--color-ink)]">{award.year}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[var(--color-mute)]">
                        {award.platform}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-mute)]">{award.category}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {award.image ? (
                          <Image src={award.image} alt="" width={32} height={44} className="h-11 w-8 shrink-0 rounded object-cover" />
                        ) : (
                          <span className="flex h-11 w-8 shrink-0 items-center justify-center rounded bg-white/5 text-sm">
                            {TYPE_ICONS[award.type] || "🏆"}
                          </span>
                        )}
                        <span className="font-medium text-[var(--color-ink)]">{award.winner}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${TYPE_STYLES[award.type] || TYPE_STYLES.anime}`}>
                        {award.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleEdit(award)}
                        className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)] transition hover:border-[var(--color-cyan)]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(award)}
                        className="ml-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--color-line)] px-5 py-3.5">
              <span className="text-sm text-[var(--color-mute)]">
                Page <span className="font-mono text-[var(--color-cyan)]">{data.page}</span> of {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPage(Math.max(1, page - 1));
                    setLoading(true);
                  }}
                  disabled={page <= 1}
                  className="rounded-full neon-rgb-border px-4 py-1.5 text-xs font-bold text-[var(--color-mute)] transition hover:text-[var(--color-cyan)] disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    setPage(Math.min(data.totalPages, page + 1));
                    setLoading(true);
                  }}
                  disabled={page >= data.totalPages}
                  className="rounded-full neon-rgb-border px-4 py-1.5 text-xs font-bold text-[var(--color-mute)] transition hover:text-[var(--color-cyan)] disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-magenta)]">
                  {editAward ? "Edit Award" : "New Award"}
                </p>
                <h2 className="font-display text-lg font-bold">{editAward ? `Edit · ${editAward.year}` : "Add Award"}</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditAward(null);
                }}
                className="text-[var(--color-mute)] hover:text-[var(--color-ink)] text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Anime of the Year"
                  className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)] placeholder:text-[var(--color-mute)]/40"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Winner</label>
                <input
                  type="text"
                  value={formData.winner}
                  onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                  placeholder="e.g. Solo Leveling"
                  className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)] placeholder:text-[var(--color-mute)]/40"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Image URL</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)] placeholder:text-[var(--color-mute)]/40"
                  />
                  {formData.image && (
                    <Image src={formData.image} alt="preview" width={44} height={60} className="h-15 w-11 shrink-0 rounded object-cover" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">MAL ID</label>
                  <input
                    type="number"
                    value={formData.malId}
                    onChange={(e) => setFormData({ ...formData, malId: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">AniList ID</label>
                  <input
                    type="number"
                    value={formData.anilistId}
                    onChange={(e) => setFormData({ ...formData, anilistId: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Source URL</label>
                <input
                  type="url"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-void)] border border-[var(--color-line)] rounded-lg text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.category || !formData.winner}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-4 py-2.5 text-sm font-bold text-black neon-rgb-border transition-all hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? "Saving..." : editAward ? "Update Award" : "Create Award"}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditAward(null);
                  }}
                  className="rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-mute)] transition hover:text-[var(--color-ink)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
