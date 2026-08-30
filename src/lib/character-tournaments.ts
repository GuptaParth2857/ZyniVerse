import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ── Character Tournament core logic ─────────────────────────────────────
// Single-elimination bracket. Rounds pair winners of consecutive matches.

export const TOURNAMENT_SIZES = [8, 16, 32] as const;
export type TournamentSize = (typeof TOURNAMENT_SIZES)[number];

export function totalRoundsForSize(size: number): number {
  return Math.round(Math.log2(size));
}

function assertSize(size: number): asserts size is TournamentSize {
  if (!TOURNAMENT_SIZES.includes(size as TournamentSize)) {
    throw new Error("Invalid tournament size");
  }
}

export interface ParticipantInput {
  charId: number;
  charName: string;
  charImage?: string | null;
}

export async function createTournament(
  creatorId: string,
  opts: { title: string; description?: string; size: number; randomize?: boolean; participants: ParticipantInput[] }
) {
  assertSize(opts.size);
  if (opts.participants.length !== opts.size) {
    throw new Error(`Tournament of size ${opts.size} needs exactly ${opts.size} characters`);
  }
  // De-dupe by charId
  const seen = new Set<number>();
  const parts: ParticipantInput[] = [];
  for (const p of opts.participants) {
    if (seen.has(p.charId)) continue;
    seen.add(p.charId);
    parts.push(p);
  }
  if (parts.length < 2 || parts.length > opts.size) {
    throw new Error("Duplicate or invalid participants");
  }

  const seed = Math.floor(Math.random() * 1e9);

  const tournament = await prisma.characterTournament.create({
    data: {
      creatorId,
      title: opts.title,
      description: opts.description,
      size: opts.size,
      status: "upcoming",
      currentRound: 1,
      totalRounds: totalRoundsForSize(opts.size),
      seed,
      participants: {
        create: parts.map((p, i) => ({
          charId: p.charId,
          charName: p.charName,
          charImage: p.charImage,
          seed: i + 1,
        })),
      },
    },
    include: { participants: true },
  });

  await generateRoundMatches(tournament.id, 1);
  return tournament;
}

export async function startTournament(tournamentId: string) {
  const t = await prisma.characterTournament.update({
    where: { id: tournamentId },
    data: { status: "active", startedAt: new Date() },
  });
  return t;
}

/** Create the matches for a given round (assumes participants/previous winners exist). */
async function generateRoundMatches(tournamentId: string, round: number) {
  const tournament = await prisma.characterTournament.findUnique({
    where: { id: tournamentId },
    include: { participants: { orderBy: { seed: "asc" } } },
  });
  if (!tournament) throw new Error("Tournament not found");

  const matchesInRound = tournament.size / Math.pow(2, round);

  if (round === 1) {
    const data: Prisma.CharacterTournamentMatchCreateManyInput[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      const a = tournament.participants[i * 2];
      const b = tournament.participants[i * 2 + 1];
      data.push({ tournamentId, round: 1, position: i + 1, charAId: a?.id ?? null, charBId: b?.id ?? null, votesA: 0, votesB: 0, winnerId: null });
    }
    await prisma.characterTournamentMatch.createMany({ data });
    return;
  }

  const prevRound = round - 1;
  const prevMatches = await prisma.characterTournamentMatch.findMany({
    where: { tournamentId, round: prevRound },
    orderBy: { position: "asc" },
  });
  const data: Prisma.CharacterTournamentMatchCreateManyInput[] = [];
  for (let i = 0; i < matchesInRound; i++) {
    const m1 = prevMatches[i * 2];
    const m2 = prevMatches[i * 2 + 1];
    data.push({ tournamentId, round, position: i + 1, charAId: m1?.winnerId ?? null, charBId: m2?.winnerId ?? null, votesA: 0, votesB: 0, winnerId: null });
  }
  await prisma.characterTournamentMatch.createMany({ data });
}

/** Cast a vote on a match (one per user per match). */
export async function castTournamentVote(matchId: string, userId: string, choice: "A" | "B") {
  const match = await prisma.characterTournamentMatch.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Match not found");
  const tournament = await prisma.characterTournament.findUnique({
    where: { id: match.tournamentId },
  });
  if (!tournament || tournament.status !== "active") {
    throw new Error("Tournament is not active");
  }

  const existing = await prisma.characterTournamentVote.findUnique({
    where: { matchId_userId: { matchId, userId } },
  });
  if (existing) throw new Error("Already voted in this match");

  const targetField = choice === "A" ? "charAId" : "charBId";
  if (!match[targetField]) throw new Error("This side has no character");

  await prisma.characterTournamentVote.create({
    data: { matchId, userId, choice },
  });

  const updated = await prisma.characterTournamentMatch.update({
    where: { id: matchId },
    data: choice === "A" ? { votesA: { increment: 1 } } : { votesB: { increment: 1 } },
  });
  return updated;
}

/** Decide every unsolved match of the current round by majority and advance. */
export async function finalizeRound(tournamentId: string) {
  const tournament = await prisma.characterTournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.status !== "active") throw new Error("Tournament is not active");

  const round = tournament.currentRound;
  const matches = await prisma.characterTournamentMatch.findMany({
    where: { tournamentId, round },
    orderBy: { position: "asc" },
  });

  for (const m of matches) {
    const winnerId =
      m.votesA > m.votesB ? m.charAId : m.votesB > m.votesA ? m.charBId : m.winnerId;
    if (winnerId) {
      await prisma.characterTournamentMatch.update({
        where: { id: m.id },
        data: { winnerId },
      });
    } else {
      throw new Error(`Match ${m.position} in round ${round} is tied — add votes or skip`);
    }
  }

  if (round >= tournament.totalRounds) {
    const finalMatch = matches[0];
    const winnerId = finalMatch.winnerId;
    await prisma.characterTournament.update({
      where: { id: tournamentId },
      data: { status: "completed", completedAt: new Date() },
    });
    const winner = winnerId
      ? await prisma.characterTournamentParticipant.findUnique({ where: { id: winnerId } })
      : null;
    return { completed: true, finalWinner: winner };
  }

  await generateRoundMatches(tournamentId, round + 1);
  await prisma.characterTournament.update({
    where: { id: tournamentId },
    data: { currentRound: round + 1 },
  });
  return { completed: false, nextRound: round + 1 };
}

/** Build a flattened bracket map keyed by round for the view. */
export async function getTournamentRounds(tournamentId: string) {
  const matches = await prisma.characterTournamentMatch.findMany({
    where: { tournamentId },
    orderBy: [{ round: "asc" }, { position: "asc" }],
    include: {
      charA: true,
      charB: true,
      winner: true,
      _count: { select: { votes: true } },
    },
  });

  const tourney = await prisma.characterTournament.findUnique({
    where: { id: tournamentId },
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      participants: { orderBy: { seed: "asc" } },
    },
  });
  if (!tourney) return null;

  const totalVotes = matches.reduce((s, m) => s + m.votesA + m.votesB, 0);

  const rounds: {
    label: string;
    matches: (typeof matches)[number][];
  }[] = [];
  for (let r = 1; r <= tourney.totalRounds; r++) {
    rounds.push({ label: roundLabel(r, tourney.totalRounds), matches: matches.filter((m) => m.round === r) });
  }

  return { tournament: tourney, rounds, matches, totalVotes };
}

export function roundLabel(round: number, total: number): string {
  if (round === total) return "Final";
  if (round === total - 1) return "Semi-Finals";
  if (round === total - 2) return "Quarter-Finals";
  return `Round ${round}`;
}
