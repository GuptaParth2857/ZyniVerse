import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_USER_ID = "system-bot";
const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const MEDIA_QUERY = `
  query ($search: String) {
    Page(page: 1, perPage: 1) {
      media(search: $search, type: ANIME, isAdult: false) {
        id
        title { romaji english }
        coverImage { extraLarge large }
        averageScore
      }
    }
  }
`;

interface ResolvedAnime {
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
}

async function resolveAnime(title: string): Promise<ResolvedAnime | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: MEDIA_QUERY, variables: { search: title } }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return null;
      const data = await res.json();
      const media = data?.data?.Page?.media?.[0];
      if (!media) return null;
      return {
        mediaId: media.id,
        mediaTitle: media.title?.english || media.title?.romaji || title,
        mediaImage: media.coverImage?.extraLarge || media.coverImage?.large || null,
      };
    } catch {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  return null;
}

interface TierListSeed {
  title: string;
  description: string;
  tiers: Record<string, string[]>;
}

const TIER_LISTS: TierListSeed[] = [
  {
    title: "All-Time Shounen Classics",
    description:
      "The legendary battle shounen that defined anime for a generation — from the Big Three to the new era.",
    tiers: {
      S: ["Fullmetal Alchemist Brotherhood", "Hunter x Hunter", "Attack on Titan"],
      A: ["One Piece", "Naruto", "Bleach", "Code Geass"],
      B: ["Death Note", "Dragon Ball Z", "Gintama", "Jujutsu Kaisen"],
      C: ["My Hero Academia", "Fairy Tail", "Demon Slayer", "Haikyuu"],
      D: ["Sword Art Online"],
    },
  },
  {
    title: "2020s New Gen Ranking",
    description:
      "How do the modern bangers of the 2020s stack up? Frieren to Chainsaw Man — the current generation ranked.",
    tiers: {
      S: ["Frieren", "Vinland Saga"],
      A: ["Chainsaw Man", "Jujutsu Kaisen", "Demon Slayer", "Oshi no Ko"],
      B: ["Spy x Family", "Dandadan", "Solo Leveling", "Mushoku Tensei"],
      C: ["Blue Lock", "Kaiju No. 8", "Bocchi the Rock"],
      D: ["Tokyo Revengers", "Wind Breaker"],
      F: ["Rent-a-Girlfriend"],
    },
  },
];

async function seedTierList(seed: TierListSeed) {
  const existing = await prisma.tierList.findFirst({ where: { title: seed.title } });
  if (existing) {
    await prisma.tierList.delete({ where: { id: existing.id } });
  }

  const items: { tier: string; mediaId: number; mediaTitle: string; mediaImage: string | null; order: number }[] = [];
  let order = 0;

  for (const [tier, titles] of Object.entries(seed.tiers)) {
    for (const title of titles) {
      const resolved = await resolveAnime(title);
      if (resolved) {
        items.push({ tier, ...resolved, order: order++ });
      } else {
        console.warn(`  ! could not resolve: ${title}`);
      }
      await new Promise((r) => setTimeout(r, 900));
    }
  }

  if (items.length === 0) {
    console.warn(`  ! no items resolved for "${seed.title}", skipping`);
    return;
  }

  await prisma.tierList.create({
    data: {
      userId: SYSTEM_USER_ID,
      title: seed.title,
      description: seed.description,
      isPublic: true,
      items: { create: items },
    },
  });

  console.log(`  seeded "${seed.title}" with ${items.length} items`);
}

async function main() {
  await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: {
      id: SYSTEM_USER_ID,
      email: "system@zyverse.in",
      username: "ZyniBot",
      bio: "System bot for curated seed data",
      provider: "credentials",
    },
  });

  for (const seed of TIER_LISTS) {
    await seedTierList(seed);
  }

  console.log("Tier list seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
