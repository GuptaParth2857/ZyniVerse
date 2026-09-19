export interface BingoSquare {
  index: number;
  text: string;
  category: string;
  color: string;
  completed: boolean;
}

export interface BingoCard {
  id: string;
  title: string;
  season: string;
  year: number;
  squares: string;
  createdAt: string;
}

export const BINGO_CATEGORIES: { text: string; category: string; color: string }[][] = [
  [
    { text: "Isekai", category: "Anime Tropes", color: "#ff3366" },
    { text: "Beach Episode", category: "Anime Tropes", color: "#ff3366" },
    { text: "Training Arc", category: "Anime Tropes", color: "#ff3366" },
    { text: "Tsundere MC", category: "Anime Tropes", color: "#ff3366" },
    { text: "Power of Friendship", category: "Anime Tropes", color: "#ff3366" },
  ],
  [
    { text: "Binge 5+ eps", category: "Watch Patterns", color: "#00ffff" },
    { text: "Drop a Show", category: "Watch Patterns", color: "#00ffff" },
    { text: "Watch Dubbed", category: "Watch Patterns", color: "#00ffff" },
    { text: "Watch Subbed Only", category: "Watch Patterns", color: "#00ffff" },
    { text: "Rewatch Favorite", category: "Watch Patterns", color: "#00ffff" },
  ],
  [
    { text: "Post a Review", category: "Community", color: "#ffd700" },
    { text: "Join a Club", category: "Community", color: "#ffd700" },
    { text: "Create a Tier List", category: "Community", color: "#ffd700" },
    { text: "Vote in Poll", category: "Community", color: "#ffd700" },
    { text: "Comment on Forum", category: "Community", color: "#ffd700" },
  ],
  [
    { text: "New Genre", category: "Discovery", color: "#8a2be2" },
    { text: "Try 90s Anime", category: "Discovery", color: "#8a2be2" },
    { text: "Watch Ghibli Film", category: "Discovery", color: "#8a2be2" },
    { text: "Sports Anime", category: "Discovery", color: "#8a2be2" },
    { text: "Horror Anime", category: "Discovery", color: "#8a2be2" },
  ],
  [
    { text: "Cosplay Photo", category: "Fun", color: "#00ff7f" },
    { text: "Fan Art Upload", category: "Fun", color: "#00ff7f" },
    { text: "Share on Social", category: "Fun", color: "#00ff7f" },
    { text: "Refer a Friend", category: "Fun", color: "#00ff7f" },
    { text: "Complete a Challenge", category: "Fun", color: "#00ff7f" },
  ],
];

export const WINNING_LINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export function checkWin(squares: BingoSquare[]): number[][] {
  return WINNING_LINES.filter((line) => line.every((idx) => squares[idx].completed));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateSquares(): BingoSquare[] {
  const all: { text: string; category: string; color: string }[] = [];
  for (const row of BINGO_CATEGORIES) for (const item of row) all.push(item);
  const shuffled = shuffle(all);
  const squares: BingoSquare[] = [];
  let idx = 0;
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      squares.push({ index: i, text: "FREE", category: "Free Space", color: "#ffffff", completed: true });
    } else {
      const item = shuffled[idx++];
      squares.push({ index: i, text: item.text, category: item.category, color: item.color, completed: false });
    }
  }
  return squares;
}

export function generateSquaresForTemplate(raw: string): BingoSquare[] {
  return generateSquaresFromPool(parsePool(raw));
}

export function seasonLabel(season: string) {
  return season.charAt(0) + season.slice(1).toLowerCase();
}

export interface BingoPoolItem {
  text: string;
  category: string;
  color: string;
}

export interface BingoTemplateData {
  id: string;
  title: string;
  emoji: string;
  description: string | null;
  squares: string;
  isActive: boolean;
  isFeatured: boolean;
  usesCount: number;
  createdAt: string;
  updatedAt: string;
}

export function parsePool(raw: string): BingoPoolItem[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((p) => p && typeof p.text === "string") : [];
  } catch {
    return [];
  }
}

const DEFAULT_POOL: BingoPoolItem[] = (() => {
  const all: BingoPoolItem[] = [];
  for (const row of BINGO_CATEGORIES) for (const item of row) all.push({ ...item });
  return all;
})();

export function generateSquaresFromPool(pool: BingoPoolItem[]): BingoSquare[] {
  const source = pool.length >= 24 ? pool : [...DEFAULT_POOL, ...pool];
  const shuffled = shuffle(source);
  const squares: BingoSquare[] = [];
  const used = new Set<string>();
  let idx = 0;
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      squares.push({ index: i, text: "FREE", category: "Free Space", color: "#ffffff", completed: true });
      continue;
    }
    let item = shuffled[idx++];
    while (item && used.has(item.text)) item = shuffled[idx++];
    if (!item) item = DEFAULT_POOL[i % DEFAULT_POOL.length];
    used.add(item.text);
    squares.push({ index: i, text: item.text, category: item.category, color: item.color, completed: false });
  }
  return squares;
}