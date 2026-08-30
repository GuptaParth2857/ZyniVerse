import { readFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const MAX_SIZE = 50 * 1024 * 1024;
const MAX_DURATION = 180;
const BUCKET = "reels";

const MIME = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function mimeOf(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  return MIME[`.${ext}`] || "application/octet-stream";
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

if (args.includes("--help") || args.includes("-h")) {
  console.log(`ZyniVerse - bulk reel importer

Usage:
  node scripts/import-reels.mjs --manifest scripts/reels-manifest.example.json [--commit] [--owner <username>]

Options:
  --manifest <path>   Path to the manifest JSON (default: scripts/reels-manifest.example.json)
  --owner <username>  Override the account that will own the reels (from manifest "username" otherwise)
  --commit            Actually upload files + create reel rows. Without it the script only prints the plan.
  --help              This help.

Manifest shape:
  {
    "username": "vortexme",                 // required unless --owner or "userId"
    "userId": "ck...",                      // optional alternative to username
    "credit": "@vort.exme · reposted with permission",  // optional footer appended to every caption
    "reels": [
      { "video": "reels/001.mp4", "thumbnail": "reels/001.jpg", "caption": "...", "duration": 45 }
    ]
  }

Video files MUST be local files (Instagram cannot be pulled directly). Paths are relative to the
manifest file's folder. "thumbnail" may also be a full http(s) URL, which is used as-is.
Run without --commit first to review the plan, then re-run with --commit to import.`);
  process.exit(0);
}

const manifestArg = argValue("manifest");
const manifestPath = isAbsolute(manifestArg || "")
  ? manifestArg
  : resolve(process.cwd(), manifestArg || "scripts/reels-manifest.example.json");
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
  console.log("Storage: Supabase detected (using 'reels' bucket).");
}

const ownerUsername = argValue("owner") || manifest.username;
let ownerId = manifest.userId || null;
if (!ownerId) {
  if (!ownerUsername) {
    console.error('No owner specified. Add "username" (or "userId") to the manifest or pass --owner <username>.');
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { username: ownerUsername } });
  if (!user) {
    console.error(`User "${ownerUsername}" does not exist on ZyniVerse. Create the account first, then re-run.`);
    process.exit(1);
  }
  ownerId = user.id;
  console.log(`Owner: ${ownerUsername} (${ownerId})`);
}

const reels = Array.isArray(manifest.reels) ? manifest.reels : [];
if (!reels.length) {
  console.error("Manifest has no reels.");
  process.exit(1);
}
const credit = typeof manifest.credit === "string" && manifest.credit.trim() ? manifest.credit.trim() : null;

const plan = [];
for (const [i, reel] of reels.entries()) {
  const videoPath = resolvePath(reel.video);
  const exists = typeof reel.video === "string" && existsSync(videoPath);
  const size = exists ? readFileSync(videoPath).length : null;
  const caption = String(reel.caption || "").trim() || null;
  const withCredit =
    credit && (!caption || !caption.includes(credit))
      ? `${caption ? `${caption}\n\n` : ""}${credit}`
      : caption;
  plan.push({
    index: i + 1,
    videoPath,
    exists,
    size,
    overLimit: size !== null && size > MAX_SIZE,
    mime: mimeOf(reel.video || ""),
    duration: Math.max(0, Math.min(MAX_DURATION, parseInt(reel.duration, 10) || 0)),
    caption: (withCredit || "").slice(0, 500),
    thumbnailRaw: reel.thumbnail || null,
  });
}

const badFiles = plan.filter((p) => !p.exists);
if (badFiles.length) {
  console.log("\nMissing video files (skip in manifest or fix paths):");
  for (const p of badFiles) console.log(`  ✗ ${p.videoPath}`);
}

console.log(`\nPlan: ${plan.length - badFiles.length} reels -> owned by ${ownerInput()}`);
for (const p of plan) {
  if (!p.exists) continue;
  const flag = p.overLimit ? "  [WARN >50MB, site blocks 50MB+ in upload UI]" : "";
  console.log(
    `  ${p.index}. ${p.videoPath.split(/[\\/]/).pop()} (${(p.size / 1048576).toFixed(2)}MB, ${p.duration}s, ${p.mime})${flag}` +
      (p.caption ? `\n      caption: ${p.caption.split("\n")[0].slice(0, 90)}` : "")
  );
}

function ownerInput() {
  return ownerUsername ? `@${ownerUsername}` : `userId ${ownerId}`;
}

if (!COMMIT) {
  console.log(`\nDry-run complete. Re-run with --commit to upload files and save reels.`);
  await prisma.$disconnect();
  process.exit(badFiles.length ? 1 : 0);
}

if (badFiles.length) {
  console.error("\nAborting: fix the missing files above, then re-run with --commit.");
  await prisma.$disconnect();
  process.exit(1);
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

let ok = 0;
let failed = 0;

for (const p of plan) {
  try {
    const now = Date.now();
    const fileName = p.videoPath.split(/[\\/]/).pop();
    const ext = (fileName.split(".").pop() || "mp4").slice(0, 10);
    const videoKey = `${ownerId}/${now}-${String(p.index).padStart(3, "0")}-${safeName(fileName)}.${ext}`;
    const videoBuffer = readFileSync(p.videoPath);
    const videoUrl = await uploadToStorage(videoKey, videoBuffer, p.mime);

    let thumbnailUrl = null;
    if (typeof p.thumbnailRaw === "string" && p.thumbnailRaw.trim()) {
      if (/^https?:\/\//.test(p.thumbnailRaw.trim())) {
        thumbnailUrl = p.thumbnailRaw.trim();
      } else {
        const thumbPath = resolvePath(p.thumbnailRaw);
        if (existsSync(thumbPath)) {
          const thumbBuffer = readFileSync(thumbPath);
          const thumbKey = `${ownerId}/${now}-${String(p.index).padStart(3, "0")}-thumb.jpg`;
          thumbnailUrl = await uploadToStorage(thumbKey, thumbBuffer, mimeOf(p.thumbnailRaw));
        } else {
          console.log(`  ! thumbnail not found, skipping: ${thumbPath}`);
        }
      }
    }

    const reel = await prisma.reel.create({
      data: {
        userId: ownerId,
        videoUrl,
        thumbnailUrl,
        caption: p.caption,
        duration: p.duration,
      },
      select: { id: true },
    });

    ok++;
    console.log(`  ✓ reel ${p.index} -> ${reel.id}\n      ${videoUrl}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ reel ${p.index} failed: ${e.message}`);
  }
}

console.log(`\nDone: ${ok} imported, ${failed} failed.`);
await prisma.$disconnect();
process.exit(failed ? 1 : 0);