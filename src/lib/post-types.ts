export type PosterCategory = "collab" | "news" | "anime" | "other";

export interface PosterCategoryMeta {
  key: PosterCategory;
  label: string;
  emoji: string;
}

export const POSTER_CATEGORIES: PosterCategoryMeta[] = [
  { key: "collab", label: "Collab", emoji: "🤝" },
  { key: "news", label: "News", emoji: "📰" },
  { key: "anime", label: "Anime", emoji: "🎬" },
  { key: "other", label: "More", emoji: "✨" },
];

export function posterCategoryOf(type: string | null | undefined): PosterCategoryMeta {
  const t = (type || "POSTER").toUpperCase().replace(/\s+/g, "_");
  if (t.includes("COLLAB")) return { key: "collab", label: "Collab", emoji: "🤝" };
  if (t.includes("NEWS")) return { key: "news", label: "News", emoji: "📰" };
  if (t === "POSTER" || t === "POST" || t.startsWith("POST")) return { key: "anime", label: "Anime", emoji: "🎬" };
  return { key: "other", label: "More", emoji: "✨" };
}

export function posterTypeFor(category: PosterCategory): string {
  switch (category) {
    case "collab":
      return "POSTER_COLLAB";
    case "news":
      return "POSTER_NEWS";
    case "other":
      return "POSTER_OTHER";
    case "anime":
    default:
      return "POSTER";
  }
}