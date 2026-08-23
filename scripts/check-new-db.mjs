import pg from "pg";
const c = new pg.Client({
  connectionString: "postgresql://postgres.vwzkdjnmdztkdtnnrlfs:8447304702Pg@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const t = await c.query(
  "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY 1,2"
);
console.log(JSON.stringify(t.rows));
const s = await c.query("SHOW search_path");
console.log("search_path:", s.rows[0].search_path);
const m = await c.query('SELECT migration_name, finished_at FROM "_prisma_migrations"');
console.log("migrations:", JSON.stringify(m.rows));
await c.end();
