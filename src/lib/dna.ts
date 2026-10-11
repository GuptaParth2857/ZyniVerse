import { getUserStats, type UserStats } from "./stats";

export interface DnaGenre {
  genre: string;
  count: number;
  pct: number;
}

export interface DnaArchetype {
  key: string;
  label: string;
  emoji: string;
  punchline: string;
  blurb: string;
}

export interface DnaWatchStyle {
  label: string;
  emoji: string;
  note: string;
}

export interface DnaProfile {
  displayName: string;
  username: string;
  avatar: string | null;
  archetype: DnaArchetype;
  watchStyle: DnaWatchStyle;
  topGenres: DnaGenre[];
  formats: string[];
  fingerprint: string;
  genes: string[];
  totalAnime: number;
  completedCount: number;
  droppedCount: number;
  planningCount: number;
  meanScore: number;
  totalDaysWatched: number;
  streak: number;
  favoriteStudio: string | null;
  peakYear: number | null;
  shareCode: string;
}

// ── color helpers (pure, dependency-free) ───────────────────────────────────

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toByte = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

// ── archetype detection ─────────────────────────────────────────────────────

interface ArchetypeRule {
  keys: string[];
  label: string;
  emoji: string;
  punchline: string;
  blurb: string;
}

const ARCHETYPE_RULES: ArchetypeRule[] = [
  {
    keys: ["Action", "Adventure", "Fantasy", "Supernatural"],
    label: "The Action Hero",
    emoji: "🗡️",
    punchline: "Hype se bhari, comebacks se pakki. Bewajah slow arcs? Nah.",
    blurb: "Action, adventure aur fantasy-heavy taste — thrillers, transformations aur bade payoff ke liye jeeta hai.",
  },
  {
    keys: ["Slice of Life", "Comedy", "Drama"],
    label: "The Healing Soul",
    emoji: "🌸",
    punchline: "Chhoti si baatein, bade jazbaat. Gosling level wholesome.",
    blurb: "Slice-of-life aur comedy me comfort dhoondta hai — daily life ko kaafi interesting bana deta hai.",
  },
  {
    keys: ["Psychological", "Mystery", "Thriller", "Horror"],
    label: "The Mind Hunter",
    emoji: "🕵️‍♂️",
    punchline: "Plot twist bhi tumko pehle se dikh gaya tha. Face reveal se zyada character reveal.",
    blurb: "Psychological dramas aur mysteries ka shikari — morally grey characters aur layered plots ki craving.",
  },
  {
    keys: ["Sci-Fi", "Mecha", "Military"],
    label: "The Future Seer",
    emoji: "🤖",
    punchline: "Payload me mechs, dil me philosophy. Future is now.",
    blurb: "Sci-fi, mecha aur military sagas — humanity aur robots ki kahaniyon me ghoomta hai.",
  },
  {
    keys: ["Romance", "Comedy"],
    label: "The Hopeless Romantic",
    emoji: "💘",
    punchline: "Will-they-won't-they se zyada 'when-will-they' matter karta hai.",
    blurb: "Romance aur comedy ka perfect dose — pining, confession scenes aur red flags ignore karne ki art.",
  },
  {
    keys: ["Sports"],
    label: "The Underdog",
    emoji: "🏅",
    punchline: "Comeback arc dekhe bina sone nahi jata. Training montage = therapy.",
    blurb: "Sports anime ka fanboy — hard work, rivalry aur last-minute match-winners ka junkie.",
  },
  {
    keys: ["Music"],
    label: "The Rhythm Riot",
    emoji: "🎶",
    punchline: "Soundtrack ke bina episode adhoora. Bangers only.",
    blurb: "Music aur idol anime ka lover — opening songs skip button spare kiye hote hain.",
  },
];

const DEFAULT_ARCHETYPE: DnaArchetype = {
  key: "eclectic",
  label: "The Eclectic Voyager",
  emoji: "🧭",
  punchline: "Har genre me ek alag planet. Explore karna hi destination hai.",
  blurb: "Kisi ek genre me band nahi — action se slice-of-life tak sab explore karta hai.",
};

function detectArchetype(topGenres: string[]): DnaArchetype {
  if (!topGenres.length) return DEFAULT_ARCHETYPE;
  const top = new Set(topGenres);
  let best: ArchetypeRule | null = null;
  let bestScore = 0;
  for (const rule of ARCHETYPE_RULES) {
    const score = rule.keys.filter((k) => top.has(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }
  if (!best || bestScore === 0) return DEFAULT_ARCHETYPE;
  return {
    key: best.keys[0].toLowerCase().replace(/\s+/g, "-"),
    label: best.label,
    emoji: best.emoji,
    punchline: best.punchline,
    blurb: best.blurb,
  };
}

function detectWatchStyle(stats: UserStats, _topGenres: string[]): DnaWatchStyle {
  if (stats.planningCount >= 10 && stats.planningCount > stats.completedCount) {
    return {
      label: "Backlog Builder",
      emoji: "📚",
      note: `${stats.planningCount} planned titles zyada, konsa pehle? Backlog grow hi fast ho jata hai.`,
    };
  }
  if (stats.completedCount > 0 && stats.droppedCount / stats.completedCount > 0.5) {
    return {
      label: "Serial Sampler",
      emoji: "🍿",
      note: "Bohot try karta hai, thoda sa drop — peak selection hack.",
    };
  }
  if (stats.completedCount >= 30) {
    return {
      label: "Completionist",
      emoji: "🏆",
      note: `${stats.completedCount} titles puri tarah complete — start-to-finish discipline.`,
    };
  }
  if (stats.currentStreak >= 7) {
    return {
      label: "Daily Devotee",
      emoji: "🔥",
      note: `${stats.currentStreak}-day streak — daily episode ritual pakka.`,
    };
  }
  if (stats.meanScore >= 85 && stats.completedCount > 0) {
    return {
      label: "Peak Picky",
      emoji: "👑",
      note: `Mean score ${stats.meanScore}/100 — sirf top-tier content.`,
    };
  }
  return {
    label: "Casual Voyager",
    emoji: "🌙",
    note: "Kompleet karna zaroori nahi, maza aana zaroori hai.",
  };
}

function deriveGenes(topGenres: string[], seedHue: number, count = 6): string[] {
  const base = topGenres.length ? topGenres : ["Taste"];
  const genes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const hue = (seedHue + Math.round(i * 51)) % 360;
    const label = i % 2 === 0 ? base[i % base.length] : `T${Math.round(40 + i * 7)}-X${i + 1}`;
    genes.push(`${label} · ${hslToHex(hue, 72, 56)}`);
  }
  return genes;
}

/**
 * Converts a user's aggregated stats into a shareable "Anime DNA" profile.
 * Pure + serializable, so it can be computed server-side and hydrated into the
 * client for PNG export.
 */
export function computeDna(stats: UserStats, username: string, displayName?: string | null, avatar?: string | null): DnaProfile {
  const topGenres = stats.genreBreakdown.slice(0, 3).map((g) => g.genre);
  const seed = hashString(username || "zyverse") % 360;
  const archetype = detectArchetype(topGenres);
  const watchStyle = detectWatchStyle(stats, topGenres);
  const favoriteStudio =
    stats.topStudios.length > 0
      ? stats.topStudios.sort((a, b) => b.count - a.count)[0].name
      : null;
  const peakYear =
    stats.yearlyActivity.length > 0
      ? [...stats.yearlyActivity].sort((a, b) => b.completed - a.completed)[0].year
      : null;

  return {
    displayName: displayName || username,
    username,
    avatar: avatar ?? null,
    archetype,
    watchStyle,
    topGenres: stats.genreBreakdown.slice(0, 3).map((g) => ({ genre: g.genre, count: g.count, pct: g.percentage })),
    formats: stats.formatBreakdown.map((f) => f.format),
    fingerprint: hslToHex(seed, 66, 52),
    genes: deriveGenes(topGenres, seed),
    totalAnime: stats.totalAnime,
    completedCount: stats.completedCount,
    droppedCount: stats.droppedCount,
    planningCount: stats.planningCount,
    meanScore: stats.meanScore,
    totalDaysWatched: stats.totalDaysWatched,
    streak: stats.currentStreak,
    favoriteStudio,
    peakYear,
    shareCode: `${seed.toString(36)}-${hashString(username + archetype.key).toString(36)}`,
  };
}

/** Full pipeline: DB + AniList aggregation → DNA profile. */
export async function getDnaForUser(userId: string, username: string, displayName?: string | null, avatar?: string | null): Promise<DnaProfile> {
  const stats = await getUserStats(userId);
  return computeDna(stats, username, displayName, avatar);
}