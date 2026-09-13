"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface SeasonAnime {
  id: number;
  title: { romaji?: string | null; english?: string | null; userPreferred?: string | null } | null;
  coverImage: { large?: string | null } | null;
  episodes?: number | null;
}

interface ListEntryData {
  mediaId: number;
  type: string;
  status: string;
  progress: number;
  total: number;
  score: number | null;
  dropReason?: string | null;
}

const TRACKED_STATUSES = ["CURRENT", "PLANNING", "COMPLETED", "DROPPED", "PAUSED", "REWATCHING"];
const STATUS_META: Record<string, { label: string; color: string }> = {
  CURRENT: { label: "Watching", color: "var(--color-cyan)" },
  COMPLETED: { label: "Completed", color: "#22c55e" },
  DROPPED: { label: "Dropped", color: "#ef4444" },
  PLANNING: { label: "Planned", color: "var(--color-violet)" },
  PAUSED: { label: "Paused", color: "#f59e0b" },
  REWATCHING: { label: "Rewatching", color: "#ec4899" },
};
const STATUSES_FOR_ADD = ["PLANNING", "CURRENT", "COMPLETED", "DROPPED", "PAUSED"] as const;

export default function SeasonalTrackerDashboard({ season, year }: { season: string; year: number }) {
  const { data: session } = useSession();
  const [animeList, setAnimeList] = useState<SeasonAnime[]>([]);
  const [entries, setEntries] = useState<ListEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addMenuId, setAddMenuId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [animeRes, listRes] = await Promise.all([
      fetch(`/api/anilist/seasonal?year=${year}&season=${season}&perPage=100`),
      session?.user?.id ? fetch("/api/watchlist") : Promise.resolve(null),
    ]);
    const animeData = await animeRes.json();
    setAnimeList(animeData.media || []);
    if (listRes) {
      const listData = await listRes.json();
      setEntries(listData.items || []);
    }
    setLoading(false);
  }, [session?.user?.id, season, year]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const entryMap = new Map(entries.map((e) => [e.mediaId, e]));

  const tracked = animeList.filter((a) => entryMap.has(a.id));
  const filtered = search
    ? animeList.filter((a) => {
        const title = a.title?.userPreferred || a.title?.romaji || a.title?.english || "";
        return title.toLowerCase().includes(search.toLowerCase());
      })
    : animeList;

  const grouped = TRACKED_STATUSES.reduce(
    (acc, s) => { acc[s] = tracked.filter((a) => entryMap.get(a.id)?.status === s); return acc; },
    {} as Record<string, SeasonAnime[]>
  );
  const completedCount = grouped.COMPLETED?.length || 0;
  const completionPct = tracked.length > 0 ? Math.round((completedCount / tracked.length) * 100) : 0;

  function title(a: SeasonAnime) { return a.title?.userPreferred || a.title?.romaji || a.title?.english || "Unknown"; }

  async function addAnime(mediaId: number, status: string) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", mediaId, type: "ANIME", status }),
    });
    setEntries((prev) => [...prev, { mediaId, type: "ANIME", status, progress: 0, total: 0, score: null }]);
    setAddMenuId(null);
  }

  async function editEntry(mediaId: number, body: Record<string, string | number | null>) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", mediaId, type: "ANIME", ...body }),
    });
    setEntries((prev) =>
      prev.map((e) => {
        if (e.mediaId !== mediaId) return e;
        const next = { ...e };
        if (body.status !== undefined) next.status = String(body.status);
        if (body.progress !== undefined) next.progress = Number(body.progress) || 0;
        if (body.total !== undefined) next.total = Number(body.total) || 0;
        if (body.score !== undefined) next.score = body.score === null || body.score === "" ? null : Number(body.score);
        return next;
      })
    );
  }

  async function removeAnime(mediaId: number) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", mediaId, type: "ANIME" }),
    });
    setEntries((prev) => prev.filter((e) => e.mediaId !== mediaId));
    setEditingId(null);
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-16">
        <div className="neon-rgb-ring inline-block rounded-2xl p-6 bg-[var(--color-panel)]/60 mb-4">
          <p className="text-2xl mb-2">📋</p>
          <h3 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2">Your Season Dashboard</h3>
          <p className="text-sm text-[var(--color-mute)] max-w-sm mx-auto mb-6">
            See all {season.charAt(0) + season.slice(1).toLowerCase()} {year} anime and track your progress in one place — powered by your watchlist.
          </p>
          <Link href="/login" className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            Sign In to Start
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden"><div className="aspect-[3/4] shimmer" /><div className="p-3 space-y-2"><div className="h-4 w-3/4 shimmer rounded" /><div className="h-3 w-1/2 shimmer rounded" /></div></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRACKED_STATUSES.map((s) => (
          <div key={s} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: STATUS_META[s].color }}>
              {grouped[s]?.length || 0}
            </div>
            <div className="text-xs text-[var(--color-mute)] mt-1">{STATUS_META[s].label}</div>
          </div>
        ))}
      </div>

      {/* Progress ring */}
      {tracked.length > 0 && (
        <div className="flex items-center gap-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-line)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-cyan)" strokeWidth="3" strokeDasharray={`${completionPct} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--color-ink)]">{completionPct}%</div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">{completedCount} of {tracked.length} completed</p>
            <p className="text-xs text-[var(--color-mute)] mt-1">{tracked.length} of {animeList.length} season anime in your list</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${animeList.length} anime...`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
          />
          {search && <button onClick={() => setSearch("")} className="text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)]">✕</button>}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {(search ? filtered : animeList).map((anime) => {
            const entry = entryMap.get(anime.id);
            const isTracked = !!entry;
            const isEditing = editingId === anime.id;
            const isAddOpen = addMenuId === anime.id;

            return (
              <motion.div
                key={anime.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex gap-3 rounded-xl border p-3 transition-all ${isTracked ? "border-[var(--color-line)] bg-[var(--color-panel)]" : "border-dashed border-[var(--color-line)]/50 bg-[var(--color-panel)]/40"}`}
              >
                {anime.coverImage?.large ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={anime.coverImage.large} alt={title(anime)} className="w-14 h-20 rounded-lg object-cover shrink-0" />
                  </>
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-[var(--color-void)] shimmer shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/anime/${anime.id}`} className="text-sm font-semibold text-[var(--color-ink)] truncate block hover:text-[var(--color-cyan)] transition-colors">{title(anime)}</Link>
                  <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{anime.episodes ? `${anime.episodes} ep` : "Ongoing"}</p>

                  {isTracked && entry && (
                    <div className="mt-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded inline-block" style={{ background: `${STATUS_META[entry.status]?.color}20`, color: STATUS_META[entry.status]?.color }}>
                        {STATUS_META[entry.status]?.label || entry.status}
                      </span>
                      {entry.total > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-void)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-cyan)]" style={{ width: `${Math.min((entry.progress / entry.total) * 100, 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-[var(--color-mute)]">{entry.progress}/{entry.total}</span>
                        </div>
                      )}
                      {entry.score !== null && <p className="text-[10px] text-[var(--color-magenta)] mt-1 font-mono">Score: {entry.score}/10</p>}
                      <div className="flex items-center gap-1 mt-2">
                        <button onClick={() => { setEditingId(isEditing ? null : anime.id); setAddMenuId(null); }} className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
                          {isEditing ? "Close" : "Edit"}
                        </button>
                        <span className="text-[var(--color-line)]">·</span>
                        <button onClick={() => removeAnime(anime.id)} className="text-[10px] text-[var(--color-mute)] hover:text-red-400 transition-colors">Remove</button>
                      </div>
                    </div>
                  )}

                  {!isTracked && (
                    <div className="mt-2 relative">
                      <button onClick={() => { setAddMenuId(isAddOpen ? null : anime.id); setEditingId(null); }}
                        className="rounded-lg bg-gradient-to-r from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 border border-[var(--color-cyan)]/30 px-3 py-1.5 text-[10px] font-semibold text-[var(--color-cyan)] hover:from-[var(--color-cyan)]/30 hover:to-[var(--color-magenta)]/30 transition-all">
                        + Add
                      </button>
                      {isAddOpen && (
                        <div className="absolute left-0 top-full mt-1 z-20 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-2 shadow-xl min-w-[140px]">
                          {STATUSES_FOR_ADD.map((s) => (
                            <button key={s} onClick={() => addAnime(anime.id, s)}
                              className="w-full text-left rounded-lg px-3 py-1.5 text-[11px] font-semibold hover:bg-white/5 transition-colors"
                              style={{ color: STATUS_META[s].color }}>
                              {STATUS_META[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {search && filtered.length === 0 && (
        <p className="text-center text-sm text-[var(--color-mute)] py-8">No anime match &quot;{search}&quot;</p>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editingId && entryMap.get(editingId) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditingId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
              {(() => {
                const anime = animeList.find((a) => a.id === editingId);
                const entry = entryMap.get(editingId!);
                if (!anime || !entry) return null;
                return (
                  <>
                    <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">{title(anime)}</h3>
                    <p className="text-xs text-[var(--color-mute)] mb-4">Edit your tracking entry</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-[var(--color-mute)] mb-1 block">Status</label>
                        <div className="flex flex-wrap gap-2">
                          {(["PLANNING", "CURRENT", "COMPLETED", "DROPPED", "PAUSED", "REWATCHING"] as const).map((s) => (
                            <button key={s} onClick={() => editEntry(editingId!, { status: s })}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${entry.status === s ? "text-black border-transparent" : "text-[var(--color-mute)] border-[var(--color-line)]"}`}
                              style={entry.status === s ? { background: STATUS_META[s].color, borderColor: STATUS_META[s].color } : {}}>
                              {STATUS_META[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[var(--color-mute)] mb-1 block">Progress</label>
                          <input type="number" min={0} value={entry.progress}
                            onChange={(e) => editEntry(editingId!, { progress: e.target.value })}
                            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--color-mute)] mb-1 block">Total Episodes</label>
                          <input type="number" min={0} placeholder={anime.episodes ? `${anime.episodes}` : "?"} value={entry.total || ""}
                            onChange={(e) => editEntry(editingId!, { total: e.target.value || "0" })}
                            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--color-mute)] mb-1 block">Score (1–10)</label>
                        <input type="number" min={1} max={10} value={entry.score ?? ""} placeholder="Optional"
                          onChange={(e) => editEntry(editingId!, { score: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg bg-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30 transition-all">Done</button>
                        <button onClick={() => removeAnime(editingId!)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all">Remove</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}