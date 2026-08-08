import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_USER_ID = "system-bot";
const SYSTEM_EMAIL = "system@zyverse.in";
const SYSTEM_USERNAME = "ZyniBot";

const WIKI_SEED = [
  {
    title: "Attack on Titan",
    slug: "attack-on-titan",
    category: "anime",
    summary: "A comprehensive guide to Hajime Isayama's dark fantasy epic where humanity fights for survival against giant humanoid creatures.",
    tags: "shonen,action,dark fantasy,giants,post-apocalyptic",
    content: `## Overview

Attack on Titan (Japanese: 進撃の巨人, Hepburn: Shingeki no Kyojin) is a Japanese dark fantasy anime television series adapted from Hajime Isayama's manga series of the same name.

## Plot

In a world where humanity lives inside enormous walled cities to protect themselves from giant humanoid Titans, the story follows Eren Yeager, his adoptive sister Mikasa Ackerman, and their childhood friend Armin Arlert. After a Colossal Titan breaches the wall of their home town, they join the Scout Regiment to fight back against the Titans and discover the truth about their world.

## Key Information

- **Studio:** Wit Studio (S1-S3), MAPPA (S4)
- **Episodes:** 94 (4 seasons + specials)
- **Airing:** 2013–2023
- **Genre:** Action, Drama, Fantasy, Dark Fantasy

## Characters

- Eren Yeager — The main protagonist who gains the ability to transform into a Titan
- Mikasa Ackerman — Eren's adoptive sister and a skilled fighter
- Armin Arlert — Strategic genius and childhood friend
- Levi Ackerman — Captain of the Scout Regiment's Special Operations Squad`,
  },
  {
    title: "Demon Slayer: Kimetsu no Yaiba",
    slug: "demon-slayer",
    category: "anime",
    summary: "Guide to Koyoharu Gotouge's tale of Tanjiro Kamado's quest to cure his demon-turned sister and avenge his family.",
    tags: "shonen,action,demons,historical,japan",
    content: `## Overview

Demon Slayer: Kimetsu no Yaiba (鬼滅の刃) is a Japanese manga series written and illustrated by Koyoharu Gotouge. The anime adaptation by ufotable has become one of the most popular series worldwide.

## Plot

Tanjiro Kamado, a kind-hearted boy who sells charcoal, finds his family slaughtered by demons. His sister Nezuko is the sole survivor but has been transformed into a demon. Tanjiro joins the Demon Slayer Corps to find a cure for Nezuko and avenge his family.

## Key Information

- **Studio:** ufotable
- **Episodes:** 63+ (4 seasons + movie)
- **Airing:** 2019–present
- **Genre:** Action, Dark Fantasy, Martial Arts

## Breathing Styles

- Water Breathing — Tanjiro's initial style
- Flame Breathing — Kyojuro Rengoku's style
- Thunder Breathing — Zenitsu Agatsuma's style
- Insect Breathing — Shinobu Kocho's style`,
  },
  {
    title: "One Piece",
    slug: "one-piece",
    category: "anime",
    summary: "Everything about Eiichiro Oda's legendary pirate adventure following Monkey D. Luffy's quest for the One Piece treasure.",
    tags: "shonen,adventure,pirates,comedy,long-running",
    content: `## Overview

One Piece (ワンピース) is a Japanese manga series written and illustrated by Eiichiro Oda. It has been serialized in Shueisha's Weekly Shōnen Jump since July 1997 and is one of the best-selling manga series of all time.

## Plot

Monkey D. Luffy, a young man whose body gains the properties of rubber after accidentally eating a Devil Fruit, sets out from the East Blue Sea to find the legendary treasure One Piece and become the King of the Pirates.

## Key Information

- **Studio:** Toei Animation
- **Episodes:** 1100+ (ongoing)
- **Airing:** 1999–present
- **Genre:** Adventure, Comedy, Fantasy, Drama`,
  },
  {
    title: "What is Shonen Anime?",
    slug: "what-is-shonen",
    category: "genre",
    summary: "An introduction to the shonen genre — its defining characteristics, history, and most iconic series.",
    tags: "genre guide,shonen,beginner",
    content: `## What is Shonen?

Shonen (少年, literally "young boy") is a demographic category in Japanese media targeting young male audiences, typically ages 12–18. It is the most popular and widely recognized anime/manga demographic worldwide.

## Defining Characteristics

- **Action-oriented** — High-stakes battles and training arcs
- **Coming of age** — Protagonists grow stronger and mature
- **Friendship** — Strong emphasis on bonds between characters
- **Perseverance** — Never-give-up attitude
- **Tournament arcs** — Competitive events to showcase power

## Iconic Shonen Series

- Dragon Ball — The pioneer of modern shonen
- One Piece — The best-selling manga of all time
- Naruto — Ninja-themed epic
- Bleach — Soul Reapers and spiritual warfare
- My Hero Academia — Superhero shonen
- Jujutsu Kaisen — Dark supernatural shonen`,
  },
  {
    title: "Studio MAPPA",
    slug: "studio-mappa",
    category: "studio",
    summary: "Profile of Studio MAPPA, one of the most prominent modern animation studios known for high-quality productions.",
    tags: "studio,mappa,animation,action",
    content: `## Overview

MAPPA (マッパ) is a Japanese animation studio founded on June 14, 2011 by Masao Maruyama, a former producer at Madhouse. The studio is known for its high-quality animation and has produced numerous critically acclaimed series.

## Notable Works

- Attack on Titan: The Final Season (2020–2023)
- Jujutsu Kaisen (2020–present)
- Chainsaw Man (2022)
- Vinland Saga Season 2 (2023)
- Yuri on Ice (2016)
- Dorohedoro (2020)
- Zombie Land Saga (2018)

## Style

MAPPA is known for fluid action animation, detailed character designs, and cinematic direction. They often push boundaries with creative visual storytelling and high production values.`,
  },
  {
    title: "How to Use the Watchlist",
    slug: "watchlist-guide",
    category: "guide",
    summary: "A step-by-step guide to using ZyniVerse's watchlist feature to track your anime progress.",
    tags: "guide,watchlist,features,beginner",
    content: `## Watchlist Guide

ZyniVerse's watchlist helps you track what you're watching, have watched, or plan to watch.

## Adding Anime

1. Search for an anime using the search bar
2. Click on the anime to open its detail page
3. Click the "Add to List" button
4. Select your status: Watching, Completed, Plan to Watch, On Hold, or Dropped

## Tracking Progress

- Update episode count as you watch
- Rate anime after completing
- Add notes and tags to organize your list
- Share your list with friends via your profile

## Features

- Cloud-synced across devices
- Export to CSV/JSON (Premium)
- Custom list categories
- Airing alerts for continuing shows`,
  },
  {
    title: "Monkey D. Luffy",
    slug: "monkey-d-luffy",
    category: "character",
    summary: "Profile of Monkey D. Luffy, the captain of the Straw Hat Pirates and protagonist of One Piece.",
    tags: "one piece,protagonist,pirate,rubber man",
    content: `## Monkey D. Luffy

Monkey D. Luffy (モンキー・D・ルフィ) is the captain of the Straw Hat Pirates and the main protagonist of One Piece. He is known for his rubber powers, cheerful personality, and unwavering determination.

## Abilities

- **Gomu Gomu no Mi** — Paramecia-type Devil Fruit granting rubber-like body
- **Haki** — Conqueror's, Armament, and Observation Haki
- **Gear Techniques** — Gear Second, Third, Fourth, and Fifth

## Biography

Luffy set sail from Foosha Village at age 17 to find the legendary treasure One Piece and become the King of the Pirates. He has gathered a diverse and loyal crew, each with their own dreams.`,
  },
  {
    title: "Understanding Anime Seasons",
    slug: "anime-seasons-guide",
    category: "guide",
    summary: "Learn how anime release seasons work — Winter, Spring, Summer, and Fall schedules explained.",
    tags: "guide,seasons,airing schedule,beginner",
    content: `## Anime Seasons

Anime is typically released in seasonal blocks that correspond to the four seasons of the year.

## Schedule

- **Winter** (January–March) — Starts in January
- **Spring** (April–June) — Starts in April
- **Summer** (July–September) — Starts in July
- **Fall** (October–December) — Starts in October

## Why Seasons Matter

- Most anime run for 12–13 episodes (one cour)
- Some run for 24–26 episodes (two cours, spanning two seasons)
- Seasonal anime allows studios to plan production schedules
- New seasons bring fresh lineup of shows`,
  },
  {
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    category: "anime",
    summary: "Guide to Gege Akutami's supernatural shonen about Yuji Itadori and the world of Jujutsu Sorcery.",
    tags: "shonen,supernatural,curses,sorcery",
    content: `## Overview

Jujutsu Kaisen (呪術廻戦) is a Japanese manga series written and illustrated by Gege Akutami. The anime adaptation by MAPPA has become a global phenomenon.

## Plot

Yuji Itadori, a high school student with extraordinary physical abilities, swallows a cursed finger belonging to Ryomen Sukuna, the King of Curses. To protect others from Sukuna's power, Yuji joins the Tokyo Jujutsu High School to become a Jujutsu Sorcerer.

## Key Information

- **Studio:** MAPPA
- **Episodes:** 47+ (2 seasons)
- **Airing:** 2020–present
- **Genre:** Action, Dark Fantasy, Supernatural

## Key Characters

- Yuji Itadori — The protagonist hosting Sukuna
- Megumi Fushiguro — Shikigami user
- Nobara Kugisaki — Resonance technique user
- Satoru Gojo — The strongest Jujutsu Sorcerer`,
  },
];

const COMMUNITY_TAG_SEED: { mediaId: number; tags: string[] }[] = [
  { mediaId: 21, tags: ["masterpiece", "long-running", "adventure", "peak-fiction", "iconic", "binge-worthy", "underrated"] },
  { mediaId: 16498, tags: ["masterpiece", "dark", "mind-blowing", "emotional", "peak-fiction", "rewatchable", "underrated"] },
  { mediaId: 101922, tags: ["great-animation", "binge-worthy", "action-packed", "masterpiece"] },
  { mediaId: 113415, tags: ["action-packed", "great-animation", "dark", "binge-worthy", "overrated"] },
  { mediaId: 127720, tags: ["controversial", "great-animation", "isekai"] },
  { mediaId: 5114, tags: ["masterpiece", "classic", "wholesome", "must-watch", "peak-fiction"] },
  { mediaId: 1535, tags: ["classic", "mind-blowing", "must-watch", "nostalgic"] },
  { mediaId: 11061, tags: ["masterpiece", "slow-burn", "binge-worthy", "peak-fiction"] },
  { mediaId: 21856, tags: ["action-packed", "binge-worthy", "nostalgic"] },
  { mediaId: 20, tags: ["classic", "nostalgic", "iconic", "long-running"] },
  { mediaId: 154587, tags: ["masterpiece", "wholesome", "emotional", "must-watch", "slow-burn"] },
  { mediaId: 151807, tags: ["great-animation", "action-packed", "overrated", "binge-worthy"] },
  { mediaId: 142838, tags: ["wholesome", "feel-good", "comedy", "binge-worthy"] },
  { mediaId: 101348, tags: ["masterpiece", "emotional", "dark", "peak-fiction", "must-watch"] },
  { mediaId: 30276, tags: ["action-packed", "comedy", "overrated", "great-animation"] },
  { mediaId: 1, tags: ["classic", "nostalgic", "masterpiece", "must-watch"] },
  { mediaId: 9253, tags: ["mind-blowing", "masterpiece", "slow-burn", "rewatchable"] },
  { mediaId: 1575, tags: ["classic", "mind-blowing", "must-watch", "iconic"] },
  { mediaId: 269, tags: ["classic", "nostalgic", "long-running", "iconic"] },
];

const FORUM_CATEGORIES = [
  { name: "General", slug: "general", description: "General chit-chat about anything otaku-related.", sortOrder: 1 },
  { name: "Anime Discussion", slug: "anime-discussion", description: "Discuss all things anime — airing shows, classics, and everything in between.", sortOrder: 2 },
  { name: "Manga", slug: "manga", description: "Talk about manga, manhwa, and webtoons.", sortOrder: 3 },
  { name: "Recommendations", slug: "recommendations", description: "Ask for and share anime and manga recommendations.", sortOrder: 4 },
  { name: "Fan Art", slug: "fan-art", description: "Share your artwork and fan creations.", sortOrder: 5 },
  { name: "News", slug: "news", description: "Latest anime and manga news and announcements.", sortOrder: 6 },
  { name: "Theory", slug: "theory", description: "Share and debate fan theories.", sortOrder: 7 },
  { name: "Review", slug: "review", description: "Post your reviews of anime, manga, and light novels.", sortOrder: 8 },
];

async function main() {
  const systemUser = await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: {
      id: SYSTEM_USER_ID,
      email: SYSTEM_EMAIL,
      username: SYSTEM_USERNAME,
      bio: "System bot for wiki seed data",
      provider: "credentials",
    },
  });

  for (const wiki of WIKI_SEED) {
    await prisma.wikiPage.upsert({
      where: { slug: wiki.slug },
      update: {},
      create: {
        title: wiki.title,
        slug: wiki.slug,
        content: wiki.content,
        summary: wiki.summary,
        category: wiki.category,
        tags: wiki.tags,
        lastEditorId: systemUser.id,
        version: 1,
        isPublished: true,
      },
    });
  }

  for (const cat of FORUM_CATEGORIES) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
  }

  const tagCount = await seedCommunityTags();
  console.log(`Seeded ${WIKI_SEED.length} wiki pages, ${FORUM_CATEGORIES.length} forum categories, and ${tagCount} community tags`);
}

async function seedCommunityTags(): Promise<number> {
  const creator = await prisma.user.findUnique({ where: { id: SYSTEM_USER_ID } });
  if (!creator) return 0;

  const realUsers = await prisma.user.findMany({
    where: { id: { not: SYSTEM_USER_ID } },
    select: { id: true },
  });
  const voterIds = realUsers.map((u) => u.id);

  let created = 0;
  for (const anime of COMMUNITY_TAG_SEED) {
    for (const tag of Array.from(new Set(anime.tags))) {
      const existing = await prisma.communityTag.findUnique({
        where: { mediaId_tag: { mediaId: anime.mediaId, tag } },
      });
      if (existing) continue;

      const tagRow = await prisma.communityTag.create({
        data: {
          mediaId: anime.mediaId,
          tag,
          createdBy: SYSTEM_USER_ID,
          upvotes: 0,
          downvotes: 0,
          score: 0,
          isApproved: true,
        },
      });
      created++;

      if (voterIds.length > 0) {
        const hash = anime.mediaId * 31 + tag.charCodeAt(0) * 7 + tag.length;
        const count = Math.min(12, 4 + (hash % 6) + (tag === "masterpiece" ? 4 : 0));
        const shuffled = [...voterIds].sort(() => Math.random() - 0.5);
        const chosen = shuffled.slice(0, count).map((userId) => ({
          userId,
          communityTagId: tagRow.id,
          vote: tag === "overrated" && Math.random() < 0.35 ? -1 : 1,
        }));
        for (const vote of chosen) {
          await prisma.tagVote2.create({ data: vote });
        }
        const up = chosen.filter((c) => c.vote === 1).length;
        const down = chosen.filter((c) => c.vote === -1).length;
        await prisma.communityTag.update({
          where: { id: tagRow.id },
          data: { upvotes: up, downvotes: down, score: up - down },
        });
      }
    }
  }
  return created;
}

main()
  .then(() => {
    console.log("Seed complete");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
