export interface TierListTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  queries: string[];
}

export const TIER_LIST_TEMPLATES: TierListTemplate[] = [
  {
    id: "shounen-classics",
    name: "All-Time Shounen Classics",
    description: "16 legendary battle shounen — rank the greats",
    emoji: "\u2694\uFE0F",
    queries: [
      "Fullmetal Alchemist Brotherhood",
      "Attack on Titan",
      "Hunter x Hunter",
      "One Piece",
      "Naruto",
      "Bleach",
      "Code Geass",
      "Death Note",
      "Dragon Ball Z",
      "Gintama",
      "My Hero Academia",
      "Fairy Tail",
      "Sword Art Online",
      "Jujutsu Kaisen",
      "Demon Slayer",
      "Haikyuu",
    ],
  },
  {
    id: "new-gen-2020s",
    name: "2020s New Gen Bangers",
    description: "Modern hits from the current decade",
    emoji: "\u26A1",
    queries: [
      "Frieren",
      "Chainsaw Man",
      "Jujutsu Kaisen",
      "Demon Slayer",
      "Spy x Family",
      "Vinland Saga",
      "Oshi no Ko",
      "Dandadan",
      "Solo Leveling",
      "Blue Lock",
      "Kaiju No. 8",
      "Wind Breaker",
      "Tokyo Revengers",
      "Rent-a-Girlfriend",
      "Bocchi the Rock",
      "Mushoku Tensei",
    ],
  },
];
