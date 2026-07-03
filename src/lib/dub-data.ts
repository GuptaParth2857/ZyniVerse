export interface DubEntry {
  title: string;
  type: string;
  releaseDate: string;
  status: "Airing" | "Upcoming" | "Completed";
  episodes: string;
  anilistId?: number;
  coverImage?: string;
}

export const UPCOMING_DUBS: DubEntry[] = [
  { title: "Solo Leveling Season 2: Arise from the Shadow", type: "English Dub", releaseDate: "2025-01-04", status: "Airing", episodes: "13" },
  { title: "Jujutsu Kaisen Season 3", type: "English Dub", releaseDate: "2026-10-01", status: "Upcoming", episodes: "TBA" },
  { title: "Demon Slayer: Infinity Castle", type: "English Dub", releaseDate: "2026-09-12", status: "Upcoming", episodes: "Movie" },
  { title: "One Piece (Egghead Arc)", type: "English Dub", releaseDate: "2025-01-25", status: "Airing", episodes: "1100+" },
  { title: "My Hero Academia Season 8", type: "English Dub", releaseDate: "2026-09-01", status: "Upcoming", episodes: "TBA" },
  { title: "Chainsaw Man Season 2", type: "English Dub", releaseDate: "2025-07-01", status: "Airing", episodes: "12" },
  { title: "Spy x Family Season 3", type: "English Dub", releaseDate: "2025-10-01", status: "Airing", episodes: "12" },
  { title: "Dragon Ball DAIMA", type: "English Dub", releaseDate: "2024-10-11", status: "Completed", episodes: "20" },
  { title: "Mashle: Magic and Muscles Season 3", type: "English Dub", releaseDate: "2025-04-01", status: "Airing", episodes: "12" },
  { title: "Blue Lock Season 2", type: "English Dub", releaseDate: "2025-01-04", status: "Completed", episodes: "24" },
  { title: "Boruto: Two Blue Vortex", type: "English Dub", releaseDate: "2025-03-01", status: "Airing", episodes: "52+" },
  { title: "Dandadan", type: "English Dub", releaseDate: "2025-01-01", status: "Completed", episodes: "12" },
  { title: "Witch Watch", type: "English Dub", releaseDate: "2025-04-01", status: "Airing", episodes: "24" },
  { title: "Sakamoto Days", type: "English Dub", releaseDate: "2025-01-11", status: "Completed", episodes: "11" },
  { title: "Dr. Stone: Science Future", type: "English Dub", releaseDate: "2025-01-09", status: "Completed", episodes: "12" },
  { title: "Tower of God Season 2", type: "English Dub", releaseDate: "2025-01-01", status: "Completed", episodes: "26" },
  { title: "Re:ZERO Season 3", type: "English Dub", releaseDate: "2025-02-01", status: "Airing", episodes: "16+" },
  { title: "Frieren: Beyond Journey's End (Season 2)", type: "English Dub", releaseDate: "2026-01-01", status: "Airing", episodes: "28" },
  { title: "Classroom of the Elite Season 4", type: "English Dub", releaseDate: "2026-10-01", status: "Upcoming", episodes: "TBA" },
  { title: "Oshi no Ko Season 3", type: "English Dub", releaseDate: "2026-10-01", status: "Upcoming", episodes: "TBA" },
  { title: "Gachiakuta", type: "English Dub", releaseDate: "2026-07-01", status: "Airing", episodes: "12+" },
  { title: "Fire Force Season 3", type: "English Dub", releaseDate: "2026-07-01", status: "Airing", episodes: "12+" },
  { title: "Kaiju No. 8 Season 2", type: "English Dub", releaseDate: "2026-10-01", status: "Upcoming", episodes: "TBA" },
];

export function getDubsByStatus(status: DubEntry["status"]): DubEntry[] {
  return UPCOMING_DUBS.filter((d) => d.status === status).sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
}

export function getAllDubs(): DubEntry[] {
  return [...UPCOMING_DUBS].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
}
