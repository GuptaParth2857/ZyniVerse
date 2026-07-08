import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLeaderboard } from "@/lib/challenges";
import ChallengeDetail from "@/components/ChallengeDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return { title: "Challenge Not Found" };

  return {
    title: `${challenge.title} — Anime Challenges | ZyniVerse`,
    description: challenge.description || `Join the ${challenge.title} challenge on ZyniVerse.`,
  };
}

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      _count: { select: { participants: true, entries: true } },
    },
  });

  if (!challenge) notFound();

  const [leaderboard, userParticipation] = await Promise.all([
    getLeaderboard(id, 10),
    session?.user?.id
      ? prisma.challengeParticipant.findUnique({
          where: { challengeId_userId: { challengeId: id, userId: session.user.id } },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ChallengeDetail
        challenge={challenge}
        initialLeaderboard={leaderboard}
        initialParticipation={userParticipation}
      />
    </div>
  );
}
