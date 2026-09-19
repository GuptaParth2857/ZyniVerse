export interface Anime {
  id: number;
  idMal?: number;
  malId?: number;
  title: { english?: string; romaji?: string; native?: string };
  coverImage: { large?: string; medium?: string; extraLarge?: string; color?: string };
  bannerImage?: string;
  episodes?: number;
  duration?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  genres?: string[];
  studios?: { name: string }[] | { nodes?: { name: string }[] };
  averageScore?: number;
  popularity?: number;
  description?: string;
  nextAiringEpisode?: { episode: number; airingAt: number };
  streamingEpisodes?: { title: string; url: string }[];
  type?: string;
}

export interface FillerData {
  animeId: number;
  title: string;
  totalEpisodes: number;
  totalFillers: number;
  fillerPercentage: number;
  episodes: { episode: number; type: 'canon' | 'filler' | 'mixed'; title?: string }[];
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

export interface CharacterTournament {
  id: string;
  title: string;
  description?: string | null;
  posterUrl?: string | null;
  size: number;
  bracketSize?: number | null;
  mode: 'qualifying' | 'bracket';
  status: 'qualifying' | 'active' | 'upcoming' | 'completed' | 'cancelled';
  currentRound: number;
  totalRounds: number;
  qualifyingEndsAt?: string | null;
  roundEndsAt?: string | null;
  createdAt: string;
  creator?: { id: string; username: string; avatar?: string | null } | null;
  _count?: { participants: number; matches: number };
}

export interface TournamentParticipant {
  id: string;
  charId: number;
  charName: string;
  charImage?: string | null;
  franchiseCover?: string | null;
  pollVotes?: number;
  seed?: number | null;
}

export interface TournamentMatch {
  id: string;
  round: number;
  position: number;
  votesA: number;
  votesB: number;
  winnerId?: string | null;
  charA?: TournamentParticipant | null;
  charB?: TournamentParticipant | null;
  winner?: TournamentParticipant | null;
  _count?: { votes: number };
}

export interface CharacterTournamentDetail {
  tournament: CharacterTournament & { participants: TournamentParticipant[] };
  rounds: { label: string; matches: TournamentMatch[] }[];
  matches: TournamentMatch[];
  totalVotes: number;
  myVotes: Record<string, 'A' | 'B'>;
  myPollVote: string | null;
  isCreator?: boolean;
}
