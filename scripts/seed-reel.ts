/* Seed a reel from a local merged mp4 into the live store + DB (owner account).
 * Mirrors the presign upload flow but runs with admin credentials + prisma.
 * Run: npx tsx scripts/seed-reel.ts <video.mp4> [--thumbnail <url|path>]
 * Env: loads .env.local (DATABASE_URL, storage creds). */
import { loadEnvFile } from "node:process";
import { readFileSync } from "node:fs";
loadEnvFile(".env.local");

interface SeedArgs {
  videoPath: string;
  thumbnailUrl: string | null;
  caption: string;
  animeId: number;
  animeTitle: string;
  duration: number;
  userName: string;
}

function parseArgs(argv: string[]): SeedArgs {
  const [videoPath, , thumbValue, , durationValue] = argv;
  if (!videoPath) {
    throw new Error(
      "usage: seed-reel.ts <video.mp4> [--thumbnail <url>] [--duration <seconds>]",
    );
  }
  return {
    videoPath,
    thumbnailUrl: thumbValue ?? null,
    caption: "Tanjiro Kamado AMV — fire 🔥 #Tanjiro #DemonSlayer #AMV",
    animeId: 16498,
    animeTitle: "Demon Slayer: Kimetsu no Yaiba",
    duration: durationValue ? Math.max(1, parseInt(durationValue, 10)) : 10,
    userName: "ParthGupta1",
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const buffer = readFileSync(args.videoPath);
  console.log(`video bytes: ${buffer.length}`);

  const { prisma } = await import("../src/lib/prisma");
  const { isR2Configured, r2Put, r2PublicUrl } = await import("../src/lib/r2");
  const { getSupabaseAdmin } = await import("../src/lib/supabase");

  const owner = await prisma.user.findUnique({
    where: { username: args.userName },
    select: { id: true, username: true },
  });
  if (!owner) throw new Error(`user ${args.userName} not found`);
  console.log(`owner: @${owner.username}`);

  const ts = Date.now();
  const workspace = "seed";
  const videoPath = `${workspace}/${ts}-tanjiro-amv.mp4`;
  const contentType = "video/mp4";

  let videoUrl: string;
  if (isR2Configured()) {
    await r2Put(videoPath, buffer, contentType);
    videoUrl = r2PublicUrl(videoPath);
    console.log("stored via R2");
  } else {
    const supabase = getSupabaseAdmin();
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === "reels")) {
      await supabase.storage.createBucket("reels", { public: true });
      console.log("created reels bucket");
    }
    const { error } = await supabase.storage
      .from("reels")
      .upload(videoPath, buffer, { contentType, cacheControl: "31536000" });
    if (error) throw new Error(`storage upload failed: ${error.message}`);
    videoUrl = supabase.storage.from("reels").getPublicUrl(videoPath)
      .data.publicUrl;
    console.log("stored via Supabase");
  }
  console.log(`videoUrl: ${videoUrl}`);

  // Verify the stored object is reachable
  const head = await fetch(videoUrl, { method: "HEAD" });
  console.log(
    `storage HEAD: ${head.status} content-length=${head.headers.get("content-length")}`,
  );

  const reel = await prisma.reel.create({
    data: {
      userId: owner.id,
      videoUrl,
      thumbnailUrl: args.thumbnailUrl,
      caption: args.caption,
      duration: args.duration,
      animeId: args.animeId,
      animeTitle: args.animeTitle,
    },
    select: {
      id: true,
      videoUrl: true,
      thumbnailUrl: true,
      animeId: true,
      animeTitle: true,
      createdAt: true,
    },
  });
  console.log(`seeded reel: ${reel.id}`);
  console.log(JSON.stringify(reel, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
