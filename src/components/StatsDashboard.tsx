"use client";

import { useEffect, useState } from "react";
import Loader, { ErrorState } from "@/components/Loader";
import type { UserStats } from "@/lib/stats";

export default function StatsDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <StatsSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return null;

  const maxGenre = Math.max(...stats.genreBreakdown.map((g) => g.count), 1);
  const maxFormat = Math.max(...stats.formatBreakdown.map((f) => f.count), 1);
  const maxYearEpisodes = Math.max(...stats.yearlyActivity.map((y) => y.episodes), 1);
  const bestDay = [...stats.dayOfWeek].sort((a, b) => b.episodes - a.episodes)[0];

  return (
    <div className="mt-6 space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Anime"
          value={stats.totalAnime}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
          }
          color="var(--color-cyan)"
        />
        <StatCard
          label="Episodes"
          value={stats.totalEpisodes}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          }
          color="var(--color-magenta)"
        />
        <StatCard
          label="Days Watched"
          value={stats.totalDaysWatched}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          }
          color="var(--color-violet)"
        />
        <StatCard
          label="Mean Score"
          value={stats.meanScore}
          suffix="/10"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          }
          color="#facc15"
        />
      </div>

      {/* Status Breakdown */}
      <div>
        <h3 className="font-display text-sm font-bold mb-3">Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatusBadge label="Watching" count={stats.watchingCount} color="var(--color-cyan)" />
          <StatusBadge label="Completed" count={stats.completedCount} color="#22c55e" />
          <StatusBadge label="Planning" count={stats.planningCount} color="var(--color-violet)" />
          <StatusBadge label="Dropped" count={stats.droppedCount} color="var(--color-magenta)" />
        </div>
      </div>

      {/* Genre Breakdown */}
      {stats.genreBreakdown.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold mb-3">Top Genres</h3>
          <div className="space-y-2">
            {stats.genreBreakdown.map((g) => (
              <BarRow
                key={g.genre}
                label={g.genre}
                count={g.count}
                percentage={g.percentage}
                max={maxGenre}
                gradient="from-[var(--color-magenta)] to-[var(--color-cyan)]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Format Breakdown */}
      {stats.formatBreakdown.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold mb-3">Format Breakdown</h3>
          <div className="space-y-2">
            {stats.formatBreakdown.map((f) => (
              <BarRow
                key={f.format}
                label={f.format.replace(/_/g, " ")}
                count={f.count}
                percentage={f.percentage}
                max={maxFormat}
                gradient="from-[var(--color-violet)] to-[var(--color-cyan)]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Yearly Activity */}
      {stats.yearlyActivity.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold mb-3">Yearly Activity</h3>
          <div className="space-y-2">
            {stats.yearlyActivity.map((y) => (
              <div key={y.year} className="flex items-center gap-3">
                <span className="w-10 text-xs font-mono text-[var(--color-mute)] text-right">{y.year}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-5 rounded-md bg-[var(--color-line)] overflow-hidden">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all"
                      style={{ width: `${(y.episodes / maxYearEpisodes) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-[10px] font-mono text-[var(--color-mute)] text-right">
                    {y.completed} completed
                  </span>
                  <span className="w-12 text-[10px] font-mono text-[var(--color-mute)] text-right">
                    {y.episodes} eps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaks + Day of Week */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StreakCard label="Current Streak" value={stats.currentStreak} unit="days" icon="🔥" />
        <StreakCard label="Longest Streak" value={stats.longestStreak} unit="days" icon="⚡" />
        <StreakCard
          label="Best Day"
          value={bestDay?.day ?? "-"}
          unit={`${bestDay?.episodes ?? 0} eps`}
          icon="📺"
        />
      </div>

      {/* Day of Week Chart */}
      {stats.dayOfWeek.some((d) => d.episodes > 0) && (
        <div>
          <h3 className="font-display text-sm font-bold mb-3">Watching by Day of Week</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.dayOfWeek.map((d) => {
              const maxDay = Math.max(...stats.dayOfWeek.map((x) => x.episodes), 1);
              const height = (d.episodes / maxDay) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">{d.episodes}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all"
                    style={{ height: `${height}%`, minHeight: d.episodes > 0 ? "4px" : "0" }}
                  />
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Studios */}
      {stats.topStudios.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold mb-3">Top Studios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {stats.topStudios.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 text-center"
              >
                <div className="text-lg font-bold font-mono text-[var(--color-cyan)]">{s.count}</div>
                <div className="text-[10px] text-[var(--color-mute)] mt-0.5 truncate">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.genreBreakdown.length === 0 && stats.formatBreakdown.length === 0 && (
        <p className="text-center text-sm text-[var(--color-mute)] py-10">
          Add items to your list to see stats.
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold font-mono" style={{ color }}>
          {typeof value === "number" ? value.toLocaleString() : value}{suffix ?? ""}
        </div>
        <div className="text-xs text-[var(--color-mute)] truncate">{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
      <div className="text-2xl font-bold font-mono" style={{ color }}>{count}</div>
      <div className="text-xs text-[var(--color-mute)] mt-0.5">{label}</div>
    </div>
  );
}

function BarRow({
  label,
  count,
  percentage,
  max,
  gradient,
}: {
  label: string;
  count: number;
  percentage: number;
  max: number;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-[var(--color-mute)] truncate text-right shrink-0">{label}</span>
      <div className="flex-1 h-5 rounded-md bg-[var(--color-line)] overflow-hidden">
        <div
          className={`h-full rounded-md bg-gradient-to-r ${gradient} transition-all`}
          style={{ width: `${(count / max) * 100}%` }}
        />
      </div>
      <span className="w-8 text-xs font-mono text-[var(--color-mute)] text-right shrink-0">{count}</span>
      <span className="w-10 text-[10px] font-mono text-[var(--color-mute)] text-right shrink-0">{percentage}%</span>
    </div>
  );
}

function StreakCard({ label, value, unit, icon }: { label: string; value: number | string; unit: string; icon: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xl font-bold font-mono text-[var(--color-ink)]">
          {value} <span className="text-xs font-normal text-[var(--color-mute)]">{unit}</span>
        </div>
        <div className="text-xs text-[var(--color-mute)]">{label}</div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="mt-6 space-y-8 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <div className="h-8 w-20 rounded bg-[var(--color-line)]" />
            <div className="h-3 w-16 mt-2 rounded bg-[var(--color-line)]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <div className="h-7 w-10 mx-auto rounded bg-[var(--color-line)]" />
            <div className="h-3 w-14 mx-auto mt-2 rounded bg-[var(--color-line)]" />
          </div>
        ))}
      </div>
      <div>
        <div className="h-4 w-24 rounded bg-[var(--color-line)] mb-3" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <div className="h-3 w-24 rounded bg-[var(--color-line)]" />
            <div className="flex-1 h-5 rounded-md bg-[var(--color-line)]" />
            <div className="h-3 w-8 rounded bg-[var(--color-line)]" />
            <div className="h-3 w-10 rounded bg-[var(--color-line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
