"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { amazonProductUrl, AMAZON_TAG } from "@/lib/affiliate-config";
import TiltCard from "@/components/TiltCard";

interface PartnerStat {
  partner: string;
  count: number;
  revenue: number;
}

interface PageStat {
  page: string;
  count: number;
}

interface DailyStat {
  date: string;
  label: string;
  count: number;
}

interface RecentClick {
  id: string;
  partner: string;
  page: string;
  createdAt: string;
}

interface AffiliateStats {
  totalClicks: number;
  estimatedRevenue: number;
  clicksLast7: number;
  clicksLast30: number;
  byPartner: PartnerStat[];
  byPage: PageStat[];
  recent: RecentClick[];
  daily: DailyStat[];
}

type ToastKind = "success" | "error";
type Toast = { text: string; kind: ToastKind } | null;

const PARTNER_META: Record<string, { label: string; color: string }> = {
  amazon: { label: "Amazon", color: "#ff9900" },
  crunchyroll: { label: "Crunchyroll", color: "#ff69b4" },
  cdjapan: { label: "CDJapan", color: "#8a5cff" },
  playasia: { label: "PlayAsia", color: "#22c55e" },
  bookwalker: { label: "BookWalker", color: "#00d4ff" },
};

const PARTNER_ICONS: Record<string, string> = {
  amazon: "🛒",
  crunchyroll: "🍿",
  cdjapan: "💿",
  playasia: "🎮",
  bookwalker: "📚",
};

const DEFAULT_PARTNER_COLOR = "#29f2e0";

function partnerMeta(partner: string): { label: string; color: string; icon: string } {
  const meta = PARTNER_META[partner];
  return {
    label: meta?.label || partner.charAt(0).toUpperCase() + partner.slice(1),
    color: meta?.color || DEFAULT_PARTNER_COLOR,
    icon: PARTNER_ICONS[partner] || "🔗",
  };
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function extractAsin(input: string): string | null {
  const trimmed = input.trim();
  const clean = trimmed.split(/[?#]/)[0];
  const direct = clean.match(/\/dp\/([A-Z0-9]{10})/i) || clean.match(/\/(gp\/aw\/d|product)\/([A-Z0-9]{10})/i);
  if (direct) return (direct[1]?.length === 10 ? direct[1] : direct[2]).toUpperCase();
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return trimmed.toUpperCase();
  const fromQuery = trimmed.match(/[?&]asin=([A-Z0-9]{10})/i);
  if (fromQuery) return fromQuery[1].toUpperCase();
  return null;
}

function pageLabel(page: string): string {
  const cleaned = page.replace(/^\//, "").replace(/-/g, " ");
  if (!cleaned) return page;
  return cleaned
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl neon-feature-card group">
      <div
        className="neon-border rounded-xl"
        style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }}
      />
      <div className="neon-glow rounded-xl" style={{ background: color }} />
      <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="h-[2px] w-full" style={{ background: color }} />
        <div className="p-5 relative">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${color}0f, transparent 70%)` }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</span>
              <span className="text-lg">{icon}</span>
            </div>
            <p className="font-mono text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]" />
        <div className="h-64 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]" />
      </div>
      <div className="h-72 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]" />
    </div>
  );
}

function DailyChart({ daily }: { daily: DailyStat[] }) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...daily.map((d) => d.count), 1);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
        <h2 className="font-display text-lg font-bold">Clicks · Last 14 Days</h2>
      </div>
      <div className="flex items-end gap-1.5 h-40">
        {daily.map((d, i) => (
          <div key={d.date} className="group relative flex-1 flex items-end h-full">
            <div
              className="w-full rounded-t-md transition-all duration-700 ease-out group-hover:bg-[var(--color-cyan)]"
              style={{
                height: mounted ? `${Math.max((d.count / max) * 100, d.count > 0 ? 6 : 3)}%` : "3%",
                background: d.count > 0 ? "var(--color-cyan)" : "rgba(255,255,255,0.08)",
                opacity: d.count > 0 ? 0.85 : 1,
                transitionDelay: `${i * 40}ms`,
              }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-black/90 border border-[var(--color-line)] px-2 py-1 text-[10px] font-mono text-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {d.label}: {d.count}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--color-mute)]">
        <span>{daily[0]?.label}</span>
        <span>{daily[daily.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function PartnerBars({ byPartner }: { byPartner: PartnerStat[] }) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...byPartner.map((p) => p.count), 1);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (byPartner.length === 0) {
    return (
      <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
          <h2 className="font-display text-lg font-bold">Clicks by Partner</h2>
        </div>
        <p className="text-sm text-[var(--color-mute)]">No clicks recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
        <h2 className="font-display text-lg font-bold">Clicks by Partner</h2>
      </div>
      <div className="space-y-4">
        {byPartner.map((p, i) => {
          const meta = partnerMeta(p.partner);
          const pct = Math.round((p.count / max) * 100);
          return (
            <div key={p.partner}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-text)]">
                  <span>{meta.icon}</span>
                  {meta.label}
                </span>
                <span className="font-mono text-[var(--color-mute)]">
                  <span style={{ color: meta.color }}>{p.count}</span>
                  <span className="mx-1.5 text-[var(--color-line)]">·</span>
                  ₹{p.revenue.toFixed(2)}
                  <span className="ml-2 text-[10px]">{pct}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: mounted ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${meta.color}55, ${meta.color})`, transitionDelay: `${i * 90}ms`, boxShadow: `0 0 12px ${meta.color}66` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopPages({ byPage }: { byPage: PageStat[] }) {
  const max = Math.max(...byPage.map((p) => p.count), 1);
  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[var(--color-violet)]" />
        <h2 className="font-display text-lg font-bold">Top Pages</h2>
      </div>
      {byPage.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)]">No clicks yet.</p>
      ) : (
        <div className="space-y-3">
          {byPage.map((p) => (
            <div key={p.page} className="flex items-center gap-3">
              <span className="flex-1 truncate text-sm text-[var(--color-mute)]">{pageLabel(p.page)}</span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-cyan)]"
                  style={{ width: `${Math.max((p.count / max) * 100, 6)}%` }}
                />
              </div>
              <span className="w-6 text-right font-mono text-sm text-[var(--color-cyan)]">{p.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentClicks({ recent }: { recent: RecentClick[] }) {
  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--color-amber)]" />
          <h2 className="font-display text-lg font-bold">Recent Clicks</h2>
        </div>
      </div>
      {recent.length === 0 ? (
        <p className="p-6 text-sm text-[var(--color-mute)]">No clicks recorded yet. Affiliate links on the site log clicks here.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-[var(--color-line)] bg-white/[0.02]">
                <th className="px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Partner</th>
                <th className="px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Page</th>
                <th className="px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">When</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const meta = partnerMeta(r.partner);
                return (
                  <tr key={r.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}12` }}
                      >
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-[var(--color-cyan)]">{pageLabel(r.page)}</td>
                    <td className="px-6 py-3 text-xs text-[var(--color-mute)]">
                      {new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LinkBuilder() {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [anime, setAnime] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const asin = extractAsin(input);
  const link = asin ? amazonProductUrl(asin) : "";

  const entrySnippet = asin
    ? `{
  id: "${(anime || "anime").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${asin.toLowerCase()}",
  name: "${name || "New Product"}",
  image: "https://m.media-amazon.com/images/PASTE_IMAGE_URL.jpg",
  price: "${price || "₹0"}",
  ${originalPrice ? `originalPrice: "${originalPrice}",` : ""}
  affiliateUrl: amazonUrl("${asin}"),
  platform: "Amazon",
  category: "Figurines",
  rating: 4.5,
  reviews: 0,
  tags: ["${anime || "Anime"}", "Figurine"],
  anime: "${anime || "Anime"}",
},`
    : "";

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <TiltCard className="neon-premium rounded-[24px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[24px] p-6 sm:p-8">
        <h2 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-2xl font-bold text-transparent">
          Affiliate Link Builder
        </h2>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
            Paste an Amazon.in product URL or ASIN — clean affiliate link is generated instantly. Tag:{" "}
            <span className="font-mono font-bold text-[var(--color-cyan)]">{AMAZON_TAG}</span>
          </p>

          <div className="rounded-xl neon-rgb-border bg-[var(--color-void)]/60 p-4">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Product URL or ASIN</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://www.amazon.in/dp/B0DV4GRN9Q/... ya B0DV4GRN9Q"
              className="mt-2 w-full rounded-lg bg-[var(--color-surface1)] px-4 py-3 text-sm text-[var(--color-text)] border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none transition-colors"
            />
            {input && !asin && (
              <p className="mt-2 text-xs text-red-400">ASIN nahi mila. Amazon.in product page ka URL paste karo (URL me /dp/ASIN/ hona chahiye).</p>
            )}
            {asin && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-surface1)] px-4 py-3 text-sm">
                <span className="text-[var(--color-mute)]">ASIN:</span>
                <span className="font-mono font-bold text-[var(--color-cyan)]">{asin}</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-cyan)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-cyan)]" />
                  </span>
                  VALID
                </span>
              </div>
            )}
          </div>

          {link && (
            <div className="mt-5 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-cyan)]">Clean Affiliate Link</h3>
                <div className="flex gap-2">
                  <motion.a
                    whileTap={{ scale: 0.94 }}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-[var(--color-cyan)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
                  >
                    Open ↗
                  </motion.a>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => copy(link, "link")}
                    className="rounded-lg bg-[var(--color-cyan)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30 transition-colors"
                  >
                    {copied === "link" ? "Copied!" : "Copy Link"}
                  </motion.button>
                </div>
              </div>
              <p className="break-all rounded-md bg-black/30 px-3 py-2 font-mono text-xs text-[var(--color-text)]">{link}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Product Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. FowWelt Tanjiro Figure 16CM"
                    className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Anime</label>
                  <input
                    value={anime}
                    onChange={(e) => setAnime(e.target.value)}
                    placeholder="e.g. Demon Slayer"
                    className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Price (₹)</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₹2,499"
                    className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Original Price (optional)</label>
                  <input
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="₹3,999"
                    className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                </div>
              </div>

              {name && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">MerchStore.tsx Entry (copy-paste ready)</h3>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => copy(entrySnippet, "entry")}
                      className="rounded-lg bg-[var(--color-magenta)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-colors"
                    >
                      {copied === "entry" ? "Copied!" : "Copy Entry"}
                    </motion.button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-[11px] leading-relaxed text-green-400">{entrySnippet}</pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-2 text-xs text-[var(--color-mute)] sm:grid-cols-2">
            <div className="rounded-lg neon-rgb-border bg-[var(--color-void)]/50 px-3 py-2.5">
              <span className="font-semibold text-[var(--color-text)]">ASIN</span> — Amazon.in product pages pe <span className="font-mono text-[var(--color-cyan)]">/dp/XXXXXX</span> wala part
            </div>
            <div className="rounded-lg neon-rgb-border bg-[var(--color-void)]/50 px-3 py-2.5">
              <span className="font-semibold text-[var(--color-text)]">Image</span> — product page pe image pe right-click → <span className="font-mono">Copy image link</span>
            </div>
            <div className="rounded-lg neon-rgb-border bg-[var(--color-void)]/50 px-3 py-2.5 sm:col-span-2">
              <span className="font-semibold text-[var(--color-text)]">Entry</span> — copy karke <span className="font-mono">src/components/MerchStore.tsx</span> ke <span className="font-mono">MERCH_ITEMS</span> array me paste karo
            </div>
          </div>
        </div>
    </TiltCard>
  );
}

export default function AdminAffiliatePage() {
  const [data, setData] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, kind: ToastKind) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, kind });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(() => {
    fetch("/api/admin/affiliate")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then(setData)
      .catch(() => showToast("Failed to load affiliate stats.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    setLoading(true);
    load();
  };

  const clicks = useCountUp(data?.totalClicks || 0, 900);
  const revenue = useCountUp(data?.estimatedRevenue || 0, 900);
  const last7 = useCountUp(data?.clicksLast7 || 0, 700);
  const last30 = useCountUp(data?.clicksLast30 || 0, 700);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin · Affiliate</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">Affiliate</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-cyan)]" />
            </span>
            {data ? `${data.totalClicks} total clicks logged` : "Clicks, conversions & link tools"}
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full neon-rgb-border px-4 py-2 text-xs font-bold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/5 disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {toast && (
        <div
          className={`mb-6 rounded-lg border px-4 py-2.5 text-sm ${
            toast.kind === "success"
              ? "border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {toast.text}
        </div>
      )}

      {loading && !data ? (
        <Skeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Clicks" value={Math.round(clicks).toLocaleString()} icon="🖱️" color="#00d4ff" />
            <StatCard label="Est. Revenue" value={`₹${revenue.toFixed(2)}`} icon="💰" color="#ffd700" />
            <StatCard label="Last 7 Days" value={Math.round(last7).toLocaleString()} icon="🔥" color="#ff2d78" />
            <StatCard label="Last 30 Days" value={Math.round(last30).toLocaleString()} icon="📈" color="#22c55e" />
          </div>

          {/* Daily + Top pages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <DailyChart daily={data?.daily || []} />
            </div>
            <TopPages byPage={data?.byPage || []} />
          </div>

          {/* Partner bars + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <RecentClicks recent={data?.recent || []} />
            </div>
            <PartnerBars byPartner={data?.byPartner || []} />
          </div>

          {/* Link builder */}
          <LinkBuilder />
        </>
      )}
    </div>
  );
}
