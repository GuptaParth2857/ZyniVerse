"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Suggestion {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
}

export default function CompareIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = username.trim().replace(/^@/, "");
    async function search() {
      if (!session?.user?.id || q.length < 2) {
        setSuggestions([]);
        setSuggestOpen(false);
        return;
      }
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const d = await res.json();
        setSuggestions(d.users || []);
        setSuggestOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }
    const id = setTimeout(search, 250);
    return () => clearTimeout(id);
  }, [username, session?.user?.id]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (u: string) => {
    const clean = u.trim().replace(/^@/, "");
    setSuggestOpen(false);
    router.push(`/compare/${encodeURIComponent(clean)}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().replace(/^@/, "");
    if (!u) {
      setError("Enter a username to compare with.");
      return;
    }
    if (/[/?#]/.test(u)) {
      setError("Username can't contain / ? or #");
      return;
    }
    setError(null);
    go(u);
  };

  return (
    <PageTransition>
      <ErrorBoundary label="Compare">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {/* Hero */}
          <section className="relative mb-14 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center sm:p-10">
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
              ✦ Social · Compare
            </motion.p>
            <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="font-display text-4xl font-black leading-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text text-transparent">
                Compare Anime Lists
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="show" className="mx-auto mt-4 max-w-xl text-base text-[var(--color-mute)]">
              See how your taste stacks up against a friend — shared anime, compatibility score, and who rates what higher.
            </motion.p>
          </section>

          {status === "loading" ? (
            <div className="h-64 animate-pulse rounded-[20px] bg-[var(--color-panel)]" />
          ) : !session?.user?.id ? (
            /* Signed out */
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="neon-premium rounded-[20px]"
            >
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
              <div className="neon-premium-content rounded-[20px] p-8 text-center sm:p-12">
                <p className="text-4xl">⚔️</p>
                <h2 className="mt-4 font-display text-2xl font-bold text-[var(--color-ink)]">Sign in to Compare</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-mute)]">
                  Compare your list with any user on ZyniVerse — anime you both watched, your compatibility percentage, and more.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/login" className="rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[#ff6b9d] px-6 py-3 text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(255,45,120,0.4)]">
                    Sign In
                  </Link>
                  <Link href="/register" className="neon-rgb-border rounded-xl bg-[var(--color-void)]/70 px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                    Create Account
                  </Link>
                </div>
              </div>
            </motion.section>
          ) : (
            /* Signed in */
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="neon-premium z-30 mb-8 rounded-[20px]"
            >
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
              <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-magenta)] shadow-[0_0_12px_rgba(41,242,224,0.4)]" />
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">Who do you want to compare with?</h2>
                </div>
                <form onSubmit={submit} className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div ref={wrapRef} className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[var(--color-cyan)]">@</span>
                      <input
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(null); }}
                        placeholder="username"
                        autoFocus
                        className="neon-rgb-border w-full rounded-xl bg-black/30 py-3 pl-9 pr-4 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none"
                      />
                      {suggestOpen && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)]">
                          {suggestLoading ? (
                            <div className="flex items-center gap-2 px-4 py-3 text-xs text-[var(--color-mute)]">
                              <span className="h-3 w-3 animate-spin rounded-full border border-[var(--color-cyan)] border-t-transparent" />
                              Searching…
                            </div>
                          ) : suggestions.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-[var(--color-mute)]">No users found.</p>
                          ) : (
                            suggestions.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => go(s.username)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--color-cyan)]/10"
                              >
                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[var(--color-line)]">
                                  {s.avatar ? (
                                    <Image src={s.avatar} alt={s.username} fill className="object-cover" sizes="32px" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--color-cyan)]">
                                      {s.username[0]?.toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-[var(--color-ink)]">@{s.username}</p>
                                  {s.bio && <p className="truncate text-xs text-[var(--color-mute)]">{s.bio}</p>}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[#29f2e0]/80 px-6 py-3 text-sm font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(41,242,224,0.35)]"
                    >
                      Compare →
                    </button>
                  </div>
                  {error && <p className="text-xs text-[var(--color-magenta)]">{error}</p>}
                </form>
                <p className="mt-3 text-xs text-[var(--color-mute)]">
                  Tip: find usernames on your{" "}
                  <Link href="/friends" className="text-[var(--color-cyan)] hover:underline">Friends</Link> or{" "}
                  <Link href="/profile" className="text-[var(--color-cyan)] hover:underline">Profile</Link> page.
                </p>
              </div>
            </motion.section>
          )}

          {/* How it works */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="neon-premium mb-8 rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--color-magenta)] to-[var(--color-cyan)] shadow-[0_0_12px_rgba(255,45,120,0.4)]" />
                <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">How it works</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { n: 1, icon: "👤", title: "Enter a username", desc: "Type any ZyniVerse user's username — including friends from your friends list." },
                  { n: 2, icon: "📊", title: "We crunch the lists", desc: "Compare anime you've both added, shared titles, and per-anime score differences." },
                  { n: 3, icon: "💜", title: "Get your %", desc: "A compatibility score from 0-100% based on how close your ratings are." },
                ].map((s, i) => (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-[var(--color-line)] bg-black/25 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] font-mono text-sm font-bold text-black shadow-[0_0_14px_rgba(255,45,120,0.4)]">
                        {s.n}
                      </span>
                      <span className="text-xl">{s.icon}</span>
                    </div>
                    <p className="mt-4 font-display text-sm font-bold text-[var(--color-ink)]">{s.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-mute)]">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[24px] neon-premium"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content relative rounded-[24px] p-8 text-center sm:p-10">
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[90%] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(138,92,255,0.25), transparent 60%)" }}
              />
              <div className="relative">
                <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
                  ✦ Queue It Up
                </motion.p>
                <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
                  Ready to settle the taste debate?
                </motion.h2>
                <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mt-3 max-w-md text-sm text-[var(--color-mute)]">
                  Find more friends to compare with, or polish your own list first.
                </motion.p>
                <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/friends" className="rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[#ff6b9d] px-6 py-3 text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(255,45,120,0.4)]">
                    Find Friends
                  </Link>
                  <Link href="/profile" className="neon-rgb-border rounded-xl bg-[var(--color-void)]/70 px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                    My List
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
