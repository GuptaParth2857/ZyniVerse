import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getActiveChallenges, getPastChallenges } from "@/lib/challenges";
import Link from "next/link";
import ChallengeCard from "@/components/ChallengeCard";

export const metadata = {
  title: "Anime Challenges — Watch & Reading Goals | ZyniVerse",
  description: "Join community challenges, set yearly anime watching goals, track your progress, and compete with friends.",
};

export default async function ChallengesPage() {
  const session = await auth();
  const [active, past] = await Promise.all([getActiveChallenges(), getPastChallenges()]);

  const activeWithCounts = await Promise.all(
    active.map(async (c) => {
      const [count] = await Promise.all([
        prisma.challenge.findUnique({
          where: { id: c.id },
          include: { _count: { select: { participants: true, entries: true } } },
        }),
      ]);
      return count!;
    })
  );

  const pastWithCounts = await Promise.all(
    past.map(async (c) => {
      const [count] = await Promise.all([
        prisma.challenge.findUnique({
          where: { id: c.id },
          include: { _count: { select: { participants: true, entries: true } } },
        }),
      ]);
      return count!;
    })
  );

  let userChallenges: any[] = [];
  if (session?.user?.id) {
    const participations = await prisma.challengeParticipant.findMany({
      where: { userId: session.user.id },
      include: {
        challenge: {
          include: { _count: { select: { participants: true, entries: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    userChallenges = participations;
  }

  const yearlyChallenge = await prisma.challenge.findFirst({
    where: { type: "watch", period: "yearly", year: new Date().getFullYear() },
  });

  const totalActive = activeWithCounts.length;
  const totalParticipants = activeWithCounts.reduce((sum, c) => sum + (c._count?.participants ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      <div className="relative text-center space-y-4 py-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cyan)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[11px] font-medium text-[var(--color-mute)] mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          {totalActive} active challenge{totalActive !== 1 ? "s" : ""} &middot; {totalParticipants} participants
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight">
          <span className="gradient-text">Anime Challenges</span>
        </h1>
        <p className="text-sm text-[var(--color-mute)] max-w-lg mx-auto leading-relaxed">
          Set goals, track your watchlist, and compete with the community. Join challenges to earn achievements and climb the leaderboard.
        </p>
        <Link
          href="/challenges/create"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-cyan)]/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Challenge
        </Link>
      </div>

      {yearlyChallenge && (
        <div className="neon-premium rounded-xl">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content">
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-magenta)] flex items-center justify-center text-3xl shadow-lg shadow-[var(--color-cyan)]/20">
                {'\u{1F3C6}'}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">Featured</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--color-magenta)]" />
                  <span className="text-[10px] font-mono text-[var(--color-magenta)]">{new Date().getFullYear()}</span>
                </div>
                <h2 className="text-lg font-display font-bold">{yearlyChallenge.title}</h2>
                <p className="text-xs text-[var(--color-mute)] mt-0.5">{yearlyChallenge.description}</p>
              </div>
              <a
                href={`/challenges/${yearlyChallenge.id}`}
                className="shrink-0 rounded-lg bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-cyan)]/20 transition-all"
              >
                View Challenge
              </a>
            </div>
          </div>
        </div>
      )}

      {session?.user?.id && userChallenges.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-magenta)]" />
            <h2 className="text-xl font-display font-bold">Your Challenges</h2>
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
              {userChallenges.length}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {userChallenges.map((p) => (
              <ChallengeCard
                key={p.challenge.id}
                challenge={p.challenge as any}
                joined
                userProgress={p.progress}
                userGoal={p.goalCount}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-green-400 to-emerald-500" />
          <h2 className="text-xl font-display font-bold">Active Challenges</h2>
          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-2 py-0.5 text-[10px] font-bold text-green-400">
            {totalActive}
          </span>
        </div>
        {activeWithCounts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeWithCounts.map((c) => (
              <ChallengeCard key={c.id} challenge={c as any} />
            ))}
          </div>
        ) : (
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content">
              <div className="p-10 text-center">
                <div className="text-3xl mb-3">{'\u{1F3AE}'}</div>
                <p className="text-sm text-[var(--color-mute)]">No active challenges right now. Check back soon!</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-gray-400 to-gray-600" />
          <h2 className="text-xl font-display font-bold text-[var(--color-mute)]">Past Challenges</h2>
          {pastWithCounts.length > 0 && (
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
              {pastWithCounts.length}
            </span>
          )}
        </div>
        {pastWithCounts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pastWithCounts.map((c) => (
              <ChallengeCard key={c.id} challenge={c as any} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-mute)]">No past challenges yet.</p>
        )}
      </section>
    </div>
  );
}
