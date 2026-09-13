// Resolve the most-followed anime characters from AniList into a
// "Dream 16" qualifying tournament (64 candidates -> top-16 bracket).
//
// Usage:
//   node scripts/create-star-tournament.mjs --dry-run [--pool=200]
//   node scripts/create-star-tournament.mjs --commit --creator <userId> [--title "The Dream 16"] [--pool=200]
//
// Flags:
//   --dry-run   (default) fetch + curate + print the candidate table, touch nothing
//   --commit    actually create the qualifying tournament in the DB
//   --creator   userId of the tournament creator (required for --commit)
//   --title     tournament title (default "The Dream 16 — Biggest Anime Character Tournament")
//   --pool      how many raw AniList characters to fetch/curate from (default 200)
//   --size      candidate pool size for the qualifier (default 64)
//   --bracket   how many advance to the bracket: 8 | 16 | 32 (default 16)
//   --force     allow creation even when another qualifying tournament is open

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

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
  for (const a of args) {
    if (a.startsWith(`--${name}=`)) return a.slice(name.length + 3);
  }
  const i = args.indexOf(`--${name}`);
  return i > -1 && args[i + 1] ? args[i + 1] : null;
}
function hasFlag(name) {
  return args.includes(`--${name}`);
}

const COMMIT = hasFlag("commit");
const FORCE = hasFlag("force");
const CREATOR = argValue("creator");
const TITLE =
  argValue("title") || "The Dream 16 — Biggest Anime Character Tournament";
const RAW_POOL = Number(argValue("pool") || 200);
const SIZE = Number(argValue("size") || 64);
const BRACKET = Number(argValue("bracket") || 16);
const MAX_PER_FRANCHISE = 2;

if (SIZE < 16 || SIZE > 100) {
  console.error(`--size must be between 16 and 100 (got ${SIZE})`);
  process.exit(1);
}
if (![8, 16, 32].includes(BRACKET)) {
  console.error(`--bracket must be 8, 16 or 32 (got ${BRACKET})`);
  process.exit(1);
}

const ENDPOINT = "https://graphql.anilist.co";
const USER_AGENT = "ZyniVerse/1.0 (https://zyverse.in)";

async function gql(query, variables = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": USER_AGENT,
          Origin: "https://anilist.co",
          Referer: "https://anilist.co/",
        },
        body: JSON.stringify({ query, variables }),
      });
      if (res.status === 429) {
        const wait = Math.min(Number(res.headers.get("retry-after") || 2), 12);
        console.log(`  got 429, waiting ${wait}s…`);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) {
        throw new Error(`AniList responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "AniList error");
      return json.data;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw new Error("exhausted AniList retries");
}

const POP_QUERY = `
  query ($p: Int, $pp: Int) {
    Page(page: $p, perPage: $pp) {
      pageInfo { hasNextPage total }
      characters(sort: FAVOURITES_DESC) {
        id
        name { full userPreferred }
        image { large medium }
        favourites
        media(sort: POPULARITY_DESC, perPage: 3) {
          edges {
            characterRole
            node { id title { romaji english userPreferred } type }
          }
        }
      }
    }
  }`;

function bestTitle(t) {
  return t?.userPreferred || t?.english || t?.romaji || "Unknown";
}

function franchiseOf(c) {
  const edge = c.media?.edges?.[0];
  if (!edge) return null;
  return `${edge.node.type || "ANIME"}:${edge.node.id}`;
}

// Fetch enough raw favourites to have head-room after franchise dedup.
async function fetchRaw() {
  await new Promise((r) => setTimeout(r, 500));
  const all = [];
  const perPage = 50;
  const pages = Math.min(6, Math.ceil((RAW_POOL * 1.5) / perPage) || 1);
  for (let page = 1; page <= pages; page++) {
    const data = await gql(POP_QUERY, { p: page, pp: perPage });
    all.push(...(data?.Page?.characters || []));
    if (!data?.Page?.pageInfo?.hasNextPage) break;
    await new Promise((r) => setTimeout(r, 450));
  }
  return all;
}

// Curate: cap candidates per franchise, keep favourites ranking as the tiebreak.
function curate(raw) {
  const count = new Map();
  const picked = [];
  for (const c of raw) {
    const name = c.name?.full || c.name?.userPreferred || "Unknown";
    const img = c.image?.large || c.image?.medium || "";
    const fc = franchiseOf(c);
    if (fc && (count.get(fc) || 0) >= MAX_PER_FRANCHISE) continue;
    if (fc) count.set(fc, (count.get(fc) || 0) + 1);
    picked.push({
      charId: c.id,
      charName: name,
      charImage: img || undefined,
      favourites: c.favourites || 0,
      franchiseId: fc,
      franchise: fc
        ? (c.media.edges.find((e) => e.node.id === Number(fc.split(":")[1]))?.node.title
            ? bestTitle(c.media.edges.find((e) => e.node.id === Number(fc.split(":")[1]))?.node.title)
            : "Unknown")
        : "Various",
      role: c.media?.edges?.[0]?.characterRole || "SUPPORTING",
    });
    if (picked.length >= SIZE) break;
  }
  return picked.sort((a, b) => b.favourites - a.favourites).slice(0, SIZE);
}

function pad(s, n) {
  const str = String(s);
  return str.length >= n ? str : str + " ".repeat(n - str.length);
}

const OPEN_QUERY = `
  query ($id: Int) { Character(id: $id) { id } }`;

async function main() {
  if (COMMIT && !CREATOR) {
    console.error("--commit requires --creator <userId>");
    process.exit(1);
  }

  console.log(`Fetching top characters from AniList (raw pool ~${RAW_POOL})…`);
  const raw = await fetchRaw();
  console.log(`Fetched ${raw.length} characters. Curating (max ${MAX_PER_FRANCHISE}/franchise)…`);
  const picks = curate(raw);
  if (picks.length < SIZE) {
    console.error(
      `Only ${picks.length} candidates after curation (need ${SIZE}). Raise --pool.`
    );
    process.exit(1);
  }

  console.log("");
  console.log(pad("#", 3) + "  " + pad("Character", 28) + pad("Franchise", 32) + pad("Role", 12) + "Favourites  ID");
  for (let i = 0; i < picks.length; i++) {
    const p = picks[i];
    console.log(
      pad(i + 1, 3) +
        "  " +
        pad(p.charName.slice(0, 26), 28) +
        pad(p.franchise.slice(0, 30), 32) +
        pad(p.role, 12) +
        pad((p.favourites || 0).toLocaleString(), 10) +
        p.charId
    );
  }
  console.log("");
  console.log(`Qualifier pool: ${picks.length} candidates -> top ${BRACKET} advance to the bracket.`);

  if (!COMMIT) {
    console.log("\nDry run complete. Re-run with --commit --creator <userId> to create it.");
    process.exit(0);
  }

  const require = createRequire(import.meta.url);
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const creator = await prisma.user.findUnique({ where: { id: CREATOR } });
    if (!creator) {
      console.error(`Creator ${CREATOR} not found.`);
      process.exit(1);
    }

    const open = await prisma.characterTournament.count({
      where: { mode: "qualifying", status: "qualifying" },
    });
    if (open > 0 && !FORCE) {
      console.error(
        `There is already ${open} open qualifying tournament(s). Use --force to create another.`
      );
      process.exit(1);
    }

    // Sanity: characters are all AniList ids in the tournament pool, unique.
    const ids = new Set(picks.map((p) => p.charId));
    if (ids.size !== picks.length) {
      console.error("Duplicate charIds in final picks — aborting.");
      process.exit(1);
    }

    const now = new Date();
    const totalRounds = Math.round(Math.log2(BRACKET));
    const tournament = await prisma.characterTournament.create({
      data: {
        creatorId: CREATOR,
        title: TITLE,
        description:
          "The biggest anime character showdown on ZyniVerse. Everyone gets ONE vote — back your favorite and push them into the Dream 16 bracket where 1v1 battles decide the champion.",
        size: SIZE,
        bracketSize: BRACKET,
        mode: "qualifying",
        status: "qualifying",
        currentRound: 1,
        totalRounds,
        seed: Math.floor(Math.random() * 1e9),
        qualifyingStartedAt: now,
        qualifyingEndsAt: new Date(now.getTime() + 7 * 86400000),
        participants: {
          create: picks.map((p, i) => ({
            charId: p.charId,
            charName: p.charName,
            charImage: p.charImage,
            seed: i + 1,
          })),
        },
      },
    });

    console.log(
      `\nCreated qualifying tournament:\n  id: ${tournament.id}\n  title: ${TITLE}\n  candidates: ${SIZE} -> bracket of ${BRACKET} (${totalRounds} rounds)\n  voting ends: ${tournament.qualifyingEndsAt.toISOString()}\n  URL: https://zyverse.in/character-tournaments/${tournament.id}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Failed:", e.message || e);
  process.exit(1);
});