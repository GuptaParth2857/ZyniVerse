const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  // Which users have entries?
  const entries = await p.listEntry.findMany({ select: { userId: true, mediaId: true, status: true, score: true } });
  console.log("ALL ENTRIES:", JSON.stringify(entries, null, 2));

  // Which users have lists?
  const lists = await p.userList.findMany({ select: { id: true, userId: true, title: true, isPublic: true } });
  console.log("ALL LISTS:", JSON.stringify(lists, null, 2));

  // Watch history
  const ep = await p.episodeProgress.findMany({ select: { userId: true, mediaId: true, episode: true, watchedAt: true } });
  console.log("EPISODE PROGRESS:", JSON.stringify(ep, null, 2));

  // Activities
  const act = await p.activity.findMany({ select: { userId: true, type: true, mediaTitle: true } });
  console.log("ACTIVITIES:", JSON.stringify(act, null, 2));

  // User achievements
  const ua = await p.userAchievement.findMany({ select: { userId: true, achievementId: true, earnedAt: true } });
  console.log("USER ACHIEVEMENTS:", JSON.stringify(ua, null, 2));

  await p.$disconnect();
})();
