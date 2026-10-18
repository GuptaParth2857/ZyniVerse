import { prisma } from "@/lib/prisma";

const DEFAULT_CONTESTS: { type: string; title: string; description: string; badge: string }[] = [
  { type: "MEME", title: "Funniest Meme of the Week", description: "Post your best anime meme — most votes wins a badge + XP!", badge: "MEME_MAESTRO" },
  { type: "COSPLAY", title: "Cosplay Spotlight", description: "Show off your anime cosplay — top voted cosplay wins!", badge: "COSPLAY_STAR" },
  { type: "FANART", title: "Fan Art of the Week", description: "Share your original anime fan art — most votes wins!", badge: "ARTIST_OF_THE_WEEK" },
  { type: "MOMENT", title: "Best Anime Moment", description: "Share your favourite anime moment/quotes", badge: "MOMENT_LEGEND" },
];

function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getCurrentContests() {
  const now = new Date();
  const start = mondayOf(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  // Ensure each default type has an active contest this week
  for (const c of DEFAULT_CONTESTS) {
    await prisma.contentContest.upsert({
      where: { id: `${c.type}-${start.toISOString().split("T")[0]}` },
      update: {},
      create: {
        id: `${c.type}-${start.toISOString().split("T")[0]}`,
        title: c.title,
        type: c.type as "MEME",
        description: c.description,
        rewardBadge: c.badge,
        weekStart: start,
        weekEnd: end,
        rewardXp: 100,
      },
    });
  }

  return prisma.contentContest.findMany({
    where: { weekStart: start, status: "ACTIVE" },
    include: { entries: { include: { user: { select: { username: true, avatar: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export type CurrentContest = Awaited<ReturnType<typeof getCurrentContests>>[number];

/** Contest ids are `TYPE-YYYY-MM-DD`, so a page can label itself without a DB read. */
export function parseContestId(id: string): { type: string; weekStart: Date | null } {
  const parts = id.split("-");
  const [type, ...rest] = parts;
  const parsed = rest.length === 3 ? new Date(`${rest.join("-")}T00:00:00`) : null;
  return {
    type: type || "MEME",
    weekStart: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
  };
}

export async function getContestById(id: string) {
  return prisma.contentContest.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
        include: { user: { select: { username: true, avatar: true } } },
      },
      winner: { select: { username: true, avatar: true } },
    },
  });
}

export interface ContestHistoryItem {
  id: string;
  title: string;
  type: string;
  description: string | null;
  rewardXp: number;
  rewardBadge: string | null;
  weekStart: Date;
  weekEnd: Date;
  winnerId: string | null;
  winner: { username: string; avatar: string | null } | null;
  entryCount: number;
  podium: { id: string; title: string; image: string | null; caption: string | null; upvotes: number; username: string; avatar: string | null }[];
}

/**
 * Finished contests, newest first. Two queries total: the contests plus their
 * entries, which are grouped in memory so each archived card can show a podium
 * without a per-contest round-trip (an N+1 here would be brutal on a remote pooler).
 */
export async function getContestHistory(limit = 30): Promise<ContestHistoryItem[]> {
  const contests = await prisma.contentContest.findMany({
    where: { status: { not: "ACTIVE" } },
    orderBy: { weekStart: "desc" },
    take: limit,
    include: {
      winner: { select: { username: true, avatar: true } },
      _count: { select: { entries: true } },
    },
  });
  if (contests.length === 0) return [];

  const entries = await prisma.contentContestEntry.findMany({
    where: { contestId: { in: contests.map((c) => c.id) } },
    orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
    include: { user: { select: { username: true, avatar: true } } },
  });

  const byContest = new Map<string, ContestHistoryItem["podium"]>();
  for (const e of entries) {
    const list = byContest.get(e.contestId) ?? [];
    if (list.length >= 3) continue;
    list.push({
      id: e.id,
      title: e.title,
      image: e.image,
      caption: e.caption,
      upvotes: e.upvotes,
      username: e.user.username,
      avatar: e.user.avatar ?? null,
    });
    byContest.set(e.contestId, list);
  }

  return contests.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    description: c.description,
    rewardXp: c.rewardXp,
    rewardBadge: c.rewardBadge,
    weekStart: c.weekStart,
    weekEnd: c.weekEnd,
    winnerId: c.winnerId,
    winner: c.winner,
    entryCount: c._count.entries,
    podium: byContest.get(c.id) ?? [],
  }));
}

export interface ContestLeaderRow {
  userId: string;
  username: string;
  avatar: string | null;
  wins: number;
  votes: number;
  entries: number;
}

/** All-time standings: wins first, then total votes received, then spread. */
export async function getContestLeaderboard(limit = 25): Promise<ContestLeaderRow[]> {
  const [winRows, voteRows] = await Promise.all([
    prisma.contentContest.groupBy({
      by: ["winnerId"],
      where: { winnerId: { not: null } },
      _count: { _all: true },
    }),
    prisma.contentContestEntry.groupBy({
      by: ["userId"],
      _sum: { upvotes: true },
      _count: { _all: true },
    }),
  ]);

  const totals = new Map<string, { wins: number; votes: number; entries: number }>();
  for (const row of winRows) {
    const id = row.winnerId;
    if (!id) continue;
    const current = totals.get(id) ?? { wins: 0, votes: 0, entries: 0 };
    current.wins = row._count._all;
    totals.set(id, current);
  }
  for (const row of voteRows) {
    const current = totals.get(row.userId) ?? { wins: 0, votes: 0, entries: 0 };
    current.votes = row._sum.upvotes ?? 0;
    current.entries = row._count._all;
    totals.set(row.userId, current);
  }

  const ranked = [...totals.entries()]
    .sort((a, b) => b[1].wins - a[1].wins || b[1].votes - a[1].votes || b[1].entries - a[1].entries)
    .slice(0, limit);
  if (ranked.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: ranked.map(([id]) => id) } },
    select: { id: true, username: true, avatar: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  const rows: ContestLeaderRow[] = [];
  for (const [id, stat] of ranked) {
    const user = byId.get(id);
    if (!user) continue;
    rows.push({
      userId: id,
      username: user.username,
      avatar: user.avatar,
      wins: stat.wins,
      votes: stat.votes,
      entries: stat.entries,
    });
  }
  return rows;
}

export interface ContestActivityItem {
  id: string;
  createdAt: Date;
  username: string;
  avatar: string | null;
  entryId: string;
  entryTitle: string;
  entryImage: string | null;
  contestId: string;
  contestTitle: string;
  contestType: string;
}

/** Latest votes across every contest — powers the "live" ticker. */
export async function getContestActivity(limit = 12): Promise<ContestActivityItem[]> {
  const votes = await prisma.contentContestVote.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { username: true, avatar: true } },
      entry: {
        select: {
          id: true,
          title: true,
          image: true,
          contest: { select: { id: true, title: true, type: true } },
        },
      },
    },
  });

  return votes.map((v) => ({
    id: v.id,
    createdAt: v.createdAt,
    username: v.user.username,
    avatar: v.user.avatar ?? null,
    entryId: v.entry.id,
    entryTitle: v.entry.title,
    entryImage: v.entry.image ?? null,
    contestId: v.entry.contest.id,
    contestTitle: v.entry.contest.title,
    contestType: v.entry.contest.type,
  }));
}
