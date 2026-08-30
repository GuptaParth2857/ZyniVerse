import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTournamentRounds } from "@/lib/character-tournaments";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await auth();

  const view = await getTournamentRounds(id);
  if (!view) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  let myVotes: Record<string, "A" | "B"> = {};
  if (session?.user?.id) {
    const votes = await prisma.characterTournamentVote.findMany({
      where: {
        userId: session.user.id,
        match: { tournamentId: id },
      },
      select: { matchId: true, choice: true },
    });
    for (const v of votes) myVotes[v.matchId] = v.choice as "A" | "B";
  }

  return NextResponse.json({
    ...view,
    myVotes,
    isCreator: !!session?.user?.id && session.user.id === view.tournament.creatorId,
  });
}
