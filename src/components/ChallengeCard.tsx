import Link from "next/link";
import type { Challenge } from "@prisma/client";

interface ChallengeCardProps {
  challenge: Challenge & { _count?: { participants: number; entries: number } };
  joined?: boolean;
  userProgress?: number;
  userGoal?: number;
}

const typeConfig: Record<string, { label: string; gradient: string; ring: string; icon: string }> = {
  watch: { label: "Watch", gradient: "from-blue-500 to-cyan-400", ring: "ring-blue-500/30", icon: "\u{1F3AC}" },
  read: { label: "Read", gradient: "from-green-500 to-emerald-400", ring: "ring-green-500/30", icon: "\u{1F4DA}" },
  mixed: { label: "Mixed", gradient: "from-purple-500 to-violet-400", ring: "ring-purple-500/30", icon: "\u{2728}" },
  custom: { label: "Custom", gradient: "from-amber-500 to-yellow-400", ring: "ring-amber-500/30", icon: "\u{2699}\u{FE0F}" },
};

const periodLabels: Record<string, string> = {
  yearly: "Yearly",
  seasonal: "Seasonal",
  monthly: "Monthly",
  custom: "Custom",
};

function getStatus(challenge: Challenge): { label: string; dotColor: string; glowColor: string } {
  const now = new Date();
  if (now < challenge.startDate) return { label: "Upcoming", dotColor: "bg-yellow-400", glowColor: "shadow-yellow-400/40" };
  if (now > challenge.endDate) return { label: "Ended", dotColor: "bg-gray-400", glowColor: "shadow-gray-400/20" };
  return { label: "Active Now", dotColor: "bg-green-400", glowColor: "shadow-green-400/40" };
}

export default function ChallengeCard({ challenge, joined, userProgress, userGoal }: ChallengeCardProps) {
  const status = getStatus(challenge);
  const type = typeConfig[challenge.type] || typeConfig.custom;
  const progress = userProgress ?? 0;
  const goal = userGoal ?? challenge.goalCount;
  const pct = goal > 0 ? Math.min(Math.round((progress / goal) * 100), 100) : 0;

  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const elapsed = totalDays - daysLeft;
  const timePct = totalDays > 0 ? Math.min(Math.round((elapsed / totalDays) * 100), 100) : 0;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="neon-premium rounded-xl no-underline group block"
    >
      <div className="neon-premium-track rounded-xl" />
      <div className="neon-premium-overlay rounded-[10.5px]" />
      <div className="neon-premium-content">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${type.gradient} px-3 py-1 text-[11px] font-bold text-black shadow-lg`}>
                <span>{type.icon}</span>
                {type.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-medium text-[var(--color-mute)]">
                {periodLabels[challenge.period] || challenge.period}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {challenge.year && (
                <span className="text-[11px] font-mono font-bold text-[var(--color-magenta)]">{challenge.year}</span>
              )}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.label === "Active Now" ? "bg-green-500/15 text-green-300 ring-1 ring-green-500/30" : status.label === "Upcoming" ? "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30" : "bg-white/5 text-gray-400 ring-1 ring-white/10"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor} shadow-lg ${status.glowColor}`} />
                {status.label}
              </span>
            </div>
          </div>

          <h3 className="text-base font-display font-bold mb-1.5 group-hover:text-[var(--color-cyan)] transition-colors leading-tight">
            {challenge.title}
          </h3>
          {challenge.description && (
            <p className="text-xs text-[var(--color-mute)] line-clamp-2 mb-4 leading-relaxed">{challenge.description}</p>
          )}

          <div className="flex items-center gap-3 text-[10px] text-[var(--color-mute)] mb-4">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {challenge._count?.participants ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              {goal} goal
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
            </span>
          </div>

          {joined && (
            <div className="rounded-lg bg-white/5 border border-white/8 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display font-bold text-[var(--color-ink)]">
                  {progress} <span className="text-[var(--color-mute)] font-normal">/ {goal}</span>
                </span>
                <span className={`font-mono text-xs font-bold ${pct >= 100 ? "text-green-400" : pct >= 50 ? "text-[var(--color-cyan)]" : "text-[var(--color-magenta)]"}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${pct >= 100 ? "bg-gradient-to-r from-green-400 to-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.4)]" : "bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] shadow-[0_0_12px_rgba(41,242,224,0.3)]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {pct >= 100 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                  <span>{'\u{1F3C6}'}</span> Challenge Complete!
                </div>
              )}
            </div>
          )}

          {!joined && status.label === "Active Now" && (
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-[var(--color-cyan)]/5 to-[var(--color-magenta)]/5 border border-[var(--color-cyan)]/10 px-3 py-2">
              <span className="text-[11px] font-medium text-[var(--color-cyan)]">Join this challenge</span>
              <svg className="w-4 h-4 text-[var(--color-cyan)] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
