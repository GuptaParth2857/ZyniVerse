import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Quiz — Test Your Knowledge | ZyniVerse",
  description: "Challenge yourself with anime trivia quizzes. Daily quizzes, category challenges, and leaderboards for anime fans.",
};

const CATEGORIES = [
  { name: "General", desc: "Anime knowledge from classics to modern hits", color: "var(--color-cyan)" },
  { name: "Characters", desc: "Identify your favorite characters", color: "var(--color-magenta)" },
  { name: "Plot", desc: "Storylines and arcs", color: "var(--color-violet)" },
  { name: "Studio", desc: "Which studio made what", color: "var(--color-amber)" },
  { name: "Music", desc: "Openings, endings, and OST trivia", color: "var(--color-glass-purple)" },
  { name: "Voice Actors", desc: "Seiyuu and their roles", color: "var(--color-cyan)" },
];

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">// Quiz</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Anime Trivia</h1>
      <p className="mt-2 text-sm text-[var(--color-mute)] max-w-xl">Challenge yourself with anime trivia quizzes across categories and difficulties.</p>

      {/* Daily Quiz CTA */}
      <div className="mt-8 rounded-2xl border border-[var(--color-violet)]/30 bg-gradient-to-r from-[var(--color-violet)]/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="text-3xl">🎯</div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">Daily Quiz</h2>
            <p className="text-sm text-[var(--color-mute)] mt-1">5 questions — everyone gets the same quiz today. Compete for the best score!</p>
          </div>
          <Link href="/quiz/daily"
            className="rounded-xl bg-[var(--color-violet)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity shrink-0"
          >Play Daily</Link>
        </div>
      </div>

      {/* Quick Play */}
      <div className="mt-6">
        <Link href="/quiz/play"
          className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 hover:border-[var(--color-violet)]/30 transition-colors"
        >
          <div>
            <h3 className="font-display text-lg font-bold">Quick Play</h3>
            <p className="text-sm text-[var(--color-mute)] mt-0.5">Choose your categories and difficulty</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Categories */}
      <h2 className="font-display text-xl font-bold mt-10 mb-4">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} href={`/quiz/play?category=${cat.name}`}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-violet)]/30 transition-colors"
          >
            <div className="h-1.5 w-12 rounded-full mb-3" style={{ backgroundColor: cat.color }} />
            <h3 className="font-display font-bold text-sm">{cat.name}</h3>
            <p className="text-xs text-[var(--color-mute)] mt-1">{cat.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
