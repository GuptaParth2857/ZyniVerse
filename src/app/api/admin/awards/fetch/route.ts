import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { scrapeAllSources } from "@/lib/awards-scraper";
import { CURATED_AWARDS } from "@/lib/awards-seed-data";

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { awards, errors } = await scrapeAllSources();

    const seen = new Set<string>();
    const combined: typeof awards = [];
    for (const award of [...awards, ...CURATED_AWARDS]) {
      const key = `${award.year}|${award.category}|${award.platform}|${award.winner}`;
      if (seen.has(key)) continue;
      seen.add(key);
      combined.push(award);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const award of combined) {
      try {
        const existing = await prisma.externalAward.findUnique({
          where: {
            year_category_platform_winner: {
              year: award.year,
              category: award.category,
              platform: award.platform,
              winner: award.winner,
            },
          },
        });

        if (existing) {
          await prisma.externalAward.update({
            where: { id: existing.id },
            data: {
              image: award.image || existing.image,
              malId: award.malId || existing.malId,
              anilistId: award.anilistId || existing.anilistId,
              source: award.source || existing.source,
            },
          });
          updated++;
        } else {
          await prisma.externalAward.create({
            data: {
              year: award.year,
              category: award.category,
              winner: award.winner,
              platform: award.platform,
              type: award.type,
              image: award.image,
              malId: award.malId,
              anilistId: award.anilistId,
              source: award.source,
            },
          });
          created++;
        }
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
      totalScraped: awards.length,
      curated: CURATED_AWARDS.length,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Fetch failed", details: String(error) },
      { status: 500 }
    );
  }
}
