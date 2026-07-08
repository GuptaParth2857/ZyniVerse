import type { AchievementDef } from "@/lib/achievements";

interface Props {
  achievement: AchievementDef & { earned?: boolean; earnedAt?: string | null; progress?: number };
  isEarned?: boolean;
  progress?: number;
}

export default function AchievementBadge({ achievement, isEarned: forceEarned, progress: forceProgress }: Props) {
  const earned = forceEarned ?? achievement.earned ?? false;
  const prog = forceProgress ?? achievement.progress ?? 0;

  return (
    <div
      className={`group relative rounded-xl border p-4 text-center transition-all ${
        earned
          ? "border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5"
          : "border-[var(--color-line)] bg-[var(--color-panel)] opacity-60"
      }`}
    >
      <div className={`text-3xl mb-2 ${!earned ? "grayscale" : ""}`}>
        {achievement.icon}
      </div>
      <div className="text-xs font-semibold truncate">{achievement.name}</div>
      <div className="text-[10px] text-[var(--color-mute)] mt-0.5">
        {earned ? `${achievement.points} pts` : "🔒 Locked"}
      </div>
      {prog > 0 && !earned && (
        <div className="mt-2 h-1 w-full rounded-full bg-[var(--color-line)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-violet)]" style={{ width: `${prog}%` }} />
        </div>
      )}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap max-w-[200px] text-center">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-[10px] opacity-80 mt-0.5">{achievement.description}</p>
          <p className="text-[10px] opacity-60 mt-0.5">{achievement.points} pts</p>
        </div>
      </div>
    </div>
  );
}
