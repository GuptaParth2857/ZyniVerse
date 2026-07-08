export type RootStackParamList = {
  MainTabs: undefined;
  AnimeDetail: { id: number };
  FillerGuide: { id: number; title: string };
  MangaDetail: { id: number };
  ThreadDetail: { id: string };
  ForumCategory: { slug: string };
  Settings: undefined;
  Recommendations: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Schedule: undefined;
  Forum: undefined;
  Profile: undefined;
};
