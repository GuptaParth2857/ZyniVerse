"use client";

interface Match {
  matchId: string;
  seed1: number;
  seed2: number;
  nominee1: { id: string; title: string; image: string | null; votes: number } | null;
  nominee2: { id: string; title: string; image: string | null; votes: number } | null;
  winnerId: string | null;
}

export default function BracketTournament({
  matches,
  round,
}: {
  matches: Match[];
  round: number;
}) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <h3 className="text-sm font-bold text-white/90 mb-3">
        Round {round} — {matches.length} match{matches.length !== 1 ? "es" : ""}
      </h3>
      <div className="space-y-4">
        {matches.map((m) => (
          <div key={m.matchId} className="rounded-lg border border-white/10 overflow-hidden">
            <div className="text-[10px] text-white/30 text-center py-1 bg-white/5">
              Match {m.matchId.split("_m")[1]}
            </div>
            {[
              { seed: m.seed1, nominee: m.nominee1 },
              { seed: m.seed2, nominee: m.nominee2 },
            ].map(({ seed, nominee }) => {
              if (!nominee) return null;
              const isWinner = m.winnerId === nominee.id;
              return (
                <div
                  key={nominee.id}
                  className={`flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0 ${
                    isWinner ? "bg-emerald-500/10" : ""
                  }`}
                >
                  <span className="text-[10px] text-white/30 w-4">#{seed}</span>
                  {nominee.image && (
                    <img src={nominee.image} alt="" className="w-6 h-8 rounded object-cover" />
                  )}
                  <span className={`text-xs flex-1 ${isWinner ? "text-emerald-400 font-semibold" : "text-white/70"}`}>
                    {nominee.title}
                  </span>
                  <span className="text-[10px] text-white/40">{nominee.votes} votes</span>
                  {isWinner && <span className="text-xs">✓</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
