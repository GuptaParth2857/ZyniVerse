import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const BINGO_CATEGORIES: { text: string; category: string; color: string }[][] = [
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSquares(): string {
  const allSquares: { text: string; category: string; color: string }[] = [];
  for (const row of BINGO_CATEGORIES) {
    for (const item of row) {
      allSquares.push(item);
    }
  }
  const shuffled = shuffle(allSquares);
  const squares: { index: number; text: string; category: string; color: string; completed: boolean }[] = [];
  let shuffleIdx = 0;
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      squares.push({ index: i, text: "FREE", category: "Free Space", color: "#ffffff", completed: true });
    } else {
      const item = shuffled[shuffleIdx++];
      squares.push({ index: i, text: item.text, category: item.category, color: item.color, completed: false });
    }
  }
  return JSON.stringify(squares);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.bingoCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cards });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { season, year } = await req.json();
  if (!season || !year) {
    return NextResponse.json({ error: "Season and year are required" }, { status: 400 });
  }

  const seasonUpper = String(season).toUpperCase();
  if (!["WINTER", "SPRING", "SUMMER", "FALL"].includes(seasonUpper)) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  const existing = await prisma.bingoCard.findFirst({
    where: { userId: session.user.id, season: seasonUpper, year: Number(year) },
  });
  if (existing) {
    return NextResponse.json({ card: existing });
  }

  const squares = generateSquares();
  const seasonLabel = seasonUpper.charAt(0) + seasonUpper.slice(1).toLowerCase();

  const card = await prisma.bingoCard.create({
    data: {
      userId: session.user.id,
      title: `${seasonLabel} ${year} Anime Bingo`,
      season: seasonUpper,
      year: Number(year),
      squares,
    },
  });

  return NextResponse.json({ card }, { status: 201 });
}
