import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ── Character Tournament core logic ─────────────────────────────────────
// Single-elimination bracket. Rounds pair winners of consecutive matches.
//
// Two modes:
//  - "qualifying": a popularity poll among a large candidate pool. Every
//    user casts one favorite vote. When the qualifying window closes, the
//    top `bracketSize` characters form a single-elim bracket.
//  - "bracket": classic single-elimination (existing behavior).

export const TOURNAMENT_SIZES = [8, 16, 32] as const;
export type TournamentSize = (typeof TOURNAMENT_SIZES)[number];

export const QUALIFYING_DAYS = 7;
export const ROUND_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function totalRoundsForSize(size: number): number {
  return Math.round(Math.log2(size));
}

function assertSize(size: number): asserts size is TournamentSize {
  if (!TOURNAMENT_SIZES.includes(size as TournamentSize)) {
    throw new Error("Invalid bracket size");
  }
}

export interface ParticipantInput {
  charId: number;
  charName: string;
  charImage?: string | null;
  franchiseCover?: string | null;
}

export interface CreateTournamentOpts {
  title: string;
  description?: string;
  posterUrl?: string;
  size: number;
  randomize?: boolean;
  participants: ParticipantInput[];
  mode?: "qualifying" | "bracket";
  bracketSize?: number;
}

export async function createTournament(creatorId: string, opts: CreateTournamentOpts) {
  const mode = opts.mode ?? "bracket";
  const bracketSize = mode === "qualifying" ? opts.bracketSize ?? 16 : opts.size;

  if (mode === "qualifying") {
    if (opts.size < bracketSize) throw new Error("Qualifying pool must be larger than the bracket size");
    if (opts.size < TOURNAMENT_SIZES[0]) throw new Error("Qualifying pool is too small");
  } else {
    assertSize(opts.size);
  }
  assertSize(bracketSize);

  if (opts.participants.length !== opts.size) {
    throw new Error(`Tournament of size ${opts.size} needs exactly ${opts.size} characters`);
  }

  const seen = new Set<number>();
  const parts: ParticipantInput[] = [];
  for (const p of opts.participants) {
    if (seen.has(p.charId)) continue;
    seen.add(p.charId);
    parts.push(p);
  }
  if (parts.length !== opts.size) {
    throw new Error("Duplicate characters are not allowed");
  }

  const seed = Math.floor(Math.random() * 1e9);
  const now = new Date();

  const tournament = await prisma.characterTournament.create({
    data: {
      creatorId,
      title: opts.title,
      description: opts.description,
      posterUrl: opts.posterUrl,
      size: opts.size,
      bracketSize,
      mode,
      status: mode === "qualifying" ? "qualifying" : "upcoming",
      currentRound: 1,
      totalRounds: totalRoundsForSize(bracketSize),
      seed,
      ...(mode === "qualifying"
        ? { qualifyingStartedAt: now, qualifyingEndsAt: new Date(now.getTime() + QUALIFYING_DAYS * DAY_MS) }
        : {}),
      participants: {
        create: parts.map((p, i) => ({
          charId: p.charId,
          charName: p.charName,
          charImage: p.charImage,
          franchiseCover: p.franchiseCover,
          seed: i + 1,
        })),
      },
    },
    include: { participants: true },
  });

  if (mode !== "qualifying") {
    await generateRoundMatches(tournament.id, 1);
  }
  return tournament;
}

export async function startTournament(tournamentId: string) {
  const t = await prisma.characterTournament.update({
    where: { id: tournamentId },
    data: { status: "active", startedAt: new Date(), roundEndsAt: new Date(Date.now() + ROUND_DAYS * DAY_MS) },
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

  const bracketSize = tournament.bracketSize ?? tournament.size;
  const matchesInRound = bracketSize / Math.pow(2, round);

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
  if (!tournament || tournament.status !== "active" || tournament.mode !== "bracket") {
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

/** Cast one favorite vote during the qualifying poll (one per user per tournament). */
export type PollVoteActor = { userId?: string | null; deviceId?: string | null };

/**
 * Cast a qualifying poll vote. A voter is identified either by their user
 * account (userId) or an anonymous device id (deviceId). One vote per
 * identity per tournament. A device guest vote is merged into the account
 * when the same device votes again while logged in (no double counting).
 */
export async function castPollVote(tournamentId: string, actor: PollVoteActor, participantId: string) {
  const userId = actor?.userId || null;
  const rawDeviceId = actor?.deviceId || null;
  if (!userId && !rawDeviceId) throw new Error("Vote requires a device");

  const tournament = await prisma.characterTournament.findUnique({ where: { id: tournamentId } });
  if (!tournament || tournament.status !== "qualifying" || tournament.mode !== "qualifying") {
    throw new Error("Qualifying is not open");
  }

  const participant = await prisma.characterTournamentParticipant.findFirst({
    where: { id: participantId, tournamentId },
  });
  if (!participant) throw new Error("Character not found in this tournament");

  return prisma.$transaction(async (tx) => {
    if (userId) {
      const userVote = await tx.characterTournamentPollVote.findUnique({
        where: { tournamentId_userId: { tournamentId, userId } },
      });
      if (userVote) throw new Error("You already voted in this qualifier");

      if (rawDeviceId) {
        const guestVote = await tx.characterTournamentPollVote.findFirst({
          where: { tournamentId, deviceId: rawDeviceId, userId: null },
        });
        if (guestVote) {
          if (guestVote.participantId !== participantId) {
            throw new Error("You already voted in this qualifier");
          }
          await tx.characterTournamentPollVote.update({
            where: { id: guestVote.id },
            data: { userId, deviceId: null },
          });
          return participant;
        }
      }

      try {
        await tx.characterTournamentPollVote.create({
          data: { tournamentId, participantId, userId },
        });
      } catch (e) {
        if ((e as { code?: string })?.code === "P2002") throw new Error("You already voted in this qualifier");
        throw e;
      }
    } else {
      if (!rawDeviceId) throw new Error("Vote requires a device");
      const guestVote = await tx.characterTournamentPollVote.findFirst({
        where: { tournamentId, deviceId: rawDeviceId },
      });
      if (guestVote) throw new Error("You already voted in this qualifier");
      try {
        await tx.characterTournamentPollVote.create({
          data: { tournamentId, participantId, deviceId: rawDeviceId },
        });
      } catch (e) {
        if ((e as { code?: string })?.code === "P2002") throw new Error("You already voted in this qualifier");
        throw e;
      }
    }

    const updated = await tx.characterTournamentParticipant.update({
      where: { id: participantId },
      data: { pollVotes: { increment: 1 } },
    });
    return updated;
  });
}

/** Return the participant the identity already voted for in a qualifying poll, if any. */
export async function getPollVoteState(
  tournamentId: string,
  actor: PollVoteActor
): Promise<string | null> {
  const userId = actor?.userId || null;
  const deviceId = actor?.deviceId || null;
  if (userId) {
    const v = await prisma.characterTournamentPollVote.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
      select: { participantId: true },
    });
    return v?.participantId ?? null;
  }
  if (deviceId) {
    const v = await prisma.characterTournamentPollVote.findFirst({
      where: { tournamentId, deviceId },
      select: { participantId: true },
    });
    return v?.participantId ?? null;
  }
  return null;
}

/** Close the qualifying poll and build the final bracket from the top vote-getters. */
export async function finalizeQualifying(tournamentId: string) {
  const tournament = await prisma.characterTournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.mode !== "qualifying") throw new Error("Tournament is not in qualifying mode");

  const bracketSize = tournament.bracketSize ?? 16;

  const participants = await prisma.characterTournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: [{ pollVotes: "desc" }, { createdAt: "asc" }],
  });
  if (participants.length < bracketSize) {
    throw new Error(`Need at least ${bracketSize} candidates to form a bracket`);
  }

  const qualifiers = participants.slice(0, bracketSize);
  const qualifierIds = qualifiers.map((p) => p.id);
  const excluded = participants.filter((p) => !qualifierIds.includes(p.id)).map((p) => p.id);

  const now = new Date();

  await prisma.$transaction([
    prisma.characterTournamentParticipant.deleteMany({
      where: { tournamentId, id: { in: excluded } },
    }),
    ...qualifiers.map((p, i) =>
      prisma.characterTournamentParticipant.update({
        where: { id: p.id },
        data: { seed: i + 1 },
      })
    ),
    prisma.characterTournament.update({
      where: { id: tournamentId },
      data: {
        mode: "bracket",
        status: "active",
        bracketStartedAt: now,
        currentRound: 1,
        roundEndsAt: new Date(now.getTime() + ROUND_DAYS * DAY_MS),
        ...(tournament.qualifyingEndsAt ? {} : { qualifyingEndsAt: now }),
      },
    }),
  ]);

  await generateRoundMatches(tournamentId, 1);

  return {
    tournamentId,
    qualifiers: qualifiers.map((p, i) => ({ ...p, seed: i + 1 })),
  };
}

/** Decide every unsolved match of the current round by majority and advance. */
export async function finalizeRound(tournamentId: string) {
  const tournament = await prisma.characterTournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.status !== "active" || tournament.mode !== "bracket") {
    throw new Error("Tournament is not active");
  }

  const round = tournament.currentRound;
  const matches = await prisma.characterTournamentMatch.findMany({
    where: { tournamentId, round },
    orderBy: { position: "asc" },
    include: { charA: { select: { id: true, seed: true } }, charB: { select: { id: true, seed: true } } },
  });

  for (const m of matches) {
    let winnerId: string | null;
    if (m.votesA > m.votesB) winnerId = m.charAId;
    else if (m.votesB > m.votesA) winnerId = m.charBId;
    else winnerId = m.charA?.seed !== undefined && (m.charB?.seed === undefined || m.charA.seed < m.charB.seed) ? m.charAId : m.charBId;

    if (!winnerId) throw new Error(`Match ${m.position} in round ${round} has no winner`);
    await prisma.characterTournamentMatch.update({
      where: { id: m.id },
      data: { winnerId },
    });
  }

  if (round >= tournament.totalRounds) {
    const finalMatch = matches[0];
    const winnerId = finalMatch.winnerId;
    await prisma.characterTournament.update({
      where: { id: tournamentId },
      data: { status: "completed", completedAt: new Date(), roundEndsAt: null },
    });
    const winner = winnerId
      ? await prisma.characterTournamentParticipant.findUnique({ where: { id: winnerId } })
      : null;
    return { completed: true, finalWinner: winner };
  }

  await generateRoundMatches(tournamentId, round + 1);
  await prisma.characterTournament.update({
    where: { id: tournamentId },
    data: { currentRound: round + 1, roundEndsAt: new Date(Date.now() + ROUND_DAYS * DAY_MS) },
  });
  return { completed: false, nextRound: round + 1 };
}

/** Build a flattened bracket map keyed by round for the view. */
export async function getTournamentRounds(tournamentId: string) {
  const tourney = await prisma.characterTournament.findUnique({
    where: { id: tournamentId },
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      participants: { orderBy: { seed: "asc" } },
    },
  });
  if (!tourney) return null;

  if (tourney.mode === "qualifying") {
    const sorted = [...tourney.participants].sort((a, b) => b.pollVotes - a.pollVotes || a.createdAt.getTime() - b.createdAt.getTime());
    const totalPollVotes = tourney.participants.reduce((s, p) => s + p.pollVotes, 0);
    return {
      tournament: { ...tourney, participants: sorted },
      rounds: [],
      matches: [],
      totalVotes: totalPollVotes,
    };
  }

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