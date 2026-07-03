"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition><div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i}
            className="particle-dot absolute h-1 w-1 rounded-full"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${15 + (i * 13) % 70}%`,
              background: i % 3 === 0 ? "var(--color-magenta)" : i % 3 === 1 ? "var(--color-cyan)" : "var(--color-violet)",
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full">
        <div className="neon-card">
          <div className="px-8 py-10 sm:px-10">
            {/* Logo */}
            <div className="mb-6 text-center">
              <span className="logo-text font-display text-2xl font-bold tracking-wider">ZyniVerse</span>
            </div>

            <h1 className="neon-glow-text font-display text-center text-4xl font-bold tracking-wider">
              JOIN US
            </h1>
            <p className="mt-2 text-center text-sm text-[var(--color-mute)] tracking-wider uppercase">
              Create your account
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="floating-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                />
                <label>Email</label>
                <span className="input-glow-line" />
              </div>

              <div className="floating-input-wrap">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  required
                  minLength={3}
                />
                <label>Username</label>
                <span className="input-glow-line" />
              </div>

              <div className="floating-input-wrap">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  minLength={6}
                />
                <label>Password</label>
                <span className="input-glow-line" />
              </div>

              {error && (
                <p className="text-center text-sm text-red-400 tracking-wider">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="login-btn">
                <span /><span /><span /><span />
                {loading ? "CREATING..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-mute)] tracking-wider">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--color-cyan)] transition-colors hover:text-[var(--color-magenta)]"
                >
                  SIGN IN
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div></PageTransition>
  );
}
