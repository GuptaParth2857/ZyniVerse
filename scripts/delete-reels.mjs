import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

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

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith("--"));
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("missing SUPABASE env");
  process.exit(1);
}
const COMMIT = args.includes("--commit");

export const supAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const reels = await prisma.reel.findMany({
  where: { id: { in: ids.length ? ids : [] } },
  select: { id: true, videoUrl: true, thumbnailUrl: true, userId: true, caption: true },
});

if (ids.length === 0 || reels.length === 0) {
  console.log("No reels matched. Pass reel ids.");
  await prisma.$disconnect();
  process.exit(1);
}

for (const r of reels) {
  console.log(`- ${r.id}  ${(r.caption || "").slice(0, 60)}`);
  console.log(`    video: ${r.videoUrl}`);
  if (r.thumbnailUrl) console.log(`    thumb: ${r.thumbnailUrl}`);
}

const bucket = "reels";
const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;

const toKey = (url, bucketName) => {
  const u = new URL(url);
  if (u.host !== host) return null;
  const m = u.pathname.match(new RegExp(`/storage/v1/object/public/${bucketName}/(.+)`));
  return m ? decodeURIComponent(m[1]) : null;
};

const objects = [];
for (const r of reels) {
  for (const url of [r.videoUrl, r.thumbnailUrl]) {
    if (!url) continue;
    const k = toKey(url, bucket);
    if (k) objects.push(k);
  }
}

if (!COMMIT) {
  console.log(`\nWill delete ${reels.length} reel(s) + ${objects.length} storage object(s). Re-run with --commit.`);
  await prisma.$disconnect();
  process.exit(0);
}

let storageErrors = 0;
if (objects.length) {
  const { error } = await supAdmin.storage.from(bucket).remove(objects);
  if (error) {
    storageErrors++;
    console.error(`storage remove: ${error.message}`);
  } else {
    console.log(`storage: removed ${objects.length} object(s)`);
  }
}

await prisma.reel.deleteMany({ where: { id: { in: reels.map((r) => r.id) } } });
console.log(`deleted ${reels.length} reel row(s)`);
await prisma.$disconnect();
process.exit(storageErrors ? 1 : 0);