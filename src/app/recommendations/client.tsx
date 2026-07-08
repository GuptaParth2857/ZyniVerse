"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Recommendations from "@/components/Recommendations";
import { PageTransition } from "@/components/PageTransition";

const ALL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Thriller",
];

export default function RecommendationsPageClient() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { data: session } = useSession();

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e]/60 via-[#2d1b4e]/30 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--color-magenta)]/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            AI-Powered Recommendations
          </p>
          <h1 className="font-display text-4xl font-black sm:text-5xl md:text-6xl tracking-tight mt-2">
            Discover Your Next
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)]">
              Favorite Anime
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--color-mute)] leading-relaxed">
            Our recommendation engine analyzes trends, genres, and community preferences
            to suggest anime tailored just for you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors"
            >
              Browse All Anime
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <Recommendations type="trending" title="Trending Now" />

      {/* Genre selector */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Pick a Genre</h2>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Select a genre to get top recommendations
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selectedGenre === genre
                  ? "bg-[var(--color-magenta)] text-black shadow-[0_0_20px_-5px_var(--color-magenta)]"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/50"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Genre-based recs */}
      {selectedGenre && (
        <Recommendations
          key={selectedGenre}
          type="genre"
          genres={[selectedGenre]}
          title={`${selectedGenre} Picks`}
        />
      )}

      {/* Similar to your favorites (logged in users) */}
      {session?.user && (
        <Recommendations type="personalized" title="Similar to Your Favorites" />
      )}
    </PageTransition>
  );
}
