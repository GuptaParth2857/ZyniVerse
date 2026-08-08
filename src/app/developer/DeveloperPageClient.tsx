"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const API_TIERS: Record<string, { name: string; requestsPerDay: number; requestsPerMinute: number; maxKeys: number; price: number; features: string[] }> = {
  free: {
    name: "Free",
    requestsPerDay: 100,
    requestsPerMinute: 10,
    maxKeys: 10,
    price: 0,
    features: ["Basic endpoints", "Community support"],
  },
  pro: {
    name: "Pro",
    requestsPerDay: 10000,
    requestsPerMinute: 100,
    maxKeys: 25,
    price: 499,
    features: ["All endpoints", "Higher rate limits", "Priority support", "Usage analytics"],
  },
  enterprise: {
    name: "Enterprise",
    requestsPerDay: 100000,
    requestsPerMinute: 1000,
    maxKeys: 100,
    price: 4999,
    features: ["Unlimited access", "SLA guarantee", "Dedicated support", "Custom integrations", "White-label options"],
  },
};

interface StatsData {
  status: string;
  requestsToday: number;
  requestsAllTime: number;
  activeKeys: number;
  totalKeys: number;
  developers: number;
}

interface ApiKeyRow {
  id: string;
  name: string;
  key: string;
  tier: string;
  requests: number;
  limit: number;
  lastUsed: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

interface PlaygroundPreset {
  label: string;
  method: string;
  path: string;
  desc: string;
}

const PRESETS: PlaygroundPreset[] = [
  { label: "Schedule", method: "GET", path: "/api/v1/schedule?hours_ahead=24", desc: "Airing schedule with filler & dub data" },
  { label: "Anime + Filler", method: "GET", path: "/api/v1/anime/21", desc: "One Piece details + filler breakdown" },
  { label: "Filler Guide", method: "GET", path: "/api/v1/filler/21", desc: "Episode-by-episode filler classification" },
  { label: "Dub Status", method: "GET", path: "/api/v1/dub-status/5114", desc: "Indian dub availability for an anime" },
  { label: "Usage Stats", method: "GET", path: "/api/v1/usage", desc: "Your current usage & limits" },
  { label: "GraphQL v2", method: "POST", path: "/api/v2/graphql", desc: "Flexible GraphQL queries" },
];

const QUERIES = [
  { name: "Get Trending Anime", endpoint: "GET /api/v1/schedule", desc: "Fetch airing schedule with filler & dub data" },
  { name: "Anime Details + Filler", endpoint: "GET /api/v1/anime/:id", desc: "Full anime details with filler breakdown per episode" },
  { name: "Filler Guide", endpoint: "GET /api/v1/filler/:id", desc: "Episode-by-episode filler classification" },
  { name: "Dub Status", endpoint: "GET /api/v1/dub-status/:malId", desc: "Check available Indian dub languages" },
  { name: "Usage Stats", endpoint: "GET /api/v1/usage", desc: "View your current API usage and limits" },
  { name: "GraphQL v2", endpoint: "POST /api/v2/graphql", desc: "Flexible GraphQL queries for advanced use cases" },
];

const STAT_WORDS = ["Filler Guides", "Indian Dub Data", "Airing Schedules", "Clean JSON", "Low Latency"];

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

function useTypewriter(words: string[]): string {
  const [text, setText] = useState("");
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const tick = () => {
      const word = words[wordIndex.current % words.length];
      if (!deleting.current) {
        charIndex.current++;
        if (charIndex.current === word.length + 1) deleting.current = true;
      } else {
        charIndex.current--;
        if (charIndex.current === 0) {
          deleting.current = false;
          wordIndex.current++;
        }
      }
      setText(word.slice(0, Math.max(0, charIndex.current)));
    };
    const id = setInterval(tick, 60);
    return () => clearInterval(id);
  }, [words]);

  return text;
}

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await copyText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-[var(--color-line)] bg-black/30 px-2.5 py-1 font-mono text-[10px] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
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

function MaskedKey({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = value.length > 8 ? `${value.slice(0, 8)}••••••••${value.slice(-4)}` : value;
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-black/30 px-2.5 py-1 font-mono text-xs text-[var(--color-cyan)]">
      {revealed ? value : masked}
      <button
        onClick={() => setRevealed((r) => !r)}
        className="text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
        aria-label={revealed ? "Hide key" : "Show key"}
      >
        {revealed ? "🙈" : "👁"}
      </button>
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function PriceCount({ target }: { target: number }) {
  const n = useCountUp(target);
  return <>{n.toLocaleString("en-IN")}</>;
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] font-mono text-sm font-bold text-black shadow-[0_0_14px_rgba(138,92,255,0.4)]">
      {n}
    </span>
  );
}

function Terminal({ copyValue, children }: { copyValue: string; children: ReactNode }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-line)] bg-black/50">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[10px] text-[var(--color-mute)]">zyverse.in — bash</span>
        <span className="ml-auto">
          <CopyButton value={copyValue} />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--color-mute)]">{children}</pre>
    </div>
  );
}

function SectionTitle({ accent, title, sub }: { accent: string; title: string; sub?: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mb-6">
      <div className="flex items-center gap-3">
        <span className="h-5 w-1 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}66` }} />
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">{title}</h2>
      </div>
      {sub && <p className="mt-2 max-w-2xl text-sm text-[var(--color-mute)]">{sub}</p>}
    </motion.div>
  );
}

export default function DeveloperPageClient() {
  const { status: authStatus } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [justCreated, setJustCreated] = useState<ApiKeyRow | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [presetIndex, setPresetIndex] = useState(0);
  const [playKey, setPlayKey] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status: number; ms: number; json: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typed = useTypewriter(STAT_WORDS);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      /* noop */
    }
  }, []);

  const loadKeys = useCallback(async () => {
    setKeysLoading(true);
    try {
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } finally {
      setKeysLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => loadStats(), 0);
    const interval = setInterval(loadStats, 60000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, [loadStats]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      const id = setTimeout(() => loadKeys(), 0);
      return () => clearTimeout(id);
    } else if (authStatus === "unauthenticated") {
      const id = setTimeout(() => setKeysLoading(false), 0);
      return () => clearTimeout(id);
    }
  }, [authStatus, loadKeys]);

  useEffect(() => {
    const id = setTimeout(() => {
      setBody(PRESETS[presetIndex].method === "POST" ? '{"query":"{ animeTrending { media { id title { romaji english } averageScore } } }"}' : "");
    }, 0);
    return () => clearTimeout(id);
  }, [presetIndex]);

  const latestKey = useMemo(() => keys.find((k) => k.active)?.key || justCreated?.key || "", [keys, justCreated]);

  useEffect(() => {
    if (latestKey && !playKey) {
      const id = setTimeout(() => setPlayKey(latestKey), 0);
      return () => clearTimeout(id);
    }
  }, [latestKey, playKey]);

  const createKey = async () => {
    const name = newKeyName.trim();
    if (!name) {
      showToast("Give your key a name first");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create key");
        return;
      }
      setJustCreated(data.key);
      setPlayKey(data.key.key);
      setNewKeyName("");
      loadKeys();
      showToast("API key created! 🎉");
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to revoke key");
        return;
      }
      loadKeys();
      showToast("Key revoked");
    } finally {
      setRevoking(null);
    }
  };

  const send = async () => {
    if (!playKey.trim()) {
      showToast("Enter an API key first");
      return;
    }
    setSending(true);
    setError(null);
    setResult(null);
    const preset = PRESETS[presetIndex];
    const start = performance.now();
    try {
      const res = await fetch(preset.path, {
        method: preset.method,
        headers: {
          Authorization: `Bearer ${playKey.trim()}`,
          ...(preset.method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        ...(preset.method === "POST" ? { body: body || "{}" } : {}),
      });
      const ms = Math.round(performance.now() - start);
      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = await res.text();
      }
      setResult({ ok: res.ok, status: res.status, ms, json });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSending(false);
    }
  };

  const scheduleItems = useMemo(() => {
    if (!result || !result.json) return null;
    const j = result.json as { data?: unknown };
    if (!Array.isArray(j.data)) return null;
    return j.data as Array<{ mediaId?: number; title?: string; episode?: number; airingAt?: number; timeUntilAiring?: number | null; coverImage?: string | null; format?: string | null; genres?: string[] | null }>;
  }, [result]);

  const statusColor = (status: number) => {
    if (status >= 200 && status < 300) return { color: "#4ade80", text: "Success" };
    if (status >= 400 && status < 500) return { color: "#f59e0b", text: "Client error" };
    return { color: "#f87171", text: "Server error" };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 whitespace-nowrap rounded-full neon-rgb-border bg-black/90 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-xl">
          {toast}
        </div>
      )}

      <section className="relative mb-14 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] p-8 sm:p-10">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 opacity-40 blur-3xl"
          style={{ background: "linear-gradient(90deg, #29f2e0, #8a5cff, #ff2d78)" }}
        />
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] shadow-[0_0_16px_rgba(41,242,224,0.2)]"
        >
          ✦ ZyniVerse API · v1 &amp; v2
        </motion.p>
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-display text-4xl font-bold leading-tight sm:text-5xl"
        >
          <span className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text text-transparent">
            India&apos;s most unique
          </span>
          <br />
          <span className="text-[var(--color-ink)]">anime data API.</span>
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="show" className="mt-4 max-w-2xl text-base text-[var(--color-mute)]">
          Build apps powered by <span className="font-mono text-[var(--color-cyan)]">{typed}</span>
          <span className="animate-pulse text-[var(--color-cyan)]">▌</span> — every endpoint returns clean JSON with minimal latency.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#keys"
            className="neon-rgb-border rounded-full bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-all hover:scale-[1.03] hover:border-[var(--color-cyan)]"
          >
            Get a Free Key →
          </a>
          <a
            href="#playground"
            className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
          >
            Try it live
          </a>
          <Link href="/docs" className="text-sm text-[var(--color-cyan)] hover:underline">
            Read the docs →
          </Link>
        </motion.div>
      </section>

      <section className="mb-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-6 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-mute)]">Live platform status</p>
          <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          {stats && <span className="font-mono text-[10px] text-[var(--color-mute)]">auto-refresh 30s</span>}
        </motion.div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="neon-premium animate-pulse rounded-[20px]">
                <div className="neon-premium-track" />
                <div className="neon-premium-content rounded-[20px] p-5">
                  <div className="h-3 w-20 rounded bg-white/5" />
                  <div className="mt-3 h-8 w-14 rounded bg-white/10" />
                </div>
              </div>
            ))
          ) : (
            <>
              <KpiCard icon="⚡" label="Requests Today" value={stats.requestsToday} color="var(--color-cyan)" sub="API calls since midnight" />
              <KpiCard icon="🌐" label="All-Time Requests" value={stats.requestsAllTime} color="var(--color-magenta)" sub="total served" />
              <KpiCard icon="🔑" label="Active Keys" value={stats.activeKeys} color="var(--color-violet)" sub={`${stats.totalKeys} created total`} />
              <KpiCard icon="🧑‍💻" label="Developers" value={stats.developers} color="#4ade80" sub="building with the API" />
            </>
          )}
        </div>
      </section>
      <section id="keys" className="mb-16 scroll-mt-24">
        <SectionTitle
          accent="var(--color-violet)"
          title="Your API Keys"
          sub="Generate and manage your real API keys. Keys are rate-limited by tier — the free tier gets 100 requests/day."
        />

        {authStatus === "loading" ? (
          <div className="neon-premium animate-pulse rounded-[20px]">
            <div className="neon-premium-track" />
            <div className="neon-premium-content rounded-[20px] p-6">
              <div className="h-4 w-40 rounded bg-white/5" />
              <div className="mt-4 h-12 w-full rounded bg-white/10" />
            </div>
          </div>
        ) : authStatus !== "authenticated" ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="neon-premium rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
            <div className="neon-premium-content rounded-[20px] p-8 text-center">
              <div className="text-4xl">🔑</div>
              <h3 className="mt-3 font-display text-xl font-bold text-[var(--color-ink)]">Sign in to manage your keys</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-mute)]">
                Create your free key in seconds and start hitting real endpoints with 100 requests/day.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="neon-rgb-border rounded-full bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-transform hover:scale-[1.03]"
                >
                  Get Free Key →
                </Link>
                <Link href="/signup" className="text-sm text-[var(--color-cyan)] hover:underline">
                  Create an account
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="neon-premium rounded-[20px]">
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
              <div className="neon-premium-content rounded-[20px] p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createKey()}
                    placeholder="e.g. My Anime App"
                    className="flex-1 rounded-xl border border-[var(--color-line)] bg-black/30 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-mute)] focus:border-[var(--color-violet)]"
                    style={{ outline: "none" }}
                  />
                  <button
                    onClick={createKey}
                    disabled={creating}
                    className="neon-rgb-border rounded-xl bg-[var(--color-void)]/70 px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "+ Create New Key"}
                  </button>
                </div>
                {justCreated && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-green-400/40 bg-green-400/10 p-3 text-sm">
                    <span className="text-green-400">🎉 New key created — copy it now, it stays masked for security:</span>
                    <MaskedKey value={justCreated.key} />
                    <CopyButton value={justCreated.key} label="Copy key" />
                  </div>
                )}
              </div>
            </div>

            {keysLoading && keys.length === 0 ? (
              <div className="neon-premium animate-pulse rounded-[20px]">
                <div className="neon-premium-track" />
                <div className="neon-premium-content rounded-[20px] p-6">
                  <div className="h-14 w-full rounded bg-white/5" />
                  <div className="mt-3 h-14 w-full rounded bg-white/5" />
                </div>
              </div>
            ) : keys.length === 0 ? (
              <div className="neon-premium rounded-[20px]">
                <div className="neon-premium-track" />
                <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
                <div className="neon-premium-content rounded-[20px] p-8 text-center text-sm text-[var(--color-mute)]">
                  No keys yet — create your first one above. ⚡
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => {
                  const pct = k.limit > 0 ? Math.min(100, Math.round((k.requests / k.limit) * 100)) : 0;
                  return (
                    <motion.div
                      key={k.id}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      className="neon-premium rounded-[20px]"
                    >
                      <div className="neon-premium-track" />
                      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
                      <div className="neon-premium-content rounded-[20px] p-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`h-2.5 w-2.5 rounded-full ${k.active ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-red-400"}`} />
                          <p className="font-semibold text-[var(--color-ink)]">{k.name}</p>
                          <span className="rounded-full border border-[var(--color-violet)]/50 bg-[var(--color-violet)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-violet)]">
                            {k.tier}
                          </span>
                          <span className="ml-auto flex flex-wrap items-center gap-2">
                            <MaskedKey value={k.key} />
                            <CopyButton value={k.key} />
                            <button
                              onClick={() => revokeKey(k.id)}
                              disabled={revoking === k.id}
                              className="rounded-md border border-red-400/40 bg-red-400/10 px-2.5 py-1 font-mono text-[10px] text-red-400 transition-colors hover:bg-red-400/20 disabled:opacity-50"
                            >
                              {revoking === k.id ? "Revoking..." : "Revoke"}
                            </button>
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="mb-1.5 flex justify-between font-mono text-[10px] text-[var(--color-mute)]">
                            <span>{k.requests.toLocaleString("en-IN")} requests used</span>
                            <span>{pct}% of {k.limit.toLocaleString("en-IN")}/day</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: pct > 80 ? "linear-gradient(90deg,#f59e0b,#f87171)" : "linear-gradient(90deg,#8a5cff,#29f2e0)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-[var(--color-mute)]">
                          <span>Created {new Date(k.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>Last used {k.lastUsed ? new Date(k.lastUsed).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "never"}</span>
                          {k.expiresAt && <span>Expires {new Date(k.expiresAt).toLocaleDateString("en-IN")}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
      <section id="playground" className="mb-16 scroll-mt-24">
        <SectionTitle
          accent="var(--color-cyan)"
          title="Live API Playground"
          sub="Paste a key and fire real requests against production endpoints. Responses below are 100% live."
        />
        <div className="neon-premium rounded-[20px]">
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
          <div className="neon-premium-content rounded-[20px] p-6">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPresetIndex(i)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                    i === presetIndex
                      ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(41,242,224,0.25)]"
                      : "border-[var(--color-line)] bg-black/20 text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
                  }`}
                >
                  {p.method} {p.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Endpoint</label>
              <div className="mt-1.5 flex items-center gap-2 overflow-x-auto rounded-xl border border-[var(--color-line)] bg-black/30 p-2">
                <span className="shrink-0 rounded-md border border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/10 px-2.5 py-1 font-mono text-xs font-bold text-[var(--color-cyan)]">
                  {PRESETS[presetIndex].method}
                </span>
                <code className="shrink-0 whitespace-nowrap font-mono text-xs text-[var(--color-ink)]">
                  https://zyverse.in{PRESETS[presetIndex].path}
                </code>
              </div>
              <p className="mt-1.5 text-[10px] font-mono text-[var(--color-mute)]">{PRESETS[presetIndex].desc}</p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">API Key</label>
                <input
                  value={playKey}
                  onChange={(e) => setPlayKey(e.target.value)}
                  placeholder="zvn_yourapikey..."
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-black/30 px-4 py-2.5 font-mono text-xs text-[var(--color-cyan)] outline-none transition-colors placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]"
                />
              </div>
              <button
                onClick={send}
                disabled={sending}
                className="self-end rounded-xl border border-[var(--color-cyan)]/60 bg-[var(--color-cyan)]/10 px-6 py-2.5 font-mono text-xs font-bold text-[var(--color-cyan)] transition-all hover:scale-[1.03] hover:bg-[var(--color-cyan)]/20 disabled:opacity-50"
                style={{ boxShadow: "0 0 18px rgba(41,242,224,0.2)" }}
              >
                {sending ? "Sending..." : "▶ Send Request"}
              </button>
            </div>

            {PRESETS[presetIndex].method === "POST" && (
              <div className="mt-3">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Request Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  spellCheck={false}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-black/30 px-4 py-2.5 font-mono text-xs text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-cyan)]"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-3 font-mono text-xs text-red-400">
                {error}
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full px-3 py-1 font-mono text-xs font-bold"
                    style={{ color: statusColor(result.status).color, border: `1px solid ${statusColor(result.status).color}66`, background: `${statusColor(result.status).color}14` }}
                  >
                    {result.status} · {statusColor(result.status).text}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-mute)]">{result.ms}ms</span>
                  {result.ok && <span className="font-mono text-[10px] text-green-400">✓ live response</span>}
                </div>

                {scheduleItems && scheduleItems.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                      Rendered from live response — {scheduleItems.length} airing entries
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {scheduleItems.slice(0, 8).map((item, i) => (
                        <div
                          key={`${item.mediaId ?? i}-${i}`}
                          className="group relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-black/30 transition-all hover:scale-[1.02]"
                        >
                          {item.coverImage && (
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <Image
                                src={item.coverImage}
                                alt={item.title || "Anime"}
                                fill
                                sizes="200px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                              <span className="absolute right-2 top-2 rounded-full bg-black/80 px-2 py-0.5 font-mono text-[10px] text-[var(--color-cyan)]">
                                EP {item.episode ?? "?"}
                              </span>
                            </div>
                          )}
                          <div className="p-2.5">
                            <p className="truncate text-xs font-semibold text-[var(--color-ink)]">{item.title}</p>
                            <p className="mt-1 font-mono text-[9px] text-[var(--color-mute)]">
                              {item.timeUntilAiring != null
                                ? item.timeUntilAiring < 0
                                  ? "Aired " + Math.abs(Math.round(item.timeUntilAiring / 3600)) + "h ago"
                                  : "Airs in " + Math.max(1, Math.round(item.timeUntilAiring / 3600)) + "h"
                                : item.airingAt
                                  ? new Date(item.airingAt * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                  : ""}
                            </p>
                            {item.genres && item.genres.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {item.genres.slice(0, 2).map((g) => (
                                  <span key={g} className="rounded-full border border-[var(--color-line)] px-1.5 py-0.5 text-[8px] text-[var(--color-mute)]">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-[var(--color-line)] bg-black/40 p-4 font-mono text-xs leading-relaxed text-[var(--color-ink)]">
                    <span className="text-[var(--color-mute)]">{JSON.stringify(result.json, null, 2)}</span>
                  </pre>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>
      <section className="mb-16">
        <SectionTitle
          accent="var(--color-magenta)"
          title="Pricing"
          sub="Start free — no credit card. Upgrade when your app needs more headroom."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(API_TIERS).map(([key, tier], i) => {
            const isPro = key === "pro";
            const accent = isPro ? "#ff2d78" : key === "free" ? "#29f2e0" : "#8a5cff";
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="neon-premium rounded-[24px]">
                  <div className="neon-premium-track" />
                  <div
                    className="neon-premium-overlay"
                    style={{ background: isPro ? "rgba(20,10,18,0.94)" : "rgba(10,10,15,0.92)" }}
                  />
                  <div className="neon-premium-content relative rounded-[24px] p-6">
                    <div
                      className="pointer-events-none absolute -top-16 left-1/2 h-32 w-44 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                      style={{ background: accent }}
                    />
                    {isPro && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--color-magenta)] bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,45,120,0.35)]">
                        ⭐ Popular
                      </span>
                    )}
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
                      {key} tier
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-[var(--color-ink)]">{tier.name}</h3>
                    <p className="mt-2 flex items-baseline gap-1 font-mono text-4xl font-bold" style={{ color: accent }}>
                      {tier.price === 0 ? (
                        "Free"
                      ) : (
                        <>
                          ₹<PriceCount target={tier.price} />
                          <span className="text-sm font-normal text-[var(--color-mute)]">/mo</span>
                        </>
                      )}
                    </p>
                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent" />
                    <ul className="mt-5 space-y-2.5">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--color-mute)]">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{ color: accent, border: `1px solid ${accent}55`, background: `${accent}14` }}
                          >
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                      <li className="flex items-center gap-2.5 text-sm text-[var(--color-mute)]">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ color: accent, border: `1px solid ${accent}55`, background: `${accent}14` }}
                        >
                          ⚡
                        </span>
                        {tier.requestsPerDay.toLocaleString("en-IN")} req/day
                      </li>
                    </ul>
                    <a
                      href="#keys"
                      className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-bold transition-all duration-300 ${
                        isPro
                          ? "bg-gradient-to-r from-[var(--color-magenta)] to-[#ff6b9d] text-black hover:shadow-[0_0_30px_rgba(255,45,120,0.4)]"
                          : "neon-rgb-border text-[var(--color-ink)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                      }`}
                    >
                      {tier.price === 0 ? "Get Free Key" : "Upgrade"}
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mb-16">
        <SectionTitle
          accent="var(--color-amber)"
          title="API Endpoints"
          sub="Every endpoint is live right now — test them above in the playground."
        />
        <div className="neon-premium rounded-[20px]">
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
          <div className="neon-premium-content rounded-[20px] p-2 sm:p-4">
            <div className="divide-y divide-[var(--color-line)]">
              {QUERIES.map((q, i) => {
                const method = q.endpoint.split(" ")[0];
                const path = q.endpoint.split(" ").slice(1).join(" ");
                const mColor = method === "POST" ? "#ff2d78" : "#29f2e0";
                return (
                  <motion.div
                    key={q.endpoint}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group flex flex-col gap-2 rounded-xl px-4 py-3.5 transition-colors hover:bg-black/20 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="w-14 shrink-0 rounded-md border px-2 py-0.5 text-center font-mono text-[10px] font-bold"
                        style={{ color: mColor, borderColor: `${mColor}55`, background: `${mColor}14` }}
                      >
                        {method}
                      </span>
                      <code className="truncate font-mono text-xs text-[var(--color-cyan)]">{path}</code>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <span className="min-w-0 flex-1 text-xs text-[var(--color-mute)] sm:text-right">{q.desc}</span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-400/40 bg-green-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-green-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                        </span>
                        live
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <SectionTitle
          accent="var(--color-violet)"
          title="Quick Start"
          sub="From zero to your first live response in under a minute."
        />
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="neon-premium rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-5">
              <div className="flex items-center gap-3">
                <StepBadge n={1} />
                <h3 className="font-semibold text-[var(--color-ink)]">Get your API key</h3>
              </div>
              <p className="mt-3 text-sm text-[var(--color-mute)]">
                <a href="#keys" className="text-[var(--color-cyan)] hover:underline">Sign up</a> and generate a free API key above — it goes live instantly.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="neon-premium rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-5">
              <div className="flex items-center gap-3">
                <StepBadge n={2} />
                <h3 className="font-semibold text-[var(--color-ink)]">Make your first request</h3>
              </div>
              <Terminal copyValue={'curl https://zyverse.in/api/v1/schedule?hours_ahead=24 \\\n  -H "Authorization: Bearer zvn_your_api_key_here"'}>
                <span className="text-[var(--color-cyan)]">curl</span> https://zyverse.in/api/v1/schedule?hours_ahead=24 \<br />
                &nbsp;&nbsp;-H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_api_key_here&quot;</span>
              </Terminal>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="neon-premium rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-5">
              <div className="flex items-center gap-3">
                <StepBadge n={3} />
                <h3 className="font-semibold text-[var(--color-ink)]">Try GraphQL v2</h3>
              </div>
              <Terminal copyValue={'curl -X POST https://zyverse.in/api/v2/graphql \\\n  -H "Authorization: Bearer zvn_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"query":"{ animeTrending { media { id title { romaji english } averageScore } } }"}\''}>
                <span className="text-[var(--color-cyan)]">curl</span> -X POST https://zyverse.in/api/v2/graphql \<br />
                &nbsp;&nbsp;-H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_api_key_here&quot;</span> \<br />
                &nbsp;&nbsp;-H <span className="text-[var(--color-magenta)]">&quot;Content-Type: application/json&quot;</span> \<br />
                &nbsp;&nbsp;-d <span className="text-[var(--color-magenta)]">{'{"query":"{ animeTrending { media { id title { romaji english } averageScore } } }"}'}</span>
              </Terminal>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="neon-premium rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-5">
              <div className="flex items-center gap-3">
                <StepBadge n={4} />
                <h3 className="font-semibold text-[var(--color-ink)]">Rate limits</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1 text-xs text-[var(--color-cyan)]">Free · 100/day</span>
                <span className="rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 text-xs text-[var(--color-magenta)]">Pro · 10,000/day</span>
                <span className="rounded-full border border-[var(--color-violet)]/40 bg-[var(--color-violet)]/10 px-3 py-1 text-xs text-[var(--color-violet)]">Enterprise · 100,000/day</span>
              </div>
              <p className="mt-3 text-sm text-[var(--color-mute)]">
                Rate limit headers are returned with every response. Exceed your limit and you&apos;ll receive a{" "}
                <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs text-[var(--color-magenta)]">429</code>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="neon-premium rounded-[20px]"
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
        <div className="neon-premium-content rounded-[20px] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl">🛟</span>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Need Help?</h2>
            <span className="ml-auto rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1 font-mono text-[10px] text-[var(--color-cyan)]">
              avg response &lt; 24h
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link
              href="/docs"
              className="group rounded-xl border border-[var(--color-line)] bg-black/20 p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-cyan)]/50 hover:bg-black/30"
            >
              <span className="text-xl">📄</span>
              <p className="mt-2 text-sm font-bold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-cyan)]">Documentation</p>
              <p className="mt-1 text-xs text-[var(--color-mute)]">Detailed API reference &amp; examples</p>
              <p className="mt-2 font-mono text-[10px] text-[var(--color-cyan)] transition-transform group-hover:translate-x-1">Open →</p>
            </Link>
            <Link
              href="/community"
              className="group rounded-xl border border-[var(--color-line)] bg-black/20 p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-cyan)]/50 hover:bg-black/30"
            >
              <span className="text-xl">💬</span>
              <p className="mt-2 text-sm font-bold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-cyan)]">Community</p>
              <p className="mt-1 text-xs text-[var(--color-mute)]">Ask questions &amp; share builds</p>
              <p className="mt-2 font-mono text-[10px] text-[var(--color-cyan)] transition-transform group-hover:translate-x-1">Open →</p>
            </Link>
            <div className="rounded-xl border border-[var(--color-line)] bg-black/20 p-4">
              <span className="text-xl">⚡</span>
              <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">Priority Support</p>
              <p className="mt-1 text-xs text-[var(--color-mute)]">
                Pro &amp; Enterprise get <span className="font-semibold text-[var(--color-magenta)]">24-hour</span> response time.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
