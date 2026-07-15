import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, username: true } });
  const existing = await prisma.userPoints.findMany({ select: { userId: true } });
  const existingSet = new Set(existing.map((e) => e.userId));
  const missing = users.filter((u) => !existingSet.has(u.id));

  console.log(`Total users: ${users.length}, Missing UserPoints: ${missing.length}`);

  for (const u of missing) {
    await prisma.userPoints.create({ data: { userId: u.id, points: 0, level: 1 } });
    console.log(`Created UserPoints for: ${u.username} (${u.id})`);
  }

  if (missing.length === 0) console.log("All users already have UserPoints.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
