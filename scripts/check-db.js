const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const users = await p.user.findMany({ select: { id: true, username: true, email: true } });
  console.log("USERS:", JSON.stringify(users, null, 2));
  const entries = await p.listEntry.count();
  console.log("ListEntry count:", entries);
  const lists = await p.userList.count();
  console.log("UserList count:", lists);
  const ep = await p.episodeProgress.count();
  console.log("EpisodeProgress count:", ep);
  const up = await p.userPoints.count();
  console.log("UserPoints count:", up);
  const ua = await p.userAchievement.count();
  console.log("UserAchievement count:", ua);
  const act = await p.activity.count();
  console.log("Activity count:", act);
  await p.$disconnect();
})();
