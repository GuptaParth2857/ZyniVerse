import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing AniListCache...");
  const del = await prisma.$executeRawUnsafe(`DELETE FROM "AniListCache"`);
  console.log("Deleted rows:", del);

  const after = await prisma.$queryRawUnsafe(`
    SELECT pg_total_relation_size('"AniListCache"') / 1048576.0 AS tbl_mb,
           pg_database_size(current_database()) / 1048576.0 AS db_mb
  `);
  console.log("After delete:", after[0]);

  console.log("Running VACUUM FULL to reclaim disk...");
  await prisma.$executeRawUnsafe(`VACUUM (FULL, ANALYZE) "AniListCache"`);
  const afterVac = await prisma.$queryRawUnsafe(`
    SELECT pg_total_relation_size('"AniListCache"') / 1048576.0 AS tbl_mb,
           pg_database_size(current_database()) / 1048576.0 AS db_mb
  `);
  console.log("After vacuum:", afterVac[0]);

  console.log("Setting long cache on storage objects...");
  const up = await prisma.$executeRawUnsafe(`
    UPDATE storage.objects
    SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"cacheControl":"max-age=31536000, immutable"}'::jsonb
    WHERE bucket_id IN ('reels', 'profiles')
  `);
  console.log("Objects updated:", up);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
