import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateYearlyChallenge, getLeaderboard } from "@/lib/challenges";
import ChallengeDetail from "@/components/ChallengeDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { year } = await params;
  return {
    title: `Watch Anime in ${year} — Yearly Challenge | ZyniVerse`,
    description: `Join the yearly anime watching challenge for ${year}. Set goals, track progress, and compete with the community.`,
  };
}

export default async function YearlyChallengePage({ params }: PageProps) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 2000 || year > 2100) notFound();

  const session = await auth();
  const challenge = await getOrCreateYearlyChallenge(year);

  const fullChallenge = await prisma.challenge.findUnique({
    where: { id: challenge.id },
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      _count: { select: { participants: true, entries: true } },
    },
  });

  if (!fullChallenge) notFound();

  const [leaderboard, userParticipation] = await Promise.all([
    getLeaderboard(challenge.id, 10),
    session?.user?.id
      ? prisma.challengeParticipant.findUnique({
          where: { challengeId_userId: { challengeId: challenge.id, userId: session.user.id } },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ChallengeDetail
        challenge={fullChallenge}
        initialLeaderboard={leaderboard}
        initialParticipation={userParticipation}
      />
    </div>
  );
}
