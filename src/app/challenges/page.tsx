import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getActiveChallenges, getPastChallenges } from "@/lib/challenges";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Anime Challenges</h1>
        <p className="text-[var(--color-mute)] max-w-xl mx-auto">
          Join community challenges, set yearly anime watching goals, track your progress, and compete with friends.
        </p>
      </div>

      {yearlyChallenge && (
        <div className="rounded-xl border border-[var(--color-cyan)]/20 bg-gradient-to-r from-[var(--color-cyan)]/5 to-[var(--color-magenta)]/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{yearlyChallenge.title}</h2>
              <p className="text-sm text-[var(--color-mute)] mt-1">{yearlyChallenge.description}</p>
            </div>
            <a
              href={`/challenges/${yearlyChallenge.id}`}
              className="shrink-0 rounded-lg bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
            >View Challenge</a>
          </div>
        </div>
      )}

      {session?.user?.id && userChallenges.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Your Challenges</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <h2 className="text-xl font-bold mb-4">Active Challenges</h2>
        {activeWithCounts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeWithCounts.map((c) => (
              <ChallengeCard key={c.id} challenge={c as any} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-mute)]">No active challenges right now.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Past Challenges</h2>
        {pastWithCounts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastWithCounts.map((c) => (
              <ChallengeCard key={c.id} challenge={c as any} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-mute)]">No past challenges.</p>
        )}
      </section>
    </div>
  );
}
