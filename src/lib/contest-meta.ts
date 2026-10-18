/** Shared contest metadata so the main page, detail page, archive and API all
 *  agree on icons, colours and prize labels. Kept dependency-free (no Prisma, no
 *  React) so it is safe to import from either the server or a client component. */

export interface ContestTypeMeta {
  label: string;
  icon: string;
  color: string;
  blurb: string;
}

export const CONTEST_TYPE_META: Record<string, ContestTypeMeta> = {
  MEME: { label: "Meme", icon: "😂", color: "#facc15", blurb: "Caption it, crop it, post it. The funniest frame wins the week." },
  COSPLAY: { label: "Cosplay", icon: "🎭", color: "#a78bfa", blurb: "Costume craftsmanship, props and photographs — judged by votes." },
  FANART: { label: "Fan Art", icon: "🎨", color: "#f472b6", blurb: "Original art of your favourite characters, in any style." },
  MOMENT: { label: "Best Moment", icon: "💬", color: "#00ffe0", blurb: "The scene or quote that hit hardest — screenshots welcome." },
  BLOG: { label: "Blog", icon: "📝", color: "#60a5fa", blurb: "Long-form writing: reviews, essays and hot takes." },
};

export function contestTypeMeta(type: string | null | undefined): ContestTypeMeta {
  return (type && CONTEST_TYPE_META[type]) || { label: "Contest", icon: "🏆", color: "#00ffe0", blurb: "Vote for your favourite entry." };
}

export const BADGE_LABEL: Record<string, string> = {
  MEME_MAESTRO: "Meme Maestro",
  COSPLAY_STAR: "Cosplay Star",
  ARTIST_OF_THE_WEEK: "Artist of the Week",
  MOMENT_LEGEND: "Moment Legend",
};

/** Prize + rules copy shared by the detail page, the rules page and the submit form. */
export const CONTEST_RULES: { icon: string; title: string; body: string }[] = [
  {
    icon: "🖼️",
    title: "One entry per battle",
    body: "Each member can submit a single entry to a weekly battle. Pick your strongest work — there is no take-back.",
  },
  {
    icon: "👍",
    title: "One vote per battle",
    body: "You can vote once in each contest and you can never vote for your own entry. Choose carefully, it is final.",
  },
  {
    icon: "⏱️",
    title: "Weeks run Monday to Monday",
    body: "Battles open every Monday at midnight and close exactly seven days later. Entries submitted after the bell do not count.",
  },
  {
    icon: "🎖️",
    title: "Winner takes the badge",
    body: "The most voted entry when the week closes wins the contest badge and the advertised XP + coin prize, awarded automatically.",
  },
  {
    icon: "🧼",
    title: "Keep it original",
    body: "Reposts, stolen art and vote brigading are removed. Credit the original artist when a meme uses someone else's drawing.",
  },
  {
    icon: "🔥",
    title: "Share to win",
    body: "Votes are community-driven. Every battle page has share buttons — bring your friends, that is part of the game.",
  },
];

export const CONTEST_PRIZES: { icon: string; label: string; value: string }[] = [
  { icon: "🎖️", label: "Badge", value: "Weekly champion badge" },
  { icon: "⚡", label: "XP", value: "100 XP + level progress" },
  { icon: "🪙", label: "Coins", value: "50 coins per win" },
  { icon: "🏆", label: "Hall of Fame", value: "Permanent archive slot" },
];

/* ------------------------------------------------------------------ *
 * Wire types shared by the contest API routes and their client pages. *
 * ------------------------------------------------------------------ */

export interface ContestUserDTO {
  username: string;
  avatar: string | null;
}

export interface ContestEntryDTO {
  id: string;
  title: string;
  image: string | null;
  caption: string | null;
  upvotes: number;
  createdAt?: string;
  rank?: number;
  user: ContestUserDTO;
  isMine?: boolean;
}

export interface ContestDTO {
  id: string;
  title: string;
  type: string;
  description: string | null;
  rewardXp: number;
  rewardBadge?: string | null;
  weekStart: string;
  weekEnd: string;
  status?: string;
  winner?: ContestUserDTO | null;
  entryCount?: number;
  totalVotes?: number;
  hasVoted?: boolean;
  votedEntryId?: string | null;
  hasSubmitted?: boolean;
  entries: ContestEntryDTO[];
}

/** A podium slot on an archived contest — the entry plus its author, flattened. */
export interface ContestPodiumDTO {
  id: string;
  title: string;
  image: string | null;
  caption: string | null;
  upvotes: number;
  username: string;
  avatar: string | null;
}

export interface ContestHistoryDTO {
  id: string;
  title: string;
  type: string;
  description: string | null;
  rewardXp: number;
  rewardBadge: string | null;
  weekStart: string;
  weekEnd: string;
  winnerId: string | null;
  winner: ContestUserDTO | null;
  entryCount: number;
  podium: ContestPodiumDTO[];
}

export interface ContestLeaderDTO {
  userId: string;
  username: string;
  avatar: string | null;
  wins: number;
  votes: number;
  entries: number;
}

export interface ContestActivityDTO {
  id: string;
  createdAt: string;
  username: string;
  avatar: string | null;
  entryId: string;
  entryTitle: string;
  contestId: string;
  contestTitle: string;
  contestType: string;
}

/** Rank medals for the top three slots, then a plain number. */
export function rankBadge(rank: number): { label: string; medal: string } {
  if (rank === 1) return { label: "#1", medal: "🥇" };
  if (rank === 2) return { label: "#2", medal: "🥈" };
  if (rank === 3) return { label: "#3", medal: "🥉" };
  return { label: `#${rank}`, medal: "" };
}

