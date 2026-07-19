import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ALL_AWARDS, AWARD_YEARS, AWARD_PLATFORMS, AWARD_TYPES, getAwardsByFilters } from "@/lib/awards-data";
import { resolveImage } from "@/lib/image-resolver";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const platformParam = searchParams.get("platform");
  const typeParam = searchParams.get("type");

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  if (yearParam && isNaN(year!)) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  try {
    const where: Record<string, unknown> = {};
    if (year) where.year = year;
    if (platformParam) where.platform = platformParam;
    if (typeParam) where.type = typeParam;

    const dbAwards = await prisma.externalAward.findMany({
      where,
      orderBy: [{ year: "desc" }, { platform: "asc" }, { category: "asc" }],
    });

    if (dbAwards.length > 0) {
      const years = await prisma.externalAward.findMany({
        select: { year: true }, distinct: ["year"], orderBy: { year: "desc" },
      });
      const platforms = await prisma.externalAward.findMany({
        select: { platform: true }, distinct: ["platform"], orderBy: { platform: "asc" },
      });
      const types = await prisma.externalAward.findMany({
        select: { type: true }, distinct: ["type"], orderBy: { type: "asc" },
      });

      const awardsWithoutImages = dbAwards.filter((a) => !a.image);
      if (awardsWithoutImages.length > 0 && awardsWithoutImages.length <= 30) {
        const batchSize = 5;
        for (let i = 0; i < awardsWithoutImages.length; i += batchSize) {
          const batch = awardsWithoutImages.slice(i, i + batchSize);
          await Promise.allSettled(
            batch.map(async (a) => {
              const img = await resolveImage(a.winner, a.malId ?? undefined, a.anilistId ?? undefined);
              if (img) {
                await prisma.externalAward.update({
                  where: { id: a.id },
                  data: { image: img },
                });
                a.image = img;
              }
            })
          );
        }
      }

      return NextResponse.json({
        awards: dbAwards.map((a) => ({
          year: a.year,
          category: a.category,
          winner: a.winner,
          malId: a.malId,
          anilistId: a.anilistId,
          image: a.image,
          platform: a.platform,
          type: a.type,
        })),
        years: years.map((y) => y.year),
        platforms: platforms.map((p) => p.platform),
        types: types.map((t) => t.type),
        source: "database",
      });
    }
  } catch {}

  const staticAwards = getAwardsByFilters(year, platformParam || undefined, typeParam || undefined);
  const fallback = staticAwards.length > 0 ? staticAwards : ALL_AWARDS;

  const awardsWithoutImages = fallback.filter((a) => !a.image);
  if (awardsWithoutImages.length > 0 && awardsWithoutImages.length <= 30) {
    const batchSize = 5;
    for (let i = 0; i < awardsWithoutImages.length; i += batchSize) {
      const batch = awardsWithoutImages.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (a) => {
          const img = await resolveImage(a.winner, a.malId, a.anilistId);
          if (img) a.image = img;
        })
      );
    }
  }

  return NextResponse.json({
    awards: fallback,
    years: AWARD_YEARS,
    platforms: AWARD_PLATFORMS,
    types: AWARD_TYPES,
    source: "static",
  });
}
