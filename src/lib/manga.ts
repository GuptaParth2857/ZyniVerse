import { searchMedia, getMangaDetailFull, getMangaPopular, type Media, type MediaMangaFull } from "./anilist";

export const MEDIA_TYPES = {
  MANGA: "manga",
  LIGHT_NOVEL: "light_novel",
  MANHWA: "manhwa",
  MANHUA: "manhua",
} as const;

export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

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
