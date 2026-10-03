#!/usr/bin/env node
// Pre-upload smoke test for a built release APK.
//
// Catches the failure mode that shipped a blank-icon, instant-crash build: a
// release bundle whose root module never calls `registerRootComponent`, so
// `AppRegistry` never learns about "main" and React Native throws
//   Invariant Violation: "main" has not been registered
// the instant the activity starts.
//
// This cannot be caught by `tsc`, by Gradle, or by looking at the build output:
// Metro bundles fine either way, and `expo start` hides the problem because it
// wraps the entry for you. Only the shipped artifact reveals it.
//
// Usage:  node scripts/verify-apk.js [path/to.apk]
// Exit code 0 = safe to upload, 1 = do not upload.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const APK =
  process.argv[2] ||
  path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(APK)) {
  fail(`APK not found: ${APK}`);
}

// --- minimal ZIP reader (central directory walk) ---------------------------
function readZipEntry(buf, wantedName) {
  // Locate the end-of-central-directory record.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 22 - 0xffff; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('not a zip file (no end-of-central-directory record)');

  const entryCount = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  for (let i = 0; i < entryCount; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('corrupt central directory');
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);

    if (name === wantedName) {
      if (buf.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('corrupt local header');
      const lNameLen = buf.readUInt16LE(localOffset + 26);
      const lExtraLen = buf.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + compressedSize);
      if (method === 0) return raw;
      if (method === 8) return zlib.inflateRawSync(raw);
      throw new Error(`unsupported compression method ${method}`);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

// --- checks ----------------------------------------------------------------
const apkb = fs.readFileSync(APK);
const sizeMB = (apkb.length / 1024 / 1024).toFixed(2);
console.log(`APK   ${APK}`);
console.log(`size  ${sizeMB} MB\n`);

let bundle;
try {
  bundle = readZipEntry(apkb, 'assets/index.android.bundle');
} catch (err) {
  fail(`could not read assets/index.android.bundle: ${err.message}`);
}

if (!bundle) fail('assets/index.android.bundle is missing — this APK ships no JS at all');

console.log(`bundle ${(bundle.length / 1024).toFixed(1)} KB`);

// Hermes stores its magic 0x1F1903C103BC1FC6 little-endian, i.e. the byte
// sequence c6 1f bc 03 c1 03 19 1f.
if (bundle.length >= 8 && bundle.readUInt32LE(4) === 0x1f1903c1) {
  console.log('format Hermes bytecode');
} else {
  console.log('format plain JavaScript');
}

// The string table of a Hermes bundle (and the body of a plain bundle) keeps
// identifier names, so a missing `registerRootComponent` is conclusive.
const hasRegister = bundle.includes(Buffer.from('registerRootComponent', 'utf8'));
console.log(`registerRootComponent ${hasRegister ? 'present' : 'ABSENT'}`);

if (!hasRegister) {
  fail(
    'the bundle never calls registerRootComponent, so the app will crash on\n' +
      '      launch with: Invariant Violation: "main" has not been registered\n' +
      '      Fix: keep package.json "main" pointing at index.js (not App.tsx).'
  );
}

console.log('\nPASS  safe to upload');

// --- size breakdown --------------------------------------------------------
// Useful when the APK unexpectedly grows: shows where the weight actually is
// instead of guessing. Grouped the way Android lays the APK out.
const GROUPS = [
  [/^lib\/([^/]+)\//, 'lib/$1'],
  [/^classes\d*\.dex$/, 'dex'],
  [/^assets\/index\.android\.bundle$/, 'JS bundle'],
  [/^res\//, 'res'],
];

function groupOf(name) {
  for (const [re, label] of GROUPS) {
    if (re.test(name)) return label.replace('$1', re.exec(name)[1]);
  }
  return 'other';
}

let eocd = -1;
for (let i = apkb.length - 22; i >= 0; i--) {
  if (apkb.readUInt32LE(i) === 0x06054b50) {
    eocd = i;
    break;
  }
}

const entryCount = apkb.readUInt16LE(eocd + 10);
const byGroup = new Map();
let p = apkb.readUInt32LE(eocd + 16);

for (let i = 0; i < entryCount; i++) {
  const nameLen = apkb.readUInt16LE(p + 28);
  const extraLen = apkb.readUInt16LE(p + 30);
  const commentLen = apkb.readUInt16LE(p + 32);
  const name = apkb.toString('utf8', p + 46, p + 46 + nameLen);
  const label = groupOf(name);
  byGroup.set(label, (byGroup.get(label) || 0) + apkb.readUInt32LE(p + 20));
  p += 46 + nameLen + extraLen + commentLen;
}

console.log(`\ncomposition  (compressed, ${entryCount} entries)`);
for (const [label, bytes] of [...byGroup.entries()].sort((a, b) => b[1] - a[1])) {
  const mb = bytes / 1024 / 1024;
  console.log(`  ${label.padEnd(16)} ${mb.toFixed(2).padStart(6)} MB  ${'#'.repeat(Math.round(mb / 2))}`);
}