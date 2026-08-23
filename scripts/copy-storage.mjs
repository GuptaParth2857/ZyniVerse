import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

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

const OLD_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const OLD_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL;
const NEW_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error("Usage: NEW_SUPABASE_URL=https://vwzkdjnmdztkdtnnrlfs.supabase.co NEW_SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/copy-storage.mjs");
  process.exit(1);
}

const oldSb = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } });
const newSb = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

async function copyBucket(name) {
  const { data: buckets } = await oldSb.storage.listBuckets();
  if (!buckets?.find((b) => b.name === name)) {
    console.log(`bucket ${name}: not on old project (skip)`);
    return;
  }
  const { error: mkErr } = await newSb.storage.createBucket(name, { public: true });
  if (mkErr && !mkErr.message?.includes("exists")) console.log(`createBucket ${name}:`, mkErr.message);

  const { data: objects, error } = await oldSb.storage.from(name).list("", { limit: 1000, sortBy: { column: "name" } });
  if (error) {
    console.log(`list ${name} failed:`, error.message);
    return;
  }
  let copied = 0;
  for (const obj of objects ?? []) {
    // top-level entries may be folders (null id) — recurse one level
    if (!obj.id && obj.name && !obj.name.includes(".")) {
      const { data: inner } = await oldSb.storage.from(name).list(obj.name, { limit: 1000 });
      for (const child of inner ?? []) {
        copied += await copyFile(name, `${obj.name}/${child.name}`);
      }
    } else {
      copied += await copyFile(name, obj.name);
    }
  }
  console.log(`bucket ${name}: ${copied} files copied`);
}

async function copyFile(bucket, path) {
  const { data: blob, error: dlErr } = await oldSb.storage.from(bucket).download(path);
  if (dlErr || !blob) {
    console.log(`  download failed ${path}:`, dlErr?.message);
    return 0;
  }
  const buf = Buffer.from(await blob.arrayBuffer());
  const contentType = blob.type || "application/octet-stream";
  const { error: upErr } = await newSb.storage.from(bucket).upload(path, buf, {
    contentType,
    cacheControl: "31536000",
    upsert: true,
  });
  if (upErr) {
    console.log(`  upload failed ${path}:`, upErr.message);
    return 0;
  }
  console.log(`  ✓ ${(buf.length / 1048576).toFixed(2)}MB ${bucket}/${path}`);
  return 1;
}

console.log("Copying storage buckets...");
await copyBucket("reels");
await copyBucket("profiles");
console.log("Done.");
