/**
 * Community cold-start seed.
 *
 * Seeds first-party (clearly attributed to the ZyniBot system account) forum
 * threads, polls, clubs, club posts, challenges and quote moments so that the
 * community surfaces don't render empty on a brand-new database.
 *
 * Honest by design: it never impersonates real users, never fabricates votes
 * or likes, and every record is idempotent so re-running is safe.
 *
 *   npx tsx prisma/seed-community-content.ts
 *   # or: npm run db:seed:community
 */
import "../scripts/load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_USER_ID = "system-bot";

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

const THREADS: { slug: string; title: string; category: string; pinned?: boolean; content: string }[] = [
  {
    slug: "what-are-you-watching-this-season",
    title: "What are you watching this season? Share your watchlist 🍿",
    category: "anime-discussion",
    pinned: true,
    content: `New season, new shows. Drop what you're currently watching, what you dropped, and your one hidden gem so far.

A quick format if you want to join in:
- **Watching:** ...
- **Best of the season:** ...
- **Dropped:** ...

No wrong answers — everyone's taste is different.`,
  },
  {
    slug: "underrated-anime-that-deserve-more-love",
    title: "Underrated anime that deserve way more love",
    category: "recommendations",
    content: `Every season a few genuinely great shows get buried under the big names. Which titles do you think never got the attention they deserved?

Share a title, one line on why it's worth watching, and roughly who it's for (slow-burn drama? comedy? sports?).`,
  },
  {
    slug: "anime-with-the-best-animation",
    title: "Anime with the best animation — your top picks",
    category: "anime-discussion",
    content: `Sakuga fans, assemble. Which series or films do you keep coming back to purely for the animation?

Some categories to argue over:
- Best fight choreography
- Best background art / world building
- Most consistent quality across a whole season`,
  },
  {
    slug: "best-anime-osts-of-all-time",
    title: "Best anime OSTs of all time",
    category: "general",
    content: `Some soundtracks stick with you years after the credits roll. Post the openings, endings, and insert songs you never skip.

Bonus points if you name the composer — Hiroyuki Sawano, Yoko Kanno, Joe Hisaishi and friends deserve the shout-outs.`,
  },
  {
    slug: "beginner-where-to-start-with-anime",
    title: "New to anime? Start here — a beginner roadmap",
    category: "recommendations",
    pinned: true,
    content: `Welcome! If you're brand new and don't know where to begin, here's a gentle path rather than a giant list.

1. **Start with something short and strong** — a single-cour show you can finish in a weekend.
2. **Pick by mood, not by genre charts** — action, romance, comedy, mystery, sports.
3. **Use the site** — every title page here has a synopsis, episode list and filler labels so you know what's skippable.

Ask away in this thread and tell us what you've enjoyed so far (games, films, books all count) and the community will point you somewhere good.`,
  },
  {
    slug: "manga-worth-reading-even-if-you-watched-the-anime",
    title: "Manga worth reading even if you've seen the anime",
    category: "manga",
    content: `Some adaptations capture the story; others leave entire arcs, characters and endings on the cutting room floor.

Which manga do you think is a must-read *even* if someone already watched the anime — and what does the anime miss?

Keep spoilers tagged, please.`,
  },
  {
    slug: "share-your-favourite-fan-theory",
    title: "Share your favourite fan theory 🧠",
    category: "theory",
    content: `The wilder the better (as long as it's fun, not nasty). Drop a theory — yours or one you've read — and why you find it convincing.

Remember to tag spoilers for anything recent.`,
  },
];

const POLLS: { title: string; description: string; options: string[] }[] = [
  {
    title: "Sub or Dub?",
    description: "The eternal question. How do you usually watch?",
    options: ["Subtitles (Sub)", "English Dub", "Hindi Dub", "Depends on the show"],
  },
  {
    title: "How do you choose your next anime?",
    description: "What actually decides what you watch next?",
    options: ["Recommendations from friends", "Seasonal charts", "Random / gut feeling", "Rewatching a favourite"],
  },
  {
    title: "Do you read the manga before the anime ends?",
    description: "When a show you love is still airing, do you jump ahead?",
    options: ["Always", "Sometimes", "Only for favourites", "Never — I stay anime-only"],
  },
  {
    title: "Best anime decade?",
    description: "Which era of anime do you rate the highest?",
    options: ["1990s", "2000s", "2010s", "2020s"],
  },
];

const CLUBS: {
  slug: string;
  name: string;
  category: string;
  description: string;
  rules: string;
  welcomeTitle: string;
  welcomeContent: string;
}[] = [
  {
    slug: "shonen-fans",
    name: "Shonen Fans",
    category: "Fandoms",
    description: "For everyone who grew up on tournaments, power-ups and the power of friendship.",
    rules: "1. Keep it friendly.\n2. Tag spoilers for recent chapters/episodes.\n3. No powerscaling flame wars.",
    welcomeTitle: "Welcome to Shonen Fans!",
    welcomeContent: "Introduce yourself: what was the first shonen you ever watched, and what are you reading/watching now?",
  },
  {
    slug: "ghibli-appreciation",
    name: "Studio Ghibli Appreciation",
    category: "Studios",
    description: "Celebrating the films, the music and the quiet magic of Studio Ghibli.",
    rules: "1. Be kind.\n2. Spoiler-tag plot details for newcomers.\n3. Fan art is welcome with credit to the artist.",
    welcomeTitle: "Which Ghibli film means the most to you?",
    welcomeContent: "Tell us your first Ghibli film and the one you'd show a friend who's never seen any.",
  },
  {
    slug: "manga-readers",
    name: "Manga Readers",
    category: "Reading",
    description: "For people who read ahead — manga, manhwa and webtoons welcome.",
    rules: "1. Tag spoilers.\n2. No scanlation links to paid or licensed works.\n3. Respect differing opinions.",
    welcomeTitle: "What are you reading right now?",
    welcomeContent: "Share your current read and one series you think everyone should try.",
  },
  {
    slug: "indian-anime-community",
    name: "Indian Anime Community",
    category: "Regional",
    description: "For Indian fans — dubs, regional releases, conventions and watch-alongs.",
    rules: "1. No spoilers untagged.\n2. Keep recommendations region-appropriate.\n3. Be respectful of all languages.",
    welcomeTitle: "Namaste! Introduce yourself 🙏",
    welcomeContent: "Which city are you from, and what's your go-to Hindi/English dub recommendation?",
  },
  {
    slug: "seasonal-watchers",
    name: "Seasonal Watchers",
    category: "Seasonal",
    description: "We watch the new seasonals as they air and argue about them weekly.",
    rules: "1. Episode discussion stays spoiler-tagged for 48 hours.\n2. No leaks.\n3. Have fun.",
    welcomeTitle: "Welcome, seasonal crew!",
    welcomeContent: "Post your seasonal watchlist and your early pick for best show of the season.",
  },
];

const CHALLENGES: {
  title: string;
  type: string;
  period: string;
  year?: number;
  season?: string;
  startDate: Date;
  endDate: Date;
  goalCount: number;
  rules: string;
}[] = [
  {
    title: "2026 Anime Challenge: 100 Titles",
    type: "watch",
    period: "yearly",
    year: 2026,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    endDate: new Date("2026-12-31T23:59:59.000Z"),
    goalCount: 100,
    rules: "Finish 100 anime during 2026. Movies, specials and rewatches all count. Log progress by marking titles completed on your list.",
  },
  {
    title: "Fall 2026 Seasonal Challenge: 12 Titles",
    type: "watch",
    period: "seasonal",
    year: 2026,
    season: "fall",
    startDate: new Date("2026-09-01T00:00:00.000Z"),
    endDate: new Date("2026-12-31T23:59:59.000Z"),
    goalCount: 12,
    rules: "Complete 12 anime that premiered in the Fall 2026 season. Only shows from this season count.",
  },
  {
    title: "2026 Manga Reading Challenge: 24 Volumes",
    type: "read",
    period: "yearly",
    year: 2026,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    endDate: new Date("2026-12-31T23:59:59.000Z"),
    goalCount: 24,
    rules: "Read 24 manga volumes in 2026 — roughly two a month. Any series, any language.",
  },
];

const MOMENTS: { animeId: number; animeTitle: string; character: string; quote: string }[] = [
  { animeId: 16498, animeTitle: "Attack on Titan", character: "Eren Yeager", quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win!" },
  { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", character: "Edward Elric", quote: "A lesson without pain is meaningless. That's because you cannot gain something without sacrificing something in return." },
  { animeId: 9253, animeTitle: "Steins;Gate", character: "Rintaro Okabe", quote: "I am mad scientist. It's so cool. Sonuvabitch." },
  { animeId: 101991, animeTitle: "Vinland Saga", character: "Thorfinn", quote: "I have no enemies." },
  { animeId: 113415, animeTitle: "Jujutsu Kaisen", character: "Satoru Gojo", quote: "Throughout heaven and earth, I alone am the honored one." },
  { animeId: 1535, animeTitle: "Death Note", character: "L", quote: "If you can't win the game, if you can't solve the puzzle, you're nothing but a loser." },
  { animeId: 21, animeTitle: "One Piece", character: "Monkey D. Luffy", quote: "I'm gonna be the Pirate King!" },
  { animeId: 101922, animeTitle: "Demon Slayer", character: "Tanjiro Kamado", quote: "No matter how many people you may lose, you have to keep going." },
];

async function main() {
  const systemUser = await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: {
      id: SYSTEM_USER_ID,
      email: "system@zyverse.in",
      username: "ZyniBot",
      bio: "Official ZyniVerse account — wiki, community and challenge curators.",
      provider: "credentials",
    },
  });

  // Forum categories ---------------------------------------------------------
  const categoryBySlug = new Map<string, string>();
  for (const cat of FORUM_CATEGORIES) {
    const row = await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    categoryBySlug.set(cat.slug, row.id);
  }

  // Forum threads ------------------------------------------------------------
  let threadsCreated = 0;
  for (const t of THREADS) {
    const existing = await prisma.forumThread.findUnique({ where: { slug: t.slug } });
    if (existing) continue;
    await prisma.forumThread.create({
      data: {
        title: t.title,
        slug: t.slug,
        content: t.content,
        categoryId: categoryBySlug.get(t.category) ?? null,
        userId: systemUser.id,
        isPinned: !!t.pinned,
      },
    });
    threadsCreated++;
  }

  // Polls --------------------------------------------------------------------
  let pollsCreated = 0;
  for (const p of POLLS) {
    const existing = await prisma.poll.findFirst({ where: { title: p.title, createdById: systemUser.id } });
    if (existing) continue;
    await prisma.poll.create({
      data: {
        title: p.title,
        description: p.description,
        createdById: systemUser.id,
        isActive: true,
        options: { create: p.options.map((label) => ({ label })) },
      },
    });
    pollsCreated++;
  }

  // Clubs + welcome posts + a member row --------------------------------------
  let clubsCreated = 0;
  let clubPostsCreated = 0;
  for (const c of CLUBS) {
    let club = await prisma.club.findUnique({ where: { slug: c.slug } });
    if (!club) {
      club = await prisma.club.create({
        data: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          rules: c.rules,
          category: c.category,
          ownerId: systemUser.id,
          memberCount: 1,
        },
      });
      clubsCreated++;
    }

    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: club.id, userId: systemUser.id } },
      update: {},
      create: { clubId: club.id, userId: systemUser.id, role: "owner" },
    });

    const existingPost = await prisma.clubPost.findFirst({
      where: { clubId: club.id, title: c.welcomeTitle },
    });
    if (!existingPost) {
      await prisma.clubPost.create({
        data: {
          clubId: club.id,
          userId: systemUser.id,
          title: c.welcomeTitle,
          content: c.welcomeContent,
          isPinned: true,
        },
      });
      clubPostsCreated++;
    }
  }

  // Challenges ---------------------------------------------------------------
  let challengesCreated = 0;
  for (const ch of CHALLENGES) {
    const existing = await prisma.challenge.findFirst({ where: { title: ch.title } });
    if (existing) continue;
    await prisma.challenge.create({
      data: {
        title: ch.title,
        type: ch.type,
        period: ch.period,
        year: ch.year ?? null,
        season: ch.season ?? null,
        startDate: ch.startDate,
        endDate: ch.endDate,
        goalCount: ch.goalCount,
        isPublic: true,
        createdBy: systemUser.id,
        rules: ch.rules,
      },
    });
    challengesCreated++;
  }

  // Quote moments ------------------------------------------------------------
  let momentsCreated = 0;
  for (const m of MOMENTS) {
    const existing = await prisma.moment.findFirst({ where: { animeId: m.animeId, quote: m.quote } });
    if (existing) continue;
    await prisma.moment.create({
      data: {
        userId: systemUser.id,
        animeId: m.animeId,
        animeTitle: m.animeTitle,
        character: m.character,
        quote: m.quote,
        style: "classic",
        isPublic: true,
      },
    });
    momentsCreated++;
  }

  console.log(
    JSON.stringify(
      {
        threadsCreated,
        pollsCreated,
        clubsCreated,
        clubPostsCreated,
        challengesCreated,
        momentsCreated,
        totals: {
          threads: await prisma.forumThread.count(),
          polls: await prisma.poll.count(),
          clubs: await prisma.club.count(),
          challenges: await prisma.challenge.count(),
          moments: await prisma.moment.count(),
        },
      },
      null,
      2
    )
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
