"use client";

import { useRef, useState, useEffect, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "100 API requests/day",
      "10 requests/minute",
      "Up to 10 API keys",
      "Basic filler guides",
      "Watchlist (cloud-synced)",
      "Community access",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    features: [
      "10,000 API requests/day",
      "100 requests/minute",
      "Up to 25 API keys",
      "Ad-free browsing",
      "Export watchlist (CSV/JSON)",
      "Advanced filters & search",
      "Usage analytics dashboard",
      "Priority support",
      "Early feature access",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    period: "/month",
    features: [
      "100,000 API requests/day",
      "1,000 requests/minute",
      "Up to 100 API keys",
      "Everything in Pro",
      "Custom API endpoints",
      "Dedicated support",
      "SLA guarantee",
      "White-label options",
      "Custom integrations",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

const FAQS = [
  { q: "How do I get API access?", a: "Sign up for a free account and create an API key in your Profile → API Keys section. Free tier gets 100 requests/day." },
  { q: "Can I upgrade from Free to Pro?", a: "Yes! Visit the Premium page and subscribe. Your API key will automatically get upgraded limits." },
  { q: "What payment methods do you accept?", a: "We accept cards, UPI, and net banking via Stripe. Indian users can pay with UPI." },
  { q: "Is there a free trial?", a: "The Free tier is always available. Pro features can be tested with no commitment." },
];

const HERO_STATS = [
  { icon: "💎", label: "3 Tiers" },
  { icon: "🚀", label: "API Access" },
  { icon: "📺", label: "Ad-Free Browsing" },
];

const HERO_TAGS = [
  { label: "Free", emoji: "🆓", color: "#34d399" },
  { label: "Pro", emoji: "⚡", color: "#22d3ee" },
  { label: "Enterprise", emoji: "🏢", color: "#a78bfa" },
  { label: "UPI / Cards", emoji: "💳", color: "#f97316" },
];

const TICKER_ITEMS = [
  { label: "API Keys", emoji: "🔑", color: "#facc15" },
  { label: "Ad-Free", emoji: "🛡️", color: "#4ade80" },
  { label: "Analytics Dashboard", emoji: "📊", color: "#60a5fa" },
  { label: "Priority Support", emoji: "🎧", color: "#f472b6" },
  { label: "Early Access", emoji: "✨", color: "#a78bfa" },
  { label: "CSV Export", emoji: "📥", color: "#fb923c" },
  { label: "Custom Endpoints", emoji: "🧩", color: "#22d3ee" },
  { label: "Watchlist Sync", emoji: "☁️", color: "#34d399" },
  { label: "White-label", emoji: "🎨", color: "#f87171" },
  { label: "SLA Guarantee", emoji: "🛡️", color: "#facc15" },
];

function MouseGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    let frame: number | null = null;
    const handle = (e: MouseEvent) => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
        frame = null;
      });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handle);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 transition duration-700"
      style={{ background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(0,255,224,0.04) 0%, transparent 100%)`, willChange: "background" }}
    />
  );
}

function NeonOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute top-[40%] right-[10%] w-[280px] h-[280px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,0,230,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute bottom-[15%] left-[35%] w-[250px] h-[250px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(112,0,255,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Particles() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const pts = useRef<{ x: number; y: number; s: number; d: number; o: number; c: string; ty: number; delay: number }[]>([]);
  /* eslint-disable react-hooks/refs, react-hooks/purity */
  if (pts.current.length === 0) {
    const colors = ["#00ffe0", "#ff00e6", "#7000ff"];
    for (let i = 0; i < 20; i++) {
      pts.current.push({
        x: Math.random() * 100, y: Math.random() * 100,
        s: Math.random() * 2.5 + 0.5, d: Math.random() * 6 + 4, o: Math.random() * 0.4 + 0.1,
        c: colors[i % 3], ty: -(Math.random() * 40 + 8), delay: Math.random() * 5,
      });
    }
  }
  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.current.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s,
            background: p.c, opacity: p.o,
            boxShadow: i % 2 === 0 ? "0 0 6px rgba(0,255,224,0.3)" : "0 0 6px rgba(255,0,230,0.3)",
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, p.ty, 0], opacity: [p.o * 0.2, p.o, p.o * 0.2] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
  /* eslint-enable react-hooks/refs, react-hooks/purity */
}

function NeonBorder({ children }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <div className="relative rounded-[24px]">
      <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
        />
        <span className="absolute inset-[1.5px] rounded-[22.5px] neon-border-inner" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(
        res.status === 503
          ? "Payments aren't available yet. Please check back soon."
          : data.error || "Checkout isn't available right now. Please try again later."
      );
    } catch {
      setError("Checkout isn't available right now. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="block w-full rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Subscribe →"
        )}
      </button>
      {error && <p className="mt-2 text-center text-[11px] text-amber-400">{error}</p>}
    </div>
  );
}

function PremiumInner() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  return (
    <PageTransition>
      <MouseGlow />
      <div className="relative min-h-screen overflow-hidden bg-[var(--color-void)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[var(--color-panel)] to-[var(--color-void)]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.06,
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />
        <NeonOrbs />
        <Particles />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          {/* ─────────── HERO ─────────── */}
          <section className="neon-rgb-border relative mb-14 overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-16">
            <div className="neon-banner-card pointer-events-none absolute inset-0" />

            {/* Top shine line */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* Scanline sweep */}
            <div aria-hidden className="scanline-sweep" />

            {/* HUD corner brackets */}
            <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--color-cyan)]/50" />
            <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--color-cyan)]/50" />
            <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--color-magenta)]/50" />
            <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--color-magenta)]/50" />

            {/* Floating emojis (desktop) */}
            <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">💎</span>
            <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>🛡️</span>
            <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>🚀</span>
            <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>✨</span>

            {/* Breathing orbs */}
            <div aria-hidden className="pointer-events-none absolute left-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-cyan)]/25 blur-[55px] float-anim md:block" />
            <div aria-hidden className="pointer-events-none absolute right-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-magenta)]/25 blur-[55px] float-anim md:block" style={{ animationDelay: "1.5s" }} />

            <div className="relative z-10 mx-auto max-w-3xl px-6">
              {/* Rotating conic halo behind title */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                style={{
                  background: "conic-gradient(from 0deg, var(--color-magenta), var(--color-cyan), var(--color-violet), var(--color-magenta))",
                  animation: "spin 10s linear infinite",
                }}
              />

              <div className="relative">
                <p className="console-label mb-4 flex animate-hero-text items-center justify-center gap-2" style={{ animationDelay: "0.05s" }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                  </span>
                  Pricing · Choose Your Tier
                </p>

                <h1
                  className="neon-text-gradient animate-hero-text font-display text-4xl font-bold tracking-tight sm:text-6xl"
                  style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
                >
                  ZyniVerse Premium
                </h1>

                <p className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base" style={{ animationDelay: "0.25s" }}>
                  From API access for developers to ad-free browsing for fans. Choose what fits you.
                </p>

                {/* Stats */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {HERO_STATS.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] backdrop-blur-sm"
                    >
                      {s.icon} {s.label}
                    </span>
                  ))}
                </div>

                {/* Content type chips */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {HERO_TAGS.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:brightness-125"
                      style={{ color: tag.color, borderColor: `${tag.color}55`, background: `${tag.color}14` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color, boxShadow: `0 0 8px ${tag.color}` }} />
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
                </div>

                {/* Scroll hint */}
                <div className="mt-6 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-mute)]">
                    Scroll to explore
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce text-[var(--color-cyan)]">
                    <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Neon marquee ticker band */}
            <div aria-hidden className="ticker-window relative z-10 mt-8 border-t border-[var(--color-line)] bg-[var(--color-void)]/40 py-3">
              <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-8">
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                  <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                    <span className="text-base leading-none" style={{ textShadow: `0 0 10px ${t.color}aa` }}>{t.emoji}</span>
                    <span className="text-[var(--color-mute)]">{t.label}</span>
                    <span className="ml-6 select-none text-[var(--color-magenta)]/40">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-md mb-8 rounded-[16px] border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-center text-sm text-emerald-300"
              >
                Subscription activated! Welcome to ZyniVerse Pro.
              </motion.div>
            )}
            {canceled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-md mb-8 rounded-[16px] border border-red-500/30 bg-red-500/10 px-6 py-4 text-center text-sm text-red-300"
              >
                Checkout was canceled. You can try again anytime.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan, idx) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx + 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <NeonBorder highlighted={plan.highlighted}>
                  <div className={`relative rounded-[24px] p-8 flex flex-col h-full ${
                    plan.highlighted
                      ? "shadow-[0_0_60px_-20px_rgba(0,255,224,0.15),0_0_80px_-30px_rgba(255,0,230,0.1)]"
                      : ""
                  }`}>
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-black z-20 shadow-[0_0_20px_-5px_rgba(0,255,224,0.4)]">
                        Popular
                      </span>
                    )}
                    <div className="mb-6">
                      <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">{plan.name}</h2>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[var(--color-ink)]">{plan.price}</span>
                        <span className="text-sm text-[var(--color-mute)]">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="mb-8 space-y-3 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-[var(--color-mute)]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.highlighted ? "#ff00e6" : "#00ffe0"} strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.cta === "Current Plan" ? (
                      <div className="block w-full rounded-[16px] border border-[rgba(0,255,224,0.15)] px-5 py-3 text-center text-sm font-bold text-[var(--color-mute)]">
                        {plan.cta}
                      </div>
                    ) : plan.cta === "Contact Us" ? (
                      <a href="mailto:contact.zenvyx@gmail.com"
                        className="block w-full rounded-[16px] border border-[rgba(0,255,224,0.2)] px-5 py-3 text-center text-sm font-bold text-[var(--color-ink)] hover:border-[#00ffe0]/40 hover:bg-[rgba(0,255,224,0.03)] transition-all"
                      >{plan.cta}</a>
                    ) : (
                      <CheckoutButton />
                    )}
                  </div>
                </NeonBorder>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 pt-10">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="font-display text-2xl font-bold mb-8 text-center text-[var(--color-ink)]">Frequently Asked</motion.h2>
            <div className="grid gap-4 max-w-2xl mx-auto">
              {FAQS.map((faq, i) => (
                <motion.div key={faq.q}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-panel)] backdrop-blur-sm p-5"
                >
                  <h3 className="font-semibold text-sm mb-1 text-[var(--color-ink)]">{faq.q}</h3>
                  <p className="text-xs text-[var(--color-mute)]">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="mt-10 text-center font-mono text-[9px] tracking-[0.3em] text-[var(--color-mute)]">
            ZYNIVERSE • v2.4.1 • ENCRYPTED
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={null}>
      <PremiumInner />
    </Suspense>
  );
}
