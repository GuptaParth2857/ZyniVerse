import { readFileSync } from "node:fs";

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
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

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(`--${name}`);
  return i > -1 && args[i + 1] ? args[i + 1] : null;
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`ZyniVerse - import historical analytics (PageView/UserSession/etc) from the OLD Supabase DB

Usage:
  node scripts/import-analytics.mjs --old-url postgresql://... [--old-url-direct postgresql://...] [--commit] [--chunk 2000]

Options:
  --old-url            Old project's DB connection string (pooler ok)
  --old-url-direct     Optional direct connection for migrations-style access
  --tables <names>     Comma list: pageView,userSession,searchLog,retentionMetric,userActivity (default: all)
  --commit             Actually write to the NEW DB. Without it only counts are printed.
  --chunk <n>          Batch size for inserts (default 2000)
  --help               This help.
`);
  process.exit(0);
}

const oldUrl = argValue("old-url");
const oldUrlDirect = argValue("old-url-direct");
const COMMIT = args.includes("--commit");
const CHUNK = Math.max(100, parseInt(argValue("chunk") || "2000", 10) || 2000);

const requested = argValue("tables")
  ? new Set(argValue("tables").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
  : new Set(["pageview", "usersession", "searchlog", "retentionmetric", "useractivity"]);

if (!oldUrl) {
  console.error("Missing --old-url (OLD project's DB connection string).");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL (NEW project) not set. Expected in .env.");
  process.exit(1);
}

const { PrismaClient } = await import("@prisma/client");
const oldClient = new PrismaClient({ datasourceUrl: oldUrlDirect || oldUrl });
const newClient = new PrismaClient();

const BATCH_SIZE = 2000;

function chunks(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i += BATCH_SIZE) out.push(arr.slice(i, i + BATCH_SIZE));
  return out;
}

async function copyTable(name, fetchRows, insertRows) {
  if (!requested.has(name.toLowerCase())) return;
  const rows = await fetchRows();
  console.log(`\n[${name}] old rows: ${rows.length}`);
  if (!COMMIT) return;
  let ok = 0, failed = 0;
  for (const batch of chunks(rows)) {
    try {
      await insertRows(batch);
      ok += batch.length;
    } catch (e) {
      failed += batch.length;
      console.error(`  ! ${name} batch failed: ${e.message}`);
    }
  }
  console.log(`[${name}] wrote ${ok}, failed ${failed}.`);
}

await copyTable(
  "PageView",
  async () => {
    const rows = await oldClient.pageView.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({
      id: r.id, userId: r.userId, sessionId: r.sessionId, path: r.path,
      referrer: r.referrer, duration: r.duration, userAgent: r.userAgent,
      country: r.country, createdAt: r.createdAt,
    }));
  },
  (batch) =>
    newClient.pageView.createMany({ data: batch, skipDuplicates: true })
);

await copyTable(
  "UserSession",
  async () => {
    const rows = await oldClient.userSession.findMany({ orderBy: { startedAt: "asc" } });
    return rows.map((r) => ({
      id: r.id, userId: r.userId, sessionId: r.sessionId,
      startedAt: r.startedAt, lastActiveAt: r.lastActiveAt,
      device: r.device, browser: r.browser, os: r.os, country: r.country,
      pagesViewed: r.pagesViewed, isActive: r.isActive,
    }));
  },
  (batch) =>
    newClient.userSession.createMany({ data: batch, skipDuplicates: true })
);

await copyTable(
  "SearchLog",
  async () => {
    const rows = await oldClient.searchLog.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({ id: r.id, userId: r.userId, query: r.query, source: r.source, resultsCount: r.resultsCount, createdAt: r.createdAt }));
  },
  (batch) =>
    newClient.searchLog.createMany({ data: batch, skipDuplicates: true })
);

await copyTable(
  "RetentionMetric",
  async () => {
    const rows = await oldClient.retentionMetric.findMany({ orderBy: { date: "asc" } });
    return rows.map((r) => ({ id: r.id, date: r.date, dau: r.dau, wau: r.wau, mau: r.mau, newUsers: r.newUsers, returningUsers: r.returningUsers, avgSessionMinutes: r.avgSessionMinutes, avgPagesPerSession: r.avgPagesPerSession }));
  },
  async (batch) => {
    for (const row of batch) {
      await newClient.retentionMetric.upsert({
        where: { date: row.date },
        update: { dau: row.dau, wau: row.wau, mau: row.mau, newUsers: row.newUsers, returningUsers: row.returningUsers, avgSessionMinutes: row.avgSessionMinutes, avgPagesPerSession: row.avgPagesPerSession },
        create: { id: row.id, date: row.date, dau: row.dau, wau: row.wau, mau: row.mau, newUsers: row.newUsers, returningUsers: row.returningUsers, avgSessionMinutes: row.avgSessionMinutes, avgPagesPerSession: row.avgPagesPerSession },
      });
    }
  }
);

await copyTable(
  "UserActivity",
  async () => {
    const rows = await oldClient.userActivity.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({ id: r.id, userId: r.userId, action: r.action, targetType: r.targetType, targetId: r.targetId, query: r.query, metadata: r.metadata, createdAt: r.createdAt }));
  },
  (batch) =>
    newClient.userActivity.createMany({ data: batch, skipDuplicates: true })
);

if (COMMIT) {
  const [pv, us] = await Promise.all([
    newClient.pageView.count(),
    newClient.userSession.count(),
  ]);
  console.log(`\nNew DB totals after import: PageView=${pv}, UserSession=${us}.`);
}

await oldClient.$disconnect();
await newClient.$disconnect();
if (!COMMIT) console.log("\nDry-run complete. Re-run with --commit to write to the NEW DB.");