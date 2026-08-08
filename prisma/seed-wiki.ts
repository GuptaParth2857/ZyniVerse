import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "gupta.parth2857@gmail.com";

const COVERS: Record<string, string> = {
  "demon-slayer":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
  "one-piece":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg",
  "jujutsu-kaisen":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
  "frieren":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
  "solo-leveling":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-9BDMjAZGEbq4.png",
  "attack-on-titan":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
  "gojo-satoru":
    "https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png",
  "monkey-d-luffy":
    "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png",
  "studio-mappa":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png",
  "studio-ghibli":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx523-fErBvxOHP7IX.jpg",
  "isekai":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg",
  "what-is-manga":
    "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-Cul4OeN7bYtn.jpg",
  "what-is-shonen":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg",
  "anime-seasons-guide":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png",
  "watchlist-guide":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21202-mPOr80AEjUcZ.png",
  "how-to-use-zyniverse":
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx136-gj0bbCpDNrKG.jpg",
};

const EXTRA_PAGES = [
  {
    title: "Frieren: Beyond Journey's End",
    slug: "frieren-beyond-journeys-end",
    category: "anime",
    summary:
      "A fantasy masterpiece following an elf mage who outlives her party and learns what it means to truly know others.",
    tags: "fantasy,drama,adventure,elf,slice of life",
    coverImage: COVERS["frieren"],
    content: `## Overview

Frieren: Beyond Journey's End (Japanese: \u8054\u6c38\u306e\u5996\u3005\u304d\u3008\u3054\u6016\u306e\u5de8\u3009, S\u014ds\u014d no Frieren) is a fantasy anime adapted from the manga by Kanehito Yamada and Tsukasa Abe. Produced by Madhouse, it aired from 2023\u20132024 and was widely praised as one of the greatest anime of its decade.

## Plot

After a decade-long adventure defeats the Demon King, the elf mage Frieren watches her human companions age and die. Decades later, regretful that she never truly understood the humans she traveled with, she sets out on a new journey with her late hero's disciple and an orphan girl, retracing the path they once walked.

## Key Information

- **Studio:** Madhouse
- **Episodes:** 28 (Season 1)
- **Aired:** 2023\u20132024
- **Genre:** Adventure, Drama, Fantasy

## Why It Matters

- Wins multiple Anime of the Year awards worldwide
- Renowned for its quiet, meditative pacing and emotional depth
- Explores themes of mortality, memory, and connection`,
  },
  {
    title: "Solo Leveling",
    slug: "solo-leveling",
    category: "anime",
    summary:
      "The global smash-hit action fantasy about E-rank hunter Sung Jinwoo who gains the power to level up without limit.",
    tags: "action,fantasy,manhwa,hunters,dungeon",
    coverImage: COVERS["solo-leveling"],
    content: `## Overview

Solo Leveling is a South Korean manhwa by Chugong (story) and h-goon (art), adapted into an anime by A-1 Pictures. Season 1 aired in 2024 and Season 2 in 2025.

## Plot

In a world where portals to dungeons filled with monsters appear, only "hunters" can fight them. Sung Jinwoo, the weakest E-rank hunter, nearly dies in a double dungeon and is chosen to become a "Player" \u2014 the only one who can level up and grow stronger without limit.

## Key Information

- **Studio:** A-1 Pictures
- **Episodes:** 13 (Season 1)
- **Genre:** Action, Fantasy, Adventure

## Notable Elements

- Unique "level up" system blended with a real world
- Iconic shadow army and the character Shadow Monarch
- Regarded as a pioneer of the "power fantasy" manhwa genre`,
  },
  {
    title: "What is Manga?",
    slug: "what-is-manga",
    category: "manga",
    summary:
      "A beginner's guide to Japanese comics \u2014 what manga is, how to read it, and the major demographics.",
    tags: "manga,guide,beginner,japanese comics",
    content: `## What is Manga?

Manga are Japanese comic books and graphic novels, read right-to-left, usually serialized in magazines before being collected into volumes called \u0022tank\u014dbon.\u0022

## How to Read

- Open from the right side of the book
- Panels and speech bubbles flow right-to-left
- Starting with physical volumes is the most common way to read

## Major Demographics

- **Sh\u014dnen** \u2014 aimed at young teen boys (e.g., One Piece, My Hero Academia)
- **Sh\u014djo** \u2014 aimed at young teen girls (e.g., Fruits Basket)
- **Seinen** \u2014 aimed at adult men (e.g., Berserk, Monster)
- **Josei** \u2014 aimed at adult women (e.g., Nana)

## Why Read Manga Instead of Watching Anime?

- Many stories continue past their anime adaptation
- Source material often has finer detail and pacing
- No censorship or seasonal gaps

## Popular Titles

- One Piece \u2014 the best-selling manga of all time
- Berserk \u2014 legendary dark fantasy by Kentaro Miura
- Attack on Titan \u2014 global dark fantasy phenomenon`,
  },
  {
    title: "Isekai",
    slug: "isekai",
    category: "genre",
    summary:
      "The genre where characters are transported to or reborn in another world \u2014 the dominant force in modern anime.",
    tags: "genre,isekai,fantasy,guide",
    content: `## What is Isekai?

Isekai (\u7570\u4e16\u754c, "different world") is a genre where the protagonist is transported to, summoned to, or reborn in a parallel world, often a fantasy or game-like setting.

## Common Tropes

- Reincarnation after death (TenSura, Mushoku Tensei)
- Being summoned as a hero (Shield Hero)
- Game-system mechanics, levels, and skills (Solo Leveling-adjacent, Overlord)
- Truck-kun \u2014 a truck hitting the protagonist as a meme origin

## Famous Examples

- Re:ZERO \u2014 deconstruction with brutal time loops
- That Time I Got Reincarnated as a Slime
- Sword Art Online \u2014 pioneer of the trapped-in-a-game subgenre

## Why So Popular

- High fantasy wish fulfillment and world-building
- Relatable power fantasy and "video game logic" audiences already know
- Cheaper to adapt as web novels already have devoted fanbases`,
  },
  {
    title: "Gojo Satoru",
    slug: "gojo-satoru",
    category: "character",
    summary:
      "The strongest jujutsu sorcerer of Jujutsu Kaisen, known for his Infinity technique and iconic Six Eyes.",
    tags: "character,jujutsu kaisen,sorcerer",
    content: `## Overview

Gojo Satoru is a central character in Jujutsu Kaisen by Gege Akutami. A teacher at Tokyo Jujutsu High, he is widely regarded as the strongest jujutsu sorcerer alive.

## Abilities

- **Limitless (Mugense)** \u2014 manipulates the concept of infinity
- **Six Eyes** \u2014 extremely efficient cursed energy control and perception
- **Domain Expansion: Unlimited Void** \u2014 traps enemies in infinite information

## Personality

- Confident and playful on the surface
- Fiercely protective of his students
- Carries a heavy belief that jujutsu society must change

## Legacy

- Iconic white hair and blindfold design
- One of the most popular anime characters of the 2020s`,
  },
  {
    title: "Studio Ghibli",
    slug: "studio-ghibli",
    category: "studio",
    summary:
      "The legendary Japanese animation studio behind Spirited Away, My Neighbor Totoro, and dozens of classics.",
    tags: "studio,ghibli,animation,films",
    content: `## Overview

Studio Ghibli is a Japanese animation film studio founded in 1985 by Hayao Miyazaki, Isao Takahata, Toshio Suzuki, and Yasuyoshi Tokuma. It is considered one of the greatest animation studios in history.

## Iconic Films

- Spirited Away \u2014 the only non-English language film to win the Academy Award for Best Animated Feature
- My Neighbor Totoro \u2014 beloved children's classic
- Princess Mononoke \u2014 environmental epic
- Howl's Moving Castle

## Characteristics

- Hand-drawn, painterly backgrounds
- Focus on detailed everyday life and nature
- Strong, independent protagonists
- Themes of environmentalism and pacifism`,
  },
  {
    title: "How to Use ZyniVerse",
    slug: "how-to-use-zyniverse",
    category: "help",
    summary:
      "Everything you need to know to get the most out of ZyniVerse \u2014 profiles, watchlists, friends, forums and more.",
    tags: "help,zyniverse,guide,getting started",
    content: `## Welcome to ZyniVerse

ZyniVerse is a free anime platform. Here is a quick tour.

## Your Account

- **Sign up** \u2014 use email, Google, GitHub, or Discord
- **Your profile** \u2014 add an avatar and banner from Settings
- **Watchlist** \u2014 track what you are watching, completed, or planning

## Core Features

- **Explore & Search** \u2014 find anime, manga, characters, and studios
- **Schedule** \u2014 weekly airing schedule and streaming calendar
- **Community** \u2014 clubs, forums, and friends
- **Challenges & Achievements** \u2014 earn badges and compete on the leaderboard

## Contributing to the Wiki

- Anyone can create a wiki page or edit an existing one
- Use the \u0022+ New Page\u0022 button on the Wiki home
- Every edit is saved in the revision history`,
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    console.error("Admin user not found:", ADMIN_EMAIL);
    process.exit(1);
  }

  const existing = await prisma.wikiPage.findMany({ select: { slug: true } });

  let updated = 0;
  let created = 0;

  for (const page of existing) {
    const cover = COVERS[page.slug];
    if (cover) {
      await prisma.wikiPage.update({
        where: { slug: page.slug },
        data: { coverImage: cover, lastEditorId: admin.id },
      });
      updated++;
    } else {
      await prisma.wikiPage.update({
        where: { slug: page.slug },
        data: { lastEditorId: admin.id },
      });
      updated++;
    }
  }

  for (const page of EXTRA_PAGES) {
    await prisma.wikiPage.upsert({
      where: { slug: page.slug },
      update: {
        lastEditorId: admin.id,
        coverImage: page.coverImage ?? undefined,
        summary: page.summary,
        tags: page.tags,
      },
      create: {
        title: page.title,
        slug: page.slug,
        category: page.category,
        summary: page.summary,
        tags: page.tags,
        coverImage: page.coverImage ?? null,
        content: page.content,
        lastEditorId: admin.id,
        version: 1,
        isPublished: true,
      },
    });
    created++;
  }

  const total = await prisma.wikiPage.count();
  console.log(
    `Reassigned ${updated} existing pages to ${admin.username}; created/ensured ${created} new pages. Total wiki pages: ${total}`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
