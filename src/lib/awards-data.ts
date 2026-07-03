export interface AwardEntry {
  year: number;
  category: string;
  winner: string;
  malId: number;
}

export const CRUNCHYROLL_AWARDS: AwardEntry[] = [
  { year: 2025, category: "Anime of the Year", winner: "Solo Leveling Season 2: Arise from the Shadow", malId: 176496 },
  { year: 2025, category: "Best Animation", winner: "Demon Slayer: Infinity Castle", malId: 178788 },
  { year: 2025, category: "Best Action", winner: "Solo Leveling Season 2", malId: 176496 },
  { year: 2025, category: "Best Romance", winner: "Dandadan", malId: 171018 },
  { year: 2025, category: "Best Comedy", winner: "Spy x Family Season 3", malId: 177937 },
  { year: 2025, category: "Best Fantasy", winner: "Frieren: Beyond Journey's End Season 2", malId: 182255 },
  { year: 2024, category: "Anime of the Year", winner: "Jujutsu Kaisen Season 2", malId: 145064 },
  { year: 2024, category: "Best Animation", winner: "Demon Slayer: Hashira Training Arc", malId: 166240 },
  { year: 2024, category: "Best Action", winner: "Solo Leveling", malId: 151807 },
  { year: 2024, category: "Best Romance", winner: "Oshi no Ko Season 2", malId: 166531 },
  { year: 2024, category: "Best Comedy", winner: "KonoSuba: An Explosion on This Wonderful World!", malId: 150075 },
  { year: 2024, category: "Best Fantasy", winner: "Mushoku Tensei Season 2", malId: 146065 },
  { year: 2024, category: "Best Drama", winner: "Frieren: Beyond Journey's End", malId: 170068 },
  { year: 2024, category: "Best Score", winner: "Frieren: Beyond Journey's End", malId: 170068 },
  { year: 2024, category: "Best New Series", winner: "Solo Leveling", malId: 151807 },
  { year: 2023, category: "Anime of the Year", winner: "Demon Slayer: Swordsmith Village Arc", malId: 145139 },
  { year: 2023, category: "Best Animation", winner: "Demon Slayer: Swordsmith Village Arc", malId: 145139 },
  { year: 2023, category: "Best Action", winner: "Jujutsu Kaisen Season 2", malId: 145064 },
  { year: 2023, category: "Best Romance", winner: "Horimiya: The Missing Pieces", malId: 163132 },
  { year: 2023, category: "Best Comedy", winner: "Spy x Family Season 2", malId: 158927 },
  { year: 2023, category: "Best Fantasy", winner: "Mushoku Tensei Season 2", malId: 146065 },
  { year: 2023, category: "Best Drama", winner: "Vinland Saga Season 2", malId: 136430 },
  { year: 2023, category: "Best Score", winner: "Oshi no Ko", malId: 150672 },
  { year: 2023, category: "Best New Series", winner: "Oshi no Ko", malId: 150672 },
  { year: 2022, category: "Anime of the Year", winner: "Demon Slayer: Entertainment District Arc", malId: 142329 },
  { year: 2022, category: "Best Animation", winner: "Demon Slayer: Entertainment District Arc", malId: 142329 },
  { year: 2022, category: "Best Action", winner: "Attack on Titan Final Season Part 2", malId: 131681 },
  { year: 2022, category: "Best Romance", winner: "My Dress-Up Darling", malId: 132405 },
  { year: 2022, category: "Best Comedy", winner: "Spy x Family", malId: 140960 },
  { year: 2022, category: "Best Fantasy", winner: "Re:ZERO Season 2", malId: 108632 },
  { year: 2022, category: "Best Drama", winner: "86 EIGHTY-SIX", malId: 116589 },
  { year: 2022, category: "Best Score", winner: "Spy x Family", malId: 140960 },
  { year: 2022, category: "Best New Series", winner: "Spy x Family", malId: 140960 },
  { year: 2021, category: "Anime of the Year", winner: "Jujutsu Kaisen", malId: 113415 },
  { year: 2021, category: "Best Animation", winner: "Demon Slayer: Mugen Train", malId: 112151 },
  { year: 2021, category: "Best Action", winner: "Jujutsu Kaisen", malId: 113415 },
  { year: 2021, category: "Best Romance", winner: "Horimiya", malId: 124080 },
  { year: 2021, category: "Best Comedy", winner: "Kaguya-sama: Love is War Season 2", malId: 112641 },
  { year: 2021, category: "Best Fantasy", winner: "Re:ZERO Season 2", malId: 108632 },
  { year: 2021, category: "Best Drama", winner: "86 EIGHTY-SIX", malId: 116589 },
  { year: 2021, category: "Best Score", winner: "Jujutsu Kaisen", malId: 113415 },
  { year: 2021, category: "Best New Series", winner: "Jujutsu Kaisen", malId: 113415 },
];

export const AWARD_YEARS = [...new Set(CRUNCHYROLL_AWARDS.map((a) => a.year))].sort((a, b) => b - a);

export function getAwardsByYear(year: number): AwardEntry[] {
  return CRUNCHYROLL_AWARDS.filter((a) => a.year === year);
}
