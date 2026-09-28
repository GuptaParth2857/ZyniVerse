import { prisma } from "@/lib/prisma";
import { getPopularCharacters } from "@/lib/anilist";
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
// Two weeks per round. The first tournament's rounds were three days and closed
// with barely any votes cast, which made every matchup a foregone conclusion. A
// 16-bracket is four rounds, so this is the window in which the fan vote
// actually has to land.
export const ROUND_DAYS = 14;
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

/** Cast a vote on a match (one per identity per match). */
export type MatchVoteActor = { userId?: string | null; deviceId?: string | null };

/**
 * Cast a bracket-match vote. A voter is identified either by their account
 * (userId) or an anonymous device id (deviceId), exactly like the qualifying
 * poll — login is not required to vote. One vote per identity per match, and a
 * guest vote is claimed by the account if the same device votes again while
 * signed in, so it is never counted twice.
 */
export async function castTournamentVote(
  matchId: string,
  actor: MatchVoteActor,
  choice: "A" | "B"
) {
  const userId = actor?.userId || null;
  const rawDeviceId = actor?.deviceId || null;
  if (!userId && !rawDeviceId) throw new Error("Vote requires a device");

  const match = await prisma.characterTournamentMatch.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Match not found");
  const tournament = await prisma.characterTournament.findUnique({
    where: { id: match.tournamentId },
  });
  if (!tournament || tournament.status !== "active" || tournament.mode !== "bracket") {
    throw new Error("Tournament is not active");
  }
  if (match.winnerId) throw new Error("This match is already decided");

  const targetField = choice === "A" ? "charAId" : "charBId";
  if (!match[targetField]) throw new Error("This side has no character");

  await prisma.$transaction(async (tx) => {
    if (userId) {
      const userVote = await tx.characterTournamentVote.findUnique({
        where: { matchId_userId: { matchId, userId } },
      });
      if (userVote) throw new Error("Already voted in this match");

      if (rawDeviceId) {
        const guestVote = await tx.characterTournamentVote.findFirst({
          where: { matchId, deviceId: rawDeviceId, userId: null },
        });
        if (guestVote) {
          if (guestVote.choice !== choice) throw new Error("Already voted in this match");
          // Claim the guest vote for the account instead of adding a second one,
          // so the running tally is not incremented for the same person.
          await tx.characterTournamentVote.update({
            where: { id: guestVote.id },
            data: { userId, deviceId: null },
          });
          return false;
        }
      }

      try {
        await tx.characterTournamentVote.create({ data: { matchId, userId, choice } });
      } catch (e) {
        if ((e as { code?: string })?.code === "P2002") throw new Error("Already voted in this match");
        throw e;
      }
    } else {
      const guestVote = await tx.characterTournamentVote.findFirst({
        where: { matchId, deviceId: rawDeviceId, userId: null },
      });
      if (guestVote) throw new Error("Already voted in this match");
      try {
        await tx.characterTournamentVote.create({ data: { matchId, deviceId: rawDeviceId, choice } });
      } catch (e) {
        if ((e as { code?: string })?.code === "P2002") throw new Error("Already voted in this match");
        throw e;
      }
    }

    await tx.characterTournamentMatch.update({
      where: { id: matchId },
      data: choice === "A" ? { votesA: { increment: 1 } } : { votesB: { increment: 1 } },
    });
  });

  const updated = await prisma.characterTournamentMatch.findUnique({ where: { id: matchId } });
  if (!updated) throw new Error("Match not found after voting");
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

/**
 * AniList `favourites` count per character id, used as a public, third-party
 * popularity signal when votes do not separate the candidates.
 *
 * AniList caps `perPage` at 50, so we page a bounded number of times and only
 * populate the map for the globally most-favourited characters. Anything absent
 * from the map scores 0. Returns an empty map if AniList is unreachable, which
 * degrades the ranking to the remaining tiebreakers rather than failing.
 */
export async function fetchAniListPopularity(pages = 5): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  for (let page = 1; page <= pages; page++) {
    try {
      const res = await getPopularCharacters(page, 50);
      for (const c of res.characters) {
        const favs = (c as { favourites?: number | null }).favourites;
        if (typeof favs === "number" && favs > 0) map.set(c.id, favs);
      }
      if (!res.pageInfo?.hasNextPage) break;
    } catch {
      break;
    }
  }
  return map;
}

/** Close the qualifying poll and build the final bracket from top vote-getters and fan favorites. */
export async function finalizeQualifying(tournamentId: string) {
  const tournament = await prisma.characterTournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.mode !== "qualifying") throw new Error("Tournament is not in qualifying mode");

  const bracketSize = tournament.bracketSize ?? 16;

  const participants = await prisma.characterTournamentParticipant.findMany({
    where: { tournamentId },
  });
  if (participants.length < bracketSize) {
    throw new Error(`Need at least ${bracketSize} candidates to form a bracket`);
  }

  // Fan-base popularity = how often each character is favorited across the platform.
  const favoriteGroups = await prisma.characterFavorite.groupBy({
    by: ["characterId"],
    _count: { _all: true },
  });
  const favoritesByCharId = new Map(
    favoriteGroups.map((g) => [g.characterId, g._count._all])
  );

  // AniList favourites fill the bracket when the poll did not produce enough
  // distinct votes to separate every candidate. Without this, a thin poll left
  // the lower seeds to `createdAt`, i.e. arbitrary insert order.
  const anilistPopularity = await fetchAniListPopularity();

  const ranked = participants
    .map((p) => ({
      ...p,
      favoriteCount: favoritesByCharId.get(p.charId) ?? 0,
      anilistFavourites: anilistPopularity.get(p.charId) ?? 0,
    }))
    .sort(
      (a, b) =>
        // Top vote-getters first ...
        b.pollVotes - a.pollVotes ||
        // ... then fan-base favorites ...
        b.favoriteCount - a.favoriteCount ||
        // ... then public AniList popularity, then insertion order as a last resort.
        b.anilistFavourites - a.anilistFavourites ||
        a.createdAt.getTime() - b.createdAt.getTime()
    );

  const qualifiers = ranked.slice(0, bracketSize);
  const qualifierIds = qualifiers.map((p) => p.id);
  const excluded = participants.filter((p) => !qualifierIds.includes(p.id)).map((p) => p.id);

  const now = new Date();

  // `@@unique([tournamentId, seed])` means a qualifier cannot be moved straight
  // to its final seed: the target slot is still held by another qualifier that
  // has not been reseeded yet, so the update fails with P2002. Shifting every
  // qualifier by the same constant in one statement keeps their seeds distinct
  // while clearing the 1..bracketSize range the final seeds need.
  const SEED_SHIFT = 100_000;

  await prisma.$transaction([
    prisma.characterTournamentParticipant.deleteMany({
      where: { tournamentId, id: { in: excluded } },
    }),
    prisma.characterTournamentParticipant.updateMany({
      where: { tournamentId, id: { in: qualifierIds } },
      data: { seed: { increment: SEED_SHIFT } },
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
    // How each qualifying seed was actually decided, so the bracket can be
    // explained honestly instead of implying every seed won a vote.
    decidedBy: {
      withVotes: qualifiers.filter((p) => p.pollVotes > 0).length,
      byPopularityTiebreak: qualifiers.filter((p) => p.pollVotes === 0 && p.anilistFavourites > 0).length,
      byInsertionOrder: qualifiers.filter((p) => p.pollVotes === 0 && p.anilistFavourites === 0).length,
      totalVotesCast: participants.reduce((sum, p) => sum + p.pollVotes, 0),
    },
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
    round: number;
    label: string;
    matches: (typeof matches)[number][];
  }[] = [];
  for (let r = 1; r <= tourney.totalRounds; r++) {
    // The round number is carried explicitly because later rounds have no match
    // rows yet, and the client needs a stable id for its round switcher.
    rounds.push({ round: r, label: roundLabel(r, tourney.totalRounds), matches: matches.filter((m) => m.round === r) });
  }

  return { tournament: tourney, rounds, matches, totalVotes };
}

export function roundLabel(round: number, total: number): string {
  if (round === total) return "Final";
  if (round === total - 1) return "Semi-Finals";
  if (round === total - 2) return "Quarter-Finals";
  return `Round ${round}`;
}