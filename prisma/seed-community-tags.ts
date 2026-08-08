import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_USER_ID = "system-bot";

const SEED_ANIME: { mediaId: number; title: string; tags: string[] }[] = [
  { mediaId: 21, title: "One Piece", tags: ["masterpiece", "long-running", "adventure", "peak-fiction", "iconic", "binge-worthy"] },
  { mediaId: 16498, title: "Attack on Titan", tags: ["masterpiece", "dark", "mind-blowing", "emotional", "peak-fiction", "rewatchable"] },
  { mediaId: 101922, title: "Demon Slayer", tags: ["great-animation", "binge-worthy", "action-packed", "masterpiece"] },
  { mediaId: 113415, title: "Jujutsu Kaisen", tags: ["action-packed", "great-animation", "dark", "binge-worthy"] },
  { mediaId: 127720, title: "Mushoku Tensei", tags: ["controversial", "great-animation", "isekai"] },
  { mediaId: 5114, title: "Fullmetal Alchemist: Brotherhood", tags: ["masterpiece", "classic", "wholesome", "must-watch", "peak-fiction"] },
  { mediaId: 1535, title: "Death Note", tags: ["classic", "mind-blowing", "must-watch", "nostalgic"] },
  { mediaId: 11061, title: "Hunter x Hunter", tags: ["masterpiece", "slow-burn", "binge-worthy", "peak-fiction"] },
  { mediaId: 21856, title: "My Hero Academia", tags: ["action-packed", "binge-worthy", "nostalgic"] },
  { mediaId: 20, title: "Naruto", tags: ["classic", "nostalgic", "iconic", "long-running"] },
  { mediaId: 154587, title: "Frieren", tags: ["masterpiece", "wholesome", "emotional", "must-watch", "slow-burn"] },
  { mediaId: 151807, title: "Solo Leveling", tags: ["great-animation", "action-packed", "overrated", "binge-worthy"] },
  { mediaId: 142838, title: "Spy x Family", tags: ["wholesome", "feel-good", "comedy", "binge-worthy"] },
  { mediaId: 101348, title: "Vinland Saga", tags: ["masterpiece", "emotional", "dark", "peak-fiction", "must-watch"] },
  { mediaId: 30276, title: "One Punch Man", tags: ["action-packed", "comedy", "overrated", "great-animation"] },
  { mediaId: 1, title: "Cowboy Bebop", tags: ["classic", "nostalgic", "masterpiece", "must-watch"] },
  { mediaId: 9253, title: "Steins;Gate", tags: ["mind-blowing", "masterpiece", "slow-burn", "rewatchable"] },
  { mediaId: 1575, title: "Code Geass", tags: ["classic", "mind-blowing", "must-watch", "iconic"] },
  { mediaId: 269, title: "Bleach", tags: ["classic", "nostalgic", "long-running", "iconic"] },
];

const EXTRA_TAGS: Record<string, string[]> = {
  "21": ["underrated"],
  "16498": ["underrated"],
  "127720": ["controversial"],
  "113415": ["overrated"],
  "5114": ["masterpiece"],
};

async function main() {
  const realUsers = await prisma.user.findMany({
    where: { id: { not: SYSTEM_USER_ID } },
    select: { id: true },
  });
  const voterIds = realUsers.map((u) => u.id);
  if (voterIds.length === 0) {
    console.error("No real users found to vote.");
    process.exit(1);
  }

  const uniquePairs = new Map<string, { mediaId: number; tag: string }>();
  for (const anime of SEED_ANIME) {
    const tags = new Set([...anime.tags, ...(EXTRA_TAGS[`${anime.mediaId}`] || [])]);
    for (const tag of Array.from(tags)) {
      uniquePairs.set(`${anime.mediaId}:${tag}`, { mediaId: anime.mediaId, tag });
    }
  }

  const pairs = Array.from(uniquePairs.values());
  let created = 0;
  let skipped = 0;
  const votes: { userId: string; communityTagId: string; vote: number }[] = [];

  for (const pair of pairs) {
    const existing = await prisma.communityTag.findUnique({
      where: { mediaId_tag: { mediaId: pair.mediaId, tag: pair.tag } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const tagRow = await prisma.communityTag.create({
      data: {
        mediaId: pair.mediaId,
        tag: pair.tag,
        createdBy: SYSTEM_USER_ID,
        upvotes: 0,
        downvotes: 0,
        score: 0,
        isApproved: true,
      },
    });
    created++;

    const popularity = voteCountFor(pair.mediaId, pair.tag);
    const downvoted = pair.tag === "overrated";
    for (const c of pickVoters(voterIds, popularity, downvoted)) {
      votes.push({ userId: c.userId, communityTagId: tagRow.id, vote: c.vote });
    }
  }

  if (votes.length > 0) {
    await prisma.tagVote2.createMany({ data: votes });
  }

  const allTags = await prisma.communityTag.findMany();
  for (const t of allTags) {
    const tagVotes = await prisma.tagVote2.findMany({ where: { communityTagId: t.id } });
    const up = tagVotes.filter((v) => v.vote === 1).length;
    const down = tagVotes.filter((v) => v.vote === -1).length;
    if (t.upvotes !== up || t.downvotes !== down || t.score !== up - down) {
      await prisma.communityTag.update({
        where: { id: t.id },
        data: { upvotes: up, downvotes: down, score: up - down },
      });
    }
  }

  const trending = await prisma.communityTag.groupBy({
    by: ["tag"],
    where: { isApproved: true },
    _count: { id: true },
    _sum: { score: true },
    orderBy: { _sum: { score: "desc" } },
    take: 10,
  });

  console.log(
    JSON.stringify(
      {
        created,
        skipped,
        communityTagTotal: await prisma.communityTag.count(),
        tagVote2Total: await prisma.tagVote2.count(),
        topTrending: trending.map((t) => ({
          tag: t.tag,
          media: t._count.id,
          score: t._sum.score,
        })),
      },
      null,
      2
    )
  );
}

function voteCountFor(mediaId: number, tag: string): number {
  const hash = mediaId * 31 + tag.charCodeAt(0) * 7 + tag.length;
  const base = 4 + (hash % 6);
  if (tag === "masterpiece" || tag === "classic" || tag === "must-watch") return Math.min(12, base + 4);
  return Math.min(12, base);
}

function pickVoters(ids: string[], count: number, downvoted: boolean) {
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled
    .slice(0, Math.min(count, shuffled.length))
    .map((userId) => ({
      userId,
      vote: downvoted && Math.random() < 0.35 ? -1 : 1,
    }));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
