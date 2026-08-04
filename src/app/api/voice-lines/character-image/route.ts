import { NextRequest, NextResponse } from "next/server";
import { getCharacter, getAnimeDetailFull, getAnimeCharacters } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

function normalizeName(s: string) {
  return (s || "").toLowerCase().replace(/[\s\-_.'"]+/g, "");
}

export async function GET(req: NextRequest) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const url = new URL(req.url);
  const characterId = Number(url.searchParams.get("characterId")) || 0;
  const animeId = Number(url.searchParams.get("animeId")) || 0;
  const character = (url.searchParams.get("character") || "").trim();

  try {
    if (characterId > 0) {
      const c = await getCharacter(characterId);
      const image = c?.image?.large || c?.image?.medium || null;
      if (image) return NextResponse.json({ image, source: "character" });
    }

    if (animeId > 0) {
      if (character) {
        const target = normalizeName(character);
        const chars = await getAnimeCharacters(animeId, 1, 25);
        for (const edge of chars.edges) {
          const node = edge.node;
          const candidates = [
            node.name?.full,
            node.name?.native,
            edge.name,
            ...(node.name?.alternative ?? []),
          ];
          for (const cand of candidates) {
            if (cand && normalizeName(cand) === target) {
              const image = node.image?.large || node.image?.medium || null;
              if (image) return NextResponse.json({ image, source: "character" });
            }
          }
        }
      }

      const m = await getAnimeDetailFull(animeId);
      const image =
        m?.coverImage?.extraLarge ||
        m?.coverImage?.large ||
        m?.coverImage?.medium ||
        null;
      if (image) return NextResponse.json({ image, source: "anime" });
    }

    return NextResponse.json({ image: null, source: null });
  } catch {
    return NextResponse.json({ image: null, source: null });
  }
}
