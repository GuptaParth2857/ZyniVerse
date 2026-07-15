import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const orphaned = await prisma.userPoints.deleteMany({
    where: { userId: "5db39065-4703-4b90-af64-c99c014164eb" },
  });
  console.log("Deleted orphaned UserPoints:", orphaned.count);
  await prisma.$disconnect();
}
main();
