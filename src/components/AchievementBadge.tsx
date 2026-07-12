import type { AchievementDef } from "@/lib/achievements";

const CATEGORY_COLORS: Record<string, string> = {
  watching: "#ff3366",
  reading: "#00ffff",
  community: "#ffd700",
  social: "#ff69b4",
  milestone: "#8a2be2",
};

interface Props {
  achievement: AchievementDef & { earned?: boolean; earnedAt?: string | null; progress?: number };
  isEarned?: boolean;
  progress?: number;
}

export default function AchievementBadge({ achievement, isEarned: forceEarned, progress: forceProgress }: Props) {
  const earned = forceEarned ?? achievement.earned ?? false;
  const prog = forceProgress ?? achievement.progress ?? 0;
  const color = CATEGORY_COLORS[achievement.category] || "#8a2be2";

  return (
    <div className="group relative">
      <div className={`neon-premium rounded-xl transition-all duration-300 ${earned ? "" : "opacity-50"}`}>
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-4 text-center">
          <div className="relative mb-3">
            <span className={`text-4xl block transition-transform duration-300 group-hover:scale-110 ${earned ? "" : "grayscale"}`}>
              {achievement.icon}
            </span>
            {earned && (
              <div
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: color, color: "#000" }}
              >
                ✓
              </div>
            )}
          </div>
          <p className="text-xs font-bold truncate">{achievement.name}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold" style={{ color }}>
              {achievement.points} pts
            </span>
            {earned ? (
              <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider">Earned</span>
            ) : (
              <span className="text-[8px] text-[var(--color-mute)] uppercase tracking-wider">Locked</span>
            )}
          </div>
          {!earned && prog > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[8px] text-[var(--color-mute)] mb-0.5">
                <span>Progress</span>
                <span>{prog}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${prog}%`, background: color }} />
              </div>
            </div>
          )}
          {earned && achievement.earnedAt && (
            <p className="text-[8px] text-[var(--color-mute)] mt-1.5">
              {new Date(achievement.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          )}
          <p className="mt-1 text-[9px] text-[var(--color-mute)] line-clamp-2">{achievement.description}</p>
        </div>
      </div>
      {earned && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `0 0 30px ${color}22, inset 0 0 30px ${color}08` }}
        />
      )}
    </div>
  );
}
