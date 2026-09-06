"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface TrackerEntry {
  id: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  status: string;
  progress: number;
  totalEpisodes: number | null;
  score: number | null;
}

interface Tracker {
  id: string;
  season: string;
  year: number;
  entries: TrackerEntry[];
}

const STATUSES = [
  { value: "WATCHING", label: "Watching", color: "var(--color-cyan)" },
  { value: "COMPLETED", label: "Completed", color: "#22c55e" },
  { value: "DROPPED", label: "Dropped", color: "#ef4444" },
  { value: "PLANNED", label: "Planned", color: "var(--color-violet)" },
] as const;

export default function SeasonalTrackerWidget({ mediaId, mediaTitle, mediaImage, totalEpisodes }: { mediaId: number; mediaTitle: string; mediaImage?: string; totalEpisodes?: number | null }) {
  const { data: session } = useSession();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [entry, setEntry] = useState<TrackerEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSeason = currentMonth <= 3 ? "WINTER" : currentMonth <= 6 ? "SPRING" : currentMonth <= 9 ? "SUMMER" : "FALL";
  const currentYear = now.getFullYear();

  const fetchTracker = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seasonal-tracker?season=${currentSeason}&year=${currentYear}`);
      const data = await res.json();
      const t = data.trackers?.[0];
      if (t) {
        setTracker(t);
        const e = t.entries?.find((x: TrackerEntry) => x.mediaId === mediaId);
        setEntry(e || null);
      }
    } catch {
      setError("Failed to load tracker");
    }
    setLoading(false);
  }, [session, currentSeason, currentYear, mediaId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTracker();
  }, [fetchTracker]);

  async function addToTracker() {
    if (!session?.user?.id) return;
    setAdding(true);
    setError("");
    try {
      const tRes = await fetch("/api/seasonal-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: currentSeason, year: currentYear }),
      });
      const tData = await tRes.json();
      const trackerId = tData.tracker.id;

      const eRes = await fetch(`/api/seasonal-tracker/${trackerId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, mediaTitle, mediaImage, totalEpisodes: totalEpisodes ?? null }),
      });
      const eData = await eRes.json();
      setTracker(tData.tracker);
      setEntry(eData.entry);
    } catch {
      setError("Failed to add to tracker");
    }
    setAdding(false);
  }

  async function updateStatus(newStatus: string) {
    if (!tracker || !entry) return;
    try {
      const res = await fetch(`/api/seasonal-tracker/${tracker.id}/entries/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      setEntry(data.entry);
    } catch {}
  }

  if (!session?.user?.id) return null;

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-[var(--color-cyan)]/30 border-t-[var(--color-cyan)] animate-spin" />
          <span className="text-xs text-[var(--color-mute)]">Loading tracker...</span>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
        {error && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">Seasonal Tracker</p>
            <p className="text-xs text-[var(--color-mute)]">{currentSeason.charAt(0) + currentSeason.slice(1).toLowerCase()} {currentYear}</p>
          </div>
          <button
            onClick={addToTracker}
            disabled={adding}
            className="rounded-lg bg-gradient-to-r from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 border border-[var(--color-cyan)]/30 px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] hover:from-[var(--color-cyan)]/30 hover:to-[var(--color-magenta)]/30 transition-all disabled:opacity-50"
          >
            {adding ? "Adding..." : "+ Add to Tracker"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
      )}
      <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">Seasonal Tracker</p>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => updateStatus(s.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
              entry.status === s.value
                ? "text-black border-transparent"
                : "text-[var(--color-mute)] border-[var(--color-line)] hover:text-[var(--color-ink)]"
            }`}
            style={entry.status === s.value ? { background: s.color, borderColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>
      {entry.progress > 0 && (
        <p className="text-xs text-[var(--color-mute)] mt-2">Ep {entry.progress}{entry.totalEpisodes ? ` / ${entry.totalEpisodes}` : ""}</p>
      )}
    </div>
  );
}
