export interface UpcomingTitleConfig {
  id: string;
  searchQuery: string;
  format?: "MOVIE" | "TV" | "TV_SHORT" | "OVA" | "ONA" | "SPECIAL";
  alternativeQueries?: string[];
}

export const UPCOMING_TITLE_CONFIGS: UpcomingTitleConfig[] = [
  {
    id: "naruto-live-action",
    searchQuery: "Naruto",
    format: "MOVIE",
    alternativeQueries: ["Naruto Shippuden"],
  },
  {
    id: "my-hero-academia-film",
    searchQuery: "My Hero Academia",
    format: "MOVIE",
    alternativeQueries: ["Boku no Hero Academia"],
  },
  {
    id: "sakamoto-days-film",
    searchQuery: "Sakamoto Days",
    format: "MOVIE",
  },
  {
    id: "kingdom-5th-film",
    searchQuery: "Kingdom",
    format: "MOVIE",
    alternativeQueries: ["Kingdom anime"],
  },
  {
    id: "dragon-ball-live-action",
    searchQuery: "Dragon Ball",
    format: "MOVIE",
    alternativeQueries: ["Dragon Ball Super"],
  },
  {
    id: "one-piece-la-s3",
    searchQuery: "One Piece",
    format: "TV",
  },
  {
    id: "your-name-live-action",
    searchQuery: "Your Name",
    format: "MOVIE",
    alternativeQueries: ["Kimi no Na wa"],
  },
  {
    id: "one-punch-man-netflix",
    searchQuery: "One Punch Man",
    format: "TV",
    alternativeQueries: ["One Punch Man Season 3"],
  },
  {
    id: "gundam-live-action",
    searchQuery: "Mobile Suit Gundam",
    format: "MOVIE",
    alternativeQueries: ["Gundam"],
  },
  {
    id: "voltron-live-action",
    searchQuery: "Voltron",
    format: "MOVIE",
    alternativeQueries: ["Voltron Legendary Defender"],
  },
  {
    id: "solo-leveling-live-action",
    searchQuery: "Solo Leveling",
    format: "TV",
    alternativeQueries: ["Ore dake Level Up na Ken"],
  },
  {
    id: "blue-lock-la",
    searchQuery: "Blue Lock",
    format: "MOVIE",
  },
  {
    id: "look-back-la",
    searchQuery: "Look Back",
    format: "MOVIE",
    alternativeQueries: ["Look Back anime"],
  },
  {
    id: "akira-live-action",
    searchQuery: "Akira",
    format: "MOVIE",
  },
  {
    id: "spy-x-family-live-action",
    searchQuery: "Spy x Family",
    format: "MOVIE",
    alternativeQueries: ["Spy Family"],
  },
  {
    id: "detective-pikachu-2",
    searchQuery: "Detective Pikachu",
    format: "MOVIE",
    alternativeQueries: ["Pokemon Detective Pikachu"],
  },
  {
    id: "bleach-thousand-year-war-film",
    searchQuery: "Bleach",
    format: "MOVIE",
    alternativeQueries: ["Bleach Sennen Kessen"],
  },
];
