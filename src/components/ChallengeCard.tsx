import Link from "next/link";
import type { Challenge } from "@prisma/client";

interface ChallengeCardProps {
  challenge: Challenge & { _count?: { participants: number; entries: number } };
  joined?: boolean;
  userProgress?: number;
  userGoal?: number;
}

const typeColors: Record<string, string> = {
  watch: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  read: "bg-green-500/20 text-green-300 border-green-500/30",
  mixed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  custom: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const periodLabels: Record<string, string> = {
  yearly: "Yearly",
  seasonal: "Seasonal",
  monthly: "Monthly",
  custom: "Custom",
};

function getStatus(challenge: Challenge): { label: string; dotColor: string } {
  const now = new Date();
  if (now < challenge.startDate) return { label: "Upcoming", dotColor: "bg-yellow-400" };
  if (now > challenge.endDate) return { label: "Ended", dotColor: "bg-gray-400" };
  return { label: "Active", dotColor: "bg-green-400" };
}

export default function ChallengeCard({ challenge, joined, userProgress, userGoal }: ChallengeCardProps) {
  const status = getStatus(challenge);
  const progress = userProgress ?? 0;
  const goal = userGoal ?? challenge.goalCount;
  const pct = goal > 0 ? Math.min(Math.round((progress / goal) * 100), 100) : 0;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="group block rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-cyan)]/40 hover:shadow-lg hover:shadow-[var(--color-cyan)]/5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColors[challenge.type] || typeColors.custom}`}>
            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
          </span>
          <span className="text-xs text-[var(--color-mute)] font-mono">{periodLabels[challenge.period] || challenge.period}</span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-mute)]">
            <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
            {status.label}
          </span>
        </div>
        {challenge.year && (
          <span className="text-xs font-mono text-[var(--color-magenta)] font-semibold">{challenge.year}</span>
        )}
      </div>

      <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--color-cyan)] transition-colors">{challenge.title}</h3>
      {challenge.description && (
        <p className="text-sm text-[var(--color-mute)] line-clamp-2 mb-3">{challenge.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-[var(--color-mute)] mb-3">
        <span>{challenge._count?.participants ?? 0} participants</span>
        <span className="font-mono">{goal} goal</span>
        <span className="font-mono">{new Date(challenge.startDate).toLocaleDateString()} – {new Date(challenge.endDate).toLocaleDateString()}</span>
      </div>

      {joined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-ink)] font-medium">{progress} / {goal}</span>
            <span className="text-[var(--color-mute)]">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
