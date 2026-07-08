"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader, { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";

interface StatsData {
  totalAnime: number;
  completed: number;
  totalEpisodes: number;
  hoursWatched: number;
  avgEpisodesPerDay: number;
  currentStreak: number;
  totalDays: number;
  genreBreakdown: Record<string, number>;
  formatBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  scoreDistribution: { score: number; count: number }[];
  yearlyActivity: { year: number; count: number }[];
}

export default function StatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats-detail")
      .then((r) => {
        if (!r.ok) throw new Error("Not logged in");
        return r.json();
      })
      .then((d) => { setStats(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <Loader label="Crunching your stats..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!stats) return null;

  const maxScore = Math.max(...stats.scoreDistribution.map((s) => s.count), 1);
  const maxYear = Math.max(...stats.yearlyActivity.map((y) => y.count), 1);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Analytics</p>
          <h1 className="font-display text-3xl font-bold mt-1">Your Watch Statistics</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Anime" value={stats.totalAnime} icon="📺" />
          <StatCard label="Episodes Watched" value={stats.totalEpisodes} icon="🎬" />
          <StatCard label="Hours Watched" value={stats.hoursWatched} icon="⏱️" suffix="hrs" />
          <StatCard label="Current Streak" value={stats.currentStreak} icon="🔥" suffix="days" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Completed" value={stats.completed} icon="✅" />
          <StatCard label="Avg/Day" value={stats.avgEpisodesPerDay} icon="📊" />
          <StatCard label="Watching Days" value={stats.totalDays} icon="📅" />
          <StatCard label="Anime Count" value={Object.keys(stats.genreBreakdown).length || stats.totalAnime} icon="🏷️" />
        </div>

        {stats.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 mb-6">
            <h3 className="font-display text-sm font-bold mb-3">Status Breakdown</h3>
            <div className="space-y-1.5">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => {
                const pct = ((count / stats.totalAnime) * 100).toFixed(1);
                return (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <span className="w-24 font-medium capitalize">{status.toLowerCase().replace(/_/g, " ")}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right font-mono text-[var(--color-mute)]">{pct}%</span>
                    <span className="w-8 text-right font-mono text-[var(--color-mute)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.scoreDistribution.length > 0 && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 mb-6">
            <h3 className="font-display text-sm font-bold mb-3">Your Score Distribution</h3>
            <div className="space-y-1">
              {stats.scoreDistribution.map((s) => (
                <div key={s.score} className="flex items-center gap-2 text-[11px]">
                  <span className="w-4 text-right font-mono text-[var(--color-mute)]">{s.score}%</span>
                  <div className="flex-1 h-2.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-emerald-400" style={{ width: `${(s.count / maxScore) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-[var(--color-mute)]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.yearlyActivity.length > 0 && (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h3 className="font-display text-sm font-bold mb-3">Yearly Activity</h3>
            <div className="flex items-end gap-2 h-28">
              {stats.yearlyActivity.map((y) => (
                <div key={y.year} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">{y.count}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-[var(--color-magenta)] to-[var(--color-cyan)] transition-all" style={{ height: `${(y.count / maxYear) * 100}%`, minHeight: y.count > 0 ? "4px" : "0" }} />
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">{y.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/profile" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">← Back to Profile</Link>
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({ label, value, icon, suffix }: { label: string; value: number | string; icon: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] text-[var(--color-mute)] font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && <span className="text-xs text-[var(--color-mute)] ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
