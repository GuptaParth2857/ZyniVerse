import { TOONS_DATABASE, type CartoonEntry } from "@/lib/toons-data";
import { dedupedFetch } from "@/lib/wiki-cache";
import { proxyImageUrl } from "@/lib/avatar-src";

const WIKI_TITLES: Record<string, string> = {
  "chhota-bheem": "Chhota Bheem",
  "motu-patlu": "Motu Patlu",
  doraemon: "Doraemon",
  "shin-chan": "Crayon Shin-chan",
  pokemon: "Pokémon",
  kochikame: "KochiKame: Tokyo Beat Cops",
  "ninja-hattori": "Ninja Hattori-kun",
  "ben-10": "Ben 10",
  "scooby-doo": "Scooby-Doo, Where Are You!",
  spongebob: "SpongeBob SquarePants",
  "dexters-lab": "Dexter's Laboratory",
  "oggy-cockroaches": "Oggy and the Cockroaches",
  "kung-fu-panda": "Kung Fu Panda: Legends of Awesomeness",
  "phineas-ferb": "Phineas and Ferb",
  "gravity-falls": "Gravity Falls",
  "avatar-last-airbender": "Avatar: The Last Airbender",
  "dora-explorer": "Dora the Explorer",
  "johnny-bravo": "Johnny Bravo",
  "the-kids-next-door": "Codename: Kids Next Door",
  "the-smurfs": "The Smurfs",
  popeye: "Popeye",
};

const USER_AGENT = "ZyniVerse/1.0";

async function fetchThumbnails(): Promise<Record<string, string>> {
  const titles = [...new Set(Object.values(WIKI_TITLES))];
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=400&pilicense=any&format=json&formatversion=2&redirects=1&origin=*&titles=${encodeURIComponent(titles.join("|"))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return {};
  const data = await res.json();
  const map: Record<string, string> = {};
  for (const page of data.query?.pages || []) {
    if (page.thumbnail?.source) map[page.title] = page.thumbnail.source;
  }
  return map;
}

export async function getToonsWithImages(): Promise<CartoonEntry[]> {
  let thumbs: Record<string, string> = {};
  try {
    thumbs = await dedupedFetch("toons:wiki-images", fetchThumbnails);
  } catch {
    // Wikipedia unavailable — keep original data
  }
  return TOONS_DATABASE.map((t) => {
    const wikiTitle = WIKI_TITLES[t.id];
    const raw = wikiTitle ? thumbs[wikiTitle] : undefined;
    const image = proxyImageUrl(raw || t.image) ?? "";
    return { ...t, image };
  });
}
