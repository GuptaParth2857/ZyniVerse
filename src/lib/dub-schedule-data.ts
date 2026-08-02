export interface DubScheduleEntry {
  title: string;
  anilistId?: number;
  malId?: number;
  episode: string;
  day: string;
  time: string;
  platform: string;
  language: string;
  coverImage?: string;
  status: "Airing" | "Completed" | "Upcoming";
}

export const DUB_SCHEDULE: DubScheduleEntry[] = [
  // ─── Monday ───
  { title: "One Piece", anilistId: 21, malId: 21, episode: "Ep 1120+", day: "Monday", time: "11:30 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-tOnNyOQWw67.jpg", status: "Airing" },
  { title: "Detective Conan", anilistId: 235, malId: 22769, episode: "Ep 1130+", day: "Monday", time: "9:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx235-mbVfPKgJpcB.jpg", status: "Airing" },

  // ─── Tuesday ───
  { title: "Doraemon", anilistId: 3010, malId: 26349, episode: "Ep 1787+", day: "Tuesday", time: "8:00 PM IST", platform: "JioHotstar", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx3010-zgGmMz2JtVfX.jpg", status: "Airing" },
  { title: "Beyblade Burst", anilistId: 9945, malId: 16498, episode: "Ep 325+", day: "Tuesday", time: "5:30 PM IST", platform: "Sony YAY", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9945-b1lqQ5K5p4zD.jpg", status: "Airing" },

  // ─── Wednesday ───
  { title: "Shin-chan", anilistId: 317, malId: 6045, episode: "Ep 1100+", day: "Wednesday", time: "9:00 PM IST", platform: "JioHotstar", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx317-3rdmJBO1pJSA.jpg", status: "Airing" },
  { title: "Pokemon", anilistId: 656, malId: 6702, episode: "Ep 1250+", day: "Wednesday", time: "6:00 PM IST", platform: "Cartoon Network", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx656-s4nVZJJFr6Y8.jpg", status: "Airing" },

  // ─── Thursday ───
  { title: "Kochikame", anilistId: 1867, malId: 869, episode: "Ep 380", day: "Thursday", time: "7:30 PM IST", platform: "JioHotstar", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1867-rCsrqX7DvDfH.jpg", status: "Completed" },

  // ─── Friday ───
  { title: "Digimon Adventure", anilistId: 5084, malId: 52991, episode: "Ep 67", day: "Friday", time: "6:30 PM IST", platform: "Cartoon Network", language: "Hindi / Tamil / Telugu", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5084-Gq7dJbJfQx0s.jpg", status: "Completed" },

  // ─── Saturday ───
  { title: "Solo Leveling", anilistId: 145139, malId: 113415, episode: "S2 Ep 13 (Dub)", day: "Saturday", time: "10:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145139-haFzEg6YmH6w.jpg", status: "Airing" },
  { title: "Jujutsu Kaisen", anilistId: 113415, malId: 23755, episode: "S2 Dub (All)", day: "Saturday", time: "11:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-rfY1g5CqOmfm.jpg", status: "Completed" },

  // ─── Sunday ───
  { title: "Dragon Ball Super", anilistId: 16935, malId: 22319, episode: "Ep 131 (All)", day: "Sunday", time: "12:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16935-aS9e1NUSYjMm.jpg", status: "Completed" },
  { title: "Naruto: Shippuden", anilistId: 1735, malId: 1735, episode: "Ep 500 (All)", day: "Sunday", time: "2:00 PM IST", platform: "Crunchyroll", language: "Hindi / Tamil / Telugu", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-jPTfBqO7G65A.jpg", status: "Completed" },
  { title: "Attack on Titan", anilistId: 16498, malId: 16498, episode: "Ep 87 (All)", day: "Sunday", time: "4:00 PM IST", platform: "Crunchyroll", language: "Hindi / Tamil / Telugu", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-4snSAJnBHxhN.jpg", status: "Completed" },
];

export const DUB_PLATFORMS = ["All", "Crunchyroll", "JioHotstar", "Sony YAY", "Cartoon Network", "Netflix"];
export const DUB_LANGUAGES = ["All", "Hindi", "Tamil", "Telugu"];
export const DUB_DAYS = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
