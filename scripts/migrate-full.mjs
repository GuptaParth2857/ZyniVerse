import { readFileSync } from "fs";
import { execSync } from "child_process";
import pg from "pg";

function loadEnv() {
  for (const f of [".env", ".env.local"]) {
    try {
      const raw = readFileSync(f, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
      }
    } catch {}
  }
}
loadEnv();

const NEW_DB_URL = process.env.NEW_DB_URL;
if (!NEW_DB_URL) {
  console.error("Usage: NEW_DB_URL=\"postgresql://postgres.vwzkdjnmdztkdtnnrlfs:PASS@aws-1-ap-south-1.pooler.supabase.com:5432/postgres\" node scripts/migrate-full.mjs");
  process.exit(1);
}

// Old DB: convert transaction pooler URL to session pooler
let OLD_DB_URL = process.env.DATABASE_URL;
OLD_DB_URL = OLD_DB_URL.replace(":6543", ":5432")
  .replace("&pgbouncer=true", "")
  .replace("&connection_limit=5", "")
  .replace("&pool_timeout=20", "");

const OLD_REF = "qpcafkrtnlokzshrmsnf.supabase.co";
const NEW_REF = "vwzkdjnmdztkdtnnrlfs.supabase.co";

const AUTH_TABLES = [
  "auth.mfa_amr_claims",
  "auth.mfa_factors",
  "auth.mfa_web_authn_credentials",
  "auth.one_time_tokens",
  "auth.identities",
  "auth.users",
];

const SKIP_PUBLIC = new Set(["_prisma_migrations"]);

function q(ident) {
  return `"${ident}"`;
}

async function main() {
  const SSL = { rejectUnauthorized: false };
  const sanitize = (u) => u.replace(/[?&]sslmode=[^&]*/g, "");
  const oldDb = new pg.Client({ connectionString: sanitize(OLD_DB_URL), ssl: SSL });
  const newDb = new pg.Client({ connectionString: sanitize(NEW_DB_URL), ssl: SSL });
  await oldDb.connect();
  await newDb.connect();
  console.log("✓ Connected to both databases");

  // 1. Create schema on NEW via prisma db push (matches CURRENT schema incl. later-added tables)
  console.log("\n[1/5] Creating schema on new project (prisma db push)...");
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: NEW_DB_URL, DIRECT_URL: NEW_DB_URL },
  });

  // 2. Copy auth users FIRST (so public.User references resolve)
  console.log("\n[2/5] Copying auth tables...");
  const { rows: existingAuth } = await newDb.query(
    `SELECT schemaname||'.'||tablename AS t FROM pg_tables WHERE schemaname='auth'`
  );
  const authExisting = new Set(existingAuth.map((r) => r.t));
  for (const table of [...AUTH_TABLES].reverse()) {
    if (!authExisting.has(table)) {
      console.log(`  ${table}: not present on new (skip)`);
      continue;
    }
    try {
      const { rows } = await oldDb.query(`SELECT * FROM ${table}`);
      if (rows.length === 0) {
        console.log(`  ${table}: 0 rows (skip)`);
        continue;
      }
      const cols = Object.keys(rows[0]);
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 200) {
        const batch = rows.slice(i, i + 200);
        const values = [];
        const params = [];
        let p = 1;
        batch.forEach((row) => {
          values.push(`(${cols.map((c) => `$${p++}`).join(",")})`);
          cols.forEach((c) => params.push(row[c] === undefined ? null : row[c]));
        });
        await newDb.query(
          `INSERT INTO ${table} (${cols.map(q).join(",")}) VALUES ${values.join(",")} ON CONFLICT DO NOTHING`,
          params
        );
        inserted += batch.length;
      }
      console.log(`  ${table}: ${inserted} rows copied`);
    } catch (e) {
      console.log(`  ${table}: ERROR ${e.message.slice(0, 80)} (skip)`);
    }
  }

  // 3. Disable triggers on public tables (FK-free bulk copy), then copy data
  console.log("\n[3/5] Copying public schema data...");
  const { rows: pubTables } = await oldDb.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  );
  for (const { tablename } of pubTables) {
    if (SKIP_PUBLIC.has(tablename)) continue;
    await newDb.query(`ALTER TABLE public.${q(tablename)} DISABLE TRIGGER ALL`);
  }

  const summary = [];
  // column type map per table (arrays + json need casts)
  const { rows: colTypes } = await newDb.query(`
    SELECT table_name, column_name, udt_name
    FROM information_schema.columns
    WHERE table_schema='public'
  `);
  const typeMap = {};
  for (const r of colTypes) {
    typeMap[`${r.table_name}.${r.column_name}`] = r.udt_name;
  }
  for (const { tablename } of pubTables) {
    if (SKIP_PUBLIC.has(tablename)) continue;
    const { rows } = await oldDb.query(`SELECT * FROM public.${q(tablename)}`);
    if (rows.length === 0) {
      summary.push([tablename, 0]);
      continue;
    }
    const cols = Object.keys(rows[0]);
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const values = [];
      const params = [];
      let p = 1;
      batch.forEach((row) => {
        values.push(`(${cols.map((c) => {
          const udt = typeMap[`${tablename}.${c}`];
          let cast = "";
          if (udt && udt.startsWith("_")) cast = `::${udt.slice(1)}[]`;
          else if (udt === "json" || udt === "jsonb") cast = `::${udt}`;
          return `$${p++}${cast}`;
        }).join(",")})`);
        cols.forEach((c) => {
          let v = row[c];
          const udt = typeMap[`${tablename}.${c}`];
          if ((udt === "json" || udt === "jsonb") && v !== null && v !== undefined && typeof v !== "string") {
            v = JSON.stringify(v);
          }
          params.push(v === undefined ? null : v);
        });
      });
      await newDb.query(
        `INSERT INTO public.${q(tablename)} (${cols.map(q).join(",")}) VALUES ${values.join(",")} ON CONFLICT DO NOTHING`,
        params
      );
    }
    summary.push([tablename, rows.length]);
    console.log(`  public.${tablename}: ${rows.length} rows`);
  }

  // Re-enable triggers + reset sequences
  for (const { tablename } of pubTables) {
    if (SKIP_PUBLIC.has(tablename)) continue;
    await newDb.query(`ALTER TABLE public.${q(tablename)} ENABLE TRIGGER ALL`);
  }
  // Reset sequences (serial/autoincrement ids)
  const { rows: seqs } = await newDb.query(`
    SELECT s.sequencename, c.table_name, c.column_name
    FROM pg_sequences s
    JOIN information_schema.columns c
      ON c.column_default LIKE '%' || s.sequencename || '%'
    WHERE s.schemaname='public'
  `);
  for (const { sequencename, table_name, column_name } of seqs) {
    try {
      await newDb.query(
        `SELECT setval('${sequencename}', COALESCE((SELECT MAX(${q(column_name)}) FROM public.${q(table_name)}), 1))`
      );
    } catch {}
  }

  // 4. Replace old project ref URLs everywhere
  console.log("\n[4/5] Rewriting storage URLs...");
  const { rows: colsToFix } = await newDb.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema='public'
      AND (data_type IN ('text', 'jsonb') OR (data_type='character varying' AND character_maximum_length > 100))
  `);
  let fixedCols = 0;
  for (const { table_name, column_name, data_type } of colsToFix) {
    if (SKIP_PUBLIC.has(table_name)) continue;
    try {
      const cast = data_type === "jsonb" ? "::text" : "";
      const back = data_type === "jsonb" ? "::jsonb" : "";
      const res = await newDb.query(
        `UPDATE public.${q(table_name)} SET ${q(column_name)} = REPLACE(${q(column_name)}${cast}, '${OLD_REF}', '${NEW_REF}')${back}
         WHERE (${q(column_name)}${cast} || '') LIKE '%${OLD_REF}%'`
      );
      if (res.rowCount > 0) {
        console.log(`  ${table_name}.${column_name}: ${res.rowCount} rows updated`);
        fixedCols++;
      }
    } catch {}
  }
  console.log(`  (${fixedCols} columns had old URLs)`);

  // 5. Verify counts
  console.log("\n[5/5] Verification (old -> new):");
  for (const { tablename } of pubTables) {
    if (SKIP_PUBLIC.has(tablename)) continue;
    const o = await oldDb.query(`SELECT COUNT(*)::int AS n FROM public.${q(tablename)}`);
    const n = await newDb.query(`SELECT COUNT(*)::int AS n FROM public.${q(tablename)}`);
    const match = o.rows[0].n === n.rows[0].n ? "✓" : "✗ MISMATCH";
    if (o.rows[0].n > 0 || n.rows[0].n > 0) {
      console.log(`  ${match} ${tablename}: ${o.rows[0].n} -> ${n.rows[0].n}`);
    }
  }
  const au = await newDb.query("SELECT COUNT(*)::int AS n FROM auth.users");
  console.log(`  ✓ auth.users on new: ${au.rows[0].n}`);

  await oldDb.end();
  await newDb.end();
  console.log("\n🎉 Migration complete! Next: copy storage files (copy-storage.mjs)");
}

main().catch((e) => {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
});
