import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTournamentRounds } from "@/lib/character-tournaments";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await auth();
  const headers: Record<string, string> = {};

  const anon =
    !session?.user?.id &&
    !req.cookies.has("authjs.session-token") &&
    !req.cookies.has("__Secure-authjs.session-token");
  if (anon) headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=300";

  const view = await getTournamentRounds(id);
  if (!view) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const myVotes: Record<string, "A" | "B"> = {};
  let myPollVote: string | null = null;
  if (session?.user?.id) {
    const [votes, pollVote] = await Promise.all([
      prisma.characterTournamentVote.findMany({
        where: {
          userId: session.user.id,
          match: { tournamentId: id },
        },
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

  return NextResponse.json(
    {
      ...view,
      myVotes,
      myPollVote,
      isCreator: !!session?.user?.id && session.user.id === view.tournament.creatorId,
    },
    { headers }
  );
}
