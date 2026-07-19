"use client";

import { useEffect, useState } from "react";
import BracketTournament from "@/components/BracketTournament";

interface Match {
  matchId: string;
  seed1: number;
  seed2: number;
  nominee1: { id: string; title: string; image: string | null; votes: number } | null;
  nominee2: { id: string; title: string; image: string | null; votes: number } | null;
  winnerId: string | null;
}

export default function BracketPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const [year, setYear] = useState(0);
  const [category, setCategory] = useState("ANIME_OF_YEAR");
  const [round, setRound] = useState(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "ANIME_OF_YEAR", name: "Anime of the Year" },
    { id: "BEST_ACTION", name: "Best Action" },
    { id: "BEST_ROMANCE", name: "Best Romance" },
    { id: "BEST_COMEDY", name: "Best Comedy" },
    { id: "BEST_FANTASY", name: "Best Fantasy" },
    { id: "BEST_DRAMA", name: "Best Drama" },
    { id: "BEST_ANIMATION", name: "Best Animation" },
    { id: "BEST_NEW_SERIES", name: "Best New Series" },
    { id: "BEST_SCORE", name: "Best Score" },
    { id: "BEST_VILLAIN", name: "Best Villain" },
    { id: "BEST_CHARACTER", name: "Best Character" },
    { id: "BEST_OPENING", name: "Best Opening" },
  ];

  useEffect(() => {
    params.then(({ year: y }) => setYear(Number(y)));
  }, [params]);

  useEffect(() => {
    if (!year) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/zyni-awards/${year}/bracket?category=${category}&round=${round}`)
      .then((r) => r.json())
      .then((d) => { setMatches(d.bracket || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, category, round]);

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
          ⚔️ Bracket Tournament
        </h1>
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {[1, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                  round === r
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : "border-white/10 text-white/50 hover:border-white/30"
                }`}
              >
                Round {r}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="animate-pulse h-64 bg-white/5 rounded-xl" />
        ) : matches.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            No bracket data available yet. Voting is still in progress.
          </div>
        ) : (
          <BracketTournament matches={matches} round={round} />
        )}
      </div>
    </div>
  );
}
