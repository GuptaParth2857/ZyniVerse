import { readFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "posters";

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function mimeOf(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  return MIME[`.${ext}`] || "image/jpeg";
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 50);
}

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
function argValue(name) {
  const i = args.indexOf(`--${name}`);
  return i > -1 && args[i + 1] ? args[i + 1] : null;
}

const VALID_TYPES = [
  "POSTER", "POSTER_COLLAB", "POSTER_NEWS", "POSTER_ANIME", "POSTER_OTHER",
  "COLLAB", "NEWS", "ANIME", "POST", "CRITIQUE",
];

if (args.includes("--help") || args.includes("-h")) {
  console.log(`ZyniVerse - bulk poster importer

Usage:
  node scripts/import-posters.mjs --manifest scripts/posters-manifest.example.json [--commit] [--owner <username>]

Options:
  --manifest <path>   Path to the manifest JSON (default: scripts/posters-manifest.example.json)
  --owner <username>  Override the account that will own the posters
  --commit            Actually upload images + create posts. Without it the script only prints the plan.
  --help              This help.

Manifest shape:
  {
    "username": "parthgupta",           // owner (or pass --owner)
    "posters": [
      { "image": "posters/collab.jpg",  // local file OR full http(s) URL
        "title": "Meet our collaborator @vort.exme",
        "type": "POSTER_COLLAB",        // POSTER | POSTER_COLLAB | POSTER_NEWS | POSTER_ANIME | POSTER_OTHER
        "content": "Longer description with keywords for SEO." }
    ]
  }

Local image files are uploaded to the Supabase/R2 "posters" storage; http(s) URLs are used as-is.
Run without --commit first to review the plan, then re-run with --commit to import.`);
  process.exit(0);
}

const manifestArg = argValue("manifest");
const manifestPath = isAbsolute(manifestArg || "")
  ? manifestArg
  : resolve(process.cwd(), manifestArg || "scripts/posters-manifest.example.json");
if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifestBase = dirname(manifestPath);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const COMMIT = args.includes("--commit");

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

function resolvePath(p) {
  return isAbsolute(p) ? p : resolve(manifestBase, p);
}

const isR2 = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE
);

let supabaseAdmin = null;
if (isR2) {
  console.log("Storage: R2 detected (using Cloudflare R2).");
} else {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("No R2 config and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_URL missing in .env");
    process.exit(1);
  }
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  console.log("Storage: Supabase detected (using 'posters' bucket).");
}

let r2Client = null;
if (isR2) {
  const { S3Client } = await import("@aws-sdk/client-s3");
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadToStorage(key, buffer, contentType) {
  if (isR2) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "max-age=31536000, immutable",
      })
    );
    const base = (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
    return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
  }

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
  return supabaseAdmin.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

const ownerUsername = argValue("owner") || manifest.username;
if (!ownerUsername) {
  console.error('No owner specified. Add "username" to the manifest or pass --owner <username>.');
  process.exit(1);
}
const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
if (!owner) {
  console.error(`User "${ownerUsername}" does not exist on ZyniVerse. Create the account first, then re-run.`);
  process.exit(1);
}
console.log(`Owner: ${ownerUsername} (${owner.id})`);

const posters = Array.isArray(manifest.posters) ? manifest.posters : [];
if (!posters.length) {
  console.error("Manifest has no posters.");
  process.exit(1);
}

const plan = [];
for (const [i, p] of posters.entries()) {
  const raw = typeof p.image === "string" ? p.image.trim() : "";
  const isRemote = /^https?:\/\//i.test(raw);
  const local = isRemote ? null : resolvePath(raw);
  const exists = !isRemote && raw ? existsSync(local) : p.type !== undefined;
  const size = !isRemote && exists ? readFileSync(local).length : null;
  const type = String(p.type || "POSTER").trim().toUpperCase();
  if (!VALID_TYPES.includes(type)) {
    console.error(`   ! item ${i + 1}: unknown type "${p.type}" (allowed: ${VALID_TYPES.join(", ")})`);
    process.exit(1);
  }
  plan.push({
    index: i + 1,
    imageRaw: raw,
    isRemote,
    local,
    exists: isRemote || (raw ? existsSync(local) : false),
    size,
    mime: isRemote ? null : mimeOf(raw),
    type,
    title: String(p.title || "").trim(),
    content: String(p.content || "").trim(),
  });
}

const badFiles = plan.filter((p) => !p.exists);
if (badFiles.length) {
  console.log("\nMissing image files (fix paths in the manifest):");
  for (const p of badFiles) console.log(`  ✗ ${p.local}`);
}

console.log(`\nPlan: ${plan.length - badFiles.length} posters -> owned by @${ownerUsername}`);
for (const p of plan) {
  if (!p.exists) continue;
  const src = p.isRemote ? p.imageRaw.slice(0, 80) : `${p.local.split(/[\\/]/).pop()} (${(p.size / 1048576).toFixed(2)}MB)`;
  console.log(
    `  ${p.index}. [${p.type}] ${p.title || "(no title)"}\n      ${src}\n      ${(p.content || "").split("\n")[0].slice(0, 110) || "(no content)"}`
  );
}

if (!COMMIT) {
  console.log(`\nDry-run complete. Re-run with --commit to upload images and save posts.`);
  await prisma.$disconnect();
  process.exit(badFiles.length ? 1 : 0);
}

if (badFiles.length) {
  console.error("\nAborting: fix the missing files above, then re-run with --commit.");
  await prisma.$disconnect();
  process.exit(1);
}

let ok = 0;
let failed = 0;

for (const p of plan) {
  try {
    let imageUrl = p.imageRaw;
    if (!p.isRemote) {
      const now = Date.now();
      const fileName = p.local.split(/[\\/]/).pop();
      const key = `${owner.id}/${now}-${String(p.index).padStart(3, "0")}-${safeName(fileName)}`;
      const buffer = readFileSync(p.local);
      imageUrl = await uploadToStorage(key, buffer, p.mime);
    }

    const post = await prisma.post.create({
      data: {
        userId: owner.id,
        type: p.type,
        title: p.title.slice(0, 300) || "Poster",
        content: p.content.slice(0, 20000),
        image: imageUrl,
      },
      select: { id: true },
    });

    ok++;
    console.log(`  ✓ poster ${p.index} -> /posts/${post.id}\n      ${imageUrl}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ poster ${p.index} failed: ${e.message}`);
  }
}

console.log(`\nDone: ${ok} imported, ${failed} failed.`);
await prisma.$disconnect();
process.exit(failed ? 1 : 0);