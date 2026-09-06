"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface TrackerEntry {
  id: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  status: string;
  progress: number;
  totalEpisodes: number | null;
  score: number | null;
  addedAt: string;
}

interface Tracker {
  id: string;
  season: string;
  year: number;
  entries: TrackerEntry[];
}

const STATUS_ORDER = ["WATCHING", "COMPLETED", "PLANNED", "DROPPED"] as const;
const STATUS_COLORS: Record<string, string> = {
  WATCHING: "var(--color-cyan)",
  COMPLETED: "#22c55e",
  DROPPED: "#ef4444",
  PLANNED: "var(--color-violet)",
};
const STATUS_LABELS: Record<string, string> = {
  WATCHING: "Watching",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  PLANNED: "Planned",
};

export default function SeasonalTrackerDashboard({ season, year }: { season: string; year: number }) {
  const { data: session } = useSession();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTracker = useCallback(async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    setError("");
    try {
      const res = await fetch(`/api/seasonal-tracker?season=${season}&year=${year}`);
      const data = await res.json();
      setTracker(data.trackers?.[0] || null);
    } catch {
      setError("Failed to load tracker");
    }
    setLoading(false);
  }, [session, season, year]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTracker(); }, [fetchTracker]);

  async function updateEntry(entryId: string, body: Record<string, unknown>) {
    if (!tracker) return;
    try {
      const res = await fetch(`/api/seasonal-tracker/${tracker.id}/entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTracker((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entries: prev.entries.map((e) => (e.id === entryId ? data.entry : e)),
        };
      });
    } catch {
      setError("Failed to update entry");
    }
  }

  async function removeEntry(mediaId: number) {
    if (!tracker) return;
    try {
      await fetch(`/api/seasonal-tracker/${tracker.id}/entries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      setTracker((prev) => {
        if (!prev) return prev;
        return { ...prev, entries: prev.entries.filter((e) => e.mediaId !== mediaId) };
      });
    } catch {
      setError("Failed to remove entry");
    }
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-mute)] mb-4">Login to start tracking seasonal anime.</p>
        <Link href="/login" className="rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
            <div className="aspect-[3/4] shimmer" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-[var(--color-void)] rounded shimmer" />
              <div className="h-3 w-1/2 bg-[var(--color-void)] rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tracker || tracker.entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 border border-[var(--color-cyan)]/20 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-cyan)]">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2">No Anime Tracked</h3>
        <p className="text-sm text-[var(--color-mute)] max-w-sm mx-auto mb-6">
          Start adding anime to your seasonal tracker from the anime detail pages.
        </p>
        <Link href="/seasonal" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all">
          Browse Seasonal
        </Link>
      </div>
    );
  }

  const grouped = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = tracker.entries.filter((e) => e.status === status);
      return acc;
    },
    {} as Record<string, TrackerEntry[]>
  );

  const totalEntries = tracker.entries.length;
  const completedCount = grouped.COMPLETED?.length || 0;
  const completionPct = totalEntries > 0 ? Math.round((completedCount / totalEntries) * 100) : 0;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: STATUS_COLORS[status] }}>
              {grouped[status]?.length || 0}
            </div>
            <div className="text-xs text-[var(--color-mute)] mt-1">{STATUS_LABELS[status]}</div>
          </div>
        ))}
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-cyan)" strokeWidth="3" strokeDasharray={`${completionPct} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--color-ink)]">
            {completionPct}%
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{completedCount} of {totalEntries} completed</p>
          <p className="text-xs text-[var(--color-mute)] mt-1">{totalEntries} anime tracked this season</p>
        </div>
      </div>

      {/* Grouped entries */}
      {STATUS_ORDER.map((status) => {
        const items = grouped[status];
        if (!items || items.length === 0) return null;
        return (
          <div key={status}>
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
              {STATUS_LABELS[status]}
              <span className="text-[var(--color-mute)] font-normal">({items.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {items.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3"
                  >
                    {entry.mediaImage && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={entry.mediaImage} alt={entry.mediaTitle} className="w-14 h-20 rounded-lg object-cover shrink-0" />
                      </>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{entry.mediaTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${STATUS_COLORS[entry.status]}20`, color: STATUS_COLORS[entry.status] }}>
                          {STATUS_LABELS[entry.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-void)] overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--color-cyan)] transition-all" style={{ width: `${entry.totalEpisodes && entry.totalEpisodes > 0 ? Math.min((entry.progress / entry.totalEpisodes) * 100, 100) : 0}%` }} />
                        </div>
                        <span className="text-[10px] text-[var(--color-mute)]">{entry.progress} / {entry.totalEpisodes || "?"} ep</span>
                      </div>
                      {entry.score !== null && (
                        <p className="text-[10px] text-[var(--color-magenta)] mt-1 font-mono">Score: {entry.score}/10</p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => setEditingEntry(editingEntry === entry.id ? null : entry.id)}
                          className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-[var(--color-line)]">·</span>
                        <button
                          onClick={() => removeEntry(entry.mediaId)}
                          className="text-[10px] text-[var(--color-mute)] hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {/* Edit modal */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditingEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6"
            >
              {(() => {
                const entry = tracker.entries.find((e) => e.id === editingEntry);
                if (!entry) return null;
                return (
                  <>
                    <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">Edit: {entry.mediaTitle}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-[var(--color-mute)] mb-1 block">Status</label>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_ORDER.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateEntry(entry.id, { status: s })}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                                entry.status === s ? "text-black border-transparent" : "text-[var(--color-mute)] border-[var(--color-line)]"
                              }`}
                              style={entry.status === s ? { background: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] } : {}}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--color-mute)] mb-1 block">Progress (episodes)</label>
                        <input
                          type="number"
                          min={0}
                          value={entry.progress}
                          onChange={(e) => updateEntry(entry.id, { progress: e.target.value })}
                          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--color-mute)] mb-1 block">Total episodes (optional)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder={entry.totalEpisodes ? `${entry.totalEpisodes}` : "e.g. 24"}
                          value={entry.totalEpisodes ?? ""}
                          onChange={(e) => updateEntry(entry.id, { totalEpisodes: e.target.value || null })}
                          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--color-mute)] mb-1 block">Score (1-10, leave empty for none)</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={entry.score ?? ""}
                          onChange={(e) => updateEntry(entry.id, { score: e.target.value || null })}
                          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                          placeholder="Optional"
                        />
                      </div>
                      <button onClick={() => setEditingEntry(null)} className="w-full rounded-lg bg-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30 transition-all">
                        Done
                      </button>
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
