export interface LiveActionAnime {
  id: string;
  title: string;
  japaneseTitle?: string;
  type: "series" | "movie";
  status: "available" | "upcoming" | "cancelled";
  releaseYear: number;
  endYear?: number;
  seasons?: number;
  episodes?: number;
  platforms: Platform[];
  languages: string[];
  genres: string[];
  rating: number;
  description: string;
  basedOn: string;
  posterUrl?: string;
  trailerUrl?: string;
}

export interface Platform {
  name: string;
  logoColor: string;
  available: boolean;
  url: string;
  subtitle?: string;
}

export const LIVE_ACTION_PLATFORMS = [
  { name: "Netflix", logoColor: "#E50914", url: "https://www.netflix.com" },
  { name: "Prime Video", logoColor: "#00A8E1", url: "https://www.primevideo.com" },
  { name: "Crunchyroll", logoColor: "#F47521", url: "https://www.crunchyroll.com" },
  { name: "JioCinema", logoColor: "#E53E3E", url: "https://www.jiocinema.com" },
  { name: "Hotstar", logoColor: "#113CCF", url: "https://www.hotstar.com" },
  { name: "20th Century Studios", logoColor: "#1A1A2E", url: "https://www.20thcenturystudios.com" },
  { name: "Japanese Theaters", logoColor: "#DC2626", url: "#" },
];

export const LIVE_ACTION_ANIME: LiveActionAnime[] = [
  {
    id: "one-piece-la-s1",
    title: "One Piece",
    japaneseTitle: "ワンピース",
    type: "series",
    status: "available",
    releaseYear: 2023,
    endYear: 2026,
    seasons: 2,
    episodes: 16,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/80217914", subtitle: "English & Japanese Audio + Hindi Sub" },
    ],
    languages: ["English", "Japanese", "Hindi"],
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 8.4,
    basedOn: "One Piece by Eiichiro Oda",
    description: "A live-action adaptation of the legendary pirate epic. Monkey D. Luffy sets sail with his crew of Straw Hat Pirates in search of the ultimate treasure, the One Piece. Netflix's ambitious adaptation captures the spirit of the original with stunning visuals and faithful storytelling.",
  },
  {
    id: "alice-in-borderland-la",
    title: "Alice in Borderland",
    japaneseTitle: "今際の国のアリス",
    type: "series",
    status: "available",
    releaseYear: 2020,
    endYear: 2025,
    seasons: 3,
    episodes: 24,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/80189685", subtitle: "Japanese Audio + Hindi Sub" },
    ],
    languages: ["Japanese", "Hindi"],
    genres: ["Sci-fi", "Thriller", "Survival"],
    rating: 8.0,
    basedOn: "Alice in Borderland by Haro Aso",
    description: "A gamer and his friends are mysteriously transported to a deserted Tokyo where they must compete in deadly games to survive. The series blends high-stakes survival games with emotional character development across three gripping seasons.",
  },
  {
    id: "yu-yu-hakusho-la",
    title: "Yu Yu Hakusho",
    japaneseTitle: "幽☆遊☆白書",
    type: "series",
    status: "available",
    releaseYear: 2023,
    seasons: 1,
    episodes: 5,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/81730895", subtitle: "Japanese Audio + Hindi Sub" },
    ],
    languages: ["Japanese", "Hindi"],
    genres: ["Action", "Supernatural"],
    rating: 7.0,
    basedOn: "Yu Yu Hakusho by Yoshihiro Togashi",
    description: "After dying to save a child, delinquent Yusuke Urameshi is brought back as a Spirit Detective and tasked with investigating supernatural cases. This compact adaptation condenses the classic '90s anime into a stylish five-episode series.",
  },
  {
    id: "rurouni-kenshin-films",
    title: "Rurouni Kenshin Films",
    japaneseTitle: "るろうに剣心",
    type: "movie",
    status: "available",
    releaseYear: 2012,
    endYear: 2021,
    episodes: 5,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com", subtitle: "Japanese Audio + Hindi Sub" },
      { name: "Prime Video", logoColor: "#00A8E1", available: true, url: "https://www.primevideo.com", subtitle: "Japanese Audio + Hindi Sub" },
    ],
    languages: ["Japanese", "Hindi"],
    genres: ["Action", "Samurai", "Historical"],
    rating: 8.2,
    basedOn: "Rurouni Kenshin by Nobuhiro Watsuki",
    description: "A five-film live-action saga following Himura Kenshin, a legendary assassin turned wandering samurai, as he protects the innocent during the Meiji Restoration. Widely regarded as one of the best anime-to-live-action adaptations ever made, featuring breathtaking swordplay.",
  },
  {
    id: "death-note-la-film",
    title: "Death Note",
    japaneseTitle: "デスノート",
    type: "movie",
    status: "available",
    releaseYear: 2017,
    seasons: 1,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/80057281", subtitle: "English Audio" },
    ],
    languages: ["English"],
    genres: ["Thriller", "Supernatural", "Crime"],
    rating: 4.5,
    basedOn: "Death Note by Tsugumi Ohba & Takeshi Obata",
    description: "A high school student discovers a supernatural notebook that kills anyone whose name is written in it. Netflix's American adaptation transposes the story to a U.S. setting, diverging significantly from the Japanese original and receiving mixed reception.",
  },
  {
    id: "cowboy-bebop-la",
    title: "Cowboy Bebop",
    japaneseTitle: "カウボーイビバップ",
    type: "series",
    status: "available",
    releaseYear: 2021,
    seasons: 1,
    episodes: 10,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/81028059", subtitle: "English Audio" },
    ],
    languages: ["English"],
    genres: ["Sci-fi", "Action", "Space Western"],
    rating: 6.7,
    basedOn: "Cowboy Bebop by Shinichirō Watanabe",
    description: "Bounty hunters Spike Spiegel, Jet Black, and Faye Valentine travel the solar system in their ship, the Bebop, taking on dangerous jobs. This live-action adaptation brings the beloved sci-fi classic to life with Keanu Reeves attached early and John Cho ultimately starring.",
  },
  {
    id: "parasyte-the-grey",
    title: "Parasyte: The Grey",
    japaneseTitle: "기생수: 더 그레이",
    type: "series",
    status: "available",
    releaseYear: 2024,
    seasons: 1,
    episodes: 6,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/81618674", subtitle: "Korean Audio + Hindi Sub" },
    ],
    languages: ["Korean", "Hindi"],
    genres: ["Horror", "Sci-fi", "Action"],
    rating: 7.2,
    basedOn: "Parasyte by Hitoshi Iwaaki",
    description: "A Korean spin-off of the beloved manga, following a new group of humans battling parasitic aliens that take over human bodies. Expands the Parasyte universe with fresh characters while honoring the spirit of the original story.",
  },
  {
    id: "kakegurui-la-s1s2",
    title: "Kakegurui",
    japaneseTitle: "賭ケグルイ",
    type: "series",
    status: "available",
    releaseYear: 2018,
    endYear: 2019,
    seasons: 2,
    episodes: 15,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/80186867", subtitle: "Japanese Audio + Hindi Sub" },
    ],
    languages: ["Japanese", "Hindi"],
    genres: ["Drama", "Thriller", "Psychological"],
    rating: 7.3,
    basedOn: "Kakegurui by Homura Kawamoto",
    description: "At Hyakkaou Private Academy, students' social status is determined by their gambling prowess. Transfer student Yumeko Jabami disrupts the hierarchy with her addictive, chaotic approach to high-stakes games. A stylish, adrenaline-fueled drama.",
  },
  {
    id: "kimi-ni-todoke-la",
    title: "From Me to You: Kimi ni Todoke",
    japaneseTitle: "君に届け",
    type: "series",
    status: "available",
    releaseYear: 2023,
    seasons: 1,
    episodes: 12,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/81727558", subtitle: "Japanese Audio + Hindi Sub" },
    ],
    languages: ["Japanese", "Hindi"],
    genres: ["Romance", "Slice of Life"],
    rating: 7.0,
    basedOn: "Kimi ni Todoke by Karuho Shiina",
    description: "Sawako Kuronuma, nicknamed 'Sadako' for her resemblance to the horror character, struggles to make friends until she develops feelings for the popular Shota Kazehaya. A heartwarming live-action adaptation of the beloved shoujo manga.",
  },
  {
    id: "golden-kamuy-film-series",
    title: "Golden Kamuy",
    japaneseTitle: "ゴールデンカムイ",
    type: "movie",
    status: "available",
    releaseYear: 2024,
    endYear: 2025,
    episodes: 4,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com", subtitle: "Japanese Audio + Hindi Sub" },
    ],
    languages: ["Japanese", "Hindi"],
    genres: ["Action", "Adventure", "Historical"],
    rating: 7.8,
    basedOn: "Golden Kamuy by Satoru Noda",
    description: "In early 20th century Hokkaido, war veteran Sugimoto and Ainu girl Asirpa race to find legendary lost Ainu gold. Combines brutal action with dark humor, historical detail, and genuine human warmth. The film covers early arcs while the series expands the story.",
  },
  {
    id: "bloodhounds-la-s1s2",
    title: "Bloodhounds",
    japaneseTitle: "블하운즈",
    type: "series",
    status: "available",
    releaseYear: 2023,
    endYear: 2024,
    seasons: 2,
    episodes: 16,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/81262326", subtitle: "Korean Audio + Hindi Sub" },
    ],
    languages: ["Korean", "Hindi"],
    genres: ["Action", "Thriller", "Crime"],
    rating: 7.5,
    basedOn: "Bloodhounds by Cheon Kyeong",
    description: "Two young boxers team up with a veteran ex-marine to take down a ruthless loan shark who preys on the vulnerable. Based on a popular Korean webtoon, this hard-hitting action series delivers intense fights and emotional weight.",
  },
  {
    id: "viral-hit-la",
    title: "Viral Hit",
    japaneseTitle: "여신강림",
    type: "series",
    status: "available",
    releaseYear: 2026,
    seasons: 1,
    episodes: 6,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com", subtitle: "Korean Audio + Hindi Sub" },
    ],
    languages: ["Korean", "Hindi"],
    genres: ["Action", "Drama"],
    rating: 7.0,
    basedOn: "Viral Hit by Naver/Webtoon",
    description: "A high school student discovers his fighting ability when pushed too far and begins streaming his fights online, quickly going viral. Explores themes of bullying, social media culture, and the morality of violence for entertainment.",
  },
  {
    id: "avatar-last-airbender-la",
    title: "Avatar: The Last Airbender",
    japaneseTitle: "Avatar: The Last Airbender",
    type: "series",
    status: "available",
    releaseYear: 2024,
    seasons: 1,
    episodes: 8,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com/title/81472759", subtitle: "English Audio + Hindi Dub" },
    ],
    languages: ["English", "Hindi"],
    genres: ["Fantasy", "Adventure", "Action"],
    rating: 7.2,
    basedOn: "Avatar: The Last Airbender by Nickelodeon",
    description: "In a world of elemental bending, young Aang must master all four elements and stop the Fire Nation from conquering the world. Netflix's adaptation brings the beloved animated series to live-action with a fresh take on the iconic story.",
  },
  {
    id: "naruto-live-action",
    title: "Naruto Live-Action",
    japaneseTitle: "ナルト",
    type: "movie",
    status: "upcoming",
    releaseYear: 2026,
    platforms: [
      { name: "Japanese Theaters", logoColor: "#DC2626", available: false, url: "#" },
    ],
    languages: ["Japanese"],
    genres: ["Action", "Adventure", "Martial Arts"],
    rating: 0,
    basedOn: "Naruto by Masashi Kishimoto",
    description: "Lionsgate's live-action adaptation of the iconic ninja manga/anime. The film follows young Naruto Uzumaki as he strives to become the strongest ninja and leader of his village. Production details still under wraps.",
  },
  {
    id: "my-hero-academia-film",
    title: "My Hero Academia Film",
    japaneseTitle: "僕のヒーローアカデミア",
    type: "movie",
    status: "upcoming",
    releaseYear: 2026,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: false, url: "#", subtitle: "English & Japanese Audio" },
    ],
    languages: ["English", "Japanese"],
    genres: ["Action", "Superhero"],
    rating: 0,
    basedOn: "My Hero Academia by Kōhei Horikoshi",
    description: "A live-action adaptation of the hit superhero manga set in a world where 80% of the population has superpowers. Follows Izuku Midoriya, born without powers, as he inherits the ultimate ability and attends a prestigious hero academy.",
  },
  {
    id: "sakamoto-days-film",
    title: "Sakamoto Days Film",
    japaneseTitle: "サカモト デイズ",
    type: "movie",
    status: "upcoming",
    releaseYear: 2026,
    platforms: [
      { name: "Japanese Theaters", logoColor: "#DC2626", available: false, url: "#" },
    ],
    languages: ["Japanese"],
    genres: ["Action", "Comedy"],
    rating: 0,
    basedOn: "Sakamoto Days by Yuto Suzuki",
    description: "A legendary hitman retires to run a convenience store but is pulled back into the assassin world. Known for its incredible action choreography in the manga, the live-action film brings Taro Sakamoto's chaotic energy to the big screen.",
  },
  {
    id: "kingdom-5th-film",
    title: "Kingdom 5th Film",
    japaneseTitle: "キングダム 第5作",
    type: "movie",
    status: "upcoming",
    releaseYear: 2026,
    platforms: [
      { name: "Japanese Theaters", logoColor: "#DC2626", available: false, url: "#" },
    ],
    languages: ["Japanese"],
    genres: ["Action", "Historical", "War"],
    rating: 0,
    basedOn: "Kingdom by Yasuhisa Hara",
    description: "The fifth installment in the live-action Kingdom film series, adapting the epic tale of Xin, a young orphan who dreams of becoming the greatest general in ancient China. Known for large-scale battle sequences and political intrigue.",
  },
  {
    id: "bet-kakegurui-hollywood",
    title: "BET (Kakegurui Hollywood)",
    japaneseTitle: "BET カケグレイ",
    type: "series",
    status: "available",
    releaseYear: 2026,
    seasons: 1,
    episodes: 10,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: true, url: "https://www.netflix.com", subtitle: "English Audio" },
    ],
    languages: ["English"],
    genres: ["Drama", "Thriller", "Psychological"],
    rating: 6.8,
    basedOn: "Kakegurui by Homura Kawamoto",
    description: "A Hollywood reimagining of the Kakegurui franchise set in a fictional American elite boarding school where gambling determines social hierarchy. Features a new cast and Western setting while maintaining the high-stakes psychological drama of the original.",
  },
  {
    id: "dragon-ball-live-action",
    title: "Dragon Ball",
    japaneseTitle: "ドラゴンボール",
    type: "movie",
    status: "upcoming",
    releaseYear: 2027,
    platforms: [
      { name: "20th Century Studios", logoColor: "#1A1A2E", available: false, url: "#" },
    ],
    languages: ["English"],
    genres: ["Action", "Martial Arts", "Adventure"],
    rating: 0,
    basedOn: "Dragon Ball by Akira Toriyama",
    description: "20th Century Studios' new live-action adaptation of the legendary Dragon Ball franchise. A fresh start following the critically panned Dragon Ball Evolution, this film aims to faithfully adapt Toriyama's original manga story of Goku's journey from childhood to martial arts champion.",
  },
  {
    id: "one-piece-la-s3",
    title: "One Piece Season 3",
    japaneseTitle: "ワンピース Season 3",
    type: "series",
    status: "upcoming",
    releaseYear: 2027,
    seasons: 3,
    platforms: [
      { name: "Netflix", logoColor: "#E50914", available: false, url: "#", subtitle: "English & Hindi Audio" },
    ],
    languages: ["English", "Hindi"],
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 0,
    basedOn: "One Piece by Eiichiro Oda",
    description: "The third season of Netflix's hit One Piece live-action adaptation, currently in filming. Will continue adapting the beloved manga with the Straw Hat Pirates' next adventures. Following the massive success of Seasons 1 and 2, expectations are sky-high.",
  },
];

export function getAvailableAnime(): LiveActionAnime[] {
  return LIVE_ACTION_ANIME.filter((a) => a.status === "available");
}

export function getUpcomingAnime(): LiveActionAnime[] {
  return LIVE_ACTION_ANIME.filter((a) => a.status === "upcoming");
}

export function filterByPlatform(platformName: string): LiveActionAnime[] {
  return LIVE_ACTION_ANIME.filter((a) =>
    a.platforms.some((p) => p.name.toLowerCase() === platformName.toLowerCase())
  );
}

export function filterByLanguage(lang: string): LiveActionAnime[] {
  return LIVE_ACTION_ANIME.filter((a) =>
    a.languages.some((l) => l.toLowerCase() === lang.toLowerCase())
  );
}
