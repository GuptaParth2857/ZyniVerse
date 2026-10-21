/**
 * One-off codemod: adds a shared-cache (CDN) `Cache-Control` header to the GET
 * handler of public, anonymous, read-only API routes.
 *
 * Why: every `/api/*` GET that reaches a route handler is a billed Node
 * function invocation. A route whose response is identical for every visitor
 * should be served from the Vercel CDN instead.
 *
 * Safety rule (encoded below): a route is only touched when
 *   - it has a GET handler,
 *   - it does not already set a Cache-Control of its own,
 *   - it does not read the visitor's identity in any way (no `auth()`,
 *     no `cookies()`, no Authorization header, no session),
 *   - and it is not under a path prefix that is inherently per-user.
 *
 * Query-string differences are fine: the CDN cache key includes the query.
 *
 * Usage: node scripts/add-api-cache.cjs [--write]
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const API_DIR = path.join(ROOT, "src", "app", "api");
const WRITE = process.argv.includes("--write");

// Path segments that mean "this response is about the visitor".
const DENY_SEGMENTS = new Set([
  "admin", "cron", "internal", "auth", "chat", "messages", "message",
  "notifications", "profile", "watchlist", "follow", "friends", "saved",
  "progress", "activity", "track", "alerts", "upload", "webhooks", "orders",
  "stripe", "subscription", "economy", "daily-login", "onboarding", "push",
  "simkl", "backlog", "character-favorites", "anime-follow", "dub-notifications",
  "user", "users", "my", "me", "private", "history", "export", "import",
  "keys", "vote", "like", "likes", "join", "join-requests", "bans", "typing",
  "unread", "conversations", "foryou", "email", "verify", "reset",
  "manga/history", "dujinshi/my", "clubs/my", "activity/track",
]);

// Code fragments that mean "the response depends on who is asking".
const DENY_PATTERNS = [
  /\bauth\(\)/,
  /getServerSession/,
  /cookies\(\)/,
  /authorization/i,
  /session\b/i,
  /viewer/i,
  /currentUser/i,
  /verifyApiKey/,
];

// Individual routes that must stay dynamic even though they look anonymous.
// Either they are stateful (a game round, a live sync position, a random
// draw) or they already carry their own cache headers.
const DENY_ROUTES = new Set([
  "/api/games/guess-ost",
  "/api/games/guess-plot",
  "/api/games/silhouette",
  "/api/quiz/generate", // random questions + per-session question store
  "/api/voice-lines/random", // random draw
  "/api/v1/usage", // per API key
  "/api/watch-party/[id]/sync", // live playback position
  "/api/img", // own cache-control header
  "/api/avatar", // own cache-control header
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name === "route.ts") out.push(full);
  }
  return out;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function isDenied(routePath) {
  const segments = routePath.split("/").filter(Boolean);
  for (const seg of segments) {
    if (DENY_SEGMENTS.has(seg)) return true;
  }
  return false;
}

const IMPORT_LINE = 'import { withPublicCache } from "@/lib/api-cache";\n';
const IMPORT_ANCHOR = /^import .*$/m;

const results = [];
const skipped = [];

for (const file of walk(API_DIR)) {
  const rel = relative(file);
  const routePath = "/api/" + path
    .relative(API_DIR, file)
    .split(path.sep)
    .join("/")
    .replace(/\/route\.ts$/, "");

  const source = fs.readFileSync(file, "utf8");

  if (!/export\s+(async\s+)?function\s+GET\b/.test(source)) {
    skipped.push([rel, "no GET handler"]);
    continue;
  }
  if (/cache-control/i.test(source)) {
    skipped.push([rel, "already sets Cache-Control"]);
    continue;
  }
  if (DENY_ROUTES.has(routePath)) {
    skipped.push([rel, "stateful or already-cached route"]);
    continue;
  }
  if (isDenied(routePath)) {
    skipped.push([rel, "per-user path"]);
    continue;
  }
  const deniedBy = DENY_PATTERNS.find((re) => re.test(source));
  if (deniedBy) {
    skipped.push([rel, `depends on visitor identity (${deniedBy})`]);
    continue;
  }

  const match = source.match(/export\s+(async\s+)?function\s+GET\s*\(([^)]*)\)/);
  if (!match) {
    skipped.push([rel, "unsupported GET signature"]);
    continue;
  }

  const params = match[2].trim();
  const asyncKw = match[1] ? "async " : "";
  const innerName = "GET_inner";

  let next = source.replace(
    match[0],
    `${asyncKw}function ${innerName}(${params})`
  );

  // Forward the arguments with a rest tuple instead of by name: some handlers
  // destructure their second parameter (`{ params }`), which has no name to
  // forward.
  const wrapper = `\n\nexport async function GET(...args: Parameters<typeof ${innerName}>) {\n  const res = await ${innerName}(...args);\n  return withPublicCache(res);\n}\n`;

  // Insert the helper import after the first import statement.
  const importMatch = next.match(IMPORT_ANCHOR);
  if (importMatch) {
    const at = importMatch.index + importMatch[0].length;
    next = next.slice(0, at) + "\n" + IMPORT_LINE.trimEnd() + next.slice(at);
  } else {
    next = IMPORT_LINE + next;
  }

  next += wrapper;
  results.push([rel, next]);
}

if (WRITE) {
  for (const [rel, content] of results) {
    fs.writeFileSync(path.join(ROOT, rel), content, "utf8");
  }
}

console.log(`TOUCHED ${results.length} route(s):`);
for (const [rel] of results) console.log("  + " + rel);
console.log(`\nSKIPPED ${skipped.length} route(s)`);
if (process.argv.includes("--verbose")) {
  for (const [rel, why] of skipped) console.log(`  - ${rel}  (${why})`);
}
