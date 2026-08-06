import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  try {
    const text = readFileSync(join(root, file), "utf8");
    const out = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

const env = { ...loadEnv(".env"), ...loadEnv(".env.local"), ...process.env };
const argBase = process.argv.find((a) => a.startsWith("--base="))?.slice(7);
const base = (argBase || env.POSTERS_SYNC_URL || "http://localhost:3000").replace(/\/+$/, "");
const secret = env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is not set in .env — add it and re-run.");
  process.exit(1);
}

const url = `${base}/api/cron/refresh-posters`;
console.log(`Syncing live-action posters (free Wikimedia source) via ${url}`);

const res = await fetch(url, { headers: { authorization: `Bearer ${secret}` } });
const body = await res.json();

if (!res.ok) {
  console.error(`Sync failed (${res.status}):`, JSON.stringify(body, null, 2));
  process.exit(1);
}

for (const row of body.results || []) {
  const status = row.matched ? `OK  ${row.page ?? ""}${row.url ? "  (poster)" : "  (no poster yet)"}` : "MISS";
  console.log(`  ${status.padEnd(48)} ${row.entryId}`);
}
if (body.errors?.length) {
  console.error("Errors:", body.errors);
}
console.log(`Done — ${body.matched ?? 0}/${body.checked ?? 0} entries resolved.`);
