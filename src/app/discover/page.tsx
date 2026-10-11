import type { Metadata } from "next";
import DiscoverFeed from "@/components/DiscoverFeed";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Discover | ZyniVerse — Unified Anime Feed",
  description: "A single feed of anime news, memes, reels, moments, fan art, cosplay and blogs all in one place.",
  alternates: { canonical: `${BASE_URL}/discover` },
};

const HERO_TAGS = [
  { label: "News", emoji: "📰", color: "#f87171" },
  { label: "Memes", emoji: "😂", color: "#facc15" },
  { label: "Reels", emoji: "🎬", color: "#f472b6" },
  { label: "Moments", emoji: "💬", color: "#a78bfa" },
  { label: "Fan Art", emoji: "🎨", color: "#22d3ee" },
  { label: "Cosplay", emoji: "📸", color: "#34d399" },
  { label: "Blogs", emoji: "✍️", color: "#60a5fa" },
];

const HERO_STATS = [
  { icon: "📡", label: "Real-time" },
  { icon: "🎭", label: "7 Content Types" },
  { icon: "🤝", label: "Community Built" },
];

const TICKER_ITEMS = [
  { label: "News", emoji: "📰", color: "#f87171" },
  { label: "Memes", emoji: "😂", color: "#facc15" },
  { label: "Reels", emoji: "🎬", color: "#f472b6" },
  { label: "Moments", emoji: "💬", color: "#a78bfa" },
  { label: "Fan Art", emoji: "🎨", color: "#22d3ee" },
  { label: "Cosplay", emoji: "📸", color: "#34d399" },
  { label: "Blogs", emoji: "✍️", color: "#60a5fa" },
  { label: "Trending Now", emoji: "🔥", color: "#fb923c" },
  { label: "Community Pick", emoji: "💜", color: "#a78bfa" },
];

export default function DiscoverPage() {
  return (
    <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <section className="neon-rgb-border relative overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-20">
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
        <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">😂</span>
        <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>🎬</span>
        <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>📰</span>
        <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>🎨</span>

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
              Unified Feed · News · Memes · Reels · More
            </p>

            <h1
              className="neon-text-gradient animate-hero-text font-display text-4xl font-black tracking-tight sm:text-6xl"
              style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
            >
              Discover
            </h1>

            <p className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base" style={{ animationDelay: "0.25s" }}>
              Events &amp; community se latest anime news, memes, reels, moments, fan art, cosplay
              aur blogs — sab ek jagah.
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

      <DiscoverFeed />
    </main>
  );
}