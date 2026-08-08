"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface TrendingTag {
  tag: string;
  mediaCount: number;
  totalScore: number;
}

interface TaggedMedia {
  id: number;
  title: string;
  image: string | null;
  score: number;
}

const TYPE_WORDS = ["masterpiece", "binge-worthy", "hidden gem", "dark fantasy", "peak fiction", "comfort anime"];

const ACCENTS = ["#8a5cff", "#29f2e0", "#ff2d78"];

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

function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: string | number; color: string; sub?: string }) {
  const isNumeric = typeof value === "number";
  const n = useCountUp(isNumeric ? value : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="neon-premium rounded-[20px]"
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</p>
          <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}>{icon}</span>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold" style={{ color }}>
          {isNumeric ? n.toLocaleString("en-IN") : value}
        </p>
        {sub && <p className="mt-1 text-[10px] font-mono text-[var(--color-mute)]">{sub}</p>}
      </div>
    </motion.div>
  );
}

function SectionHeader({ step, title, sub, accent = "var(--color-magenta)" }: { step: string; title: string; sub: string; accent?: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mb-6">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: accent }}>
        {step}
      </p>
      <div className="flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--color-magenta)] to-[var(--color-cyan)] shadow-[0_0_12px_rgba(255,45,120,0.4)]" />
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-[var(--color-mute)]">{sub}</p>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TagsPage() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [media, setMedia] = useState<TaggedMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const typed = useTypewriter(TYPE_WORDS);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/community-tags/trending");
        const d = await res.json();
        if (cancelled) return;
        setTags(d.tags || []);
      } catch {
        if (cancelled) return;
        setTags([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectTag = useCallback(async (tag: string) => {
    setActiveTag(tag);
    setMediaLoading(true);
    setMediaError(null);
    setMedia([]);
    try {
      const res = await fetch(`/api/community-tags/by-tag?tag=${encodeURIComponent(tag)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setMedia(d.media || []);
    } catch {
      setMediaError("Couldn't load anime for this tag. Try again.");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.tag.toLowerCase().includes(q));
  }, [tags, query]);

  const maxScore = useMemo(() => Math.max(1, ...tags.map((t) => t.totalScore)), [tags]);
  const totalAnime = useMemo(() => tags.reduce((s, t) => s + t.mediaCount, 0), [tags]);
  const totalScore = useMemo(() => tags.reduce((s, t) => s + t.totalScore, 0), [tags]);
  const topTag = useMemo(() => tags.reduce<TrendingTag | null>((best, t) => (!best || t.mediaCount > best.mediaCount ? t : best), null), [tags]);

  return (
    <PageTransition>
      <ErrorBoundary label="Tags">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* Hero */}
          <section className="relative mb-14 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center sm:p-10">
            <div
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 opacity-40 blur-3xl"
              style={{ background: "linear-gradient(90deg, #ff2d78, #8a5cff, #29f2e0)" }}
            />
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,45,120,0.2)]"
            >
              ✦ Community Tags · Live
            </motion.p>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display text-4xl font-black leading-tight sm:text-6xl"
            >
              <span className="bg-gradient-to-r from-[var(--color-magenta)] via-white to-[var(--color-cyan)] bg-clip-text text-transparent">
                Trending Tags
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="show" className="mx-auto mt-4 max-w-xl text-base text-[var(--color-mute)]">
              Browse anime by community-created tags — from{" "}
              <span className="font-mono text-[var(--color-cyan)]">{typed}</span>
              <span className="animate-pulse text-[var(--color-cyan)]">▌</span> and everything in between.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#trending"
                className="neon-rgb-border rounded-full bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-all hover:scale-[1.03] hover:border-[var(--color-cyan)]"
              >
                Explore Tags ↓
              </a>
              <Link
                href="/random"
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
              >
                Random Anime
              </Link>
              <Link
                href="/community"
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              >
                Community
              </Link>
            </motion.div>
          </section>

          {/* Stats */}
          <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard icon="🏷" label="Total Tags" value={loading ? 0 : tags.length} color="#29f2e0" sub="live community tags" />
            <StatCard icon="🎬" label="Anime Tagged" value={loading ? 0 : totalAnime} color="#ff2d78" sub="unique series" />
            <StatCard icon="⚡" label="Community Score" value={loading ? 0 : totalScore} color="#8a5cff" sub="aggregate votes" />
            <StatCard icon="👑" label="Top Tag" value={loading || !topTag ? "—" : `#${topTag.tag}`} color="#ffb300" sub={topTag ? `${topTag.mediaCount} anime` : undefined} />
          </div>

          {/* Quick Nav */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-12 flex flex-wrap justify-center gap-2"
          >
            {[
              { id: "trending", label: "Trending" },
              { id: "explore", label: "Explore" },
              { id: "how", label: "How it works" },
            ].map((nav) => (
              <a
                key={nav.id}
                href={`#${nav.id}`}
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] transition-colors hover:border-[var(--color-magenta)]/50 hover:text-[var(--color-magenta)]"
              >
                {nav.label}
              </a>
            ))}
          </motion.div>

          {/* Trending tag cloud */}
          <motion.section
            id="trending"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="neon-premium mb-8 scroll-mt-24 rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
              <SectionHeader
                step="01 · Explore"
                title="Trending Tag Cloud"
                sub="Size and glow grow with community score. Click any tag to reveal every anime tagged with it."
              />
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tags…"
                  className="neon-rgb-border w-full max-w-sm rounded-xl bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="w-fit rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/50 hover:text-white"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              <ErrorBoundary label="Tags">
                {loading ? (
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="h-14 w-32 animate-pulse rounded-xl bg-[var(--color-panel)]" />
                    ))}
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-3xl">🏷</p>
                    <p className="mt-3 text-sm text-[var(--color-mute)]">No tags yet. Create tags on anime detail pages!</p>
                    <Link href="/random" className="mt-4 inline-block rounded-full border border-[var(--color-cyan)]/50 px-5 py-2 text-xs font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/10">
                      Start with a random anime →
                    </Link>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.025 } }, hidden: {} }}
                    className="flex flex-wrap items-center gap-2.5"
                  >
                    {filteredTags.map((t) => {
                      const intensity = 0.15 + 0.85 * (t.totalScore / maxScore);
                      const accent = ACCENTS[intensity > 0.6 ? 2 : intensity > 0.3 ? 1 : 0];
                      const active = activeTag === t.tag;
                      const size = 13 + 6 * intensity;
                      return (
                        <motion.button
                          key={t.tag}
                          variants={{ hidden: { opacity: 0, scale: 0.9, y: 10 }, visible: { opacity: 1, scale: 1, y: 0 } }}
                          onClick={() => selectTag(t.tag)}
                          style={{ fontSize: size }}
                          className={`group relative overflow-hidden rounded-full border px-4 py-2 font-bold transition-all ${
                            active
                              ? "text-black"
                              : "text-white/85 hover:scale-105 hover:text-white"
                          }`}
                        >
                          <span
                            className="pointer-events-none absolute inset-0 transition-opacity"
                            style={{
                              opacity: active ? 1 : 0.12 + 0.3 * intensity,
                              background: `linear-gradient(120deg, ${accent}, ${accent}bb)`,
                              boxShadow: active ? `0 0 24px -2px ${accent}` : `0 0 ${8 + 16 * intensity}px -6px ${accent}`,
                            }}
                          />
                          <span
                            className={`pointer-events-none absolute inset-0 rounded-full ${active ? "" : "border"}`}
                            style={active ? undefined : { borderColor: `${accent}66` }}
                          />
                          <span className="relative flex items-center gap-2">
                            <span>#{t.tag}</span>
                            <span className={`font-mono text-[10px] ${active ? "text-black/70" : "text-[var(--color-mute)]"}`}>
                              {t.mediaCount} · {t.totalScore}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                    {filteredTags.length === 0 && (
                      <p className="py-6 text-sm text-[var(--color-mute)]">
                        No tags match &quot;{query}&quot;. Try something like &quot;masterpiece&quot;.
                      </p>
                    )}
                  </motion.div>
                )}
              </ErrorBoundary>
            </div>
          </motion.section>

          {/* Explore: selected tag anime grid */}
          <motion.section
            id="explore"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="neon-premium mb-8 scroll-mt-24 rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-magenta)] shadow-[0_0_12px_rgba(41,242,224,0.4)]" />
                <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
                  {activeTag ? (
                    <>
                      <span className="text-[var(--color-cyan)]">#{activeTag}</span>
                      <span className="ml-2 text-sm font-normal text-[var(--color-mute)]">
                        {mediaLoading ? "Loading…" : `${media.length} anime`}
                      </span>
                    </>
                  ) : (
                    "Explore by Tag"
                  )}
                </h2>
                {activeTag && (
                  <button
                    onClick={() => setActiveTag(null)}
                    className="ml-auto rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-mute)] transition-colors hover:border-[var(--color-magenta)]/50 hover:text-white"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {!activeTag ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-black/20 p-12 text-center">
                  <p className="text-3xl">🎯</p>
                  <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-mute)]">
                    Pick a tag from the cloud above — like <span className="font-mono text-[var(--color-cyan)]">#masterpiece</span> or{" "}
                    <span className="font-mono text-[var(--color-magenta)]">#binge-worthy</span> — and see every anime tagged with it here.
                  </p>
                  <a
                    href="#trending"
                    className="mt-5 inline-block rounded-full border border-[var(--color-cyan)]/50 px-5 py-2 text-xs font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/10"
                  >
                    Browse tags ↑
                  </a>
                </div>
              ) : mediaLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-[var(--color-panel)]" />
                  ))}
                </div>
              ) : mediaError ? (
                <div className="rounded-xl border border-[var(--color-line)] bg-black/20 p-8 text-center text-sm text-[var(--color-mute)]">
                  {mediaError}
                </div>
              ) : media.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-line)] bg-black/20 p-8 text-center text-sm text-[var(--color-mute)]">
                  No anime tagged with #{activeTag} yet.
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  {media.map((m) => (
                    <motion.div
                      key={m.id}
                      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                      className="group"
                    >
                      <Link href={`/anime/${m.id}`} className="block">
                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--color-panel)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(41,242,224,0.15)] group-hover:ring-1 group-hover:ring-[var(--color-cyan)]/40">
                          {m.image ? (
                            <Image
                              src={m.image}
                              alt={m.title}
                              fill
                              loading="lazy"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-[var(--color-mute)]">
                              No Image
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          {m.score !== 0 && (
                            <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] font-bold text-[var(--color-cyan)] backdrop-blur-sm shadow-[0_0_10px_rgba(41,242,224,0.25)]">
                              +{m.score}
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-3">
                            <h3 className="line-clamp-2 font-display text-sm font-semibold leading-tight text-white drop-shadow-lg">
                              {m.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* How it works */}
          <motion.section
            id="how"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="neon-premium mb-14 scroll-mt-24 rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
              <SectionHeader
                step="02 · Contribute"
                title="How Tags Work"
                sub="Tags are community-driven — every vote shapes what shows up here."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { n: 1, icon: "🗳", title: "Vote on anime", desc: "On any anime detail page, add a tag like #masterpiece and vote on tags others created." },
                  { n: 2, icon: "🔥", title: "Watch it trend", desc: "High-scoring tags rise to the top of the cloud. Size and glow reflect community score." },
                  { n: 3, icon: "✨", title: "Discover anime", desc: "One click reveals every anime tagged with that vibe — your next binge is one tag away." },
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
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] font-mono text-sm font-bold text-black shadow-[0_0_14px_rgba(255,45,120,0.4)]"
                      >
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
                  ✦ Vibe Check
                </motion.p>
                <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
                  Still looking for something to watch?
                </motion.h2>
                <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mt-3 max-w-md text-sm text-[var(--color-mute)]">
                  Let the community lead. Jump into the top-rated anime or roll the dice with a random pick.
                </motion.p>
                <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/top-anime" className="rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[#ff6b9d] px-6 py-3 text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(255,45,120,0.4)]">
                    Top Anime
                  </Link>
                  <Link href="/random" className="neon-rgb-border rounded-xl bg-[var(--color-void)]/70 px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                    Random Anime
                  </Link>
                  <Link href="/watch-order" className="rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                    Watch Order
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
