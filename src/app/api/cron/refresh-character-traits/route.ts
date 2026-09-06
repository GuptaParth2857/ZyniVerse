import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCharacterTraitsBatch } from "@/lib/anilist";
import { parseAge, normalizeGender } from "@/lib/character-traits";

export const revalidate = 0;
export const maxDuration = 120;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pagesToFetch = Number(new URL(request.url).searchParams.get("pages")) || 200;
  let fetched = 0;

  for (let page = 1; page <= pagesToFetch; page++) {
    let res;
    try {
      res = await getCharacterTraitsBatch(page, 50);
    } catch {
      break;
    }
    if (!res.characters || res.characters.length === 0) break;

    for (const c of res.characters) {
      const name = c.name?.userPreferred || c.name?.full;
      if (!name) continue;
      const image = c.image?.large || c.image?.medium || null;
      const age = parseAge(c.age);
      const gender = normalizeGender(c.gender);

      try {
        await prisma.characterTrait.upsert({
          where: { characterId: c.id },
          update: {
            name,
            image,
            ageInt: age.ageInt,
            ageLabel: age.ageLabel,
            gender,
            favourites: c.favourites ?? 0,
          },
          create: {
            characterId: c.id,
            name,
            image,
            ageInt: age.ageInt,
            ageLabel: age.ageLabel,
            gender,
            favourites: c.favourites ?? 0,
          },
        });
        fetched++;
      } catch {
        continue;
      }
    }

    if (!res.pageInfo?.hasNextPage) break;
  }

  return NextResponse.json({ refreshedAt: new Date().toISOString(), fetched, pages: Math.ceil(fetched / 50) });
}