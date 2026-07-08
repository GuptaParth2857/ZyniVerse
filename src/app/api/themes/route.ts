import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { THEME_SONGS } from "@/lib/data/themes";

const ANIMETHEMES_API = "https://api.animethemes.moe";

const ANIME_TITLES: Record<number, string> = {
  1: "Cowboy Bebop",
  21: "One Piece",
  813: "Dragon Ball",
  1535: "Fullmetal Alchemist: Brotherhood",
  1735: "Naruto Shippuden",
  2001: "Steins;Gate",
  2904: "Puella Magi Madoka Magica",
  5114: "Fullmetal Alchemist: Brotherhood",
  9253: "K-On!",
  10087: "Guilty Crown",
  11061: "Fate/Zero",
  11757: "Sword Art Online",
  16498: "Attack on Titan",
  19815: "Kill la Kill",
  20464: "Parasyte",
  21459: "No Game No Life",
  21570: "Barakamon",
  22319: "Dragon Ball Super",
  23273: "Yuki Yuna is a Hero",
  23755: "Jujutsu Kaisen",
  24701: "Mashle: Magic and Muscles",
  28755: "Your Lie in April",
  30276: "Code Geass",
  31240: "Kabaneri of the Iron Fortress",
  31964: "Beastars",
  33352: "The Idolmaster Cinderella Girls",
  34438: "Yuri on Ice",
  35760: "Your Lie in April",
  37521: "Princess Connect! Re:Dive",
  37991: "Interspecies Reviewers",
  40748: "Chainsaw Man",
  41467: "Blue Lock",
  101922: "Frieren: Beyond Journey's End",
  113415: "Solo Leveling",
  127230: "Demon Slayer: Entertainment District Arc",
};

async function fetchPopularThemesFromApi(): Promise<{ mediaId: number; title: string; image: string | null; count: number }[]> {
  try {
    const ids = [21, 16498, 1735, 5114, 1535, 813, 11061, 113415, 101922, 127230, 30276, 9253, 1, 2001, 23755];
    const groups: { mediaId: number; title: string; image: string | null; count: number }[] = [];

    for (const id of ids) {
      const url = `${ANIMETHEMES_API}/anime?filter[has]&include=animethemes.animethemeentries.video&page[size]=1&filter[anilist_id]=${id}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      const anime = data?.anime?.[0];
      if (anime) {
        groups.push({
          mediaId: id,
          title: anime.name || `Anime #${id}`,
          image: null,
          count: anime.animethemes?.length || 0,
        });
      }
    }
    return groups;
  } catch { return []; }
}

export async function GET() {
  const dbGroups = await prisma.themeSong.findMany({
    select: { mediaId: true },
    distinct: ["mediaId"],
  });

  let groups: { mediaId: number; title: string; image: string | null; count: number }[] = dbGroups.map((t) => ({ mediaId: t.mediaId, title: ANIME_TITLES[t.mediaId] || `Anime #${t.mediaId}`, image: null, count: 0 }));

  if (groups.length < 10) {
    const staticIds = [...new Set(THEME_SONGS.map((t) => t.mediaId))];
    const existingIds = new Set(groups.map((g) => g.mediaId));
    for (const id of staticIds) {
      if (!existingIds.has(id)) {
        groups.push({ mediaId: id, title: ANIME_TITLES[id] || `Anime #${id}`, image: null, count: THEME_SONGS.filter((t) => t.mediaId === id).length });
      }
    }

    try {
      const apiGroups = await fetchPopularThemesFromApi();
      const dbIds = new Set(groups.map((g) => g.mediaId));
      for (const ag of apiGroups) {
        if (!dbIds.has(ag.mediaId)) {
          groups.push(ag);
        }
      }
    } catch {}
  }

  groups = groups.filter((g, i, a) => a.findIndex((x) => x.mediaId === g.mediaId) === i);

  return NextResponse.json({ groups });
}
