import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTournamentRounds } from "@/lib/character-tournaments";
import TournamentDetail, { type TournamentDetail as TournamentDetailData } from "./client";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const getView = cache((id: string) => getTournamentRounds(id));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const view = await getView(id);
  const t = view?.tournament;

  const title = t
    ? `${t.title} — ${t.size}-Player Character Tournament`
    : "Character Tournament — Vote Your Favorite Anime Fan";
  const description = t
    ? `${t.description || `${t.title} — anime characters battle it out.`} Vote your favorite on ZyniVerse by @${t.creator.username}.`
    : "Anime characters fight in community tournaments. Build brackets, vote and crown champions on ZyniVerse.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/character-tournaments/${id}` },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "ZyniVerse",
      url: `${BASE}/character-tournaments/${id}`,
      images: [{ url: `${BASE}/api/og/character-tournament/${id}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}/api/og/character-tournament/${id}`] },
  };
}

export default async function CharacterTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const view = await getView(id);

  const myVotes: Record<string, "A" | "B"> = {};
  let myPollVote: string | null = null;
  if (view && session?.user?.id) {
    const [votes, pollVote] = await Promise.all([
      prisma.characterTournamentVote.findMany({
        where: { userId: session.user.id, match: { tournamentId: id } },
        select: { matchId: true, choice: true },
      }),
      prisma.characterTournamentPollVote.findUnique({
        where: { tournamentId_userId: { tournamentId: id, userId: session.user.id } },
        select: { participantId: true },
      }),
    ]);
    for (const v of votes) myVotes[v.matchId] = v.choice as "A" | "B";
    myPollVote = pollVote?.participantId ?? null;
  }

  if (!view) {
    return <TournamentDetail initial={null} serverResolved />;
  }

  const initial = {
    ...(JSON.parse(JSON.stringify(view)) as typeof view),
    myVotes,
    myPollVote,
    isCreator: !!session?.user?.id && session.user.id === view.tournament.creatorId,
  };

  return <TournamentDetail initial={initial as unknown as TournamentDetailData} serverResolved />;
}