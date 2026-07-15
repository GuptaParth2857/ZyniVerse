import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type MediaTitle {
    romaji: String
    english: String
    native: String
    userPreferred: String
  }

  type CoverImage {
    extraLarge: String
    large: String
    medium: String
    color: String
  }

  type FuzzyDate {
    year: Int
    month: Int
    day: Int
  }

  type StudioNode {
    id: Int!
    name: String!
    isAnimationStudio: Boolean
  }

  type Studios {
    nodes: [StudioNode]
  }

  type NextAiringEpisode {
    airingAt: Int!
    episode: Int!
    timeUntilAiring: Int!
  }

  type Tag {
    id: Int!
    name: String!
    description: String
    category: String
    rank: Int!
    isGeneralSpoiler: Boolean!
    isMediaSpoiler: Boolean!
    isAdult: Boolean!
  }

  type Trailer {
    id: String!
    site: String!
    thumbnail: String
  }

  type ExternalLink {
    id: Int!
    url: String!
    site: String!
    siteId: Int
    type: String
    language: String
    color: String
    icon: String
    notes: String
    isDisabled: Boolean
  }

  type StreamingEpisode {
    title: String!
    thumbnail: String!
    url: String!
    site: String!
  }

  type VoiceActor {
    id: Int!
    name: StaffName!
    languageV2: String
    image: Image!
  }

  type StaffName {
    first: String
    middle: String
    last: String
    full: String
    native: String
    userPreferred: String
  }

  type Image {
    large: String
    medium: String
  }

  type CharacterEdge {
    role: String!
    name: String
    voiceActor: VoiceActor
    node: CharacterNode!
  }

  type CharacterNode {
    id: Int!
    name: CharacterName!
    image: Image!
    description: String
    gender: String
    dateOfBirth: FuzzyDate
    age: String
    bloodType: String
    favourites: Int
    siteUrl: String
  }

  type CharacterName {
    first: String
    middle: String
    last: String
    full: String
    native: String
    alternative: [String]
  }

  type StaffEdge {
    role: String!
    node: StaffNode!
  }

  type StaffNode {
    id: Int!
    name: StaffName!
    languageV2: String
    image: Image!
    primaryOccupations: [String]
    siteUrl: String
    favourites: Int
  }

  type RelationEdge {
    id: Int!
    relationType: String!
    node: RelationNode!
  }

  type RelationNode {
    id: Int!
    idMal: Int
    title: MediaTitle!
    coverImage: CoverImage!
    bannerImage: String
    format: String
    status: String
    episodes: Int
    chapters: Int
    volumes: Int
    averageScore: Int
    meanScore: Int
    popularity: Int
    type: String
    startDate: FuzzyDate
    endDate: FuzzyDate
    siteUrl: String
  }

  type Ranking {
    id: Int!
    rank: Int!
    type: String!
    format: String
    year: Int
    season: String
    allTime: Boolean
    context: String!
  }

  type RecommendationEdge {
    node: RecommendationNode!
  }

  type RecommendationNode {
    id: Int!
    rating: Int!
    mediaRecommendation: RecommendationMedia!
  }

  type RecommendationMedia {
    id: Int!
    title: MediaTitle!
    coverImage: CoverImage!
    format: String
    episodes: Int
    chapters: Int
    volumes: Int
    averageScore: Int
    popularity: Int
    type: String
    siteUrl: String
  }

  type ScoreDistribution {
    score: Int!
    amount: Int!
  }

  type StatusDistribution {
    status: String!
    amount: Int!
  }

  type Stats {
    scoreDistribution: [ScoreDistribution]
    statusDistribution: [StatusDistribution]
  }

  type FillerInfo {
    total: Int!
    filler: Int!
    fillerPercent: Float!
    quickList: String!
  }

  type Anime {
    id: Int!
    idMal: Int
    title: MediaTitle!
    description: String
    coverImage: CoverImage!
    bannerImage: String
    format: String
    status: String
    episodes: Int
    duration: Int
    season: String
    seasonYear: Int
    genres: [String]
    averageScore: Int
    meanScore: Int
    popularity: Int
    trending: Int
    favourites: Int
    countryOfOrigin: String
    isLicensed: Boolean
    source: String
    tags: [Tag]
    startDate: FuzzyDate
    endDate: FuzzyDate
    studios: Studios
    trailer: Trailer
    siteUrl: String
    nextAiringEpisode: NextAiringEpisode
    characters: [CharacterEdge]
    staff: [StaffEdge]
    externalLinks: [ExternalLink]
    streamingEpisodes: [StreamingEpisode]
    relations: [RelationEdge]
    rankings: [Ranking]
    recommendations: [RecommendationEdge]
    stats: Stats
    filler: FillerInfo
    zyniScore: ZyniScoreResult
    communityTags: [CommunityTagItem]
  }

  type Manga {
    id: Int!
    idMal: Int
    title: MediaTitle!
    description: String
    coverImage: CoverImage!
    bannerImage: String
    format: String
    status: String
    chapters: Int
    volumes: Int
    countryOfOrigin: String
    source: String
    genres: [String]
    averageScore: Int
    meanScore: Int
    popularity: Int
    trending: Int
    favourites: Int
    startDate: FuzzyDate
    endDate: FuzzyDate
    tags: [Tag]
    externalLinks: [ExternalLink]
    relations: [RelationEdge]
    rankings: [Ranking]
    recommendations: [RecommendationEdge]
    stats: Stats
    siteUrl: String
    zyniScore: ZyniScoreResult
    communityTags: [CommunityTagItem]
  }

  type Character {
    id: Int!
    name: CharacterName!
    image: Image!
    description: String
    gender: String
    dateOfBirth: FuzzyDate
    age: String
    bloodType: String
    favourites: Int
    siteUrl: String
  }

  type Staff {
    id: Int!
    name: StaffName!
    image: Image!
    description: String
    gender: String
    favourites: Int
    siteUrl: String
    dateOfBirth: FuzzyDate
    age: String
    homeTown: String
    yearsActive: String
    primaryOccupations: [String]
  }

  type Studio {
    id: Int!
    name: String!
    siteUrl: String
    isAnimationStudio: Boolean
    favourites: Int
    media: [Anime]
  }

  type ScheduleEntry {
    mediaId: Int!
    title: String!
    episode: Int!
    airingAt: Int!
    timeUntilAiring: Int
    coverImage: String
    format: String
    genres: [String]
  }

  type DubEntry {
    title: String!
    type: String!
    releaseDate: String!
    status: String!
    episodes: String
    coverImage: String
  }

  type PageInfo {
    hasNextPage: Boolean!
    total: Int!
  }

  type SearchResult {
    pageInfo: PageInfo!
    anime: [Anime]
    manga: [Manga]
  }

  type AnimePage {
    pageInfo: PageInfo!
    media: [Anime]!
  }

  type DubStatusResult {
    malId: Int!
    available: [String]!
    totalDubRequests: Int!
    lastUpdated: String
  }

  type ZyniScoreResult {
    mediaId: String!
    averageScore: Float
    bayesianScore: Float
    totalRatings: Int
    distribution: [ZyniScoreBucket]
    verifiedWeight: Float
  }

  type ZyniScoreBucket {
    score: Int!
    count: Int!
    percentage: Float!
  }

  type CommunityTagItem {
    id: String!
    tag: String!
    category: String
    upvotes: Int!
    downvotes: Int!
    score: Int!
    userId: String!
    username: String
    createdAt: String!
  }

  type CommunityTagConnection {
    tags: [CommunityTagItem]!
    total: Int!
  }

  type TrendingTag {
    tag: String!
    count: Int!
    avgScore: Float!
    mediaCount: Int!
  }

  type ActivityReactionItem {
    id: String!
    type: String!
    userId: String!
    username: String
    createdAt: String!
  }

  type ClubEventItem {
    id: String!
    title: String!
    description: String
    startTime: String!
    endTime: String
    location: String
    clubId: String!
    createdAt: String!
    rsvpCount: Int!
  }

  type ZyniAwardCategory {
    id: String!
    name: String!
    emoji: String
  }

  type ZyniAwardNomineeItem {
    id: String!
    mediaId: Int!
    title: String!
    coverImage: String
    votes: Int!
    totalVotes: Int!
  }

  type ZyniAwardRound {
    round: Int!
    nominees: [ZyniAwardNomineeItem]!
  }

  type ZyniAwardData {
    year: Int!
    status: String!
    categories: [ZyniAwardCategory]
    votingOpen: Boolean
    bracket: ZyniAwardRound
  }

  type FigureCollectionItem {
    id: String!
    name: String!
    anime: String
    manufacturer: String
    scale: String
    price: Float
    currency: String
    purchaseDate: String
    image: String
    condition: String
    isForSale: Boolean!
    createdAt: String!
  }

  type FigureStats {
    totalFigures: Int!
    totalValue: Float!
    currency: String!
    recentAdditions: Int!
    byAnime: [FigureAnimeStat]!
    byCondition: [FigureConditionStat]!
    byManufacturer: [FigureManufacturerStat]!
  }

  type FigureAnimeStat {
    anime: String!
    count: Int!
  }

  type FigureConditionStat {
    condition: String!
    count: Int!
  }

  type FigureManufacturerStat {
    manufacturer: String!
    count: Int!
  }

  type UserProfile {
    id: String!
    username: String!
    avatar: String
    bio: String
    createdAt: String!
    figureCollection: [FigureCollectionItem]
    figureStats: FigureStats
  }

  type Query {
    anime(id: Int!): Anime
    animeTrending(page: Int, perPage: Int): AnimePage!
    animePopular(page: Int, perPage: Int): AnimePage!
    animeTopRated(page: Int, perPage: Int): AnimePage!
    animeUpcoming(page: Int, perPage: Int): AnimePage!
    seasonalAnime(year: Int, season: String, perPage: Int): AnimePage!

    mangaTrending(page: Int, perPage: Int): AnimePage!
    mangaPopular(page: Int, perPage: Int): AnimePage!
    mangaTopRated(page: Int, perPage: Int): AnimePage!

    search(query: String!, page: Int, perPage: Int): SearchResult!
    searchAnime(query: String!, page: Int, perPage: Int): AnimePage!
    searchManga(query: String!, page: Int, perPage: Int): AnimePage!

    character(id: Int!): Character
    staff(id: Int!): Staff
    studio(id: Int!): Studio

    schedule(hoursBack: Int, hoursAhead: Int): [ScheduleEntry]!
    schedulePaginated(page: Int, perPage: Int): AnimePage!

    filler(anilistId: Int!, title: String): FillerInfo

    dubStatus(malId: Int!): DubStatusResult
    dubSchedule: [DubEntry]!

    genres: [String]!
    trendingNow: [Anime]!
    spotlights: [Anime]!

    zyniScore(mediaId: String!): ZyniScoreResult
    zyniScoreBatch(mediaIds: [String!]!): [ZyniScoreResult]!

    communityTags(mediaId: String!, sort: String): CommunityTagConnection!
    trendingTags(limit: Int): [TrendingTag]!

    activityReactions(activityId: String!): [ActivityReactionItem]!

    clubEvents(clubId: String!, upcoming: Boolean): [ClubEventItem]!

    zyniAwards(year: Int!): ZyniAwardData
    zyniAwardsList: [ZyniAwardData]!

    figureCollection(userId: String!): [FigureCollectionItem]
    figureStats(userId: String!): FigureStats

    userProfile(username: String!): UserProfile
  }
`);
