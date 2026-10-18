"use client";

import { Fragment, useCallback, useEffect, useState } from "react";

/**
 * Crawler / AI-bot traffic panel.
 *
 * This is the *server-side* counterpart to /admin/visitors. The visitor panel is
 * fed by a client-side beacon, which crawlers never trigger — they do not run
 * JavaScript. Crawler hits are therefore counted in `src/proxy.ts` and stored in
 * the `SiteCounter` table (see src/lib/bot-stats.ts).
 */

type BotKind = "ai-search" | "ai-training" | "search" | "social" | "seo" | "monitor" | "other";

interface BotSummary {
  id: string;
  kind: BotKind;
  vendor: string;
  total: number;
  today: number;
  last7: number;
  lastSeenDay: string | null;
  daily: Array<{ date: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
}

interface BotStats {
  generatedAt: string;
  trendDays: number;
  totals: {
    hits: number;
    hitsToday: number;
    hits7: number;
    uniqueBots: number;
    aiSearchHits: number;
    aiTrainingHits: number;
    searchEngineHits: number;
  };
  daily: Array<{ date: string; count: number }>;
  kindTotals: Array<{ kind: BotKind; count: number }>;
  bots: BotSummary[];
}

const KIND_META: Record<BotKind, { label: string; color: string; hint: string }> = {
  "ai-search": {
    label: "AI answer",
    color: "#29f2e0",
    hint: "Allowed in robots.txt — these citations send real readers.",
  },
  "ai-training": {
    label: "AI training",
    color: "#f43f5e",
    hint: "Opted out in robots.txt — a hit here means the crawler ignored the rule.",
  },
  search: { label: "Search", color: "#60a5fa", hint: "Classic search index crawlers." },
  social: { label: "Social", color: "#c084fc", hint: "Link preview / unfurl fetchers." },
  seo: { label: "SEO tool", color: "#fbbf24", hint: "Third-party audit crawlers." },
  monitor: { label: "Monitor", color: "#94a3b8", hint: "Uptime, AdsBot and verification tools." },
  other: { label: "Other", color: "#9ca3af", hint: "Bot-shaped User-Agent with no known product." },
};

function fmtDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function Kpi({ label, value, accent, hint }: { label: string; value: number; accent: string; hint?: string }) {
  return (
    <div className="neon-premium rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold" style={{ color: accent }}>
          {fmtNum(value)}
        </div>
        {hint && <div className="mt-1 text-[10px] leading-snug text-[var(--color-mute)]">{hint}</div>}
      </div>
    </div>
  );
}

export default function AdminCrawlersPage() {
  const [data, setData] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/crawlers", { cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error || `Request failed (${res.status})`);
        return;
      }
      setData((await res.json()) as BotStats);
      setError(null);
    } catch {
      setError("Could not reach the crawler stats API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(() => {
      if (!document.hidden) fetchData();
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = useCallback(async () => {
    if (!window.confirm("Delete all crawler counters? Counters only — no user data is touched.")) return;
    setResetting(true);
    try {
      await fetch("/api/admin/crawlers", { method: "DELETE" });
      await fetchData();
    } finally {
      setResetting(false);
    }
  }, [fetchData]);

  const daily = data?.daily ?? [];
  const maxDaily = Math.max(...daily.map((d) => d.count), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Crawlers &amp; AI bots</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-mute)]">
            Server-side crawl traffic. Bots never run JavaScript, so they are invisible to the visitor
            analytics on <span className="font-mono">/admin/visitors</span> — these counters come from the
            request path (Proxy → <span className="font-mono">/api/internal/bot-hit</span>) instead.
          </p>
        </div>
        <button
          onClick={reset}
          disabled={resetting}
          className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-50"
        >
          {resetting ? "Resetting…" : "Reset counters"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      )}

      {loading && !data ? (
        <p className="text-sm text-[var(--color-mute)]">Loading crawler stats…</p>
      ) : (
        data && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
              <Kpi label="Bot hits (all time)" value={data.totals.hits} accent="var(--color-cyan)" />
              <Kpi label="Today (UTC)" value={data.totals.hitsToday} accent="#34d399" />
              <Kpi label="Last 7 days" value={data.totals.hits7} accent="#60a5fa" />
              <Kpi label="Unique bots" value={data.totals.uniqueBots} accent="#c084fc" />
              <Kpi
                label="AI answer crawlers"
                value={data.totals.aiSearchHits}
                accent="#29f2e0"
                hint="OAI-SearchBot, PerplexityBot, ChatGPT-User…"
              />
              <Kpi
                label="AI training crawlers"
                value={data.totals.aiTrainingHits}
                accent="#f43f5e"
                hint="Opted out in robots.txt"
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
              <div className="neon-premium rounded-[20px]">
                <div className="neon-premium-track" />
                <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
                <div className="neon-premium-content rounded-[20px] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full" style={{ background: "var(--color-cyan)" }} />
                    <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
                      Hits per day (last {data.trendDays} days, UTC)
                    </h2>
                  </div>
                  {data.totals.hits === 0 ? (
                    <p className="text-sm text-[var(--color-mute)]">
                      No crawler hits recorded yet. Counters start filling as soon as Googlebot or an AI
                      crawler requests a page in the matcher (content pages, /sitemap.xml, /robots.txt).
                    </p>
                  ) : (
                    <>
                      <div className="flex h-40 items-end gap-1">
                        {daily.map((d, i) => (
                          <div key={d.date} className="group relative flex h-full flex-1 items-end">
                            <div
                              className="w-full rounded-t-md transition-all duration-700 ease-out"
                              style={{
                                height: mounted
                                  ? `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 6 : 2)}%`
                                  : "2%",
                                background: d.count > 0 ? "var(--color-cyan)" : "rgba(255,255,255,0.08)",
                                opacity: d.count > 0 ? 0.85 : 1,
                                transitionDelay: `${i * 15}ms`,
                                boxShadow: d.count > 0 ? "0 0 12px rgba(41,242,224,0.3)" : undefined,
                              }}
                            />
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--color-line)] bg-black/90 px-2 py-1 text-[10px] font-mono text-[var(--color-cyan)] opacity-0 transition-opacity group-hover:opacity-100">
                              {fmtDay(d.date)}: {d.count}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--color-mute)]">
                        <span>{fmtDay(daily[0]?.date ?? "")}</span>
                        <span>{fmtDay(daily[daily.length - 1]?.date ?? "")}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="neon-premium rounded-[20px]">
                <div className="neon-premium-track" />
                <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
                <div className="neon-premium-content rounded-[20px] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full" style={{ background: "#c084fc" }} />
                    <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">By category</h2>
                  </div>
                  {data.kindTotals.length === 0 ? (
                    <p className="text-sm text-[var(--color-mute)]">No data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.kindTotals.map((k) => {
                        const meta = KIND_META[k.kind] ?? KIND_META.other;
                        const pct = Math.round((k.count / Math.max(data.totals.hits, 1)) * 100);
                        return (
                          <div key={k.kind}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}88` }}
                                />
                                <span className="font-medium text-[var(--color-ink)]">{meta.label}</span>
                              </span>
                              <span className="font-mono text-[var(--color-mute)]">
                                <span style={{ color: meta.color }}>{fmtNum(k.count)}</span>
                                <span className="ml-2 text-[10px]">{pct}%</span>
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                  width: mounted ? `${Math.max(pct, 4)}%` : "0%",
                                  background: `linear-gradient(90deg, ${meta.color}55, ${meta.color})`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="mt-4 text-[10px] leading-relaxed text-[var(--color-mute)]">
                    AI answer crawlers are the ones robots.txt allows on purpose. Training crawlers are opted
                    out — any hits there are crawlers fetching despite the rule.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 neon-premium rounded-[20px]">
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
              <div className="neon-premium-content rounded-[20px] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full" style={{ background: "#34d399" }} />
                  <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Detected crawlers</h2>
                  <span className="ml-auto text-[10px] font-mono text-[var(--color-mute)]">
                    {data.bots.length} bots
                  </span>
                </div>

                {data.bots.length === 0 ? (
                  <p className="text-sm text-[var(--color-mute)]">Nothing detected yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-line)] font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                          <th className="py-2 pr-3">Crawler</th>
                          <th className="py-2 pr-3">Category</th>
                          <th className="py-2 pr-3 text-right">Today</th>
                          <th className="py-2 pr-3 text-right">7d</th>
                          <th className="py-2 pr-3 text-right">Total</th>
                          <th className="py-2 pr-3">Last seen (UTC)</th>
                          <th className="py-2 text-right">Top pages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.bots.map((bot) => {
                          const meta = KIND_META[bot.kind] ?? KIND_META.other;
                          const isOpen = expanded === bot.id;
                          return (
                            <Fragment key={bot.id}>
                              <tr
                                className="border-b border-[var(--color-line)]/40 transition-colors hover:bg-white/[0.03]"
                              >
                                <td className="py-2.5 pr-3">
                                  <div className="font-mono text-xs font-bold text-[var(--color-ink)]">{bot.id}</div>
                                  <div className="text-[10px] text-[var(--color-mute)]">{bot.vendor}</div>
                                </td>
                                <td className="py-2.5 pr-3">
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono"
                                    style={{
                                      color: meta.color,
                                      background: `${meta.color}18`,
                                      border: `1px solid ${meta.color}40`,
                                    }}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                                    {meta.label}
                                  </span>
                                </td>
                                <td className="py-2.5 pr-3 text-right font-mono text-xs text-[var(--color-ink)]">
                                  {fmtNum(bot.today)}
                                </td>
                                <td className="py-2.5 pr-3 text-right font-mono text-xs text-[var(--color-ink)]">
                                  {fmtNum(bot.last7)}
                                </td>
                                <td
                                  className="py-2.5 pr-3 text-right font-mono text-xs font-bold"
                                  style={{ color: meta.color }}
                                >
                                  {fmtNum(bot.total)}
                                </td>
                                <td className="py-2.5 pr-3 font-mono text-[11px] text-[var(--color-mute)]">
                                  {bot.lastSeenDay ? fmtDay(bot.lastSeenDay) : "—"}
                                </td>
                                <td className="py-2.5 text-right">
                                  {bot.topPaths.length > 0 ? (
                                    <button
                                      onClick={() => setExpanded(isOpen ? null : bot.id)}
                                      className="rounded-md border border-[var(--color-line)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                                    >
                                      {isOpen ? "Hide" : `Show (${bot.topPaths.length})`}
                                    </button>
                                  ) : (
                                    <span className="font-mono text-[10px] text-[var(--color-mute)]">—</span>
                                  )}
                                </td>
                              </tr>
                              {isOpen && (
                                <tr className="border-b border-[var(--color-line)]/40 bg-black/20">
                                  <td colSpan={7} className="px-1 py-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div>
                                        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                                          Most crawled pages
                                        </div>
                                        <ul className="space-y-1">
                                          {bot.topPaths.map((p) => (
                                            <li key={p.path} className="flex items-center justify-between gap-3">
                                              <a
                                                href={p.path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate font-mono text-[11px] text-[var(--color-cyan)] hover:underline"
                                              >
                                                {p.path}
                                              </a>
                                              <span className="shrink-0 font-mono text-[11px] text-[var(--color-mute)]">
                                                {fmtNum(p.count)}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                                          Countries
                                        </div>
                                        {bot.countries.length === 0 ? (
                                          <p className="text-[11px] text-[var(--color-mute)]">No geo data yet.</p>
                                        ) : (
                                          <ul className="space-y-1">
                                            {bot.countries.map((c) => (
                                              <li key={c.country} className="flex items-center justify-between gap-3">
                                                <span className="font-mono text-[11px] text-[var(--color-ink)]">
                                                  {c.country}
                                                </span>
                                                <span className="font-mono text-[11px] text-[var(--color-mute)]">
                                                  {fmtNum(c.count)}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                        <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-mute)]">
                                          {meta.hint}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="mt-4 text-[10px] leading-relaxed text-[var(--color-mute)]">
                  Coverage: crawler hits are only counted for paths in the Proxy matcher — content pages
                  (<span className="font-mono">/anime</span>, <span className="font-mono">/manga</span>,{" "}
                  <span className="font-mono">/toons</span>, <span className="font-mono">/filler</span>, …) plus{" "}
                  <span className="font-mono">/sitemap.xml</span> and <span className="font-mono">/robots.txt</span>.
                  Static assets and API calls are not counted.
                </p>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
