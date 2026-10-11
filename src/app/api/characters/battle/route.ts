import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPopularCharacters, getCharacter } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

// These old AniList URLs were hardcoded/fabricated and return 404. We verify
// artwork server-side with a cheap HEAD request (memoized) instead of trusting
// whatever got stored in the DB, so the page never shows a broken image icon.
const MIN_IMAGE_CHARS = 40;
const validityCache = new Map<string, { ok: boolean; at: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function imageIsValid(url: string | null | undefined): Promise<boolean> {
  if (!url || url.length < MIN_IMAGE_CHARS) return false;
  const cached = validityCache.get(url);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.ok;
  let ok = false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(t);
    ok = res.ok;
  } catch {
    ok = false;
  }
  // Only cache positive results + negatives briefly to avoid spamming.
  validityCache.set(url, { ok, at: Date.now() });
  return ok;
}


function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface CharacterPick {
  id: number;
  name: string;
  image: string;
  favourites: number;
  anime: string | null;
  role: string | null;
}

function pickFromList(
  list: CharacterPick[],
  seed: number
): { a: CharacterPick; b: CharacterPick } | null {
  if (list.length < 2) return null;
  const idxA = Math.floor(seededRandom(seed) * list.length);
  let idxB = Math.floor(seededRandom(seed + 1) * (list.length - 1));
  if (idxB >= idxA) idxB++;
  return { a: list[idxA], b: list[idxB] };
}

function firstAnime(c: { media?: { edges: { characterRole: string; node: { popularity?: number; title: { userPreferred?: string; romaji?: string } } }[] } }): {
  anime: string | null;
  role: string | null;
} {
  const edge = c.media?.edges
    ?.filter((e) => e.node?.title)
    .sort((a, b) => (b.node?.popularity ?? 0) - (a.node?.popularity ?? 0))[0];
  const anime = edge?.node?.title?.userPreferred || edge?.node?.title?.romaji || null;
  const role = edge?.characterRole || null;
  return { anime, role };
}

export async function GET(req: Request) {
  const rateCheck = await anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  let battle = await prisma.characterBattle.findUnique({
    where: { date: today },
    include: { votes: true },
  });

  // Runtime anime/role enrichment pulled fresh from the API each request.
  let metaA: { anime: string | null; role: string | null } | null = null;
  let metaB: { anime: string | null; role: string | null } | null = null;

  try {
    if (battle) {
      const [aOk, bOk] = await Promise.all([
        imageIsValid(battle.charAImage),
        imageIsValid(battle.charBImage),
      ]);
      const needRefresh = !aOk || !bOk;
      if (needRefresh) {
        const [fa, fb] = await Promise.allSettled([
          getCharacter(battle.charAId),
          getCharacter(battle.charBId),
        ]);
        const upd: Record<string, unknown> = {};
        if (fa.status === "fulfilled" && fa.value?.image?.large) {
          upd.charAImage = fa.value.image.large;
          upd.charAName = fa.value.name.userPreferred || fa.value.name.full || battle.charAName;
          const anim = firstAnime(fa.value);
          metaA = anim;
        }
        if (fb.status === "fulfilled" && fb.value?.image?.large) {
          upd.charBImage = fb.value.image.large;
          upd.charBName = fb.value.name.userPreferred || fb.value.name.full || battle.charBName;
          const anim = firstAnime(fb.value);
          metaB = anim;
        }
        if (Object.keys(upd).length) {
          battle = await prisma.characterBattle.update({
            where: { id: battle.id },
            data: { ...upd, totalVotes: battle.votesA + battle.votesB },
            include: { votes: true },
          });
        }
      }

      // Still broken? The stored IDs/URLs are garbage — re-pick fresh characters
      // (only safe while the battle has no votes yet).
      const [postA, postB] = battle
        ? await Promise.all([imageIsValid(battle.charAImage), imageIsValid(battle.charBImage)])
        : [true, true];
      if (battle && (battle.votesA + battle.votesB === 0) && (!postA || !postB)) {
        const chars = await fetchCandidates();
        const pair = pickFromList(chars, seed);
        if (pair) {
          metaA = { anime: pair.a.anime, role: pair.a.role };
          metaB = { anime: pair.b.anime, role: pair.b.role };
          battle = await prisma.characterBattle.update({
            where: { id: battle.id },
            data: {
              charAId: pair.a.id,
              charBId: pair.b.id,
              charAName: pair.a.name,
              charBName: pair.b.name,
              charAImage: pair.a.image,
              charBImage: pair.b.image,
              votesA: 0,
              votesB: 0,
              totalVotes: 0,
            },
            include: { votes: true },
          });
        }
      }
    } else {
      const chars = await fetchCandidates();
      const pair = pickFromList(chars, seed);
      if (pair) {
        metaA = { anime: pair.a.anime, role: pair.a.role };
        metaB = { anime: pair.b.anime, role: pair.b.role };
        battle = await prisma.characterBattle.create({
          data: {
            date: today,
            charAId: pair.a.id,
            charBId: pair.b.id,
            charAName: pair.a.name,
            charBName: pair.b.name,
            charAImage: pair.a.image,
            charBImage: pair.b.image,
            votesA: 0,
            votesB: 0,
            totalVotes: 0,
          },
          include: { votes: true },
        });
      }
    }
  } catch {
    if (!battle) {
      return NextResponse.json(
        { battle: null, offline: true },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
      );
    }
  }

  if (!battle) {
    return NextResponse.json(
      { battle: null },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  }

  const votesA = battle.votesA > 0 ? battle.votesA : battle.votes.filter((v) => v.choice === "A").length;
  const votesB = battle.votesB > 0 ? battle.votesB : battle.votes.filter((v) => v.choice === "B").length;

  return NextResponse.json(
    {
      id: battle.id,
      charA: {
        id: battle.charAId,
        name: battle.charAName,
        image: battle.charAImage,
        votes: votesA,
        anime: metaA?.anime ?? null,
        role: metaA?.role ?? null,
      },
      charB: {
        id: battle.charBId,
        name: battle.charBName,
        image: battle.charBImage,
        votes: votesB,
        anime: metaB?.anime ?? null,
        role: metaB?.role ?? null,
      },
      totalVotes: votesA + votesB,
      date: battle.date,
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}

async function fetchCandidates(): Promise<CharacterPick[]> {
  const data = await getPopularCharacters(1, 60);
  return (data?.characters ?? [])
    .filter((c) => c?.image?.large && c.name?.full)
    .map<CharacterPick>((c) => {
      const anim = firstAnime(c);
      return {
        id: c.id,
        name: c.name.full || c.name.userPreferred || c.name.first || "Unknown",
        image: c.image.large!,
        favourites: c.favourites ?? 0,
        anime: anim.anime,
        role: anim.role,
      };
    });
}
// touch
