"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "login" | "register";
}

export default function AuthModal({ open, onClose, mode = "login" }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<"login" | "register">(mode);

  function reset() {
    setEmail("");
    setPassword("");
    setUsername("");
    setError("");
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      reset();
      onClose();
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, username, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Registration failed");
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      reset();
      onClose();
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl border border-[var(--glass-border)] bg-[var(--color-panel)] p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6 text-center">
              <h2 className="font-display text-xl font-bold">
                {currentMode === "login" ? "Welcome Back" : "Join ZyniVerse"}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-mute)]">
                {currentMode === "login" ? "Sign in to continue" : "Create your account"}
              </p>
            </div>

            <form onSubmit={currentMode === "login" ? handleLogin : handleRegister} className="space-y-4">
              {currentMode === "register" && (
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    minLength={3}
                    className="glass-input w-full px-4 py-3 text-sm"
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="glass-input w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="glass-input w-full px-4 py-3 text-sm"
                />
              </div>

              {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-magnetic w-full rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {currentMode === "login" ? "Signing in..." : "Creating..."}
                  </span>
                ) : (
                  currentMode === "login" ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-[var(--color-mute)]">
                {currentMode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => { setCurrentMode("register"); setError(""); }}
                      className="font-semibold text-[var(--color-cyan)] hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => { setCurrentMode("login"); setError(""); }}
                      className="font-semibold text-[var(--color-cyan)] hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
              <Link
                href={currentMode === "login" ? "/login" : "/register"}
                className="mt-2 inline-block text-[10px] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                onClick={onClose}
              >
                Open full page →
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
