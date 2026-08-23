import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sizes = await prisma.$queryRawUnsafe(`
    SELECT pg_database_size(current_database()) / 1048576.0 AS db_mb,
           (SELECT pg_total_relation_size('"AniListCache"') / 1048576.0) AS anilist_tbl_mb
  `);
  console.log("DB size now:", sizes[0]);

  const up = await prisma.$executeRawUnsafe(`
    UPDATE storage.objects
    SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"cacheControl":"max-age=31536000, immutable"}'::jsonb
    WHERE bucket_id IN ('reels', 'profiles')
      AND COALESCE(metadata->>'cacheControl', '') NOT LIKE '%31536000%'
  `);
  console.log("Storage objects updated with 1-year cache:", up);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
