import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface DailyAnime {
  mediaId: number;
  title: string;
  genres: string[];
  format: string;
  year: number;
  season: string;
  studio: string;
  episodeCount: number;
  scoreRanges: { min: number; max: number };
}

const POPULAR_ANIME: DailyAnime[] = [
  { mediaId: 1535, title: "Death Note", genres: ["Mystery", "Thriller", "Supernatural"], format: "TV", year: 2006, season: "FALL", studio: "Madhouse", episodeCount: 37, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 16498, title: "Attack on Titan", genres: ["Action", "Drama", "Fantasy"], format: "TV", year: 2013, season: "SPRING", studio: "MAPPA", episodeCount: 87, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 11757, title: "Sword Art Online", genres: ["Action", "Adventure", "Fantasy"], format: "TV", year: 2012, season: "SUMMER", studio: "A-1 Pictures", episodeCount: 96, scoreRanges: { min: 65, max: 80 } },
  { mediaId: 5114, title: "Fullmetal Alchemist Brotherhood", genres: ["Action", "Adventure", "Drama"], format: "TV", year: 2009, season: "SPRING", studio: "Bones", episodeCount: 64, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 9253, title: "Steins;Gate", genres: ["Drama", "Sci-Fi", "Thriller"], format: "TV", year: 2011, season: "SPRING", studio: "White Fox", episodeCount: 24, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 30276, title: "One Punch Man", genres: ["Action", "Comedy", "Supernatural"], format: "TV", year: 2015, season: "FALL", studio: "Madhouse", episodeCount: 24, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 101922, title: "Demon Slayer", genres: ["Action", "Fantasy", "Supernatural"], format: "TV", year: 2019, season: "SPRING", studio: "ufotable", episodeCount: 55, scoreRanges: { min: 80, max: 95 } },
  { mediaId: 20, title: "Naruto", genres: ["Action", "Adventure", "Fantasy"], format: "TV", year: 2002, season: "FALL", studio: "Pierrot", episodeCount: 220, scoreRanges: { min: 75, max: 90 } },
  { mediaId: 1735, title: "Naruto Shippuuden", genres: ["Action", "Adventure", "Fantasy"], format: "TV", year: 2007, season: "WINTER", studio: "Pierrot", episodeCount: 500, scoreRanges: { min: 80, max: 90 } },
  { mediaId: 11061, title: "Hunter x Hunter (2011)", genres: ["Action", "Adventure", "Fantasy"], format: "TV", year: 2011, season: "FALL", studio: "Madhouse", episodeCount: 148, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 22319, title: "Tokyo Ghoul", genres: ["Action", "Drama", "Horror"], format: "TV", year: 2014, season: "SUMMER", studio: "Pierrot", episodeCount: 48, scoreRanges: { min: 75, max: 85 } },
  { mediaId: 31964, title: "My Hero Academia", genres: ["Action", "Comedy", "Super Power"], format: "TV", year: 2016, season: "SPRING", studio: "Bones", episodeCount: 138, scoreRanges: { min: 75, max: 90 } },
  { mediaId: 38000, title: "Kimetsu no Yaiba: Mugen Train", genres: ["Action", "Fantasy", "Supernatural"], format: "MOVIE", year: 2020, season: "FALL", studio: "ufotable", episodeCount: 1, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 21, title: "One Piece", genres: ["Action", "Adventure", "Comedy"], format: "TV", year: 1999, season: "FALL", studio: "Toei Animation", episodeCount: 1100, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 36456, title: "Re:Zero kara Hajimeru Isekai Seikatsu", genres: ["Drama", "Fantasy", "Thriller"], format: "TV", year: 2016, season: "SPRING", studio: "White Fox", episodeCount: 50, scoreRanges: { min: 80, max: 90 } },
  { mediaId: 22199, title: "Aldnoah.Zero", genres: ["Action", "Drama", "Mecha"], format: "TV", year: 2014, season: "SUMMER", studio: "A-1 Pictures", episodeCount: 24, scoreRanges: { min: 70, max: 80 } },
  { mediaId: 9969, title: "Gintama'", genres: ["Action", "Comedy", "Sci-Fi"], format: "TV", year: 2011, season: "SPRING", studio: "Sunrise", episodeCount: 51, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 2001, title: "Cowboy Bebop", genres: ["Action", "Drama", "Sci-Fi"], format: "TV", year: 1998, season: "SPRING", studio: "Sunrise", episodeCount: 26, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 20507, title: "Your Lie in April", genres: ["Drama", "Music", "Romance"], format: "TV", year: 2014, season: "FALL", studio: "A-1 Pictures", episodeCount: 22, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 199, title: "Neon Genesis Evangelion", genres: ["Drama", "Mecha", "Psychological"], format: "TV", year: 1995, season: "FALL", studio: "Gainax", episodeCount: 26, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 37779, title: "Yakusoku no Neverland", genres: ["Mystery", "Psychological", "Thriller"], format: "TV", year: 2019, season: "WINTER", studio: "CloverWorks", episodeCount: 23, scoreRanges: { min: 80, max: 90 } },
  { mediaId: 31043, title: "Oregairu", genres: ["Comedy", "Drama", "Romance"], format: "TV", year: 2015, season: "SPRING", studio: "Feel", episodeCount: 38, scoreRanges: { min: 80, max: 90 } },
  { mediaId: 38680, title: "Kono Subarashii Sekai ni Shukufuku wo!", genres: ["Comedy", "Fantasy", "Isekai"], format: "TV", year: 2016, season: "WINTER", studio: "Studio Deen", episodeCount: 20, scoreRanges: { min: 80, max: 90 } },
  { mediaId: 28223, title: "No Game No Life", genres: ["Comedy", "Fantasy", "Isekai"], format: "TV", year: 2014, season: "SPRING", studio: "Madhouse", episodeCount: 12, scoreRanges: { min: 80, max: 90 } },
  { mediaId: 32281, title: "Kimi no Na wa.", genres: ["Drama", "Romance", "Supernatural"], format: "MOVIE", year: 2016, season: "SUMMER", studio: "CoMix Wave Films", episodeCount: 1, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 5680, title: "Clannad: After Story", genres: ["Drama", "Romance", "Supernatural"], format: "TV", year: 2008, season: "FALL", studio: "Kyoto Animation", episodeCount: 24, scoreRanges: { min: 90, max: 100 } },
  { mediaId: 121, title: "Trigun", genres: ["Action", "Adventure", "Comedy"], format: "TV", year: 1998, season: "SPRING", studio: "Madhouse", episodeCount: 26, scoreRanges: { min: 85, max: 95 } },
  { mediaId: 42299, title: "Spy x Family", genres: ["Action", "Comedy", "Slice of Life"], format: "TV", year: 2022, season: "SPRING", studio: "Wit Studio", episodeCount: 37, scoreRanges: { min: 85, max: 95 } },
];

function getDailyAnime(): DailyAnime {
  const now = new Date();
  const start = new Date("2024-01-01").getTime();
  const diff = now.getTime() - start;
  const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
  return POPULAR_ANIME[dayIndex % POPULAR_ANIME.length];
}

async function GET_inner() {
  const daily = getDailyAnime();
  return NextResponse.json({
    mediaId: daily.mediaId,
    genres: daily.genres,
    format: daily.format,
    year: daily.year,
    season: daily.season,
    episodeCount: daily.episodeCount,
  });
}

const MAX_ATTEMPTS = 6;

export async function POST(req: NextRequest) {
  const session = await auth();

  const { guess, attempts: clientAttempts = 0 } = await req.json();
  if (!guess || typeof guess !== "string") {
    return NextResponse.json({ error: "Guess is required" }, { status: 400 });
  }

  const daily = getDailyAnime();
  const guessLower = guess.toLowerCase().trim();
  const targetLower = daily.title.toLowerCase();
  const correct = guessLower === targetLower;

  const genreMatch = (daily.genres || []).some((g) => guessLower.includes(g.toLowerCase()));
  const formatMatch = guessLower.includes(daily.format.toLowerCase());

  const guessWords = guessLower.split(/\s+/);
  const targetWords = targetLower.split(/\s+/);
  const sharedWords = guessWords.filter((w) => w.length > 2 && targetWords.some((tw) => tw.includes(w) || w.includes(tw)));
  const wordSimilarity = targetWords.length > 0 ? Math.round((sharedWords.length / targetWords.length) * 40) : 0;

  const similarity = correct ? 100 : Math.min(99, Math.round(
    wordSimilarity +
    (genreMatch ? 25 : 0) +
    (formatMatch ? 15 : 0) +
    Math.max(0, 20 - Math.abs(new Date().getFullYear() - daily.year))
  ));

  const hints: string[] = [];
  if (correct) {
    hints.push("Correct!");
  } else {
    if (genreMatch) {
      const sharedGenres = daily.genres.filter((g) => guessLower.includes(g.toLowerCase()));
      hints.push(`Genre:${sharedGenres.join(", ")}`);
    } else {
      hints.push("Genre:No match");
    }
    if (formatMatch) {
      hints.push(`Format:${daily.format}`);
    } else {
      hints.push(`Format:Not ${daily.format}`);
    }
    hints.push(`Year:${daily.year > 2020 ? "2020s" : daily.year > 2010 ? "2010s" : daily.year > 2000 ? "2000s" : "pre-2000s"}`);
    hints.push(`Studio:${daily.studio}`);
    hints.push(`Episodes:${daily.episodeCount > 100 ? "100+" : daily.episodeCount > 24 ? "25-100" : "<25"}`);
  }

  // Logged-in users: attempts tracked server-side per day (source of truth).
  // Anonymous users: attempts come from the client so a refresh keeps progress.
  let currentAttempts = 0;
  let existing: { id: string; attempts: number; guesses: string } | null = null;

  if (session?.user?.id) {
    existing = await prisma.wordleGame.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    currentAttempts = existing ? existing.attempts : 0;
  } else {
    currentAttempts = Math.max(0, Math.min(Number(clientAttempts) || 0, MAX_ATTEMPTS - 1));
  }

  const newAttempts = currentAttempts + 1;
  const isGameOver = correct || newAttempts >= MAX_ATTEMPTS;

  if (session?.user?.id) {
    const existingGuesses: string[] = existing ? JSON.parse(existing.guesses) : [];
    const updatedGuesses = [...existingGuesses, guess];

    if (existing) {
      await prisma.wordleGame.update({
        where: { id: existing.id },
        data: {
          attempts: newAttempts,
          won: correct,
          guesses: JSON.stringify(updatedGuesses),
          completed: isGameOver,
        },
      });
    } else {
      await prisma.wordleGame.create({
        data: {
          userId: session.user.id,
          mediaId: daily.mediaId,
          mediaTitle: daily.title,
          attempts: newAttempts,
          won: correct,
          guesses: JSON.stringify(updatedGuesses),
          completed: isGameOver,
        },
      });
    }
  }

  return NextResponse.json({
    correct,
    similarity,
    hints,
    attempts: newAttempts,
    gameOver: isGameOver,
    target: isGameOver ? { title: daily.title } : undefined,
  });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
