import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ScoreRow {
  user: { id: string; username: string; avatar: string | null };
  bestScore: number;
  bestXp: number;
  category: string;
  difficulty: string;
  date: string;
}

async function getScores(timeFilter: string): Promise<ScoreRow[]> {
  const session = await auth();
  const userId = session?.user?.id;

  const now = new Date();
  let createdAt: Record<string, Date> | undefined;
  if (timeFilter === "week") {
    createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeFilter === "today") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    createdAt = { gte: startOfDay };
  }

  const scores = await prisma.quizScore.findMany({
    where: createdAt ? { createdAt } : undefined,
    orderBy: [{ score: "desc" }, { xpEarned: "desc" }],
    take: 300,
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  const grouped = new Map<string, { user: { id: string; username: string; avatar: string | null }; bestScore: number; bestXp: number; category: string; difficulty: string; date: Date }>();

  for (const s of scores) {
    const existing = grouped.get(s.userId);
    if (!existing || s.score > existing.bestScore || (s.score === existing.bestScore && s.xpEarned > existing.bestXp)) {
      grouped.set(s.userId, {
        user: s.user,
        bestScore: s.score,
        bestXp: s.xpEarned,
        category: s.category,
        difficulty: s.difficulty,
        date: s.createdAt,
      });
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.bestScore - a.bestScore || b.bestXp - a.bestXp)
    .slice(0, 50)
    .map((r) => ({ ...r, date: r.date.toISOString() }));
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "#00ffff",
    medium: "#ffd700",
    hard: "#ff00ff",
  };
  const c = colors[difficulty] || "#888";
  return (
    <span
      className="rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase"
      style={{ color: c, borderColor: `${c}33` }}
    >
      {difficulty}
    </span>
  );
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const timeFilter = tab === "week" ? "week" : tab === "today" ? "today" : "all";
  const scores = await getScores(timeFilter);
  const session = await auth();
  const currentUserId = session?.user?.id;

  const tabs = [
    { key: "all", label: "All Time" },
    { key: "week", label: "This Week" },
    { key: "today", label: "Today" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold mb-1">
            <span className="text-[#8a2be2]">Quiz</span> Leaderboard
          </h1>
          <p className="text-sm text-gray-500">Top anime quiz players</p>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/quiz/leaderboard${t.key === "all" ? "" : `?tab=${t.key}`}`}
              className="rounded-lg border px-4 py-2 text-xs font-bold transition-all"
              style={{
                borderColor: timeFilter === t.key ? "#8a2be2" : "rgba(255,255,255,0.1)",
                background: timeFilter === t.key ? "rgba(138,43,226,0.15)" : "transparent",
                color: timeFilter === t.key ? "#8a2be2" : "#666",
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {scores.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] p-12 text-center">
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-sm text-gray-500">No scores yet. Be the first to play!</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] overflow-hidden">
            <div className="grid grid-cols-[48px_1fr_80px_100px_90px_90px] gap-2 px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 border-b border-white/5">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Score</span>
              <span className="text-right">XP</span>
              <span className="text-center">Category</span>
              <span className="text-center">Date</span>
            </div>
            {scores.map((s, i) => {
              const isMe = s.user.id === currentUserId;
              return (
                <div
                  key={s.user.id}
                  className="grid grid-cols-[48px_1fr_80px_100px_90px_90px] gap-2 px-4 py-3 items-center border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02]"
                  style={isMe ? { background: "rgba(138,43,226,0.08)" } : undefined}
                >
                  <span className={`font-mono text-sm font-bold ${i === 0 ? "text-[#ffd700]" : i === 1 ? "text-gray-300" : i === 2 ? "text-[#cd7f32]" : "text-gray-600"}`}>
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    {s.user.avatar ? (
                      <img src={s.user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#8a2be2]/20 flex items-center justify-center text-[10px] font-bold text-[#8a2be2]">
                        {s.user.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="truncate text-sm font-medium" style={isMe ? { color: "#8a2be2" } : undefined}>
                      {s.user.username}
                      {isMe && <span className="ml-1 text-[10px] text-[#8a2be2]">(You)</span>}
                    </span>
                  </div>
                  <span className="text-right font-mono text-sm font-bold text-[#00ffff]">{s.bestScore}</span>
                  <span className="text-right font-mono text-xs text-[#ffd700]">{s.bestXp} XP</span>
                  <div className="flex justify-center">
                    <DifficultyBadge difficulty={s.difficulty} />
                  </div>
                  <span className="text-center text-[10px] text-gray-600">
                    {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
