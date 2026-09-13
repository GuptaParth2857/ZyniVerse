import { readFileSync } from "node:fs";

const BUCKETS_REQUIRED_PUBLIC = ["reels", "profiles"];

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
  console.log(`ZyniVerse - restore user media + reels from the OLD Supabase project to the current storage

Copies every avatar / banner / reel video / reel thumbnail that still points at the OLD project's
public storage, uploads it to the CURRENT project, and rewrites the DB URLs. (Small files only —
this never touches bulk poster archives.)

Usage:
  node scripts/restore-media.mjs [--old-key <service_role>] [--commit] [--include reels,profiles]

  --old-url <url>   Old Supabase URL (default: derived from stored media URLs; usually not needed)
  --source-url <url> Alternative Supabase URL that SERVES the files right now (e.g.
                    https://qpcafkrtnlokzshrmsnf.supabase.co). Files are downloaded from here.
                    Use this instead of --old-key when the original storage is restricted.
  --old-key <key>   OLD project service-role key. When provided, files are downloaded via the
                    storage API; otherwise the public URL is fetched (fine once the project is
                    un-restricted).
  --commit          Actually download/upload/rewrite. Without it only the plan is printed.
  --include <list>  Buckets to process: reels,profiles (default: all found buckets)
  --help            This help.

Prerequisite: the OLD project must serve its files again (no more HTTP 402).
`);
  process.exit(0);
}

const oldKey = argValue("old-key");
const sourceUrl = argValue("source-url");
const COMMIT = args.includes("--commit");
const include = argValue("include") ? new Set(argValue("include").split(",").map((s) => s.trim())) : null;

const newUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const newKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!newUrl || !newKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env");
  process.exit(1);
}
const newRef = new URL(newUrl).hostname.split(".")[0];

let oldClient = null;
if (oldKey) {
  const { createClient } = await import("@supabase/supabase-js");
  const oldUrl = argValue("old-url") || `https://vwzkdjnmdztkdtnnrlfs.supabase.co`;
  oldClient = createClient(oldUrl, oldKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const { createClient } = await import("@supabase/supabase-js");
const newClient = createClient(newUrl, newKey, { auth: { autoRefreshToken: false, persistSession: false } });

function parseObject(url) {
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

const [users, reels] = await Promise.all([
  prisma.user.findMany({ select: { id: true, username: true, avatar: true, banner: true } }),
  prisma.reel.findMany({ select: { id: true, videoUrl: true, thumbnailUrl: true } }),
]);

const jobs = [];
for (const u of users) {
  if (u.avatar && u.avatar.includes(`${newRef}.supabase.co`) === false && parseObject(u.avatar)) {
    const o = parseObject(u.avatar);
    jobs.push({ kind: "user", userId: u.id, label: u.username, field: "avatar", bucket: o.bucket, path: o.path, url: u.avatar });
  }
  if (u.banner && u.banner.includes(`${newRef}.supabase.co`) === false && parseObject(u.banner)) {
    const o = parseObject(u.banner);
    jobs.push({ kind: "user", userId: u.id, label: u.username, field: "banner", bucket: o.bucket, path: o.path, url: u.banner });
  }
}
for (const r of reels) {
  if (r.videoUrl && r.videoUrl.includes(`${newRef}.supabase.co`) === false && parseObject(r.videoUrl)) {
    const o = parseObject(r.videoUrl);
    jobs.push({ kind: "reel", userId: r.id, label: r.id, field: "videoUrl", bucket: o.bucket, path: o.path, url: r.videoUrl });
  }
  if (r.thumbnailUrl && r.thumbnailUrl.includes(`${newRef}.supabase.co`) === false && parseObject(r.thumbnailUrl)) {
    const o = parseObject(r.thumbnailUrl);
    jobs.push({ kind: "reel", userId: r.id, label: r.id, field: "thumbnailUrl", bucket: o.bucket, path: o.path, url: r.thumbnailUrl });
  }
}

const filtered = jobs.filter((j) => !include || include.has(j.bucket));
console.log(`Plan: ${filtered.length} object(s) to copy.` + (COMMIT ? "" : " (dry-run; re-run with --commit)"));
for (const j of filtered) {
  console.log(`  ${j.kind} ${j.label} [${j.field}] bucket=${j.bucket} path=${j.path}`);
}

if (!COMMIT) {
  await prisma.$disconnect();
  process.exit(0);
}

for (const b of BUCKETS_REQUIRED_PUBLIC) {
  await newClient.storage.createBucket(b, { public: true }).catch(() => {});
}

let ok = 0, failed = 0;
for (const j of filtered) {
  try {
    let blob;
    let downloadUrl = j.url;
    if (sourceUrl) {
      const fromUrl = new URL(j.url);
      const src = new URL(sourceUrl.endsWith("/") ? sourceUrl : `${sourceUrl}/`);
      downloadUrl = `${src.href.replace(/\/+$/, "")}${fromUrl.pathname}`;
    }
    if (oldClient) {
      const { data, error } = await oldClient.storage.from(j.bucket).download(j.path);
      if (error || !data) throw new Error(`old download: ${error?.message || "no data"}`);
      blob = data;
    } else {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`fetch ${downloadUrl} -> ${res.status}`);
      blob = await res.blob();
    }
    const name = j.path.split("/").pop() || "file";
    const ext = (name.split(".").pop() || "jpg").toLowerCase();
    const contentType = ["mp4", "webm", "mov"].includes(ext) ? (ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4") : (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
    const { error: upErr } = await newClient.storage.from(j.bucket).upload(j.path, blob, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (upErr) throw new Error(`upload: ${upErr.message}`);
    const newUrlValue = newClient.storage.from(j.bucket).getPublicUrl(j.path).data.publicUrl;

    if (j.kind === "user") {
      await prisma.user.update({ where: { id: j.userId }, data: { [j.field]: newUrlValue } });
    } else {
      await prisma.reel.update({ where: { id: j.userId }, data: { [j.field]: newUrlValue } });
    }
    ok++;
    console.log(`  ✓ ${j.kind} ${j.label} [${j.field}] -> ${newUrlValue}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${j.kind} ${j.label} [${j.field}]: ${e.message}`);
  }
}

console.log(`\nDone: ${ok} copied, ${failed} failed.`);
await prisma.$disconnect();
process.exit(failed ? 1 : 0);