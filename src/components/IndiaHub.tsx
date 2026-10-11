import Link from "next/link";
import { DUBBED_ANIME_STATIC } from "@/lib/data/dubbed-static";
import { INDIAN_DUB_GUIDES } from "@/lib/indian-dub-guides";

// The one thing no competitor tracks: Indian-language anime. This band is
// deliberately placed high on the homepage and leads with the weekly-refreshed
// Hindi dub schedule — the freshest, most link-worthy asset we have.
export default function IndiaHub() {
  const hindiCount = DUBBED_ANIME_STATIC.filter((d) => d.hasHindi).length;
  const tamilCount = DUBBED_ANIME_STATIC.filter((d) => d.hasTamil).length;
  const teluguCount = DUBBED_ANIME_STATIC.filter((d) => d.hasTelugu).length;
  const guideCount = INDIAN_DUB_GUIDES.length;

  const cards = [
    {
      href: "/indian-dubs",
      emoji: "🇮🇳",
      title: "Hindi Dubs",
      desc: `${Math.max(hindiCount, 60)}+ anime tracked`,
      color: "#ff9933",
    },
    {
      href: "/indian-dubs",
      emoji: "🏛️",
      title: "Tamil & Telugu",
      desc: `${tamilCount}+ Tamil · ${teluguCount}+ Telugu`,
      color: "#e84a5f",
    },
    {
      href: `/indian-dubs`,
      emoji: "📚",
      title: "Dub Guides",
      desc: `${guideCount} deep-dive guides`,
      color: "#6c63ff",
    },
    {
      href: "/voice-actors/indian",
      emoji: "🎙️",
      title: "Indian VAs",
      desc: "Meet the voice artists",
      color: "#29f2e0",
    },
    {
      href: "/conventions",
      emoji: "📅",
      title: "Conventions",
      desc: "Anime events in India",
      color: "#8a5cff",
    },
    {
      href: "/filler",
      emoji: "⏭️",
      title: "Filler Guides",
      desc: "200+ anime, episode-by-episode",
      color: "#ff2d78",
    },
    {
      href: "/watch-order",
      emoji: "📺",
      title: "Watch Orders",
      desc: "50 anime, correct sequence",
      color: "#3b82f6",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-xl px-4 py-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            🇮🇳 India&apos;s Anime Hub
          </p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Hindi, Tamil &amp; Telugu — tracked weekly
          </h2>
        </div>
        <Link href="/indian-dubs" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
          View all →
        </Link>
      </div>

      {/* Freshness-first hero: the weekly-updated Hindi dub schedule is the
          asset Google rewards for freshness and nobody else publishes. */}
      <Link
        href="/hindi-dub-schedule"
        className="group mb-4 flex flex-col gap-3 overflow-hidden rounded-2xl border border-[#ff9933]/40 bg-gradient-to-r from-[#ff9933]/10 via-transparent to-[#8a5cff]/10 p-5 transition-colors hover:border-[#ff9933]/70 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#ff9933]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff9933]" />
            Updated every week
          </p>
          <p className="mt-2 font-display text-xl font-bold sm:text-2xl">
            This Week&apos;s Hindi Dub Schedule
          </p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Every Hindi dub airing across Indian TV &amp; streaming — refreshed each week.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#ff9933] px-5 py-2.5 text-sm font-bold text-black transition-transform group-hover:scale-105">
          See this week →
        </span>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title + card.href} href={card.href} className="overflow-hidden rounded-xl neon-feature-card group">
            <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${card.color}, transparent 40%, ${card.color}80, transparent 70%, ${card.color})` }} />
            <div className="neon-glow rounded-xl" style={{ background: card.color }} />
            <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
              <div className="h-[2px] w-full" style={{ background: card.color }} />
              <div className="relative p-5">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}08, transparent 70%)` }} />
                <span className="relative z-10 mb-3 block text-3xl">{card.emoji}</span>
                <p className="relative z-10 font-display text-lg font-bold">{card.title}</p>
                <p className="relative z-10 mt-1 text-xs text-[var(--color-mute)]">{card.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
