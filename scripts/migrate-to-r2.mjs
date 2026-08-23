import { readFileSync } from "fs";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {}
}
loadEnv();

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE"];
for (const v of required) {
  if (!process.env[v]) {
    console.error(`Missing env ${v} — add it to .env.local first.`);
    process.exit(1);
  }
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const prisma = new PrismaClient();

function keyFromUrl(url) {
  const marker = "/storage/v1/object/public/reels/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function copy(url, contentTypeHint) {
  const key = keyFromUrl(url);
  if (!key) {
    console.log(`  SKIP (not a supabase reel url): ${url.slice(0, 70)}`);
    return false;
  }
  if (await exists(key)) {
    console.log(`  EXISTS in R2: ${key}`);
    return false;
  }
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`  FETCH FAILED (${res.status}): ${key}`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: res.headers.get("content-type") || contentTypeHint,
      CacheControl: "max-age=31536000, immutable",
    })
  );
  console.log(`  COPIED ${(buf.length / 1048576).toFixed(1)}MB -> ${key}`);
  return true;
}

async function main() {
  const reels = await prisma.reel.findMany({
    select: { id: true, videoUrl: true, thumbnailUrl: true },
  });
  console.log(`Found ${reels.length} reels in DB`);

  let copied = 0;
  for (const r of reels) {
    console.log(`Reel #${r.id}:`);
    if (r.videoUrl && (await copy(r.videoUrl, "video/mp4"))) copied++;
    if (r.thumbnailUrl && (await copy(r.thumbnailUrl, "image/jpeg"))) copied++;
  }
  console.log(`\nDone. ${copied} new objects uploaded to R2 bucket "${process.env.R2_BUCKET}".`);
  console.log("NOTE: DB rows intentionally keep old Supabase URLs — they keep working.");
}

main()
  .catch((e) => {
    console.error("MIGRATION FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
