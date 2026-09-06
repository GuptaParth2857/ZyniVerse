import { prisma } from "@/lib/prisma";

const DEFAULT_CONTESTS: { type: string; title: string; description: string; badge: string }[] = [
  { type: "MEME", title: "Funniest Meme of the Week", description: "Post your best anime meme — most votes wins a badge + XP!", badge: "MEME_MAESTRO" },
  { type: "COSPLAY", title: "Cosplay Spotlight", description: "Show off your anime cosplay — top voted cosplay wins!", badge: "COSPLAY_STAR" },
  { type: "FANART", title: "Fan Art of the Week", description: "Share your original anime fan art — most votes wins!", badge: "ARTIST_OF_THE_WEEK" },
  { type: "MOMENT", title: "Best Anime Moment", description: "Share your favourite anime moment/quotes", badge: "MOMENT_LEGEND" },
];

function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getCurrentContests() {
  const now = new Date();
  const start = mondayOf(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  // Ensure each default type has an active contest this week
  for (const c of DEFAULT_CONTESTS) {
    await prisma.contentContest.upsert({
      where: { id: `${c.type}-${start.toISOString().split("T")[0]}` },
      update: {},
      create: {
        id: `${c.type}-${start.toISOString().split("T")[0]}`,
        title: c.title,
        type: c.type as "MEME",
        description: c.description,
        rewardBadge: c.badge,
        weekStart: start,
        weekEnd: end,
        rewardXp: 100,
      },
    });
  }

  return prisma.contentContest.findMany({
    where: { weekStart: start, status: "ACTIVE" },
    include: { entries: { include: { user: { select: { username: true, avatar: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export type CurrentContest = Awaited<ReturnType<typeof getCurrentContests>>[number];