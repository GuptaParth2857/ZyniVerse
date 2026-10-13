import { searchMedia, getMangaDetailFull, getMangaPopular, type Media, type MediaMangaFull } from "./anilist";

export const MEDIA_TYPES = {
  MANGA: "manga",
  LIGHT_NOVEL: "light_novel",
  MANHWA: "manhwa",
  MANHUA: "manhua",
} as const;

export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

/** Type filter chips shared by the browse grid and the My List view. */
export const MANGA_TYPE_OPTIONS = [
  { key: "ALL", label: "All" },
  { key: MEDIA_TYPES.MANGA, label: "Manga" },
  { key: MEDIA_TYPES.MANHWA, label: "Manhwa" },
  { key: MEDIA_TYPES.MANHUA, label: "Manhua" },
  { key: MEDIA_TYPES.LIGHT_NOVEL, label: "Light Novel" },
] as const;

export type MangaTypeKey = (typeof MANGA_TYPE_OPTIONS)[number]["key"];

/**
 * Infer the stored sub-type from an AniList media object. Used when adding a
 * title so the list can be filtered by Manga / Manhwa / Manhua / Light Novel.
 */
export function inferMangaType(media: {
  format?: string | null;
  countryOfOrigin?: string | null;
}): MediaType {
  if (media.format === "NOVEL") return MEDIA_TYPES.LIGHT_NOVEL;
  switch (media.countryOfOrigin) {
    case "KR":
      return MEDIA_TYPES.MANHWA;
    case "CN":
      return MEDIA_TYPES.MANHUA;
    default:
      return MEDIA_TYPES.MANGA;
  }
}

export async function searchManga(query: string, type?: string) {
  const res = type === "light_novel"
    ? await searchMedia({ search: query, type: "MANGA", format: "NOVEL", perPage: 20 })
    : await searchMedia({ search: query, type: "MANGA", perPage: 20 });
  return res.media as Media[];
}

export async function getMangaDetail(mediaId: number) {
  return getMangaDetailFull(mediaId) as Promise<MediaMangaFull>;
}

export async function getPopularManga() {
  return getMangaPopular(18) as Promise<Media[]>;
}

export function getMediaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    manga: "Manga",
    light_novel: "Light Novel",
    manhwa: "Manhwa",
    manhua: "Manhua",
  };
  return labels[type] || "Manga";
}

export function getMediaTypeColor(type: string): string {
  const colors: Record<string, string> = {
    manga: "var(--color-violet)",
    light_novel: "var(--color-cyan)",
    manhwa: "var(--color-magenta)",
    manhua: "var(--color-amber)",
  };
  return colors[type] || "var(--color-violet)";
}

export const STATUS_LABELS: Record<string, string> = {
  READING: "Reading",
  COMPLETED: "Completed",
  PLANNING: "Plan to Read",
  DROPPED: "Dropped",
  PAUSED: "Paused",
  REREADING: "Rereading",
};

export const STATUS_COLORS: Record<string, string> = {
  READING: "var(--color-cyan)",
  COMPLETED: "var(--color-violet)",
  PLANNING: "var(--color-mute)",
  DROPPED: "var(--color-magenta)",
  PAUSED: "var(--color-amber)",
  REREADING: "var(--color-glass-purple)",
};
