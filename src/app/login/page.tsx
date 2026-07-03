"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

/* ─── Particles ─── */
function Particles() {
  const pts = useRef<{ x: number; y: number; s: number; d: number; o: number }[]>([]);
  if (pts.current.length === 0) {
    for (let i = 0; i < 60; i++) {
      pts.current.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2.5 + 0.5,
        d: Math.random() * 12 + 6,
        o: Math.random() * 0.4 + 0.1,
      });
    }
  }
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.current.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            background: i % 3 === 0 ? "#00ffe0" : i % 3 === 1 ? "#ff00e6" : "#7000ff",
            opacity: p.o,
            boxShadow: i % 2 === 0 ? "0 0 6px rgba(0,255,224,0.3)" : "0 0 6px rgba(255,0,230,0.3)",
          }}
          animate={{ y: [0, -(Math.random() * 50 + 10), 0], opacity: [p.o * 0.2, p.o, p.o * 0.2] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ─── Mouse Glow ─── */
function MouseGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const handle = useCallback((e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY }), []);
  useEffect(() => {
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [handle]);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 transition duration-700"
      style={{
        background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(0,255,224,0.04) 0%, transparent 100%)`,
      }}
    />
  );
}

/* ─── Floating neon orbs ─── */
function NeonOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-[15%] left-[10%] w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,255,224,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[50%] right-[15%] w-[250px] h-[250px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,0,230,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[40%] w-[200px] h-[200px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(112,0,255,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Animated neon border ─── */
function NeonBorder() {
  return (
    <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-[-50%]"
        style={{
          background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[1.5px] rounded-[22.5px]" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(30px)" }} />
    </div>
  );
}

/* ─── Glow line input ─── */
function GlowInput({ type, value, onChange, placeholder, icon, toggle }: {
  type: string; value: string; onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; toggle?: { show: boolean; onToggle: () => void };
}) {
  return (
    <div className="group relative">
      <div className="relative">
        <input
          type={toggle ? (toggle.show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full h-[56px] rounded-[16px] bg-transparent pl-12 pr-12 text-[14px] text-white placeholder-[rgba(255,255,255,0.2)] outline-none transition-all duration-300 border border-[rgba(0,255,224,0.2)] focus:border-[#00ffe0] focus:shadow-[0_0_30px_-10px_rgba(0,255,224,0.4),inset_0_0_20px_-15px_rgba(0,255,224,0.15)]"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffe0] opacity-60 group-focus-within:opacity-100 transition-opacity">
          {icon}
        </div>
        {toggle && (
          <button type="button" onClick={toggle.onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)] hover:text-[#00ffe0] transition-colors"
            tabIndex={-1}
          >
            {toggle.show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── RippleButton ─── */
function RippleButton({ children, className = "", ...props }: { children: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const click = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
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

/* ─── MAIN ─── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("zyniverse_remember_email");
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (remember) {
      localStorage.setItem("zyniverse_remember_email", email);
    } else {
      localStorage.removeItem("zyniverse_remember_email");
    }
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <PageTransition><>
      <MouseGlow />
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] px-4">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />

        <NeonOrbs />
        <Particles />

        {/* Card wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[440px]"
        >
          {/* Neon border card */}
          <div className="relative rounded-[24px] shadow-[0_0_60px_-20px_rgba(0,255,224,0.15),0_0_80px_-30px_rgba(255,0,230,0.1)]">
            <NeonBorder />

            <div className="relative z-10 px-8 py-10 sm:px-10 sm:py-12">
              {/* Brand */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  className="relative inline-flex mx-auto mb-4"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--color-cyan)]/40 shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)]">
                    <img src="/logo.png" alt="ZyniVerse" width={64} height={64} className="object-cover" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: "0 0 30px rgba(0,255,224,0.4)" }} />
                </motion.div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">ZyniVerse</h1>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="font-display text-[32px] font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
                  Login
                </h2>
                <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Enter your credentials to access your account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <GlowInput
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Email address"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>}
                />

                <GlowInput
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Password"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                  toggle={{ show: showPw, onToggle: () => setShowPw(!showPw) }}
                />

                {/* Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setRemember(!remember)}
                      className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-300 ${remember ? "bg-[#00ffe0]" : "bg-[rgba(255,255,255,0.06)]"}`}
                    >
                      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ${remember ? "ml-[19px]" : "ml-[3px]"}`}
                      />
                    </button>
                    <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>Remember me</span>
                  </div>
                  <button type="button" onClick={() => { setComingSoon("Password reset coming soon!"); setTimeout(() => setComingSoon(""), 3000); }}
                    className="text-[13px] font-medium text-[#00ffe0] hover:text-[#ff00e6] transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Error / Coming Soon */}
                <AnimatePresence>
                  {(error || comingSoon) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className={`rounded-[12px] border px-4 py-2.5 ${error ? "border-red-500/20 bg-red-500/5" : "border-[#00ffe0]/20 bg-[#00ffe0]/5"}`}>
                        <p className={`text-center text-[13px] ${error ? "text-red-400" : "text-[#00ffe0]"}`}>{error || comingSoon}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <RippleButton type="submit" disabled={loading}
                  className="w-full h-[56px] rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] text-[15px] font-bold text-white tracking-wide shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </RippleButton>
              </form>

              {/* Divider */}
              <div className="mt-7 flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>or continue with</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>

              {/* Social */}
              <div className="mt-5 flex gap-3">
                {[
                  { name: "Google", id: "google", icon: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                  { name: "GitHub", id: "github", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg> },
                ].map((s) => (
                  <motion.button key={s.id} type="button"
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => signIn(s.id, { redirect: false })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-[rgba(0,255,224,0.1)] bg-[rgba(255,255,255,0.02)] py-3 text-[13px] font-medium text-[rgba(255,255,255,0.4)] transition-all duration-300 hover:border-[#00ffe0]/30 hover:bg-[rgba(0,255,224,0.03)] hover:text-[#00ffe0] hover:shadow-[0_0_25px_-10px_rgba(0,255,224,0.15)]"
                  >
                    {s.icon}
                    <span className="hidden sm:inline">{s.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-semibold text-[#00ffe0] hover:text-[#ff00e6] transition-colors">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom meta */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-5 text-center font-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.06)" }}
          >
            ZYNIVERSE • v2.4.1 • ENCRYPTED
          </motion.p>
        </motion.div>
      </div>
    </></PageTransition>
  );
}
