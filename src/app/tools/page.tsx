import type { Metadata } from "next";
import Link from "next/link";
import ToolsHero from "@/components/ToolsHero";

export const metadata: Metadata = {
  title: "Free Anime Tools — Filler Calculator, Watch Time & More (2026)",
  description:
    "Free anime tools you can't find anywhere else. Calculate how many hours you'd save skipping filler, compare anime watch times, find your next binge & more. Bookmark these!",
  keywords: ["anime tools", "anime filler calculator", "anime watch time calculator", "how long to watch anime", "anime binge calculator", "free anime tools"],
  openGraph: {
    title: "Free Anime Tools — Filler Calculator, Watch Time & More",
    description: "Calculate hours saved skipping filler, compare watch times & more. Free tools for anime fans.",
    url: "https://zyverse.in/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Free Anime Tools — Filler Calculator, Watch Time & More",
    description: "Calculate hours saved skipping filler, compare watch times & more. Free tools for anime fans.",
  },
  alternates: { canonical: "https://zyverse.in/tools" },
  robots: { index: true, follow: true },
};

const TOOLS = [
  {
    emoji: "⏱️",
    title: "Filler Time Calculator",
    description: "See exactly how many hours you'd save by skipping filler in any anime. Enter episode count & filler % to calculate.",
    href: "/tools/filler-time",
    color: "#ff2d78",
    tag: "Popular",
  },
  {
    emoji: "📅",
    title: "Binge Watch Calculator",
    description: "Planning a marathon? Enter how many episodes you want to watch and your pace — we'll tell you when you'll finish.",
    href: "/tools/binge-calculator",
    color: "#8a5cff",
    tag: "New",
  },
  {
    emoji: "📊",
    title: "Anime Watch Time Stats",
    description: "How long would it take to watch every anime ever made? Mind-blowing stats about total watch time across genres.",
    href: "/tools/watch-stats",
    color: "#29f2e0",
    tag: "Infographic",
  },
  {
    emoji: "🔄",
    title: "Watch Order Quick Check",
    description: "Not sure if an anime has a specific watch order? Quick check for 50+ popular franchises.",
    href: "/watch-order",
    color: "#ff9933",
    tag: "Tool",
  },
  {
    emoji: "🎯",
    title: "Filler Skip Guide",
    description: "The complete filler guide for 200+ anime. See exactly which episodes to skip.",
    href: "/filler",
    color: "#ff2d78",
    tag: "Guide",
  },
  {
    emoji: "🇮🇳",
    title: "Indian Dub Finder",
    description: "Find which anime are available in Hindi, Tamil & Telugu. Track upcoming dubs.",
    href: "/dubbed?language=hindi",
    color: "#ff9933",
    tag: "India",
  },
];

const STATS = [
  { label: "Total Anime Episodes", value: "500K+", description: "Across all anime ever made" },
  { label: "Filler Episodes", value: "~120K", description: "That's 24% of all anime" },
  { label: "Hours Saved by Skipping Filler", value: "~87K hrs", description: "If you skipped all filler" },
  { label: "Average Anime Length", value: "24 episodes", description: "About 8 hours of watch time" },
  { label: "Longest Anime", value: "Sazae-san", description: "7,700+ episodes since 1969" },
  { label: "Most Filler", value: "Boruto (80%)", description: "480+ filler episodes out of 600" },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Hero with live demo */}
      <ToolsHero />

      {/* Tools Grid */}
      <section id="tools" className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6 text-center">All Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5 hover:border-[var(--color-cyan)]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{tool.emoji}</span>
                <div className="flex items-center gap-2">
                  {tool.tag === "Popular" && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-black" style={{ backgroundColor: tool.color }}>
                      {tool.tag}
                    </span>
                  )}
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
                  >
                    {tool.tag}
                  </span>
                </div>
              </div>
              <h3 className="font-display text-lg font-bold group-hover:text-[var(--color-cyan)] transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-[var(--color-mute)] mt-1.5 leading-relaxed">
                {tool.description}
              </p>
              <p className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity">
                Open Tool <span>→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6 text-center">Mind-Blowing Anime Stats</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5 text-center">
              <p className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-cyan)]">{stat.value}</p>
              <p className="text-sm font-semibold mt-1">{stat.label}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shareable Infographic */}
      <section className="mb-16">
        <div className="rounded-2xl neon-rgb-border bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold">Share This Infographic</h2>
            <p className="text-sm text-[var(--color-mute)] mt-1">
              Copy the embed code below to share these stats on your site or blog.
            </p>
          </div>
          <div className="mx-auto max-w-2xl rounded-xl neon-rgb-border bg-[var(--color-void)] p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-xl font-bold text-[var(--color-magenta)]">200+</p>
                <p className="text-[10px] text-[var(--color-mute)]">Anime Covered</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-[var(--color-cyan)]">24%</p>
                <p className="text-[10px] text-[var(--color-mute)]">Average Filler</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-[var(--color-amber)]">87K</p>
                <p className="text-[10px] text-[var(--color-mute)]">Hours Saved</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-[var(--color-mute)]">
                Source: <a href="https://zyverse.in/filler" className="text-[var(--color-cyan)] hover:underline">ZyniVerse Anime Filler List</a>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <pre className="text-[10px] text-[var(--color-mute)] bg-[var(--color-panel)] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all neon-rgb-border">
              {`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;padding:24px;border-radius:12px;border:1px solid #1f1d33;background:#0a0a0f;">
  <div><p style="font-size:24px;font-weight:700;color:#ff2d78;margin:0;">200+</p><p style="font-size:10px;color:#888;margin:4px 0 0;">Anime Covered</p></div>
  <div><p style="font-size:24px;font-weight:700;color:#29f2e0;margin:0;">24%</p><p style="font-size:10px;color:#888;margin:4px 0 0;">Average Filler</p></div>
  <div><p style="font-size:24px;font-weight:700;color:#f59e0b;margin:0;">87K</p><p style="font-size:10px;color:#888;margin:4px 0 0;">Hours Saved</p></div>
</div>
<p style="font-size:11px;color:#888;text-align:center;margin-top:8px;">Source: <a href="https://zyverse.in/filler" style="color:#29f2e0;">ZyniVerse Anime Filler List</a></p>`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-8">
          <h2 className="font-display text-2xl font-bold mb-2">Want More Tools?</h2>
          <p className="text-sm text-[var(--color-mute)] mb-6 max-w-lg mx-auto">
            We&apos;re building new anime tools every month. Have an idea? Let us know!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/filler" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
              Filler Guides →
            </Link>
            <Link href="/embed" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">
              Embed Widgets
            </Link>
            <Link href="/link-to-us" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
