import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CREATORS = [
  {
    email: "sakura.art@zyverse.in",
    username: "SakuraStroke",
    avatar: "https://picsum.photos/seed/sakura-stroke/200/200",
    bio: "Anime portrait illustrator. Watercolor + digital hybrid.",
  },
  {
    email: "kisame.beats@zyverse.in",
    username: "KisameBeats",
    avatar: "https://picsum.photos/seed/kisame-beats/200/200",
    bio: "Lo-fi and anime ED remixes. DM for instrumental work.",
  },
  {
    email: "zen.cut@zyverse.in",
    username: "ZenCut",
    avatar: "https://picsum.photos/seed/zen-cut/200/200",
    bio: "AMV editor. Trailers, hype reels, and clean cuts.",
  },
  {
    email: "himiko.cos@zyverse.in",
    username: "HimikoCraft",
    avatar: "https://picsum.photos/seed/himiko-craft/200/200",
    bio: "Cosplay maker. Armor, props, and full builds.",
  },
  {
    email: "gojo.glyphs@zyverse.in",
    username: "GojoGlyphs",
    avatar: "https://picsum.photos/seed/gojo-glyphs/200/200",
    bio: "Custom anime logo & poster designer.",
  },
];

const LISTINGS = [
  {
    title: "Anime Portrait Commission (Bust)",
    category: "fanart",
    description:
      "High-detail digital anime portrait of your favourite character — or an OC designed to match your brief. I work in a vibrant semi-realistic style with clean linework, soft shading, and optional background.\n\nWhat you get:\n- 1 character, bust/waist crop\n- PSD source file + PNG export\n- 2 free revision rounds\n- Commercial rights for personal prints\n\nShare a reference, a mood board, and any must-have details. Turnaround depends on queue position.",
    imageUrl: "https://picsum.photos/seed/portrait-bust/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-bust-1/300/300",
      "https://picsum.photos/seed/portfolio-bust-2/300/300",
    ]),
    priceMin: 1500,
    priceMax: 3500,
    turnaround: "1 week",
  },
  {
    title: "Full-Body Anime OC Illustration",
    category: "fanart",
    description:
      "Full-body illustration with a simple or detailed background. Perfect for profile pics, banners, V-tuber models, or light-novel covers. Includes lighting, colour grading, and optional chibi variant for an extra fee.\n\nProcess:\n1. Sketch approval\n2. Line + flat colour\n3. Shading pass\n4. Final polish",
    imageUrl: "https://picsum.photos/seed/fullbody-oc/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-fb-1/300/300",
      "https://picsum.photos/seed/portfolio-fb-2/300/300",
      "https://picsum.photos/seed/portfolio-fb-3/300/300",
    ]),
    priceMin: 4000,
    priceMax: 6500,
    turnaround: "2 weeks",
  },
  {
    title: "Lo-fi Anime ED Remix",
    category: "music",
    description:
      "I turn any anime OP/ED into a chill lo-fi beat while keeping the melody recognisable. Includes a mastered MP3 + untagged WAV for your streams. Send the song link and I'll handle the rest.\n\nExtras:\n- Video art loop (simple) \u2014 +₹800\n- Full vocal mix \u2014 negotiable",
    imageUrl: "https://picsum.photos/seed/lofi-remix/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-music-1/300/300",
    ]),
    priceMin: 1200,
    priceMax: 2500,
    turnaround: "3-5 days",
  },
  {
    title: "Custom AMV / Trailer Edit",
    category: "editing",
    description:
      "Tight, sync-heavy edits for YouTube, Instagram, or TikTok. I work with your raw clips or pick cuts for you. Anime trailer style, hype mashup, or a sad-edit with lyric sync.\n\nDeliverables:\n- 1080p export (MP4)\n- Aspect-ratio variants for Reels/Shorts\n- 2 revision rounds",
    imageUrl: "https://picsum.photos/seed/amv-edit/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-edit-1/300/300",
      "https://picsum.photos/seed/portfolio-edit-2/300/300",
    ]),
    priceMin: 900,
    priceMax: 3000,
    turnaround: "1 week",
  },
  {
    title: "Cosplay Commission — Armor & Props",
    category: "cosplay",
    description:
      "Hand-built cosplay armour, weapons, and props using EVA foam and 3D printing. I ship within India and internationally. Share your character sheet and measurements and I'll quote materials separately.\n\nCurrent build slots: 2 open.\nPopular builds: Demon Slayer swords, Chainsaw Man accessories, JJK weapons.",
    imageUrl: "https://picsum.photos/seed/cosplay-armor/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-cos-1/300/300",
    ]),
    priceMin: 2500,
    priceMax: 8000,
    turnaround: "1 month",
  },
  {
    title: "Anime Poster / Key Visual Design",
    category: "other",
    description:
      "Poster art and key visuals for events, conventions, or your own anime-inspired projects. Includes layout, typography, and print-ready export (300 DPI). Great as wall art too.\n\n- Poster (A3/A2) \u2014 ₹1800+\n- Key visual with original illustration \u2014 starts ₹5000",
    imageUrl: "https://picsum.photos/seed/poster-design/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-poster-1/300/300",
    ]),
    priceMin: 1800,
    priceMax: 5000,
    turnaround: "1 week",
  },
  {
    title: "Anime Logo & Channel Branding",
    category: "other",
    description:
      "Channel logos, animated intros, and overlay packs for anime YT/Discord communities. Clean, sharp, on-brand. Includes source vectors for full ownership.\n\nPackages:\n- Logo only \u2014 ₹1000\n- Logo + intro 10s \u2014 ₹2200\n- Full overlay pack \u2014 ₹3500",
    imageUrl: "https://picsum.photos/seed/logo-pack/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-logo-1/300/300",
      "https://picsum.photos/seed/portfolio-logo-2/300/300",
    ]),
    priceMin: 1000,
    priceMax: 3500,
    turnaround: "3-5 days",
  },
  {
    title: "Semi-Realistic Anime Waifu Art",
    category: "fanart",
    description:
      "Semi-realistic anime art with dramatic lighting for streaming thumbnails, V-tubers, or personal commissions. High level of detail on face and hair, custom poses welcome.",
    imageUrl: "https://picsum.photos/seed/waifu-art/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-waifu-1/300/300",
    ]),
    priceMin: 3000,
    priceMax: 5500,
    turnaround: "2 weeks",
  },
  {
    title: "Anime Cover Song (Full Mix)",
    category: "music",
    description:
      "Full anime song cover with vocal production — tuning, mixing, and mastering. Send your dry vocal stems or booking a studio session. I deliver a radio-ready master.\n\nExtras: MV edit bundle available.",
    imageUrl: "https://picsum.photos/seed/cover-song/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-cover-1/300/300",
    ]),
    priceMin: 2000,
    priceMax: 4500,
    turnaround: "2 weeks",
  },
  {
    title: "Quick Chibi Sticker Pack",
    category: "fanart",
    description:
      "10 chibi stickers of your chosen character(s) with transparent backgrounds — ready for Discord, WhatsApp, or merch. Fast turnaround since it's my most-streamlined commission type.",
    imageUrl: "https://picsum.photos/seed/chibi-pack/680/510",
    portfolio: JSON.stringify([
      "https://picsum.photos/seed/portfolio-chibi-1/300/300",
      "https://picsum.photos/seed/portfolio-chibi-2/300/300",
    ]),
    priceMin: 800,
    priceMax: 2000,
    turnaround: "3-5 days",
  },
];

async function main() {
  const existing = await prisma.commission.count();
  if (existing > 0) {
    console.log(`skipped: commissions already exist (${existing}).`);
    return;
  }

  const creatorRows = [];
  for (const c of CREATORS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { avatar: c.avatar, bio: c.bio },
      create: {
        email: c.email,
        username: c.username,
        avatar: c.avatar,
        bio: c.bio,
        onboarded: true,
        themeColor: "emerald",
      },
    });
    creatorRows.push(user);
  }

  const userIds = creatorRows.map((u) => u.id);
  await prisma.commission.createMany({
    data: LISTINGS.map((l, i) => ({
      ...l,
      userId: userIds[i % userIds.length],
      isActive: true,
    })),
  });

  const totals = await prisma.commission.groupBy({ by: ["userId"], where: { isActive: true } });
  console.log(`seeded ${LISTINGS.length} commission listings across ${totals.length} creators.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());