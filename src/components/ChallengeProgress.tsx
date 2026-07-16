"use client";

interface ChallengeProgressProps {
  progress: number;
  goal: number;
  title?: string;
}

export default function ChallengeProgress({ progress, goal, title }: ChallengeProgressProps) {
  const pct = goal > 0 ? Math.min(Math.round((progress / goal) * 100), 100) : 0;
  const isComplete = pct >= 100;

  return (
    <div className="space-y-2">
      {title && (
        <p className="text-[11px] font-medium text-[var(--color-mute)] truncate uppercase tracking-wider">{title}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display text-2xl font-bold ${isComplete ? "text-green-400" : "text-[var(--color-cyan)]"}`}>
            {progress}
          </span>
          <span className="text-sm text-[var(--color-mute)]">/ {goal}</span>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <span className="text-xs">{'\u{1F3C6}'}</span>
          )}
          <span className={`font-mono text-sm font-bold ${isComplete ? "text-green-400" : pct >= 50 ? "text-[var(--color-cyan)]" : "text-[var(--color-magenta)]"}`}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? "bg-gradient-to-r from-green-400 to-emerald-300 shadow-[0_0_16px_rgba(74,222,128,0.4)]" : "bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] shadow-[0_0_16px_rgba(41,242,224,0.3)]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isComplete && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-400">
          <span>{'\u{2705}'}</span> Challenge Complete! Great work!
        </div>
      )}
    </div>
  );
}
