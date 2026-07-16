const ANIME_KEYWORDS = [
  "anime", "manga", "otaku", "cosplay", "doujinshi",
  "shonen", "shoujo", "seinen", "josei", "mecha",
  "isekai", "kaiju", "chibi", "tsundere", "yandere",
  "waifu", "husbando", "otaku", "weeb", "weeaboo",
  "seasonal", "simulcast", "dub", "sub", "subbed", "dubbed",
  "filler", "canon", "arc", "opening", "ending", "ost",
  "voice-actor", "seiyuu", "studio", "mappa", "ufotable",
  "toei", "bones", "wit", "cloverworks", "a-1", "kyoto-animation",
  "light-novel", "visual-novel", "manhwa", "manhua",
  "review", "recommendation", "top-10", "tierlist", "bracket",
  "seasonal-anime", "chart", "schedule", "watch-order",
  "episode", "chapter", "volume", "movie", "ova", "ona", "special",
  "film", "theatrical",
  "action", "adventure", "comedy", "drama", "fantasy", "horror",
  "romance", "sci-fi", "slice-of-life", "thriller", "mystery",
  "supernatural", "psychological", "historical", "military",
  "sports", "music", "school", "urban", "cyberpunk", "steampunk",
  "dystopia", "post-apocalyptic",
  "naruto", "one-piece", "dragon-ball", "attack-on-titan", "demon-slayer",
  "jujutsu-kaisen", "my-hero-academia", "fullmetal-alchemist",
  "death-note", "sword-art-online", "hunter-x-hunter",
  "evangelion", "cowboy-bebop", "ghost-in-the-shell",
  "spirited-away", "princess-mononoke", "howls-moving-cast",
  "your-name", "weathering-with-you", "suzume",
  "chainsaw-man", "spy-x-family", "blue-lock",
  "one-punch-man", "mob-psycho", "vinland-saga",
  "tokyo-ghoul", "parasyte", "deadman-wonderland",
  "anime-blog", "anime-review", "anime-news", "anime-discussion",
  "figure", "merch", "plush", "gunpla", "nendoroid", "figma",
  "convention", "comic-con", "anime-expo", "comiket",
  "crunchyroll", "funimation", "netflix-anime", "hidive",
  "vrv", "anime-network",
];

export function hasValidAnimeTag(tags: string): boolean {
  if (!tags || !tags.trim()) return false;
  const userTags = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (userTags.length === 0) return false;
  return userTags.some((tag) =>
    ANIME_KEYWORDS.some((kw) => tag.includes(kw) || kw.includes(tag))
  );
}

export function getAnimeTagError(): string {
  return "At least one anime-related tag is required (e.g. anime, manga, review, naruto, seasonal)";
}
