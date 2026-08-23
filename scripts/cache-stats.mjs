import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS rows,
           ROUND(AVG(LENGTH("data"::text)) / 1024.0, 1) AS avg_kb,
           ROUND(SUM(LENGTH("data"::text)) / 1048576.0, 1) AS total_mb,
           COUNT(*) FILTER (WHERE LENGTH("data"::text) > 102400)::int AS big_rows,
           COUNT(*) FILTER (WHERE "updatedAt" < now() - interval '7 days')::int AS stale_7d
    FROM "AniListCache"
  `);
  console.log("=== AniListCache BEFORE ===", stats[0]);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
