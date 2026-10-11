// Reverse lookup: AniList media id -> watch-order slug.
//
// The authoritative data lives in `WATCH_ORDERS_DATA` in
// `src/app/watch-order/[id]/page.tsx`. That object is module-private to the
// route, so we mirror only the `anilistId` -> slug pairs here. If you add or
// change a watch order, update both places.
export const WATCH_ORDER_SLUG_BY_ANILIST_ID: Record<number, string> = {
  5081: "monogatari",
  19603: "fate",
  223: "dragon-ball",
  80: "gundam",
  4654: "toaru",
  16498: "aot",
  14719: "jojo",
  11757: "sao",
  1575: "code-geass",
  9253: "steins-gate",
  101922: "demon-slayer",
  97986: "made-in-abyss",
  21355: "rezero",
  9756: "madoka",
  30: "evangelion",
  1735: "naruto",
  269: "bleach",
  5114: "fma",
  21: "one-piece",
  11061: "hunter-x-hunter",
  21459: "mha",
  13927: "psycho-pass",
  849: "haruhi",
  6114: "durarara",
  2251: "baccano",
  934: "higurashi",
  43: "ghost-in-the-shell",
  979: "gintama",
  235: "conan",
  180: "digimon",
  2540: "pokemon",
  467: "initial-d",
  11813: "symphogear",
  963: "macross",
  381: "yu-yu-hakusho",
  1629: "slam-dunk",
  3816: "precure",
  6595: "katangatari",
  10075: "tiger-and-bunny",
};

export function getWatchOrderSlugForAnilistId(anilistId: number): string | null {
  return WATCH_ORDER_SLUG_BY_ANILIST_ID[anilistId] ?? null;
}
