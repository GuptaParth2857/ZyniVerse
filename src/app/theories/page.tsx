import type { Metadata } from "next";
import TheoryLeaderboard from "@/components/TheoryLeaderboard";
import { getTheoryLeaderboard } from "@/lib/theory-leaderboard";
import { PageTransition } from "@/components/PageTransition";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Top Fan Theories by Community Votes | ZyniVerse",
  description:
    "The most-voted anime fan theories on ZyniVerse — powered by our community. See which predictions ranked by AI got the most agree/refute votes this week and all-time.",
  keywords: ["anime fan theories", "theory votes", "ZyniVerse community", "predictions leaderboard"],
  openGraph: {
    title: "Top Fan Theories by Community Votes | ZyniVerse",
    description: "Community-ranked anime fan theories from the Zyni AI Lab — vote on predictions, see the leaderboard.",
  },
};

export default async function TheoriesPage() {
  const initial = await getTheoryLeaderboard("all", 25);

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-cyan)]">Zyni AI Lab · Community</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Top Fan Theories 🏆</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Every anime page in the Zyni AI Lab generates AI fan theories — the community votes 🙏 agree / 🧢 refute. Here are the
            theories ranked by votes. Tap any anime to see its theory cards and add your vote.
          </p>
        </header>

        {/* SEO-friendly server-rendered snapshot */}
        <TheoryLeaderboard initial={initial} initialPeriod="all" />

        <footer className="mt-8 text-center text-xs text-white/40">
          Votes are per-user and one per anime. Data refreshes automatically. ✨ Made in India 🇮🇳
        </footer>
      </main>
    </PageTransition>
  );
}