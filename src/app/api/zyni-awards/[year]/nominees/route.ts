import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeAllNominees, type ScrapedNominee } from "@/lib/awards-scraper";

const CATEGORY_MAP: Record<string, string> = {
  "Anime of the Year": "ANIME_OF_YEAR",
  "Best Action": "BEST_ACTION",
  "Best Romance": "BEST_ROMANCE",
  "Best Comedy": "BEST_COMEDY",
  "Best Fantasy": "BEST_FANTASY",
  "Best Drama": "BEST_DRAMA",
  "Best Animation": "BEST_ANIMATION",
  "Best New Series": "BEST_NEW_SERIES",
  "Best Score": "BEST_SCORE",
  "Best Villain": "BEST_VILLAIN",
  "Best Character": "BEST_CHARACTER",
  "Best Opening": "BEST_OPENING",
  "Best Film": "BEST_FILM",
  "Best TV Anime": "BEST_TV_ANIME",
  "Best Continuing Series": "BEST_CONTINUING",
  "Best Slice of Life": "BEST_SLICE_OF_LIFE",
  "Best Director": "BEST_DIRECTOR",
  "Best Character Design": "BEST_CHARACTER_DESIGN",
  "Best Ending": "BEST_ENDING",
  "Best Soundtrack": "BEST_SOUNDTRACK",
  "Best Boy": "BEST_BOY",
  "Best Girl": "BEST_GIRL",
  "Best Couple": "BEST_COUPLE",
  "Best VA Performance": "BEST_VA",
  "Best Manga": "BEST_MANGA",
  "Best Original Anime": "BEST_ORIGINAL",
  "Best Isekai": "BEST_ISEKAI",
  "Best Background Art": "BEST_BACKGROUND_ART",
};

const EXTRA_CATEGORIES = [
  { id: "BEST_FILM", name: "Best Film", emoji: "🎬" },
  { id: "BEST_TV_ANIME", name: "Best TV Anime", emoji: "📺" },
  { id: "BEST_CONTINUING", name: "Best Continuing Series", emoji: "🔄" },
  { id: "BEST_SLICE_OF_LIFE", name: "Best Slice of Life", emoji: "🌸" },
  { id: "BEST_DIRECTOR", name: "Best Director", emoji: "🎥" },
  { id: "BEST_CHARACTER_DESIGN", name: "Best Character Design", emoji: "✏️" },
  { id: "BEST_ENDING", name: "Best Ending", emoji: "🎵" },
  { id: "BEST_SOUNDTRACK", name: "Best Soundtrack", emoji: "🎶" },
  { id: "BEST_BOY", name: "Best Boy", emoji: "👦" },
  { id: "BEST_GIRL", name: "Best Girl", emoji: "👧" },
  { id: "BEST_COUPLE", name: "Best Couple", emoji: "💑" },
  { id: "BEST_VA", name: "Best VA Performance", emoji: "🎤" },
  { id: "BEST_MANGA", name: "Best Manga", emoji: "📖" },
  { id: "BEST_ORIGINAL", name: "Best Original Anime", emoji: "💎" },
  { id: "BEST_ISEKAI", name: "Best Isekai", emoji: "🌀" },
  { id: "BEST_BACKGROUND_ART", name: "Best Background Art", emoji: "🏔️" },
];

function mapCategory(name: string): string {
  return CATEGORY_MAP[name] || name.toUpperCase().replace(/\s+/g, "_");
}

async function ensureAwardCycle(year: number) {
  const { AWARD_CATEGORIES } = await import("@/lib/zyni-awards");
  const allCats = [...AWARD_CATEGORIES, ...EXTRA_CATEGORIES];

  for (const cat of allCats) {
    await prisma.zyniAward.upsert({
      where: { year_category: { year, category: cat.id } },
      update: {},
      create: { year, category: cat.id, title: cat.name, status: "voting" },
    });
  }
}

async function importNomineesToDb(year: number, platform: string, nominees: ScrapedNominee[]) {
  let imported = 0;
  let skipped = 0;

  for (const n of nominees) {
    const categoryId = mapCategory(n.category);

    const award = await prisma.zyniAward.findUnique({
      where: { year_category: { year, category: categoryId } },
    });
    if (!award) { skipped++; continue; }

    const existing = await prisma.zyniAwardNominee.findFirst({
      where: { awardId: award.id, title: n.title },
    });
    if (existing) { skipped++; continue; }

    await prisma.zyniAwardNominee.create({
      data: {
        awardId: award.id,
        mediaId: n.malId || n.anilistId || 0,
        title: n.title,
        image: n.image,
        round: 1,
      },
    });
    imported++;
  }

  return { imported, skipped };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { year: yearStr } = await params;
  const year = Number(yearStr);
  if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  try {
    await ensureAwardCycle(year);

    const { nominees, errors } = await scrapeAllNominees(year);

    const byPlatform: Record<string, ScrapedNominee[]> = {};
    for (const n of nominees) {
      const key = n.category.includes("Trending") || n.category.includes("ATA") ? "Anime Trending" : "Crunchyroll";
      if (!byPlatform[key]) byPlatform[key] = [];
      byPlatform[key].push(n);
    }

    let totalImported = 0;
    let totalSkipped = 0;

    for (const [platform, platformNominees] of Object.entries(byPlatform)) {
      const result = await importNomineesToDb(year, platform, platformNominees);
      totalImported += result.imported;
      totalSkipped += result.skipped;
    }

    return NextResponse.json({
      success: true,
      totalScraped: nominees.length,
      imported: totalImported,
      skipped: totalSkipped,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  const awards = await prisma.zyniAward.findMany({
    where: { year },
    include: {
      nominees: {
        include: { votes: true },
        orderBy: { votes: { _count: "desc" } },
      },
    },
    orderBy: { category: "asc" },
  });

  return NextResponse.json({
    year,
    awards: awards.map((a) => ({
      id: a.id,
      category: a.category,
      title: a.title,
      status: a.status,
      nominees: a.nominees.map((n) => ({
        id: n.id,
        mediaId: n.mediaId,
        title: n.title,
        image: n.image,
        votes: n.votes.length,
      })),
    })),
  });
}
