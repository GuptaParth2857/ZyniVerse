export const CONVENTIONS_META = {
  disclaimer: "No public API exists for Indian anime convention data. All convention listings are community-sourced and may not reflect real events. Dates, venues, and details are illustrative examples. Verify with official event websites before making plans.",
  lastUpdated: "2026-07-08",
  source: "community-sourced",
} as const;

interface Convention {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  venue: string;
  startDate: string;
  endDate: string;
  website: string;
  ticketUrl?: string;
  image?: string;
  description: string;
  estimatedAttendance?: number;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  organizers?: string[];
  guests?: { name: string; role: string }[];
  tags: string[];
}

const database: Convention[] = [
  {
    id: "comic-con-delhi-jul",
    name: "Comic Con Delhi",
    shortName: "CC Delhi",
    city: "Delhi",
    state: "Delhi",
    venue: "NSIC Exhibition Grounds, Okhla",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "India's biggest pop culture convention featuring anime, comics, cosplay, gaming, and celebrity panels. Delhi edition with exclusive merchandise and artist alley.",
    estimatedAttendance: 35000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "pop-culture", "anime"],
  },
  {
    id: "anime-expo-delhi",
    name: "Anime Expo India Delhi",
    shortName: "AX Delhi",
    city: "Delhi",
    state: "Delhi",
    venue: "Pragati Maidan",
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    website: "https://animeexpo.in",
    ticketUrl: "https://animeexpo.in/tickets",
    description: "India's largest anime-exclusive convention. Cosplay contests, anime screenings, J-music performances, and exclusive merchandise from top anime brands.",
    estimatedAttendance: 25000,
    status: "upcoming",
    organizers: ["Anime Expo India"],
    guests: [
      { name: "TBD", role: "Special Guest" },
    ],
    tags: ["anime", "cosplay", "j-music", "screenings"],
  },
  {
    id: "bengaluru-anime-con",
    name: "Bengaluru Anime Con",
    shortName: "BAC",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "White Orchid Convention Hall, Whitefield",
    startDate: "2026-07-18",
    endDate: "2026-07-19",
    website: "https://bengaluruanimecon.in",
    ticketUrl: "https://bengaluruanimecon.in/tickets",
    description: "Bengaluru's premier anime convention featuring cosplay competitions, anime trivia, gaming tournaments, and artist stalls. Weekend packed with otaku activities.",
    estimatedAttendance: 12000,
    status: "upcoming",
    organizers: ["Otaku India Events"],
    tags: ["anime", "cosplay", "gaming", "trivia"],
  },
  {
    id: "comic-con-mumbai-aug",
    name: "Comic Con Mumbai",
    shortName: "CC Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    venue: "Bandra Kurla Complex (BKC)",
    startDate: "2026-08-28",
    endDate: "2026-08-30",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Mumbai edition of India's biggest pop culture fest. Celebrity appearances, exclusive previews, cosplay parade, and thousands of pop culture fans.",
    estimatedAttendance: 40000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "pop-culture", "celebrity"],
  },
  {
    id: "comic-con-bangalore",
    name: "Comic Con Bangalore",
    shortName: "CC Bangalore",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "KTPO Convention Centre, Whitefield",
    startDate: "2026-09-11",
    endDate: "2026-09-13",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Bengaluru's biggest pop culture convention. Three days of comics, anime, gaming, cosplay, and special celebrity appearances.",
    estimatedAttendance: 35000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "pop-culture", "anime"],
  },
  {
    id: "comic-con-hyderabad",
    name: "Comic Con Hyderabad",
    shortName: "CC Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    venue: "HICC, Novotel",
    startDate: "2026-09-25",
    endDate: "2026-09-27",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Hyderabad edition of Comic Con India. Cosplay competitions, gaming zones, anime screenings, and pop culture merchandise.",
    estimatedAttendance: 28000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "anime"],
  },
  {
    id: "otaku-fest-delhi",
    name: "Otaku Fest Delhi",
    shortName: "OF Delhi",
    city: "Delhi",
    state: "Delhi",
    venue: "Japanese Cultural Institute, Lodhi Road",
    startDate: "2026-10-03",
    endDate: "2026-10-04",
    website: "https://otakufest.in",
    ticketUrl: "https://otakufest.in/tickets",
    description: "A celebration of Japanese pop culture and anime. Features cosplay events, anime marathons, Japanese food stalls, and cultural workshops.",
    estimatedAttendance: 8000,
    status: "upcoming",
    organizers: ["Otaku Fest India"],
    tags: ["anime", "cosplay", "j-culture", "food"],
  },
  {
    id: "indipop-delhi",
    name: "IndiPop Delhi",
    shortName: "IndiPop",
    city: "Delhi",
    state: "Delhi",
    venue: "Talkatora Stadium",
    startDate: "2026-10-10",
    endDate: "2026-10-11",
    website: "https://indipop.in",
    ticketUrl: "https://indipop.in/tickets",
    description: "Pop culture convention covering anime, comics, gaming, and K-pop. Cosplay contests, merch stalls, and special performances.",
    estimatedAttendance: 15000,
    status: "upcoming",
    organizers: ["IndiPop Events"],
    tags: ["pop-culture", "anime", "k-pop", "cosplay", "gaming"],
  },
  {
    id: "comic-con-chennai",
    name: "Comic Con Chennai",
    shortName: "CC Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    venue: "Chennai Trade Centre, Nandambakkam",
    startDate: "2026-10-17",
    endDate: "2026-10-19",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Chennai's biggest pop culture convention. Three days of cosplay, anime, comics, and gaming with top celebrities and exhibitors.",
    estimatedAttendance: 25000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "anime"],
  },
  {
    id: "mumbai-anime-con",
    name: "Mumbai Anime Con",
    shortName: "MAC",
    city: "Mumbai",
    state: "Maharashtra",
    venue: "NESCO Exhibition Center, Goregaon",
    startDate: "2026-10-24",
    endDate: "2026-10-25",
    website: "https://mumbainanimecon.com",
    ticketUrl: "https://mumbainanimecon.com/tickets",
    description: "Mumbai's dedicated anime convention. Cosplay competitions, anime quizzes, gaming tournaments, artist alley, and special screenings of latest anime movies.",
    estimatedAttendance: 15000,
    status: "upcoming",
    organizers: ["Mumbai Anime Con Team"],
    guests: [
      { name: "TBD", role: "Voice Actor" },
    ],
    tags: ["anime", "cosplay", "gaming", "screenings"],
  },
  {
    id: "delhi-anime-con-nov",
    name: "Delhi Anime Con",
    shortName: "DAC",
    city: "Delhi",
    state: "Delhi",
    venue: "Dilli Haat, INA",
    startDate: "2026-11-07",
    endDate: "2026-11-08",
    website: "https://delhianimecon.in",
    ticketUrl: "https://delhianimecon.in/tickets",
    description: "Delhi's homegrown anime convention focused on community. Cosplay workshops, indie artist market, retro anime screenings, and gaming lounges.",
    estimatedAttendance: 10000,
    status: "upcoming",
    organizers: ["Delhi Anime Community"],
    tags: ["anime", "cosplay", "community", "artists", "retro"],
  },
  {
    id: "indipop-bangalore",
    name: "IndiPop Bangalore",
    shortName: "IndiPop BLR",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "Bangalore International Exhibition Centre",
    startDate: "2026-11-14",
    endDate: "2026-11-15",
    website: "https://indipop.in",
    ticketUrl: "https://indipop.in/tickets",
    description: "Bangalore edition of IndiPop pop culture convention. Anime, K-pop, cosplay, gaming, and comic book culture under one roof.",
    estimatedAttendance: 18000,
    status: "upcoming",
    organizers: ["IndiPop Events"],
    tags: ["pop-culture", "anime", "k-pop", "cosplay", "gaming"],
  },
  {
    id: "comic-con-pune",
    name: "Comic Con Pune",
    shortName: "CC Pune",
    city: "Pune",
    state: "Maharashtra",
    venue: "JW Marriott Pune, SB Road",
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Pune's edition of Comic Con India. Cosplay contests, gaming arena, anime screenings, and exclusive merchandise from top brands.",
    estimatedAttendance: 20000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "anime"],
  },
  {
    id: "cosplay-carnival",
    name: "Cosplay Carnival",
    shortName: "CC",
    city: "Mumbai",
    state: "Maharashtra",
    venue: "Rajiv Gandhi Indoor Stadium, Bandra",
    startDate: "2026-11-28",
    endDate: "2026-11-29",
    website: "https://cosplaycarnival.in",
    ticketUrl: "https://cosplaycarnival.in/tickets",
    description: "India's biggest cosplay-dedicated event. Professional cosplay competitions, workshops, photoshoot zones, and guest cosplayers from around the world.",
    estimatedAttendance: 12000,
    status: "upcoming",
    organizers: ["Cosplay India"],
    guests: [
      { name: "TBD", role: "International Cosplayer" },
      { name: "TBD", role: "Cosplay Judge" },
    ],
    tags: ["cosplay", "workshop", "photography", "competition"],
  },
  {
    id: "anime-expo-bangalore",
    name: "Anime Expo India Bangalore",
    shortName: "AX Bangalore",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "Sheraton Grand, Brigade Gateway",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    website: "https://animeexpo.in",
    ticketUrl: "https://animeexpo.in/tickets",
    description: "Anime Expo returns to Bengaluru! Three days of anime celebration with exclusive screenings, J-rock concerts, cosplay championships, and industry panels.",
    estimatedAttendance: 22000,
    status: "upcoming",
    organizers: ["Anime Expo India"],
    guests: [
      { name: "TBD", role: "Anime Director" },
    ],
    tags: ["anime", "cosplay", "j-music", "screenings", "industry"],
  },
  {
    id: "otaku-fest-mumbai",
    name: "Otaku Fest Mumbai",
    shortName: "OF Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    venue: "Rang Sharda Auditorium, Bandra West",
    startDate: "2026-12-12",
    endDate: "2026-12-13",
    website: "https://otakufest.in",
    ticketUrl: "https://otakufest.in/tickets",
    description: "Mumbai's celebration of otaku culture. Anime screenings, cosplay contest, Japanese cultural activities, and exclusive anime merchandise stalls.",
    estimatedAttendance: 9000,
    status: "upcoming",
    organizers: ["Otaku Fest India"],
    tags: ["anime", "cosplay", "j-culture", "music"],
  },
  {
    id: "comic-con-delhi-dec",
    name: "Comic Con Delhi Winter",
    shortName: "CC Delhi W",
    city: "Delhi",
    state: "Delhi",
    venue: "NSIC Exhibition Grounds, Okhla",
    startDate: "2026-12-18",
    endDate: "2026-12-20",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Winter edition of Comic Con Delhi. Special holiday-themed cosplay events, year-end sales, exclusive previews of upcoming movies and games.",
    estimatedAttendance: 30000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "holiday", "anime"],
  },
  {
    id: "hyderabad-comic-con-dec",
    name: "Hyderabad Comic Con Winter",
    shortName: "HCC Winter",
    city: "Hyderabad",
    state: "Telangana",
    venue: "HICC, Novotel",
    startDate: "2026-12-26",
    endDate: "2026-12-27",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Year-end Hyderabad Comic Con with extended holiday celebrations. Cosplay galore, gaming tournaments, and anime marathons.",
    estimatedAttendance: 20000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "gaming", "anime", "holiday"],
  },
  {
    id: "indipop-hyderabad",
    name: "IndiPop Hyderabad",
    shortName: "IndiPop HYD",
    city: "Hyderabad",
    state: "Telangana",
    venue: "Shilpakala Vedika",
    startDate: "2026-09-05",
    endDate: "2026-09-06",
    website: "https://indipop.in",
    ticketUrl: "https://indipop.in/tickets",
    description: "Hyderabad edition of IndiPop. Features anime screenings, K-pop dance competitions, cosplay contests, and pop culture merchandise.",
    estimatedAttendance: 12000,
    status: "upcoming",
    organizers: ["IndiPop Events"],
    tags: ["pop-culture", "anime", "k-pop", "cosplay", "gaming"],
  },
  {
    id: "pune-anime-con",
    name: "Pune Anime Con",
    shortName: "PAC",
    city: "Pune",
    state: "Maharashtra",
    venue: "Symphony Hall, Senapati Bapat Road",
    startDate: "2026-10-31",
    endDate: "2026-11-01",
    website: "https://puneanimecon.in",
    ticketUrl: "https://puneanimecon.in/tickets",
    description: "Pune's anime community convention. Cosplay contest, anime art exhibition, gaming competitions, and meet-and-greet with content creators.",
    estimatedAttendance: 7000,
    status: "upcoming",
    organizers: ["Pune Otaku Community"],
    tags: ["anime", "cosplay", "community", "art", "gaming"],
  },
  {
    id: "kolkata-comic-con",
    name: "Comic Con Kolkata",
    shortName: "CC Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    venue: "Science City Auditorium",
    startDate: "2026-11-14",
    endDate: "2026-11-15",
    website: "https://comicconindia.com",
    ticketUrl: "https://comicconindia.com/tickets",
    description: "Kolkata's pop culture convention featuring anime, comics, cosplay, and gaming. Eastern India's biggest gathering of pop culture fans.",
    estimatedAttendance: 18000,
    status: "upcoming",
    organizers: ["Comic Con India"],
    tags: ["comic-con", "cosplay", "anime", "gaming", "pop-culture"],
  },
];

export function getConventions(filters?: {
  city?: string;
  state?: string;
  status?: "upcoming" | "past" | "ongoing" | "all";
  month?: number;
  year?: number;
}): Convention[] {
  let results = [...database];

  if (filters?.city) {
    const c = filters.city.toLowerCase();
    results = results.filter((e) => e.city.toLowerCase().includes(c));
  }

  if (filters?.state) {
    const s = filters.state.toLowerCase();
    results = results.filter((e) => e.state.toLowerCase().includes(s));
  }

  if (filters?.status && filters.status !== "all") {
    results = results.filter((e) => e.status === filters.status);
  }

  if (filters?.month !== undefined) {
    results = results.filter((e) => new Date(e.startDate).getMonth() + 1 === filters.month);
  }

  if (filters?.year !== undefined) {
    results = results.filter((e) => new Date(e.startDate).getFullYear() === filters.year);
  }

  return results;
}

export function getConventionById(id: string): Convention | undefined {
  return database.find((e) => e.id === id);
}

export function getCities(): string[] {
  return Array.from(new Set(database.map((e) => e.city))).sort();
}

export function getStates(): string[] {
  return Array.from(new Set(database.map((e) => e.state))).sort();
}

export function getConventionsMeta() {
  return { ...CONVENTIONS_META };
}

export type { Convention };
