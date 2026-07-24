import Link from "next/link";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Top Anime 2026 — Best Anime of All Time, Ranked by Rating & Popularity",
  description:
    "Discover the top-rated anime of all time and the best anime of 2026. Ranked by score, popularity & favorites. Naruto, Attack on Titan, Fullmetal Alchemist, Jujutsu Kaisen & more.",
  keywords: [
    "top anime", "best anime 2026", "best anime of all time", "top rated anime",
    "anime ranking", "highest rated anime", "most popular anime",
    "top 10 anime", "best anime series", "anime recommendations",
    "anime rankings 2026", "best action anime", "best romance anime",
  ],
  openGraph: {
    title: "Top Anime 2026 — Best Anime of All Time, Ranked",
    description: "Discover the top-rated anime of all time and the best anime of 2026. Ranked by score & popularity.",
    url: `${BASE_URL}/top-anime`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Anime 2026 — Best Anime Ranked",
    description: "Top-rated anime ranked by score, popularity & favorites.",
  },
  alternates: { canonical: `${BASE_URL}/top-anime` },
  robots: { index: true, follow: true },
};

export const revalidate = 86400;

const categories = [
  { emoji: "⚔️", title: "Best Action Anime", desc: "High-octane battles, incredible fights & adrenaline-pumping action.", link: "/search?genre=Action&sort=SCORE_DESC" },
  { emoji: "💕", title: "Best Romance Anime", desc: "Heartwarming love stories & emotional relationships.", link: "/search?genre=Romance&sort=SCORE_DESC" },
  { emoji: "😂", title: "Best Comedy Anime", desc: "Hilarious anime that'll make you laugh out loud.", link: "/search?genre=Comedy&sort=SCORE_DESC" },
  { emoji: "🧠", title: "Best Psychological Anime", desc: "Mind-bending thrillers & thought-provoking stories.", link: "/search?genre=Psychological&sort=SCORE_DESC" },
  { emoji: "🗡️", title: "Best Isekai Anime", desc: "Transported to another world — the best isekai adventures.", link: "/search?genre=Isekai&sort=SCORE_DESC" },
  { emoji: "🏆", title: "Best Shonen Anime", desc: "Epic adventures for young protagonists — the classics & new hits.", link: "/search?genre=Action&sort=POPULARITY_DESC" },
];

export default function TopAnimePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Top Anime</span>
      </nav>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Curated Rankings</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
          Top Anime of 2026
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-mute)] leading-relaxed">
          Discover the best anime of all time and the top-rated shows of 2026. Our rankings are updated daily based on scores, popularity, and community favorites from millions of anime fans worldwide.
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Quick Links</p>
            <h2 className="font-display text-xl font-bold">Browse by Genre</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.title} href={cat.link}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 hover:border-[var(--color-magenta)]/40 transition-all group"
            >
              <span className="text-2xl block mb-2">{cat.emoji}</span>
              <h3 className="font-display text-sm font-bold group-hover:text-[var(--color-magenta)] transition-colors">{cat.title}</h3>
              <p className="mt-1 text-xs text-[var(--color-mute)] leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold">Start Tracking Your Anime</h2>
        <p className="mt-3 text-sm text-[var(--color-mute)] max-w-xl">
          ZyniVerse lets you build your personal anime watchlist, track your progress, get AI-powered recommendations, and join India&apos;s largest anime community — all for free.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/search?sort=TRENDING_DESC" className="rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
            Browse All Anime →
          </Link>
          <Link href="/recommendations" className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">
            Get Recommendations
          </Link>
          <Link href="/filler" className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">
            Filler Guides
          </Link>
        </div>
      </section>
    </div>
  );
}
