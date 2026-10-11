// Curated cross-surface internal links.
//
// Every slug here is verified against the live data it points at:
//   - filler slugs come from the AniFiller dataset (animefillerlist.com slugs)
//   - dub guide slugs come from INDIAN_DUB_GUIDES
// so we never render a link to a page that does not exist. Keep this file as
// the single source of truth for "related page" links between the watch-order,
// filler, and Indian-dub surfaces.

/** watch-order slug -> AniFiller filler slug */
export const WATCH_ORDER_TO_FILLER: Record<string, string> = {
  naruto: "naruto",
  "one-piece": "one-piece",
  "dragon-ball": "dragon-ball",
  bleach: "bleach",
  fma: "fullmetal-alchemist-brotherhood",
  "hunter-x-hunter": "hunter-x-hunter",
  "made-in-abyss": "made-abyss",
  "tokyo-ghoul": "tokyo-ghoul",
  "seven-deadly-sins": "nanatsu-no-taizai",
  "mob-psycho-100": "mob-psycho-100",
  fate: "fate-zero",
  jojo: "jojos-bizarre-adventure",
  aot: "attack-on-titan",
  gintama: "gintama",
  conan: "detective-conan",
  "yu-yu-hakusho": "yuyu-hakusho",
  "slam-dunk": "slam-dunk",
  haruhi: "melancholy-haruhi-suzumiya",
  gundam: "mobile-suit-gundam",
  "ghost-in-the-shell": "ghost-shell-arise",
};

/** Extra filler slug -> watch-order slug links (season pages point at the franchise hub). */
const EXTRA_FILLER_TO_WATCH_ORDER: Record<string, string> = {
  "naruto-shippuden": "naruto",
  "boruto-naruto-next-generations": "naruto",
  "dragon-ball-z": "dragon-ball",
  "dragon-ball-super": "dragon-ball",
  "dragon-ball-gt": "dragon-ball",
  "fullmetal-alchemist": "fma",
  "nanatsu-no-taizai-second-season": "seven-deadly-sins",
  "nanatsu-no-taizai-signs-of-holy-war": "seven-deadly-sins",
  "hunter-x-hunter-1999": "hunter-x-hunter",
  "jojos-bizarre-adventure-2000": "jojo",
  "attack-on-titan-second-season": "aot",
  "attack-on-titan-third-season": "aot",
  "attack-on-titan-third-season-part-two": "aot",
  "gintama-second-season": "gintama",
  "gintama-silver-soul-arc-part-two": "gintama",
  "demon-slayer-fifth-season": "demon-slayer",
  "spy-x-family-third-season": "spy-x-family",
};

const FILLER_TO_WATCH_ORDER: Record<string, string> = (() => {
  const map: Record<string, string> = { ...EXTRA_FILLER_TO_WATCH_ORDER };
  for (const [watchOrderSlug, fillerSlug] of Object.entries(WATCH_ORDER_TO_FILLER)) {
    if (!(fillerSlug in map)) map[fillerSlug] = watchOrderSlug;
  }
  return map;
})();

export function getFillerForWatchOrder(watchOrderSlug: string): string | null {
  return WATCH_ORDER_TO_FILLER[watchOrderSlug] ?? null;
}

export function getWatchOrderForFiller(fillerSlug: string): string | null {
  return FILLER_TO_WATCH_ORDER[fillerSlug] ?? null;
}

/** watch-order slug -> Hindi dub guide slug */
export const WATCH_ORDER_TO_DUB: Record<string, string> = {
  naruto: "naruto-hindi-dub",
  "one-piece": "one-piece-hindi-dub",
  aot: "attack-on-titan-hindi-dub",
  "demon-slayer": "demon-slayer-hindi-dub",
  bleach: "bleach-thousand-year-blood-war-hindi-dub",
  fma: "fullmetal-alchemist-brotherhood-hindi-dub",
  "hunter-x-hunter": "hunter-x-hunter-hindi-dub",
  mha: "my-hero-academia-hindi-dub",
  "jujutsu-kaisen": "jujutsu-kaisen-hindi-dub",
  "chainsaw-man": "chainsaw-man-hindi-dub",
  "spy-x-family": "spy-x-family-hindi-dub",
  sao: "sword-art-online-hindi-dub",
  "code-geass": "code-geass-hindi-dub",
  "dragon-ball": "dragon-ball-z-hindi-dub",
  "tokyo-ghoul": "tokyo-ghoul-hindi-dub",
  "steins-gate": "steins-gate-hindi-dub",
  fate: "fate-zero-hindi-dub",
  "one-punch-man": "one-punch-man-hindi-dub",
  conan: "detective-conan-hindi-dub",
  pokemon: "pokemon-hindi-dub",
  digimon: "digimon-adventure-hindi-dub",
};

export function getDubGuideForWatchOrder(watchOrderSlug: string): string | null {
  return WATCH_ORDER_TO_DUB[watchOrderSlug] ?? null;
}

/** filler slug -> Hindi dub guide slug */
export const FILLER_TO_DUB: Record<string, string> = {
  naruto: "naruto-hindi-dub",
  "naruto-shippuden": "naruto-shippuden-hindi-dub",
  "one-piece": "one-piece-hindi-dub",
  bleach: "bleach-thousand-year-blood-war-hindi-dub",
  "fullmetal-alchemist-brotherhood": "fullmetal-alchemist-brotherhood-hindi-dub",
  "hunter-x-hunter": "hunter-x-hunter-hindi-dub",
  "death-note": "death-note-hindi-dub",
  "tokyo-ghoul": "tokyo-ghoul-hindi-dub",
  "demon-slayer-fifth-season": "demon-slayer-hindi-dub",
  "detective-conan": "detective-conan-hindi-dub",
};

export function getDubGuideForFiller(fillerSlug: string): string | null {
  return FILLER_TO_DUB[fillerSlug] ?? null;
}
