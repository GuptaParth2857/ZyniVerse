import type { Metadata } from "next";
import Link from "next/link";
import PersonalWatchTime from "@/components/PersonalWatchTime";

export const metadata: Metadata = {
  title: "Anime Watch Time Stats — How Long to Watch All Anime? | ZyniVerse",
  description: "Mind-blowing stats about anime watch time. How long would it take to watch every anime ever made? Total filler, genre breakdowns, and more.",
  openGraph: {
    title: "Anime Watch Time Stats | ZyniVerse",
    description: "Mind-blowing anime stats — total watch time, filler hours, genre breakdowns.",
  },
};

const STATS = [
  { label: "Total Anime Series", value: "22,000+", description: "TV anime series tracked on MyAnimeList", color: "cyan" },
  { label: "Total Episodes", value: "500K+", description: "Across every anime series ever aired", color: "magenta" },
  { label: "Total Watch Time", value: "1.2M+ hrs", description: "If you watched every anime start to finish", color: "amber" },
  { label: "Total Watch Time (days)", value: "50,000+", description: "That's 137 years of non-stop anime", color: "cyan" },
  { label: "Filler Episodes", value: "~120K", description: "24% of all episodes are filler", color: "magenta" },
  { label: "Hours Wasted on Filler", value: "~87K hrs", description: "Time you could get back by skipping filler", color: "amber" },
];

const GENRE_STATS = [
  { genre: "Slice of Life", hours: "45,000+", bar: 85 },
  { genre: "Comedy", hours: "42,000+", bar: 80 },
  { genre: "Action", hours: "38,000+", bar: 72 },
  { genre: "Drama", hours: "35,000+", bar: 67 },
  { genre: "Sci-Fi", hours: "28,000+", bar: 53 },
  { genre: "Romance", hours: "22,000+", bar: 42 },
  { genre: "Horror", hours: "12,000+", bar: 23 },
  { genre: "Sports", hours: "15,000+", bar: 28 },
];

const RECORDS = [
  { record: "Longest Running Anime", title: "Sazae-san", value: "7,700+ eps", since: "1969" },
  { record: "Most Episodes (Action)", title: "One Piece", value: "1,120+ eps", since: "1999" },
  { record: "Most Filler", title: "Boruto", value: "80% filler", since: "2017" },
  { record: "Highest Rated (MAL)", title: "Fullmetal Alchemist: Brotherhood", value: "9.10 score", since: "2009" },
  { record: "Most Watched (MAL)", title: "Attack on Titan", value: "3M+ members", since: "2013" },
  { record: "Fastest to 1000 Eps", title: "Detective Conan", value: "1,150+ eps", since: "1996" },
];

const SPEED_RECORDS = [
  { pace: "Speed Run (12 eps/day)", timeToWatchAll: "~113 years", timeToWatchOne: "~2 days" },
  { pace: "Normal (6 eps/day)", timeToWatchAll: "~227 years", timeToWatchOne: "~4 days" },
  { pace: "Relaxed (3 eps/day)", timeToWatchAll: "~454 years", timeToWatchOne: "~8 days" },
  { pace: "Ultra (20 eps/day)", timeToWatchAll: "~68 years", timeToWatchOne: "~1.2 days" },
];

export default function WatchStatsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Infographic</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-2">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">Anime Watch Time Stats</h1>
        </div>
        <p className="mt-3 text-sm text-[var(--color-mute)] max-w-xl mx-auto">
          Mind-blowing numbers about the entire anime medium. Updated 2026.
        </p>
      </div>

      {/* Main Stats Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5 text-center">
              <p className={`font-display text-2xl sm:text-3xl font-bold ${
                stat.color === "cyan" ? "text-[var(--color-cyan)]" :
                stat.color === "magenta" ? "text-[var(--color-magenta)]" :
                "text-[var(--color-amber)]"
              }`}>{stat.value}</p>
              <p className="text-sm font-semibold mt-1">{stat.label}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genre Breakdown */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6 text-center">Watch Time by Genre</h2>
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
          <div className="space-y-4">
            {GENRE_STATS.map((g) => (
              <div key={g.genre}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">{g.genre}</span>
                  <span className="text-[var(--color-mute)]">{g.hours} hours</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--color-line)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] rounded-full"
                    style={{ width: `${g.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-mute)] mt-4 text-center">
            Estimated total hours based on episode count × avg 24 min/episode across MAL-tagged genres.
          </p>
        </div>
      </section>

      {/* Records */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6 text-center">Anime Records</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {RECORDS.map((r) => (
            <div key={r.record} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
              <p className="text-[10px] text-[var(--color-magenta)] font-mono uppercase tracking-wider">{r.record}</p>
              <p className="font-display text-lg font-bold mt-1">{r.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[var(--color-cyan)] font-semibold">{r.value}</span>
                <span className="text-[10px] text-[var(--color-mute)]">since {r.since}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Watch Time */}
      <PersonalWatchTime />

      {/* How Long to Watch All */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6 text-center">How Long to Watch ALL Anime?</h2>
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
          <p className="text-sm text-[var(--color-mute)] text-center mb-6">
            Based on ~22,000 series and ~500,000 episodes. At ~24 min per episode.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {SPEED_RECORDS.map((s) => (
              <div key={s.pace} className="rounded-xl bg-[var(--color-void)] p-4 text-center">
                <p className="text-xs font-semibold text-[var(--color-mute)]">{s.pace}</p>
                <p className="font-display text-xl font-bold text-[var(--color-cyan)] mt-1">{s.timeToWatchAll}</p>
                <p className="text-[10px] text-[var(--color-mute)]">1 anime: {s.timeToWatchOne}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-8">
          <h2 className="font-display text-xl font-bold mb-2">Track Your Own Stats</h2>
          <p className="text-sm text-[var(--color-mute)] mb-4">
            Create a free account and see your personal anime watch time stats.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
              Create Account →
            </Link>
            <Link href="/tools" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">
              More Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
