"use client";

import { useEffect, useState } from "react";
import AwardVotingCard from "@/components/AwardVotingCard";
import AwardNominationForm from "@/components/AwardNominationForm";

const AWARD_CATEGORIES = [
  { id: "ANIME_OF_YEAR", name: "Anime of the Year", emoji: "🏆" },
  { id: "BEST_ACTION", name: "Best Action", emoji: "⚔️" },
  { id: "BEST_ROMANCE", name: "Best Romance", emoji: "💕" },
  { id: "BEST_COMEDY", name: "Best Comedy", emoji: "😂" },
  { id: "BEST_FANTASY", name: "Best Fantasy", emoji: "🧙" },
  { id: "BEST_DRAMA", name: "Best Drama", emoji: "🎭" },
  { id: "BEST_ANIMATION", name: "Best Animation", emoji: "🎨" },
  { id: "BEST_NEW_SERIES", name: "Best New Series", emoji: "✨" },
  { id: "BEST_SCORE", name: "Best Score", emoji: "🎵" },
  { id: "BEST_VILLAIN", name: "Best Villain", emoji: "😈" },
  { id: "BEST_CHARACTER", name: "Best Character", emoji: "👤" },
  { id: "BEST_OPENING", name: "Best Opening", emoji: "🎶" },
];

interface AwardData {
  id: string;
  year: number;
  category: string;
  categoryName: string;
  emoji: string;
  status: string;
  nominees: { id: string; mediaId: number; title: string; image: string | null; votes: number; advanced: boolean; seed: number | null }[];
}

export default function AwardsYearPage({ params }: { params: Promise<{ year: string }> }) {
  const [year, setYear] = useState(0);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNominate, setShowNominate] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ year: y }) => {
      const yr = Number(y);
      setYear(yr);
      fetch(`/api/zyni-awards/${yr}`)
        .then((r) => r.json())
        .then((d) => { setAwards(d.awards || []); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const handleVote = async (category: string, nomineeId: string) => {
    await fetch(`/api/zyni-awards/${year}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, nomineeId }),
    });
    const res = await fetch(`/api/zyni-awards/${year}`);
    const d = await res.json();
    setAwards(d.awards || []);
  };

  const handleNominate = async (data: { category: string; mediaId: number; title: string; image?: string }) => {
    await fetch(`/api/zyni-awards/${year}/nominate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowNominate(null);
    const res = await fetch(`/api/zyni-awards/${year}`);
    const d = await res.json();
    setAwards(d.awards || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-void)] flex items-center justify-center">
        <div className="animate-pulse text-white/30">Loading awards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
            🏆 ZyniVerse Awards {year}
          </h1>
          <p className="text-sm text-white/40">Vote for the best anime of {year}</p>
        </div>

        {showNominate && (
          <div className="mb-6">
            <AwardNominationForm
              year={year}
              category={showNominate}
              categories={AWARD_CATEGORIES}
              onSubmit={handleNominate}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {awards.map((a) => (
            <div key={a.id}>
              <AwardVotingCard
                category={a.category}
                categoryName={a.categoryName}
                emoji={a.emoji}
                nominees={a.nominees}
                year={year}
                onVote={handleVote}
                status={a.status}
              />
              <button
                onClick={() => setShowNominate(showNominate === a.category ? null : a.category)}
                className="mt-2 w-full py-1.5 text-xs text-white/40 border border-white/10 rounded-lg hover:bg-white/5"
              >
                + Nominate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
