import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMAGES: Record<string, string> = {
  "comic-con-delhi": "https://images.unsplash.com/photo-1608889825205-eebdb9fc5814?w=800&h=450&fit=crop&q=80",
  "anime-expo-india-delhi": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=450&fit=crop&q=80",
  "bengaluru-anime-con": "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=450&fit=crop&q=80",
  "comic-con-mumbai": "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&h=450&fit=crop&q=80",
  "comic-con-bangalore": "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=800&h=450&fit=crop&q=80",
  "comic-con-hyderabad": "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=450&fit=crop&q=80",
  "otaku-fest-delhi": "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&h=450&fit=crop&q=80",
  "indipop-delhi": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop&q=80",
  "comic-con-chennai": "https://images.unsplash.com/photo-1612544448445-b8232cff3e35?w=800&h=450&fit=crop&q=80",
  "mumbai-anime-con": "https://images.unsplash.com/photo-1607604276583-cbc999877861?w=800&h=450&fit=crop&q=80",
  "delhi-anime-con": "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=450&fit=crop&q=80",
  "indipop-bangalore": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop&q=80",
  "comic-con-pune": "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&h=450&fit=crop&q=80",
  "cosplay-carnival": "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=450&fit=crop&q=80",
  "anime-expo-india-bangalore": "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=450&fit=crop&q=80",
  "otaku-fest-mumbai": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop&q=80",
  "comic-con-delhi-winter": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=450&fit=crop&q=80",
  "hyderabad-comic-con-winter": "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=450&fit=crop&q=80",
  "indipop-hyderabad": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop&q=80",
  "pune-anime-con": "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=450&fit=crop&q=80",
  "comic-con-kolkata": "https://images.unsplash.com/photo-1560523157-0fb82a813e2c?w=800&h=450&fit=crop&q=80",
};

async function main() {
  console.log("Updating convention images...");

  let updated = 0;
  for (const [id, image] of Object.entries(IMAGES)) {
    const result = await prisma.convention.updateMany({
      where: { id },
      data: { image },
    });
    if (result.count > 0) {
      updated++;
      console.log(`  ✓ ${id}`);
    } else {
      console.log(`  ✗ ${id} (not found)`);
    }
  }

  console.log(`\nDone! Updated ${updated} conventions with images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
