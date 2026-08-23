import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT relname,
           ROUND(pg_total_relation_size(c.oid) / 1048576.0, 1) AS size_mb
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY pg_total_relation_size(c.oid) DESC
    LIMIT 15
  `);
  console.log("=== TOP TABLES BY SIZE (MB) ===");
  for (const t of tables) {
    console.log(`${String(t.size_mb).padStart(8)} MB  ${t.relname}`);
  }

  try {
    const storage = await prisma.$queryRawUnsafe(`
      SELECT b.name AS bucket,
             COUNT(o.id)::bigint AS files,
             ROUND(COALESCE(SUM((o.metadata->>'size')::numeric), 0) / 1048576.0, 1) AS total_mb
      FROM storage.buckets b
      LEFT JOIN storage.objects o ON o.bucket_id = b.id
      GROUP BY b.name
      ORDER BY COALESCE(SUM((o.metadata->>'size')::numeric), 0) DESC
    `);
    console.log("=== STORAGE BUCKETS ===");
    for (const s of storage) {
      console.log(`${String(s.total_mb).padStart(8)} MB  ${String(s.files).padStart(6)} files  ${s.bucket}`);
    }
  } catch (e) {
    console.log("storage query failed:", e.message);
  }

  try {
    const oldLogs = await prisma.$queryRawUnsafe(`
      SELECT 'ApiUsageLog' AS m, COUNT(*)::int AS n FROM "ApiUsageLog" WHERE "createdAt" < now() - interval '30 days'
      UNION ALL
      SELECT 'Activity', COUNT(*)::int FROM "Activity" WHERE "createdAt" < now() - interval '90 days'
    `);
    console.log("=== CLEANUP CANDIDATES ===");
    for (const r of oldLogs) console.log(`${r.m}: ${r.n} old rows`);
  } catch (e) {
    console.log("count query failed:", e.message);
  }
}

main()
  .catch((e) => {
    console.error("DIAG FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
