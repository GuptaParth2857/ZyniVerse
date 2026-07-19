"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

interface EpisodeTrackerProps {
  mediaId: number;
  totalEpisodes: number;
  animeTitle?: string;
}

export default function EpisodeTracker({ mediaId, totalEpisodes, animeTitle }: EpisodeTrackerProps) {
  const { data: session } = useSession();
  const [watched, setWatched] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session?.user?.id) { setLoading(false); return; }
    fetch(`/api/track/progress?mediaId=${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setWatched(d.watched || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId, session?.user?.id]);

  const toggleEpisode = useCallback(async (episode: number) => {
    if (!session?.user?.id || toggling !== null) return;
    setToggling(episode);

    const isWatched = watched.includes(episode);
    const newWatched = isWatched ? watched.filter((e) => e !== episode) : [...watched, episode].sort((a, b) => a - b);
    setWatched(newWatched);

    try {
      if (isWatched) {
        await fetch("/api/track/episode", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, episode }),
        });
      } else {
        await fetch("/api/track/episode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, episode, totalEpisodes }),
        });
      }
    } catch {
      setWatched(watched);
    }
    setToggling(null);
  }, [mediaId, totalEpisodes, watched, session?.user?.id, toggling]);

  const markAllUpTo = useCallback(async (episode: number) => {
    if (!session?.user?.id) return;
    const newWatched: number[] = [];
    for (let i = 1; i <= episode; i++) {
      if (!watched.includes(i)) newWatched.push(i);
    }
    if (newWatched.length === 0) return;
    setWatched((prev) => [...new Set([...prev, ...newWatched])].sort((a, b) => a - b));

    for (const ep of newWatched) {
      await fetch("/api/track/episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, episode: ep, totalEpisodes }),
      }).catch(() => {});
    }
  }, [mediaId, totalEpisodes, watched, session?.user?.id]);

  const nextUnwatched = watched.length > 0 ? Math.max(...watched) + 1 : 1;
  const progress = totalEpisodes > 0 ? Math.round((watched.length / totalEpisodes) * 100) : 0;

  if (!session?.user?.id) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
        Episodes
      </h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium">
            Ep {watched.length}/{totalEpisodes} watched
          </span>
          <span className="text-[var(--color-cyan)] font-mono text-xs">{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--color-line)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[10, 25, 50, totalEpisodes].filter((n) => n < totalEpisodes).map((n) => (
          <button
            key={n}
            onClick={() => markAllUpTo(n)}
            className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-xs font-medium text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
          >Mark up to ep {n}</button>
        ))}
        <button
          onClick={() => markAllUpTo(totalEpisodes)}
          className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-xs font-medium text-[var(--color-mute)] hover:border-green-500 hover:text-green-500 transition-all"
        >✓ Mark all watched</button>
        <div className="ml-auto">
          <ShareButton mediaId={mediaId} title={animeTitle || "Anime"} />
        </div>
      </div>

      {/* Episode grid */}
      {loading ? (
        <div className="text-sm text-[var(--color-mute)]">Loading episodes...</div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto scrollbar-thin">
          {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
            const isWatched = watched.includes(ep);
            const isNext = ep === nextUnwatched && nextUnwatched <= totalEpisodes;
            return (
              <button
                key={ep}
                onClick={() => toggleEpisode(ep)}
                disabled={toggling === ep}
                className={`relative flex items-center justify-center w-9 h-9 rounded-lg text-xs font-mono font-semibold transition-all ${
                  isWatched
                    ? "bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-magenta)] text-black shadow-sm"
                    : "bg-[var(--color-surface)] text-[var(--color-mute)] border border-[var(--color-line)] hover:border-[var(--color-cyan)]"
                } ${isNext && !isWatched ? "ring-2 ring-[var(--color-cyan)] ring-offset-1 ring-offset-[var(--color-panel)]" : ""}`}
              >
                {isWatched ? "✓" : ep}
              </button>
            );
          })}
        </div>
      )}

      {/* Sync info */}
      {watched.length > 0 && totalEpisodes > 0 && watched.length >= totalEpisodes && (
        <p className="mt-4 text-xs text-green-500 font-semibold text-center">
          ✓ All episodes watched — marked as completed
        </p>
      )}
    </div>
  );
}
