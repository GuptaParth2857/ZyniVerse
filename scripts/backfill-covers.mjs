import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const T = "cmtzrog3c0001d9aui4b0ue8q";

const COVER_QUERY = `
  query ($ids: [Int!], $p: Int, $pp: Int) {
    Page(page: $p, perPage: $pp) {
      pageInfo { hasNextPage }
      characters(id_in: $ids) {
        id
        media(sort: POPULARITY_DESC, perPage: 1, type: ANIME) {
          edges { node { coverImage { extraLarge large } } }
        }
      }
    }
  }`;

async function gql(query, variables) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (r.status === 429) { await new Promise((r) => setTimeout(r, 1500)); continue; }
    const d = await r.json();
    if (d?.errors) throw new Error(d.errors[0].message);
    return d.data;
  }
  throw new Error("anilist retries exhausted");
}

const parts = await p.characterTournamentParticipant.findMany({
  where: { tournamentId: T },
  orderBy: { seed: "asc" },
  select: { charId: true, seed: true, charName: true },
});
console.log("participants:", parts.length);

const map = new Map(); // charId -> cover
const BATCH = 50;
for (let i = 0; i < parts.length; i += BATCH) {
  const ids = parts.slice(i, i + BATCH).map((x) => x.charId);
  const data = await gql(COVER_QUERY, { ids, p: 1, pp: BATCH });
  for (const c of data?.Page?.characters || []) {
    const cover = c.media?.edges?.[0]?.node?.coverImage;
    map.set(c.id, coward(cover));
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log(`  fetched ${Math.min(i + BATCH, parts.length)}/${parts.length}`);
}

function coward(cover) {
  return cover?.extraLarge || cover?.large || null;
}

let updated = 0, missing = 0;
for (const part of parts) {
  const cover = map.get(part.charId) || null;
  await p.characterTournamentParticipant.update({
    where: { tournamentId_seed: { tournamentId: T, seed: part.seed } },
    data: { franchiseCover: cover },
  });
  if (cover) updated++; else { missing++; console.log("  MISSING cover:", part.charName, "(seed", part.seed + ")"); }
}
console.log(`\nupdated: ${updated}, missing covers: ${missing}`);
await p.$disconnect();