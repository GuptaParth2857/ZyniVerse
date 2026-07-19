import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeAllSources } from "@/lib/awards-scraper";
import { scrapeAllNominees } from "@/lib/awards-scraper";

function isAwardSeason(): boolean {
  const month = new Date().getMonth() + 1;
  return month >= 3 && month <= 6 || month >= 10 && month <= 11;
}

const NOMINEE_CATEGORY_MAP: Record<string, string> = {
  "Anime of the Year": "ANIME_OF_YEAR", "Best Action": "BEST_ACTION", "Best Romance": "BEST_ROMANCE",
  "Best Comedy": "BEST_COMEDY", "Best Fantasy": "BEST_FANTASY", "Best Drama": "BEST_DRAMA",
  "Best Animation": "BEST_ANIMATION", "Best New Series": "BEST_NEW_SERIES", "Best Score": "BEST_SCORE",
  "Best Villain": "BEST_VILLAIN", "Best Character": "BEST_CHARACTER", "Best Opening": "BEST_OPENING",
  "Best Film": "BEST_FILM", "Best TV Anime": "BEST_TV_ANIME", "Best Continuing Series": "BEST_CONTINUING",
  "Best Slice of Life": "BEST_SLICE_OF_LIFE", "Best Director": "BEST_DIRECTOR",
  "Best Character Design": "BEST_CHARACTER_DESIGN", "Best Ending": "BEST_ENDING",
  "Best Soundtrack": "BEST_SOUNDTRACK", "Best Boy": "BEST_BOY", "Best Girl": "BEST_GIRL",
  "Best Couple": "BEST_COUPLE", "Best VA Performance": "BEST_VA", "Best Manga": "BEST_MANGA",
  "Best Original Anime": "BEST_ORIGINAL", "Best Isekai": "BEST_ISEKAI", "Best Background Art": "BEST_BACKGROUND_ART",
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAwardSeason()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Not award season — skipping scrape",
      timestamp: new Date().toISOString(),
    });
  }

  const currentYear = new Date().getFullYear();
  const results: {
    winners: { created: number; updated: number; skipped: number };
    nominees: { imported: number; skipped: number };
    errors: string[];
  } = {
    winners: { created: 0, updated: 0, skipped: 0 },
    nominees: { imported: 0, skipped: 0 },
    errors: [],
  };

  try {
    const { awards, errors: winnerErrors } = await scrapeAllSources();
    results.errors.push(...winnerErrors);

    for (const award of awards) {
      try {
        const existing = await prisma.externalAward.findUnique({
          where: {
            year_category_platform_winner: {
              year: award.year, category: award.category, platform: award.platform, winner: award.winner,
            },
          },
        });
        if (existing) {
          await prisma.externalAward.update({
            where: { id: existing.id },
            data: { image: award.image || existing.image, malId: award.malId || existing.malId, anilistId: award.anilistId || existing.anilistId, source: award.source || existing.source },
          });
          results.winners.updated++;
        } else {
          await prisma.externalAward.create({
            data: { year: award.year, category: award.category, winner: award.winner, platform: award.platform, type: award.type, image: award.image, malId: award.malId, anilistId: award.anilistId, source: award.source },
          });
          results.winners.created++;
        }
      } catch {
        results.winners.skipped++;
      }
    }

    const { nominees, errors: nomineeErrors } = await scrapeAllNominees(currentYear);
    results.errors.push(...nomineeErrors);

    const { AWARD_CATEGORIES } = await import("@/lib/zyni-awards");
    const allCats = [...AWARD_CATEGORIES];

    for (const n of nominees) {
      try {
        const categoryId = NOMINEE_CATEGORY_MAP[n.category] || n.category.toUpperCase().replace(/\s+/g, "_");

        let award = await prisma.zyniAward.findUnique({
          where: { year_category: { year: currentYear, category: categoryId } },
        });
        if (!award) {
          award = await prisma.zyniAward.create({
            data: { year: currentYear, category: categoryId, title: n.category, status: "voting" },
          });
        }

        const existing = await prisma.zyniAwardNominee.findFirst({
          where: { awardId: award.id, title: n.title },
        });
        if (existing) { results.nominees.skipped++; continue; }

        await prisma.zyniAwardNominee.create({
          data: { awardId: award.id, mediaId: n.malId || n.anilistId || 0, title: n.title, image: n.image, round: 1 },
        });
        results.nominees.imported++;
      } catch {
        results.nominees.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cron refresh failed", details: String(error) },
      { status: 500 }
    );
  }
}
