import fs from "node:fs";

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2];
}

const { PrismaClient } = await import("@prisma/client");
const p = new PrismaClient();
const { getHomepageData, getAiringSchedule } = await import("./src/lib/anilist");

async function time(label: string, fn: () => Promise<unknown>) {
  const t = Date.now();
  try {
    const r = await fn();
    const extra = typeof r === "string" ? r : Array.isArray(r) ? `len=${r.length}` : "";
    console.log(`${label.padEnd(40)} ${String(Date.now() - t).padStart(7)}ms ${extra}`);
  } catch (e) {
    console.log(`${label.padEnd(40)} ${String(Date.now() - t).padStart(7)}ms ERROR: ${(e as Error).message.slice(0, 90)}`);
  }
}

const now = Math.floor(Date.now() / 1000);

for (let round = 1; round <= 2; round++) {
  console.log(`--- round ${round} (${round === 1 ? "cold caches" : "warm caches"}) ---`);
  await time("prisma.user.count()", () => p.user.count());
  await time("prisma.post.findMany(take 10)", () =>
    p.post.findMany({ where: { image: { not: null } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true } })
  );
  await time("getHomepageData() anilist", () => getHomepageData());
  await time("getAiringSchedule() anilist", () => getAiringSchedule(now - 3600 * 6, now + 3600 * 18));
  console.log("--- all 4 parallel ---");
  await time("Promise.all(4)", () =>
    Promise.all([
      p.user.count(),
      p.post.findMany({ where: { image: { not: null } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true } }),
      getHomepageData(),
      getAiringSchedule(now - 3600 * 6, now + 3600 * 18),
    ])
  );
}

await p.$disconnect();
