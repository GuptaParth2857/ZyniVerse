import { prisma } from "@/lib/prisma";
import { awardAchievement } from "@/lib/achievements-server";
import { createNotification } from "@/lib/notifications";
import { awardEconomy } from "@/lib/economy";

// Finds active contests whose voting window has ended, awards the top-voted
// entry's author the prize (badge achievement + XP) and marks them complete.
// Returns the number of contests finalized.
export async function finalizeContests(): Promise<number> {
  const now = new Date();
  const expired = await prisma.contentContest.findMany({
    where: { status: "ACTIVE", weekEnd: { lte: now } },
    include: {
      entries: { orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }] },
      winner: { select: { username: true } },
    },
  });

  let finalized = 0;
  for (const contest of expired) {
    const winner = contest.entries[0];
    if (!winner) {
      // No entries -> just close it without a winner
      await prisma.contentContest.update({ where: { id: contest.id }, data: { status: "COMPLETED" } });
      finalized++;
      continue;
    }

    try {
      await prisma.contentContest.update({
        where: { id: contest.id },
        data: { status: "COMPLETED", winnerId: winner.userId },
      });

      if (contest.rewardBadge) {
        await awardAchievement(winner.userId, contest.rewardBadge, JSON.stringify({ contestId: contest.id, title: contest.title }));
      }

      // Pay the advertised prize. `contest.id` is the dedupe ref, so a retried
      // finalize (cron + admin both call this) can never pay the same win twice.
      await awardEconomy(winner.userId, "CONTEST_WIN", { coins: 50, xp: contest.rewardXp }, contest.id);

      await createNotification({
        userId: winner.userId,
        type: "SYSTEM",
        title: "🏆 Contest Winner!",
        body: `Congrats! Your entry '${winner.title}' won "${contest.title}". +${contest.rewardXp} XP + 50 coins and a badge unlocked!`,
        link: `/contests/${contest.id}`,
      });
      finalized++;
    } catch (e) {
      console.error("[/lib/contests-finalize] error finalizing contest", contest.id, e);
    }
  }

  return finalized;
}