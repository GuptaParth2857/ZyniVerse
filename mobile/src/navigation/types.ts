export type RootStackParamList = {
  MainTabs: undefined;
  AnimeDetail: { id: number };
  FillerGuide: { id: number; title: string };
  MangaDetail: { id: number };
  ThreadDetail: { id: string };
  ForumCategory: { slug: string };
  Settings: undefined;
  Recommendations: undefined;
  TournamentDetail: { id: string; title: string };
  Login: undefined;
};

export type TabParamList = {
  Home: undefined;
  Tournaments: undefined;
  Search: undefined;
  Schedule: undefined;
  Forum: undefined;
  Profile: undefined;
};
