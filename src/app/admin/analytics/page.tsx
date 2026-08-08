"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Metrics {
  dau: number;
  wau: number;
  mau: number;
  pageViewsToday: number;
  pageViews7: number;
  pageViews30: number;
  newUsersToday: number;
  totalUsers: number;
  sessionsToday: number;
  activeNow: number;
  avgSessionMinutes: number;
  avgPagesPerSession: number;
  retentionRate: number;
  dailyPageViews: { date: string; label: string; count: number }[];
  dailyActiveUsers: { date: string; label: string; count: number }[];
  dailyNewUsers: { date: string; label: string; count: number }[];
  topPages: { path: string; count: number }[];
  searchTrends: { query: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
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

function pageLabel(path: string): string {
  if (path === "/") return "Home";
  if (path.startsWith("/anime/")) return "Anime Detail";
  if (path.startsWith("/manga/")) return "Manga Detail";
  const map: Record<string, string> = {
    "/anime": "Anime List",
    "/manga": "Manga List",
    "/merch": "Merch",
    "/ost": "OST",
    "/filler": "Filler Guide",
    "/light-novels": "Light Novels",
    "/wiki": "Wiki",
    "/forum": "Forum",
    "/recommendations": "Recommendations",
    "/news": "News",
    "/admin": "Admin",
  };
  return map[path] || path || "(unknown)";
}

function KpiCard({
  icon,
  label,
  value,
  color,
  sub,
  decimals = 0,
  display,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  sub?: string;
  decimals?: number;
  display?: string;
}) {
  const n = useCountUp(value);
  const shown = display ?? (decimals > 0 ? n.toFixed(decimals) : n.toLocaleString("en-IN"));
  return (
    <div className="neon-feature-card rounded-xl p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">{label}</p>
        <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold font-mono" style={{ color }}>{shown}</p>
      {sub && <p className="mt-1 text-[10px] font-mono text-[var(--color-mute)]">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
            <div className="h-3 w-20 rounded bg-white/5" />
            <div className="mt-3 h-7 w-24 rounded bg-white/5" />
            <div className="mt-2 h-2 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
            <div className="h-4 w-40 rounded bg-white/5" />
            <div className="mt-8 h-32 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({
  title,
  accent,
  data,
  empty,
}: {
  title: string;
  accent: string;
  data: { label: string; count: number }[];
  empty: string;
}) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...data.map((d) => d.count), 1);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      {data.length === 0 || data.every((d) => d.count === 0) ? (
        <p className="text-sm text-[var(--color-mute)]">{empty}</p>
      ) : (
        <>
          <div className="flex items-end gap-1.5 h-40">
            {data.map((d, i) => (
              <div key={`${d.label}-${i}`} className="group relative flex-1 flex items-end h-full">
                <div
                  className="w-full rounded-t-md transition-all duration-700 ease-out"
                  style={{
                    height: mounted ? `${Math.max((d.count / max) * 100, d.count > 0 ? 6 : 3)}%` : "3%",
                    background: d.count > 0 ? accent : "rgba(255,255,255,0.08)",
                    opacity: d.count > 0 ? 0.85 : 1,
                    transitionDelay: `${i * 40}ms`,
                    boxShadow: d.count > 0 ? `0 0 12px ${accent}44` : undefined,
                  }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-black/90 border border-[var(--color-line)] px-2 py-1 text-[10px] font-mono text-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {d.label}: {d.count}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--color-mute)]">
            <span>{data[0]?.label}</span>
            <span>{data[data.length - 1]?.label}</span>
          </div>
        </>
      )}
    </div>
  );
}

function RankList({
  title,
  accent,
  items,
  nameFor,
  empty,
  bars,
  plain = false,
}: {
  title: string;
  accent: string;
  items: { name: string; count: number }[];
  nameFor: (name: string) => string;
  empty: string;
  bars: number;
  plain?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...items.map((p) => p.count), 1);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={plain ? "" : "rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6"}>
      {title && (
        <div className="mb-4 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
          <h2 className="font-display text-lg font-bold">{title}</h2>
          {items.length > 0 && (
            <span className="ml-auto text-[10px] font-mono text-[var(--color-mute)]">{items.length} items</span>
          )}
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)]">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, bars).map((p, i) => {
            const pct = Math.round((p.count / max) * 100);
            return (
              <div key={`${p.name}-${i}`}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
                      style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}40` }}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate font-medium text-[var(--color-text)]">{nameFor(p.name)}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[var(--color-mute)]">
                    <span style={{ color: accent }}>{p.count}</span>
                    <span className="ml-2 text-[10px]">{pct}%</span>
                  </span>
                </div>
                <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: mounted ? `${Math.max(pct, 4)}%` : "0%",
                      background: `linear-gradient(90deg, ${accent}55, ${accent})`,
                      transitionDelay: `${i * 70}ms`,
                      boxShadow: `0 0 10px ${accent}55`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setMetrics(data);
      setAccessDenied(false);
    } catch {
      if (!silent) setAccessDenied(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load(true), 0);
    const interval = setInterval(() => load(true), 90000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin · Analytics</p>
          <h1 className="font-display text-3xl font-bold mt-1 sm:text-4xl">Analytics Dashboard</h1>
        </div>
        <Skeleton />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--color-mute)] text-sm">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const topPagesItems = metrics.topPages.map((p) => ({ name: p.path, count: p.count }));
  const searchItems = metrics.searchTrends.map((s) => ({ name: s.query, count: s.count }));
  const deviceItems = metrics.deviceBreakdown.map((d) => ({ name: d.device, count: d.count }));
  const browserItems = metrics.browserBreakdown.map((b) => ({ name: b.browser, count: b.count }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin · Analytics</p>
          <h1 className="font-display text-3xl font-bold mt-1 sm:text-4xl">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-cyan)]" />
            </span>
            Live · {metrics.activeNow} online now · auto-refresh every 45s · {metrics.totalUsers} total users
          </p>
        </div>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-lg neon-rgb-border bg-[var(--color-void)]/60 px-3 py-2 text-xs font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
        >
          <span className={`inline-block h-2 w-2 rounded-full bg-[var(--color-cyan)] ${refreshing ? "animate-ping" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="👤" label="DAU" value={metrics.dau} color="var(--color-cyan)" sub="active today" />
        <KpiCard icon="📅" label="WAU" value={metrics.wau} color="var(--color-violet)" sub="7-day active" />
        <KpiCard icon="🌙" label="MAU" value={metrics.mau} color="var(--color-magenta)" sub="30-day active" />
        <KpiCard
          icon="👁️"
          label="Page Views"
          value={metrics.pageViewsToday}
          color="var(--color-amber)"
          sub={`today · ${metrics.pageViews7.toLocaleString("en-IN")} in 7d`}
        />
        <KpiCard icon="🆕" label="New Users" value={metrics.newUsersToday} color="var(--color-cyan)" sub="registered today" />
        <KpiCard icon="🔌" label="Sessions" value={metrics.sessionsToday} color="var(--color-violet)" sub="started today" />
        <KpiCard icon="⚡" label="Online Now" value={metrics.activeNow} color="var(--color-cyan)" sub="active · last 5 min" />
        <KpiCard
          icon="⏱️"
          label="Avg Session"
          value={metrics.avgSessionMinutes}
          color="var(--color-magenta)"
          sub="minutes · 14d"
          decimals={1}
        />
        <KpiCard
          icon="📄"
          label="Pages / Session"
          value={metrics.avgPagesPerSession}
          color="var(--color-amber)"
          sub="avg · 14d"
          decimals={1}
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Page Views · Last 14 Days"
          accent="var(--color-cyan)"
          data={metrics.dailyPageViews}
          empty="No page views recorded yet."
        />
        <BarChart
          title="Active Users · Last 14 Days"
          accent="var(--color-magenta)"
          data={metrics.dailyActiveUsers}
          empty="No activity recorded yet."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankList
          title="Top Pages"
          accent="var(--color-cyan)"
          items={topPagesItems}
          nameFor={pageLabel}
          empty="No page views recorded yet."
          bars={10}
        />
        <RankList
          title="Search Trends"
          accent="var(--color-violet)"
          items={searchItems}
          nameFor={(q) => `"${q}"`}
          empty="No searches recorded yet. Site search logs queries here."
          bars={10}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="New Users · Last 14 Days"
          accent="var(--color-violet)"
          data={metrics.dailyNewUsers}
          empty="No new users registered yet."
        />
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[var(--color-amber)]" />
            <h2 className="font-display text-lg font-bold">Sessions · Devices &amp; Browsers</h2>
          </div>
          <div className="space-y-6">
            <RankList
              title=""
              accent="var(--color-amber)"
              items={deviceItems}
              nameFor={(d) => d}
              empty="No session data yet."
              bars={5}
              plain
            />
            <RankList
              title=""
              accent="var(--color-cyan)"
              items={browserItems}
              nameFor={(b) => b}
              empty="No session data yet."
              bars={5}
              plain
            />
          </div>
        </div>
      </div>
    </div>
  );
}
