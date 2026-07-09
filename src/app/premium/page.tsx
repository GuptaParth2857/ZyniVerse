"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
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
  const pts = useRef<{ x: number; y: number; s: number; d: number; o: number; c: string; ty: number; delay: number }[]>([]);
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
}

function NeonBorder({ children }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <div className="relative rounded-[24px]">
      <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
        />
        <div className="absolute inset-[1.5px] rounded-[22.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function RippleButton({ children, className = "", ...props }: { children: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const click = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { x: e.clientX - r.left, y: e.clientY - r.top, id }]);
    setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 800);
    props.onClick?.(e as any);
  };
  return (
    <button ref={ref} onClick={click} className={`relative overflow-hidden ${className}`} {...props}>
      {ripples.map((r) => (
        <span key={r.id} className="absolute rounded-full bg-white/20 animate-ripple" style={{ left: r.x - 8, top: r.y - 8, width: 16, height: 16 }} />
      ))}
      {children}
    </button>
  );
}

export default function PremiumPage() {
  return (
    <PageTransition>
      <MouseGlow />
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />
        <NeonOrbs />
        <Particles />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
              Pricing
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="font-display text-4xl font-bold sm:text-5xl mt-2 bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
              ZyniVerse Premium
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
              From API access for developers to ad-free browsing for fans. Choose what fits you.
            </motion.p>
          </div>

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
                      <h2 className="font-display text-xl font-bold text-white">{plan.name}</h2>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="mb-8 space-y-3 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.highlighted ? "#ff00e6" : "#00ffe0"} strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.cta === "Current Plan" ? (
                      <div className="block w-full rounded-[16px] border border-[rgba(0,255,224,0.15)] px-5 py-3 text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {plan.cta}
                      </div>
                    ) : plan.cta === "Contact Us" ? (
                      <a href="mailto:contact.zenvyx@gmail.com"
                        className="block w-full rounded-[16px] border border-[rgba(0,255,224,0.2)] px-5 py-3 text-center text-sm font-bold text-white hover:border-[#00ffe0]/40 hover:bg-[rgba(0,255,224,0.03)] transition-all"
                      >{plan.cta}</a>
                    ) : (
                      <Link href="/profile"
                        className="block w-full rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] active:scale-[0.98]"
                      >{plan.cta} →</Link>
                    )}
                  </div>
                </NeonBorder>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 pt-10">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="font-display text-2xl font-bold mb-8 text-center text-white">Frequently Asked</motion.h2>
            <div className="grid gap-4 max-w-2xl mx-auto">
              {FAQS.map((faq, i) => (
                <motion.div key={faq.q}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-[16px] border border-[rgba(0,255,224,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-sm p-5"
                >
                  <h3 className="font-semibold text-sm mb-1 text-white">{faq.q}</h3>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="mt-10 text-center font-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.06)" }}>
            ZYNIVERSE • v2.4.1 • ENCRYPTED
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
