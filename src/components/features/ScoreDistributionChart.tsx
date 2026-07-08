"use client";

interface Props {
  scoreDistribution: { score: number; amount: number }[];
  className?: string;
}

export default function ScoreDistributionChart({ scoreDistribution, className = "" }: Props) {
  if (!scoreDistribution || scoreDistribution.length === 0) return null;

  const maxAmount = Math.max(...scoreDistribution.map((s) => s.amount), 1);
  const total = scoreDistribution.reduce((s, d) => s + d.amount, 0);
  const avgScore = total > 0
    ? (scoreDistribution.reduce((s, d) => s + (d.score >= 10 ? d.score : d.score * 10) * d.amount, 0) / total)
    : 0;

  const getBarColor = (score: number) => {
    const pct = score >= 10 ? score : score * 10;
    if (pct >= 80) return "from-emerald-500 to-emerald-400";
    if (pct >= 60) return "from-[var(--color-cyan)] to-cyan-400";
    if (pct >= 40) return "from-amber-500 to-amber-400";
    return "from-[var(--color-magenta)] to-rose-400";
  };

  return (
    <div className={`rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 ${className}`}>
      <div className="flex items-end justify-between mb-3">
        <h3 className="font-display text-sm font-bold">Score Distribution</h3>
        <span className="font-mono text-xs text-[var(--color-mute)]">
          Avg: <span className="text-[var(--color-cyan)] font-bold">{(avgScore / 10).toFixed(1)}</span> / 10
        </span>
      </div>
      <div className="space-y-1">
        {scoreDistribution.filter((s) => s.amount > 0).map((s) => {
          const pct = (s.amount / maxAmount) * 100;
          const label = s.score >= 10 ? s.score : s.score * 10;
          return (
            <div key={s.score} className="flex items-center gap-2 text-[11px]">
              <span className="w-6 text-right font-mono text-[var(--color-mute)]">{label}%</span>
              <div className="flex-1 h-3 rounded-full bg-[var(--color-line)] overflow-hidden relative group">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(s.score)} transition-all duration-500`}
                  style={{ width: `${Math.max(3, pct)}%` }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] font-bold bg-black/60 px-1.5 rounded">{s.amount} votes</span>
                </div>
              </div>
              <span className="w-6 text-right font-mono text-[var(--color-mute)]">{s.amount}</span>
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <p className="mt-2 text-[10px] text-[var(--color-mute)] text-center">
          Based on {total.toLocaleString()} user ratings
        </p>
      )}
    </div>
  );
}
