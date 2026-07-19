import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WebhookAward {
  year: number;
  category: string;
  winner: string;
  platform: string;
  type: "anime" | "manga" | "live-action" | "character" | "music";
  image?: string;
  malId?: number;
  anilistId?: number;
  source?: string;
}

interface WebhookNominee {
  year: number;
  category: string;
  title: string;
  image?: string;
  malId?: number;
  anilistId?: number;
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

export async function POST(req: NextRequest) {
  const secret = process.env.AWARDS_WEBHOOK_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as {
    awards?: WebhookAward[];
    award?: WebhookAward;
    nominees?: WebhookNominee[];
    nominee?: WebhookNominee;
  };

  const awards: WebhookAward[] = payload.awards || (payload.award ? [payload.award] : []);
  const nominees: WebhookNominee[] = payload.nominees || (payload.nominee ? [payload.nominee] : []);

  if (awards.length === 0 && nominees.length === 0) {
    return NextResponse.json({
      error: "Provide 'awards'/'award' or 'nominees'/'nominee'",
    }, { status: 400 });
  }

  const results: { created?: number; updated?: number; imported?: number; skipped?: number; errors?: string[] } = {};

  if (awards.length > 0) {
    let created = 0, updated = 0;
    const errors: string[] = [];

    for (const award of awards.slice(0, 50)) {
      if (!award.year || !award.category || !award.winner || !award.platform) {
        errors.push(`Skipping invalid award: ${JSON.stringify(award)}`);
        continue;
      }
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
          updated++;
        } else {
          await prisma.externalAward.create({
            data: { year: award.year, category: award.category, winner: award.winner, platform: award.platform, type: award.type || "anime", image: award.image, malId: award.malId, anilistId: award.anilistId, source: award.source },
          });
          created++;
        }
      } catch (e) {
        errors.push(`Failed to process "${award.winner}": ${String(e)}`);
      }
    }
    results.created = created;
    results.updated = updated;
    if (errors.length > 0) results.errors = errors;
  }

  if (nominees.length > 0) {
    let imported = 0, skipped = 0;
    const nomineeErrors: string[] = [];

    for (const n of nominees.slice(0, 100)) {
      if (!n.year || !n.category || !n.title) {
        nomineeErrors.push(`Skipping invalid nominee: ${JSON.stringify(n)}`);
        continue;
      }
      try {
        const categoryId = NOMINEE_CATEGORY_MAP[n.category] || n.category.toUpperCase().replace(/\s+/g, "_");
        const award = await prisma.zyniAward.findUnique({
          where: { year_category: { year: n.year, category: categoryId } },
        });
        if (!award) {
          await prisma.zyniAward.create({
            data: { year: n.year, category: categoryId, title: n.category, status: "voting" },
          });
          const newAward = await prisma.zyniAward.findUnique({
            where: { year_category: { year: n.year, category: categoryId } },
          });
          if (newAward) {
            await prisma.zyniAwardNominee.create({
              data: { awardId: newAward.id, mediaId: n.malId || n.anilistId || 0, title: n.title, image: n.image, round: 1 },
            });
            imported++;
          }
          continue;
        }

        const existing = await prisma.zyniAwardNominee.findFirst({
          where: { awardId: award.id, title: n.title },
        });
        if (existing) { skipped++; continue; }

        await prisma.zyniAwardNominee.create({
          data: { awardId: award.id, mediaId: n.malId || n.anilistId || 0, title: n.title, image: n.image, round: 1 },
        });
        imported++;
      } catch (e) {
        nomineeErrors.push(`Failed to import "${n.title}": ${String(e)}`);
      }
    }
    results.imported = imported;
    results.skipped = skipped;
    if (nomineeErrors.length > 0) {
      results.errors = [...(results.errors || []), ...nomineeErrors];
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
