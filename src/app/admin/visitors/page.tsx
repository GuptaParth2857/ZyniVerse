"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ActiveSession {
  id: string;
  userId: string | null;
  username: string;
  avatar: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  pagesViewed: number;
  lastActiveAt: string;
  startedAt: string;
}

interface VisitorsData {
  liveCount: number;
  activeSessions: ActiveSession[];
  todayVisitors: number;
  anonymousVisitors: number;
  pageViewsToday: number;
  sessionsToday: number;
  avgSessionMinutesToday: number;
  hourlyPageViews: Array<{ label: string; count: number }>;
  topPages: Array<{ path: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  osBreakdown: Array<{ os: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
}

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

function formatSeen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return "now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function KpiCard({
  icon,
  label,
  value,
  color,
  sub,
  decimals = 0,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  sub?: string;
  decimals?: number;
}) {
  const n = useCountUp(value);
  const shown = decimals > 0 ? n.toFixed(decimals) : n.toLocaleString("en-IN");
  return (
    <div className="neon-premium rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-mute)]">{label}</p>
          <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}>{icon}</span>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold" style={{ color }}>{shown}</p>
        {sub && <p className="mt-1 text-[10px] font-mono text-[var(--color-mute)]">{sub}</p>}
      </div>
    </div>
  );
}

function BarChart({ title, accent, data }: { title: string; accent: string; data: { label: string; count: number }[] }) {
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
        </div>
        {data.every((d) => d.count === 0) ? (
          <p className="text-sm text-[var(--color-mute)]">No visits in the last 24 hours yet.</p>
        ) : (
          <>
            <div className="flex h-40 items-end gap-1">
              {data.map((d, i) => (
                <div key={`${d.label}-${i}`} className="group relative flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md transition-all duration-700 ease-out"
                    style={{
                      height: mounted ? `${Math.max((d.count / max) * 100, d.count > 0 ? 6 : 2)}%` : "2%",
                      background: d.count > 0 ? accent : "rgba(255,255,255,0.08)",
                      opacity: d.count > 0 ? 0.85 : 1,
                      transitionDelay: `${i * 15}ms`,
                      boxShadow: d.count > 0 ? `0 0 12px ${accent}44` : undefined,
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md border border-[var(--color-line)] bg-black/90 px-2 py-1 text-[10px] font-mono text-[var(--color-cyan)] opacity-0 transition-opacity group-hover:opacity-100">
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
    </div>
  );
}

function RankList({ title, accent, items, empty }: { title: string; accent: string; items: { name: string; count: number }[]; empty: string }) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...items.map((p) => p.count), 1);

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
          {items.length > 0 && (
            <span className="ml-auto text-[10px] font-mono text-[var(--color-mute)]">{items.length} items</span>
          )}
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-mute)]">{empty}</p>
        ) : (
          <div className="space-y-3">
            {items.map((p, i) => {
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
                      <span className="truncate font-medium text-[var(--color-ink)]">{p.name}</span>
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
    </div>
  );
}

function SessionCard({ session, index }: { session: ActiveSession; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  const isAnon = session.userId === null || session.username === "Anonymous";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 9) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[20px]"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {session.avatar ? (
              <Image
                src={session.avatar}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
                style={{ boxShadow: "0 0 14px rgba(52,211,153,0.5)" }}
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border text-base font-bold"
                style={{ color: "var(--color-cyan)", borderColor: "rgba(41,242,224,0.4)", background: "rgba(41,242,224,0.08)" }}
              >
                {isAnon ? "?" : session.username[0].toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-void)] bg-green-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          </div>
          <div className="min-w-0 flex-1">
            {isAnon ? (
              <span className="block truncate text-sm font-bold text-[var(--color-mute)]">Anonymous Visitor</span>
            ) : (
              <Link href={`/u/${session.username}`} className="block truncate text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-cyan)] transition-colors">
                {session.username}
              </Link>
            )}
            <span className="font-mono text-[10px] text-green-400">{formatSeen(session.lastActiveAt)}</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-[var(--color-cyan)]">{session.pagesViewed}</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">pages</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {session.device && (
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
              {session.device}
            </span>
          )}
          {session.browser && (
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
              {session.browser}
            </span>
          )}
          {session.os && (
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
              {session.os}
            </span>
          )}
          {session.country && (
            <span className="rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-magenta)]">
              {session.country}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line)] pt-2.5">
          <span className="font-mono text-[10px] text-[var(--color-mute)]">
            active {formatSeen(session.lastActiveAt)}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-green-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Live
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SessionSkeleton() {
  return (
    <div className="neon-premium animate-pulse rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-white/10" />
            <div className="h-2.5 w-1/3 rounded bg-white/5" />
          </div>
          <div className="h-8 w-8 rounded bg-white/5" />
        </div>
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-5 w-16 rounded-full bg-white/5" />
          ))}
        </div>
        <div className="mt-4 h-px bg-white/5" />
        <div className="mt-2.5 h-2.5 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function AdminVisitorsPage() {
  const [data, setData] = useState<VisitorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const res = await fetch("/api/admin/visitors/active");
    if (res.ok) {
      setData(await res.json());
      setLastUpdated(new Date());
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(true);
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
          ✦ Live Visitors
        </p>
        <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-4xl">
            Visitor Monitor
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-[var(--color-mute)]">
          Real-time visitor tracking powered by live session heartbeats — auto-refreshes every 15 seconds.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-green-400/40 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          {data ? `${data.liveCount} online now` : "Connecting..."}
        </span>
        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 font-mono text-xs text-[var(--color-mute)]">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}` : "Waiting for first update"}
        </span>
        <button
          onClick={() => fetchData()}
          className="inline-flex items-center gap-2 rounded-full neon-rgb-border bg-[var(--color-void)]/60 px-4 py-2 text-xs font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
        >
          <span className={`inline-block h-2 w-2 rounded-full bg-[var(--color-cyan)] ${refreshing ? "animate-ping" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh now"}
        </button>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SessionSkeleton key={i} />
          ))}
        </div>
      ) : !data ? (
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--color-mute)] text-sm">Admin access required.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KpiCard icon="⚡" label="Live Now" value={data.liveCount} color="#4ade80" sub="active · last 90s" />
            <KpiCard icon="👁️" label="Visitors Today" value={data.todayVisitors} color="var(--color-cyan)" sub={`${data.anonymousVisitors} anonymous`} />
            <KpiCard icon="👀" label="Page Views Today" value={data.pageViewsToday} color="var(--color-amber)" sub="total pageviews" />
            <KpiCard icon="🔌" label="Sessions Today" value={data.sessionsToday} color="var(--color-violet)" sub="started today" />
            <KpiCard icon="🎭" label="Anonymous Today" value={data.anonymousVisitors} color="var(--color-magenta)" sub="no login" />
            <KpiCard icon="⏱️" label="Avg Session" value={data.avgSessionMinutesToday} color="var(--color-amber)" sub="minutes · today" decimals={1} />
          </div>

          <div className="mt-6">
            <BarChart
              title="Page Views · Last 24 Hours"
              accent="var(--color-cyan)"
              data={data.hourlyPageViews}
            />
          </div>

          <div className="mt-8 flex items-center gap-3">
            <p className="text-sm text-[var(--color-mute)]">
              Live Sessions · <span className="font-semibold text-[var(--color-cyan)]">{data.activeSessions.length}</span> active in the last 90 seconds
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>

          {data.activeSessions.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-6 py-16">
              <p className="text-lg text-[var(--color-mute)]">No active sessions right now</p>
              <p className="text-sm text-[var(--color-mute)]/70">When someone visits the site, their session appears here live.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.activeSessions.map((s, i) => (
                <SessionCard key={s.id} session={s} index={i} />
              ))}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RankList
              title="Top Pages Today"
              accent="var(--color-cyan)"
              items={data.topPages.map((p) => ({ name: p.path, count: p.count }))}
              empty="No page views recorded yet today."
            />
            <RankList
              title="Devices Today"
              accent="var(--color-violet)"
              items={data.deviceBreakdown.map((d) => ({ name: d.device, count: d.count }))}
              empty="No device data yet."
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RankList
              title="Operating Systems Today"
              accent="var(--color-magenta)"
              items={data.osBreakdown.map((o) => ({ name: o.os, count: o.count }))}
              empty="No OS data yet."
            />
            <RankList
              title="Countries Today"
              accent="var(--color-amber)"
              items={data.countryBreakdown.map((c) => ({ name: c.country, count: c.count }))}
              empty="No country data yet."
            />
          </div>
        </>
      )}
    </div>
  );
}
