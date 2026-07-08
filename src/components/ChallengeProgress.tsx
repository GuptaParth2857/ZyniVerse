"use client";

interface ChallengeProgressProps {
  progress: number;
  goal: number;
  title?: string;
}

export default function ChallengeProgress({ progress, goal, title }: ChallengeProgressProps) {
  const pct = goal > 0 ? Math.min(Math.round((progress / goal) * 100), 100) : 0;

  return (
    <div className="space-y-1.5">
      {title && (
        <p className="text-xs font-medium text-[var(--color-mute)] truncate">{title}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--color-cyan)]">{progress}</span>
        <span className="text-[var(--color-mute)]">/ {goal}</span>
        <span className="text-[var(--color-magenta)] font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
