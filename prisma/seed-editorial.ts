/**
 * Seeds the `EditorialEntry` table from the bundled static arrays so the
 * previously hardcoded hubs (`/dubbed`, `/theatrical-releases`) become
 * DB-backed and editable without a redeploy.
 *
 * Idempotent: entries are upserted on `(kind, slug)`, so re-running only
 * refreshes content. Reads fall back to the static arrays when the table is
 * empty, so seeding is optional.
 *
 *   npx tsx prisma/seed-editorial.ts
 *   # or: npm run db:seed:editorial
 */
import "../scripts/load-env";
import { PrismaClient, type Prisma } from "@prisma/client";
import { DUBBED_ANIME_STATIC } from "../src/lib/data/dubbed-static";
import { THEATRICAL_RELEASES } from "../src/lib/theatrical-releases";

const prisma = new PrismaClient();

async function seedKind<T>(
  kind: string,
  entries: readonly T[],
  slugOf: (entry: T) => string,
  titleOf: (entry: T) => string
): Promise<number> {
  let count = 0;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const slug = slugOf(entry);
    const data = entry as unknown as Prisma.InputJsonValue;
    await prisma.editorialEntry.upsert({
      where: { kind_slug: { kind, slug } },
      update: { title: titleOf(entry), data, sortOrder: i },
      create: {
        kind,
        slug,
        title: titleOf(entry),
        data,
        sortOrder: i,
        isPublished: true,
      },
    });
    count++;
  }
  return count;
}

async function main() {
  const dubbed = await seedKind(
    "dubbed",
    DUBBED_ANIME_STATIC,
    (entry) => String(entry.mal_id),
    (entry) => entry.title
  );
  const theatrical = await seedKind(
    "theatrical",
    THEATRICAL_RELEASES,
    (entry) => entry.id,
    (entry) => entry.title
  );

  console.log(
    JSON.stringify(
      {
        dubbedUpserted: dubbed,
        theatricalUpserted: theatrical,
        totals: {
          dubbed: await prisma.editorialEntry.count({ where: { kind: "dubbed" } }),
          theatrical: await prisma.editorialEntry.count({ where: { kind: "theatrical" } }),
        },
      },
      null,
      2
    )
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
