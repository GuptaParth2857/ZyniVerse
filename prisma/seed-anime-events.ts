import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedAnnouncement {
  title: string;
  description: string;
  category: string;
  trailerUrl?: string;
  posterUrl?: string;
  sourceUrl?: string;
  animeId?: number;
}

const ANIME_EVENTS_SEED = [
  {
    slug: "anime-expo-2026",
    name: "Anime Expo 2026",
    shortName: "AX 2026",
    type: "expo",
    location: "Los Angeles Convention Center, Los Angeles, CA",
    country: "USA",
    startDate: new Date("2026-07-02"),
    endDate: new Date("2026-07-05"),
    website: "https://www.anime-expo.org",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21612-d5zrx9CWkxNl.png",
    description:
      "North America's largest anime convention. Four days of premieres, panels, cosplay, industry exhibits, and exclusive announcements from top studios like Crunchyroll, Aniplex, MAPPA, and more.",
    status: "past",
    attendance: 500000,
    tags: ["expo", "premiere", "panels", "cosplay", "industry"],
    announcements: [
      {
        title: "Demon Slayer: Hashira Training Arc — Official Trailer",
        description: "ufotable's official trailer for the Hashira Training Arc. The arc covers Tanjiro and the Hashira preparing for the final battle against Muzan.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=7w5Vfjozzb8",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21612-d5zrx9CWkxNl.png",
        animeId: 21612,
      },
      {
        title: "Chainsaw Man: Assassins Arc — Official Trailer 2",
        description: "MAPPA's official trailer for the International Assassins Arc, revealed during MAPPA's 15th Anniversary event. Denji faces deadly assassins from around the world.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=s8cP1Vt5US8",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png",
        animeId: 127230,
      },
      {
        title: "Jujutsu Kaisen Season 3: The Culling Game — Official Trailer",
        description: "Crunchyroll's official trailer for Jujutsu Kaisen Season 3: The Culling Game. Yuji Itadori enters the deadly Culling Game. Premiering January 2026.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=MPfZhgLiK6w",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
        animeId: 113415,
      },
      {
        title: "Blue Lock Season 2: VS. U-20 JAPAN — Official Trailer",
        description: "Bandai Namco's official trailer for Blue Lock Season 2. Isagi and the Blue Lock Eleven face the U-20 Japan national team in the deciding match.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=g9gB5OCtIT4",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx137822-U8naszP96vzC.png",
        animeId: 137822,
      },
    ],
  },
  {
    slug: "jump-festa-2027",
    name: "Jump Festa 2027",
    shortName: "JF 2027",
    type: "festival",
    location: "Makuhari Messe, Chiba, Japan",
    country: "Japan",
    startDate: new Date("2026-12-19"),
    endDate: new Date("2026-12-20"),
    website: "https://www.jumpfesta.com",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg",
    description: "Shueisha's annual manga and anime festival. The biggest reveals for Weekly Shonen Jump anime — Naruto, One Piece, Jujutsu Kaisen, My Hero Academia, and more get exclusive first looks here.",
    status: "upcoming",
    attendance: 100000,
    tags: ["jump", "shonen", "manga", "anime-reveal", "exclusive"],
    announcements: [
      {
        title: "One Piece — Egghead Arc Part 2 Official Trailer",
        description: "Toei Animation's official trailer for the Egghead Arc Part 2. The Straw Hats face the World Government on the island of the future.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=okSWhWr52u8",
        animeId: 21,
      },
      {
        title: "Spy x Family Season 3 — Official Trailer",
        description: "Crunchyroll's official trailer for Spy x Family Season 3. The Forger family returns with a new mission. Premiered October 2025.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=5ASJJI_RkiA",
        animeId: 140960,
      },
      {
        title: "My Hero Academia: You're Next — Official Trailer",
        description: "Studio Bones' official trailer for the 4th MHA film 'You're Next'. Deku faces Dark Might, a mysterious figure claiming to be the new Symbol of Peace.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=6za6mqA_nA4",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg",
        animeId: 21459,
      },
    ],
  },
  {
    slug: "otakon-2026",
    name: "Otakon 2026",
    shortName: "Otakon",
    type: "convention",
    location: "Walter E. Washington Convention Center, Washington, D.C.",
    country: "USA",
    startDate: new Date("2026-07-31"),
    endDate: new Date("2026-08-02"),
    website: "https://otakon.com",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
    description: "One of North America's oldest and largest anime conventions, celebrating East Asian pop culture since 1994. The 2026 edition drew 47,049 fans to the Walter E. Washington Convention Center with panels, cosplay, concerts, and industry guests.",
    status: "past",
    attendance: 47049,
    tags: ["washington-dc", "east-coast", "anime", "cosplay", "panels"],
    announcements: [],
  },
  {
    slug: "sdcc-2026-anime",
    name: "San Diego Comic-Con 2026 — Anime Section",
    shortName: "SDCC 2026",
    type: "convention",
    location: "San Diego Convention Center, San Diego, CA",
    country: "USA",
    startDate: new Date("2026-07-23"),
    endDate: new Date("2026-07-26"),
    website: "https://www.comic-con.org",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
    description: "The world's biggest pop culture convention with a massive anime presence. Hall H panels from major studios, exclusive reveals, and surprise announcements.",
    status: "upcoming",
    attendance: 130000,
    tags: ["comic-con", "hollywood", "anime", "panels", "exclusive"],
    announcements: [
      {
        title: "Attack on Titan: The Last Attack — Official Trailer",
        description: "Crunchyroll's official trailer for Attack on Titan: The Last Attack, the compilation film of the final season with additional scenes and enhanced animation.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=3xNH23QkNpk",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
        animeId: 16498,
      },
    ],
  },
  {
    slug: "anime-japan-2027",
    name: "AnimeJapan 2027",
    shortName: "AJ 2027",
    type: "festival",
    location: "INTEX Osaka, Osaka, Japan",
    country: "Japan",
    startDate: new Date("2027-03-26"),
    endDate: new Date("2027-03-28"),
    website: "https://anime-japan.jp",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
    description: "Japan's premier anime event, moving to INTEX Osaka for the first time in its history. Business days run March 26-27 with public days on March 27-28 (overlapping on the 27th). The stage for major anime reveals, stage shows, and industry exhibitions from top Japanese studios.",
    status: "upcoming",
    attendance: 150000,
    tags: ["anime-japan", "osaka", "industry", "premiere", "manga"],
    announcements: [
      {
        title: "Spy x Family: Code White — Movie Panel & Preview",
        description: "WIT Studio hosted a panel for the Spy x Family: Code White movie with exclusive bonus content and a preview of the upcoming anime continuation.",
        category: "movie-reveal",
        trailerUrl: "https://www.youtube.com/watch?v=5ASJJI_RkiA",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
        animeId: 140960,
      },
    ],
  },
  {
    slug: "comiket-2026-winter",
    name: "Comiket (C109) Winter 2026",
    shortName: "C109",
    type: "festival",
    location: "Tokyo Big Sight, Tokyo, Japan",
    country: "Japan",
    startDate: new Date("2026-12-29"),
    endDate: new Date("2026-12-31"),
    website: "https://www.comiket.co.jp",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg",
    description: "The world's largest doujinshi convention. C109 returns to a three-day format (Dec 29-31) for the first time since C95 in 2018. East Halls 4-6 are closed for renovation, and December 28 is the circle setup day. Over 50,000 circles participate with major anime studios hosting booths.",
    status: "upcoming",
    attendance: 500000,
    tags: ["doujinshi", "manga", "indie", "merchandise"],
    announcements: [],
  },
  {
    slug: "anime-india-delhi-2026",
    name: "Anime India Delhi 2026",
    shortName: "Anime India Delhi",
    type: "convention",
    location: "Yashobhoomi Convention Centre, New Delhi, India",
    country: "India",
    startDate: new Date("2026-06-06"),
    endDate: new Date("2026-06-07"),
    website: "https://animeindia.live",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
    description: "India's largest anime convention, held at Yashobhoomi in Dwarka, New Delhi. Japanese voice actor Kazuhiko Inoue (Kakashi in Naruto) headlined the 2026 edition alongside J-pop concerts, cosplay competitions, gaming, and celebrity appearances. The two-day event drew over 34,000 visitors.",
    status: "past",
    attendance: 34000,
    tags: ["india", "delhi", "anime", "cosplay", "j-music"],
    announcements: [
      {
        title: "50 New Hindi Dubbed Anime Announced for Indian TV",
        description: "Indian broadcasters announced 50 new anime titles getting Hindi dubs for 2027, including Jujutsu Kaisen, Chainsaw Man, and Blue Lock.",
        category: "anime-reveal",
      },
    ],
  },
  {
    slug: "annec-2026",
    name: "Annecy International Animation Film Festival 2026",
    shortName: "Annecy 2026",
    type: "festival",
    location: "Bonlieu, Annecy, France",
    country: "France",
    startDate: new Date("2026-06-21"),
    endDate: new Date("2026-06-27"),
    website: "https://www.annecy.org",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
    description: "The world's largest animation festival, shifted two weeks later than usual (June 21-27) because of a G7 summit in the Haute-Savoie region. The MIFA market ran June 23-26. Increasingly features anime premieres and panels from Japanese studios, with directors like Makoto Shinkai presenting here.",
    status: "past",
    attendance: 100000,
    tags: ["animation", "film", "festival", "international", "premiere"],
    announcements: [
      {
        title: "Makoto Shinkai's Next Film — Annecy Presentation",
        description: "Makoto Shinkai presented his upcoming film project at Annecy 2026, following up on the success of Suzume. Studio CoMix Wave Films confirmed production.",
        category: "movie-reveal",
        trailerUrl: "https://www.youtube.com/watch?v=EOMVXqH9DSg",
      },
      {
        title: "Studio Ghibli — Hayao Miyazaki's Next Project Hinted",
        description: "Studio Ghibli's Toshio Suzuki hinted at a new project from Hayao Miyazaki during the Annecy panel, though details remain scarce.",
        category: "anime-reveal",
      },
    ],
  },
  {
    slug: "anime-fest-2026",
    name: "Anime Festival Asia 2026",
    shortName: "AFA 2026",
    type: "festival",
    location: "Suntec Singapore Convention & Exhibition Centre, Singapore",
    country: "Singapore",
    startDate: new Date("2026-11-27"),
    endDate: new Date("2026-11-29"),
    website: "https://www.animefestival.asia",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg",
    description: "Southeast Asia's largest anime event, marking 60 years of Singapore-Japan diplomatic relations. I Love Anisong concerts, cosplay competition, industry booths, and exclusive Southeast Asian anime premieres.",
    status: "upcoming",
    attendance: 120000,
    tags: ["asia", "concert", "cosplay", "southeast-asia", "anisong"],
    announcements: [
      {
        title: "Dandadan Season 2 — Official Trailer",
        description: "Science SARU's official trailer for Dandadan Season 2, premiering July 2025 on Netflix and Crunchyroll. Momo and Okarun's adventure continues.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=0G7HX16YTLU",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg",
        animeId: 171018,
      },
    ],
  },
  {
    slug: "anime-nyc-2026",
    name: "Anime NYC 2026",
    shortName: "Anime NYC",
    type: "convention",
    location: "Javits Convention Center, New York, NY",
    country: "USA",
    startDate: new Date("2026-08-20"),
    endDate: new Date("2026-08-23"),
    website: "https://animenyc.com",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx137822-U8naszP96vzC.png",
    description: "The East Coast's largest anime convention, held over four days at the Javits Center in Manhattan. Exclusive premieres, headline-making appearances by top creators from Japan, expansive exhibits, and immersive programming that rivals the biggest anime events in the world.",
    status: "upcoming",
    attendance: 60000,
    tags: ["new-york", "east-coast", "anime", "industry", "premiere"],
    announcements: [],
  },
];

const REMOVED_SLUGS = [
  "crunchyroll-expo-2026",
  "tokyo-anime-fair-2027",
  "anime-india-expo-2026",
];

async function seedAnimeEvents() {
  const removed = await prisma.animeEvent.deleteMany({
    where: { slug: { in: REMOVED_SLUGS } },
  });
  if (removed.count > 0) {
    console.log(`  Removed ${removed.count} outdated/fake event(s)`);
  }

  for (const event of ANIME_EVENTS_SEED) {
    const { announcements, ...eventData } = event;

    const upserted = await prisma.animeEvent.upsert({
      where: { slug: event.slug },
      update: eventData,
      create: eventData,
    });

    await prisma.animeAnnouncement.deleteMany({
      where: { eventId: upserted.id },
    });
    if (announcements.length > 0) {
      await prisma.animeAnnouncement.createMany({
        data: announcements.map((a: SeedAnnouncement) => ({
          eventId: upserted.id,
          title: a.title,
          description: a.description,
          category: a.category,
          trailerUrl: a.trailerUrl ?? null,
          posterUrl: a.posterUrl ?? null,
          sourceUrl: a.sourceUrl ?? null,
          animeId: a.animeId ?? null,
        })),
      });
    }
    console.log(`  Synced event: ${event.name}`);
  }
}

seedAnimeEvents()
  .then(() => {
    console.log(`Seeded ${ANIME_EVENTS_SEED.length} anime events`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
