const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const moments = await p.moment.findMany({
    select: { id: true, character: true, animeTitle: true, animeId: true, animeCover: true, quote: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("TOTAL:", moments.length);
  for (const m of moments) {
    console.log(
      `${m.id} | ${m.character} | ${m.animeTitle} (${m.animeId}) | cover=${m.animeCover}`
    );
  }
  await p.$disconnect();
})();
