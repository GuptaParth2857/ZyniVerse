import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
(async () => {
  const total = await p.affiliateClick.count();
  const byPartner = await p.affiliateClick.groupBy({ by: ["partner"], _count: { _all: true } });
  const last7 = await p.affiliateClick.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } });
  const last30 = await p.affiliateClick.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 864e5) } } });
  const recent = await p.affiliateClick.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { partner: true, page: true, createdAt: true },
  });
  console.log(JSON.stringify({ total, byPartner, last7, last30, recent }, null, 2));
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
