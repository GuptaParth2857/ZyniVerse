import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Chrome Extension — Auto-Track Anime to ZyniVerse",
  description:
    "Install the free ZyniVerse Chrome extension to automatically track anime you watch on Crunchyroll and Netflix — episode progress syncs to your watchlist.",
  openGraph: {
    title: "ZyniVerse Chrome Extension — Auto-Tracking",
    description:
      "Watch on Crunchyroll or Netflix and ZyniVerse tracks it automatically — series, episodes and progress, all synced to your list.",
  },
};

const STEPS = [
  {
    n: "1",
    title: "Download the extension",
    desc: "Grab the extension folder from the ZyniVerse GitHub repository or the link below.",
  },
  {
    n: "2",
    title: "Open Chrome extensions",
    desc: "Go to chrome://extensions and turn on Developer mode (top-right corner).",
  },
  {
    n: "3",
    title: "Load unpacked",
    desc: "Click “Load unpacked” and select the extension folder. Pin it next to your address bar.",
  },
  {
    n: "4",
    title: "Add your API key",
    desc: "Click the extension icon, paste your free API key from Profile → API Keys, and hit Save & Verify.",
  },
];

const FEATURES = [
  { icon: "▶", title: "Crunchyroll", desc: "Auto-detects the series and episode you're watching." },
  { icon: "N", title: "Netflix", desc: "Tracks your series and advances episode progress as you watch." },
  { icon: "↻", title: "Auto progress", desc: "Updates your list to Currently Watching and sets episode progress." },
  { icon: "🔒", title: "Private", desc: "Everything runs locally in your browser with your own API key." },
];

export default function ExtensionPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <section className="relative mb-12 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] p-8 sm:p-12 text-center">
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 opacity-40 blur-3xl"
            style={{ background: "linear-gradient(90deg, #29f2e0, #8a5cff, #ff2d78)" }}
          />
          <p className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            ✦ Free Chrome Extension
          </p>
          <h1 className="relative font-display text-4xl font-black leading-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text text-transparent">
              Watch. Done. Tracked.
            </span>
          </h1>
          <p className="relative mx-auto mt-4 max-w-xl text-base text-[var(--color-mute)]">
            Install the ZyniVerse extension and your Crunchyroll &amp; Netflix sessions auto-sync to your
            watchlist — series added, episode progress updated, no manual entry.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/profile"
              className="neon-rgb-border rounded-full bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-all hover:scale-[1.03] hover:border-[var(--color-cyan)]"
            >
              Get Your API Key →
            </Link>
            <a
              href="https://github.com/GuptaParth2857/ZyniVerse/tree/main/extension"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
            >
              Download from GitHub ↗
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] text-base font-bold text-black">
                {f.icon}
              </div>
              <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)]">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Install steps */}
        <section className="mb-12">
          <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            Install in 1 minute
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-5">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] font-mono text-sm font-bold text-black">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works + API */}
        <section className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">How it works</h2>
          <ol className="mt-4 space-y-2.5 text-sm text-[var(--color-mute)]">
            {[
              <>The extension watches your active tab on <b className="text-[var(--color-ink)]">Crunchyroll</b> or <b className="text-[var(--color-ink)]">Netflix</b> and detects the anime + episode being played.</>,
              <>It sends one secure request to <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-[var(--color-cyan)]">POST /api/v1/scrobble</code> with your personal API key.</>,
              <>ZyniVerse matches the title (via AniList), sets the series to <b className="text-[var(--color-ink)]">Currently Watching</b> and records your episode progress.</>,
              <>Open your <Link href="/watchlist" className="text-[var(--color-cyan)] hover:underline">watchlist</Link> and it's all there — automatic.</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] font-mono text-xs font-bold text-black">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/docs" className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
              API Docs →
            </Link>
            <Link href="/docs/changelog" className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
              Changelog
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
