"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface OverviewData {
  totalUsers: number;
  todayUsers: number;
  pendingFeedback: number;
  todayPageViews: number;
  liveVisitors: number;
  totalPageViews: number;
  todaySessions: number;
  feedbackStats: { pending: number; replied: number; resolved: number; featured: number; today: number };
  weeklySignups: Array<{ label: string; date: string; count: number }>;
  recentFeedback: Array<{
    id: string;
    type: string;
    message: string;
    status: string;
    isFeatured: boolean;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    username: string;
    avatar: string | null;
    createdAt: string;
  }>;
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  bug: { label: "Bug", color: "#f87171" },
  suggestion: { label: "Suggestion", color: "#60a5fa" },
  feature: { label: "Feature", color: "#4ade80" },
  other: { label: "Other", color: "#a1a1aa" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#f59e0b" },
  replied: { label: "Replied", color: "#29f2e0" },
  resolved: { label: "Resolved", color: "#4ade80" },
};

const QUICK_ACTIONS = [
  { href: "/admin/feedback", icon: "💬", label: "Feedback", desc: "Review, feature & resolve", color: "#29f2e0" },
  { href: "/admin/visitors", icon: "👁️", label: "Visitors", desc: "Live sessions & traffic", color: "#22c55e" },
  { href: "/admin/users", icon: "👥", label: "Users", desc: "Manage accounts", color: "#8a5cff" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics", desc: "Engagement analytics", color: "#f59e0b" },
  { href: "/admin/ads", icon: "📢", label: "Ads", desc: "Placements & earnings", color: "#ff2d78" },
  { href: "/admin/affiliate", icon: "🛒", label: "Affiliate", desc: "Links & conversions", color: "#00d4ff" },
  { href: "/admin/awards", icon: "🏆", label: "Awards", desc: "Annual award entries", color: "#ffd700" },
  { href: "/admin/reels", icon: "🎬", label: "Reels", desc: "Moderate community reels", color: "#ff69b4" },
];

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function formatSeen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function KpiCard({ icon, label, value, color, sub }: { icon: string; label: string; value: number; color: string; sub?: string }) {
  const n = useCountUp(value);
  return (
    <div className="neon-premium rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</p>
          <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}>{icon}</span>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold" style={{ color }}>{n.toLocaleString("en-IN")}</p>
        {sub && <p className="mt-1 text-[10px] font-mono text-[var(--color-mute)]">{sub}</p>}
      </div>
    </div>
  );
}

function BarChart({ title, accent, data }: { title: string; accent: string; data: { label: string; date: string; count: number }[] }) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...data.map((d) => d.count), 1);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="neon-premium rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">{title}</h2>
          <span className="ml-auto text-[10px] font-mono text-[var(--color-mute)]">last 7 days</span>
        </div>
        {data.every((d) => d.count === 0) ? (
          <p className="py-8 text-center text-sm text-[var(--color-mute)]">No new signups in the last 7 days.</p>
        ) : (
          <>
            <div className="flex h-44 items-end gap-2">
              {data.map((d, i) => (
                <div key={d.date} className="group relative flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md transition-all duration-700 ease-out"
                    style={{
                      height: mounted ? `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 3)}%` : "3%",
                      background: d.count > 0 ? `linear-gradient(180deg, ${accent}, ${accent}66)` : "rgba(255,255,255,0.08)",
                      opacity: d.count > 0 ? 0.9 : 1,
                      transitionDelay: `${i * 60}ms`,
                      boxShadow: d.count > 0 ? `0 0 16px ${accent}44` : undefined,
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md border border-[var(--color-line)] bg-black/90 px-2 py-1 text-[10px] font-mono text-[var(--color-cyan)] opacity-0 transition-opacity group-hover:opacity-100">
                    {d.date}: {d.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--color-mute)]">
              {data.map((d) => (
                <span key={d.date} className="flex-1 text-center">{d.label}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ color, label, filled }: { color: string; label: string; filled?: boolean }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color,
        background: filled ? `${color}22` : "transparent",
        border: `1px solid ${color}55`,
        boxShadow: `0 0 10px ${color}22`,
      }}
    >
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="neon-premium animate-pulse rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="mt-3 h-8 w-16 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) {
      setData(await res.json());
      setLastUpdated(new Date());
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load(), 0);
    const interval = setInterval(load, 60000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--color-mute)] text-sm">Admin access required.</p>
          <Link href="/" className="inline-block mt-4 text-sm text-[var(--color-cyan)] hover:underline">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
          ✦ Admin Overview
        </p>
        <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-4xl">
            Command Center
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-[var(--color-mute)]">
          Live snapshot of your platform — users, traffic, sessions and community feedback in real time.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-green-400/40 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          {data.liveVisitors} online now
        </span>
        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 font-mono text-xs text-[var(--color-mute)]">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}` : "Waiting for first update"}
        </span>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full neon-rgb-border bg-[var(--color-void)]/60 px-4 py-2 text-xs font-mono text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
        >
          <span className={`inline-block h-2 w-2 rounded-full bg-[var(--color-cyan)] ${refreshing ? "animate-ping" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh now"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon="👥" label="Total Users" value={data.totalUsers} color="var(--color-cyan)" sub={`+${data.todayUsers} today`} />
        <KpiCard icon="👁️" label="Live Now" value={data.liveVisitors} color="#4ade80" sub="last 90s" />
        <KpiCard icon="📄" label="Views Today" value={data.todayPageViews} color="var(--color-violet)" sub="page views" />
        <KpiCard icon="🔌" label="Sessions Today" value={data.todaySessions} color="var(--color-amber)" sub="started today" />
        <KpiCard icon="💬" label="Pending Feedback" value={data.pendingFeedback} color="#f59e0b" sub="needs review" />
        <KpiCard icon="📊" label="Total Views" value={data.totalPageViews} color="#ff2d78" sub="all time" />
      </div>

      <div className="mt-8">
        <BarChart
          title="New Signups · Last 7 Days"
          accent="var(--color-cyan)"
          data={data.weeklySignups}
        />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <p className="font-display text-lg font-bold text-[var(--color-ink)]">Quick Actions</p>
          <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group relative overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-panel)] p-4 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${a.color}14, transparent 70%)` }}
              />
              <span className="text-2xl">{a.icon}</span>
              <p className="mt-3 text-sm font-bold" style={{ color: a.color }}>{a.label}</p>
              <p className="mt-0.5 text-[10px] text-[var(--color-mute)]">{a.desc}</p>
              <span className="mt-3 inline-block font-mono text-[10px] text-[var(--color-mute)] transition-colors group-hover:text-[var(--color-cyan)]">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="neon-premium rounded-[20px]">
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
          <div className="neon-premium-content rounded-[20px] p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[var(--color-amber)]" />
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Recent Feedback</h2>
              <Link href="/admin/feedback" className="ml-auto text-xs text-[var(--color-cyan)] hover:underline">
                View all →
              </Link>
            </div>
            {data.recentFeedback.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-mute)]">No feedback yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentFeedback.map((f) => {
                  const type = TYPE_META[f.type] || TYPE_META.other;
                  const status = STATUS_META[f.status] || STATUS_META.pending;
                  return (
                    <Link
                      key={f.id}
                      href="/admin/feedback"
                      className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-black/20 p-3 transition-colors hover:border-[var(--color-line)]/60 hover:bg-black/30"
                    >
                      <Badge color={type.color} label={type.label} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[var(--color-ink)]">{f.message}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge color={status.color} label={status.label} />
                          <span className="font-mono text-[10px] text-[var(--color-mute)]">{formatSeen(f.createdAt)}</span>
                          {f.isFeatured && (
                            <span className="font-mono text-[10px]" style={{ color: "#ffd700" }}>★ Featured</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="neon-premium rounded-[20px]">
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
          <div className="neon-premium-content rounded-[20px] p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
              <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Recent Signups</h2>
              <Link href="/admin/users" className="ml-auto text-xs text-[var(--color-cyan)] hover:underline">
                View all →
              </Link>
            </div>
            {data.recentUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-mute)]">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentUsers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/u/${u.username}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-black/20 p-3 transition-colors hover:border-[var(--color-line)]/60 hover:bg-black/30"
                  >
                    {u.avatar ? (
                      <Image src={u.avatar} alt={u.username} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
                        style={{ color: "var(--color-cyan)", border: "1px solid rgba(41,242,224,0.4)", background: "rgba(41,242,224,0.08)" }}
                      >
                        {u.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{u.username}</p>
                      <p className="font-mono text-[10px] text-[var(--color-mute)]">Joined {formatSeen(u.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
