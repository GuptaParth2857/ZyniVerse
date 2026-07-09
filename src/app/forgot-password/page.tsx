"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
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
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
      } else {
        setError(data.error || "Failed to send email");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Password reset successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
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
                      <Image src="/logo.png" alt="ZyniVerse" width={64} height={64} className="object-cover" />
                    </div>
                  <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: "0 0 30px rgba(0,255,224,0.4)" }} />
                </motion.div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">ZyniVerse</h1>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="font-display text-[32px] font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
                  Reset Password
                </h2>
                <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {step === "email" ? "Enter your email to receive an OTP." : "Enter the OTP sent to your email and a new password."}
                </p>
              </div>

              {/* Form */}
              {step === "email" ? (
                <form onSubmit={handleSendEmail} className="space-y-5">
                  <GlowInput
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Email address"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>}
                  />

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="rounded-[12px] border px-4 py-2.5 border-red-500/20 bg-red-500/5">
                          <p className="text-center text-[13px] text-red-400">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <RippleButton type="submit" disabled={loading}
                    className="w-full h-[56px] rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] text-[15px] font-bold text-white tracking-wide shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Reset Code"}
                  </RippleButton>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <GlowInput
                    type="text"
                    value={otp}
                    onChange={setOtp}
                    placeholder="6-digit OTP"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>}
                  />

                  <GlowInput
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="New Password"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                    toggle={{ show: showPw, onToggle: () => setShowPw(!showPw) }}
                  />

                  {/* Error / Success */}
                  <AnimatePresence>
                    {(error || successMsg) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className={`rounded-[12px] border px-4 py-2.5 ${error ? "border-red-500/20 bg-red-500/5" : "border-[#00ffe0]/20 bg-[#00ffe0]/5"}`}>
                          <p className={`text-center text-[13px] ${error ? "text-red-400" : "text-[#00ffe0]"}`}>{error || successMsg}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <RippleButton type="submit" disabled={loading}
                    className="w-full h-[56px] rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] text-[15px] font-bold text-white tracking-wide shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </RippleButton>
                </form>
              )}

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Remember your password?{" "}
                  <Link href="/login" className="font-semibold text-[#00ffe0] hover:text-[#ff00e6] transition-colors">
                    Sign In
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
