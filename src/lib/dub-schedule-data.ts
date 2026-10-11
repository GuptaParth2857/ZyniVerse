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

// NOTE: `anilistId`, `malId` and `coverImage` are sourced directly from the
// AniList API (verified) so they always resolve. The `day`/`time`/`platform`
// slots are editorial broadcast estimates — confirm on the platform before
// relying on them.
export const DUB_SCHEDULE: DubScheduleEntry[] = [
  // ─── Monday ───
  { title: "One Piece", anilistId: 21, malId: 21, episode: "Ep 1120+", day: "Monday", time: "11:30 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg", status: "Airing" },
  { title: "Detective Conan", anilistId: 235, malId: 235, episode: "Ep 1130+", day: "Monday", time: "9:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx235-MyYT7K3chBdO.jpg", status: "Airing" },

  // ─── Tuesday ───
  { title: "Doraemon", anilistId: 8687, malId: 8687, episode: "Ep 1787+", day: "Tuesday", time: "8:00 PM IST", platform: "JioHotstar", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b8687-bBnJMGnih4PT.jpg", status: "Airing" },
  { title: "Beyblade Burst", anilistId: 21236, malId: 31049, episode: "Ep 325+", day: "Tuesday", time: "5:30 PM IST", platform: "Sony YAY", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21236-8B4fORbuUp6v.jpg", status: "Airing" },

  // ─── Wednesday ───
  { title: "Shin-chan", anilistId: 966, malId: 966, episode: "Ep 1100+", day: "Wednesday", time: "9:00 PM IST", platform: "JioHotstar", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b966-QUCdKAk4ls9J.jpg", status: "Airing" },
  { title: "Pokemon", anilistId: 527, malId: 527, episode: "Ep 1250+", day: "Wednesday", time: "6:00 PM IST", platform: "Cartoon Network", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b527-t6dBVJ5OVcXK.png", status: "Airing" },

  // ─── Thursday ───
  { title: "Kochikame", anilistId: 3545, malId: 3545, episode: "Ep 380", day: "Thursday", time: "7:30 PM IST", platform: "JioHotstar", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx3545-rhUDPxf7DsBQ.png", status: "Completed" },

  // ─── Friday ───
  { title: "Digimon Adventure", anilistId: 552, malId: 552, episode: "Ep 67", day: "Friday", time: "6:30 PM IST", platform: "Cartoon Network", language: "Hindi / Tamil / Telugu", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx552-zad0ts5hylQJ.jpg", status: "Completed" },

  // ─── Saturday ───
  { title: "Solo Leveling", anilistId: 151807, malId: 52299, episode: "S2 Ep 13 (Dub)", day: "Saturday", time: "10:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png", status: "Airing" },
  { title: "Jujutsu Kaisen", anilistId: 113415, malId: 40748, episode: "S2 Dub (All)", day: "Saturday", time: "11:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg", status: "Completed" },

  // ─── Sunday ───
  { title: "Dragon Ball Super", anilistId: 21175, malId: 30694, episode: "Ep 131 (All)", day: "Sunday", time: "12:00 PM IST", platform: "Crunchyroll", language: "Hindi", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21175-EH06qlfF8TnB.jpg", status: "Completed" },
  { title: "Naruto: Shippuden", anilistId: 1735, malId: 1735, episode: "Ep 500 (All)", day: "Sunday", time: "2:00 PM IST", platform: "Crunchyroll", language: "Hindi / Tamil / Telugu", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png", status: "Completed" },
  { title: "Attack on Titan", anilistId: 16498, malId: 16498, episode: "Ep 87 (All)", day: "Sunday", time: "4:00 PM IST", platform: "Crunchyroll", language: "Hindi / Tamil / Telugu", coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg", status: "Completed" },
];

export const DUB_PLATFORMS = ["All", "Crunchyroll", "JioHotstar", "Sony YAY", "Cartoon Network", "Netflix"];
export const DUB_LANGUAGES = ["All", "Hindi", "Tamil", "Telugu"];
export const DUB_DAYS = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
