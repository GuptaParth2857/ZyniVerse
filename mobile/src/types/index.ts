export interface Anime {
  id: number;
  title: { english?: string; romaji?: string; native?: string };
  coverImage: { large?: string; medium?: string; extraLarge?: string };
  bannerImage?: string;
  episodes?: number;
  duration?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  genres?: string[];
  studios?: { name: string }[];
  averageScore?: number;
  popularity?: number;
  description?: string;
  nextAiringEpisode?: { episode: number; airingAt: number };
  streamingEpisodes?: { title: string; url: string }[];
}

export interface FillerData {
  animeId: number;
  title: string;
  totalEpisodes: number;
  totalFillers: number;
  fillerPercentage: number;
  episodes: { episode: number; type: string; title?: string }[];
}

export interface ScheduleItem {
  mediaId: number;
  title: string;
  episode: number;
  airingAt: string;
  timeUntilAiring: number;
  media: Anime;
}

export interface DubStatus {
  malId: number;
  title: string;
  hindi?: { available: boolean; platform?: string };
  tamil?: { available: boolean; platform?: string };
  telugu?: { available: boolean; platform?: string };
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  stats?: {
    animeCompleted: number;
    episodesWatched: number;
    daysWatched: number;
  };
}
