"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface WatchEntry {
  mediaId: number;
  episode: number;
  mediaTitle?: string;
  title?: string;
  watchedAt: string;
}

interface StreakData {
  current: number;
  longest: number;
}

function getGroupLabel(dateStr: string): string {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  const date = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays <= 7) return "This Week";

  return "Earlier";
}

export default function WatchHistory() {
  const { data: session } = useSession();
  const [episodes, setEpisodes] = useState<WatchEntry[]>([]);
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session?.user?.id) { setLoading(false); return; }
    fetch("/api/track/recent")
      .then((r) => r.json())
      .then((d) => {
        setEpisodes(d.episodes || []);
        setStreak(d.streak || { current: 0, longest: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session?.user?.id]);

  if (!session?.user?.id) return null;

  const grouped: Record<string, WatchEntry[]> = {};
  for (const ep of episodes) {
    const date = ep.watchedAt.split("T")[0];
    const label = getGroupLabel(date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(ep);
  }

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
        Watch History
      </h3>

      {/* Streak */}
      {streak.current > 0 && (
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="rounded-lg bg-[var(--color-cyan)]/10 px-3 py-2">
            <span className="font-mono text-lg font-bold text-[var(--color-cyan)]">{streak.current}</span>
            <span className="ml-1 text-xs text-[var(--color-mute)]">day streak</span>
          </div>
          <div className="rounded-lg bg-[var(--color-magenta)]/10 px-3 py-2">
            <span className="font-mono text-lg font-bold text-[var(--color-magenta)]">{streak.longest}</span>
            <span className="ml-1 text-xs text-[var(--color-mute)]">longest</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-[var(--color-mute)]">Loading...</div>
      ) : episodes.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)] text-center py-6">
          No episodes watched yet. <Link href="/search" className="text-[var(--color-cyan)] hover:underline">Browse anime</Link>
        </p>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const items = grouped[group];
            if (!items) return null;
            return (
              <div key={group}>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-2">{group}</h4>
                <div className="space-y-2">
                  {items.map((ep, i) => (
                    <Link
                      key={`${ep.mediaId}-${ep.episode}-${i}`}
                      href={`/anime/${ep.mediaId}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 hover:border-[var(--color-cyan)]/40 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{ep.mediaTitle || `Anime #${ep.mediaId}`}</p>
                        <p className="text-[10px] text-[var(--color-mute)]">
                          Episode {ep.episode}{ep.title ? ` — ${ep.title}` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-[10px] font-mono text-[var(--color-mute)]">
                          {new Date(ep.watchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span className="text-[9px] text-[var(--color-cyan)]">Continue →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
