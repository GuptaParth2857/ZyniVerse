import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const POPULAR_CHARACTERS = [
  { id: 158925, name: "Monkey D. Luffy", image: "https://s4.anilist.co/file/anilistcdn/character/large/b25-8YtYQ1AhUHsN.png" },
  { id: 158926, name: "Roronoa Zoro", image: "https://s4.anilist.co/file/anilistcdn/character/large/b25-1bqMHfVfJnm.png" },
  { id: 157224, name: "Naruto Uzumaki", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-VoDljnBC3lJ.png" },
  { id: 157228, name: "Sasuke Uchiha", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-qGPw4fYFcpoK.png" },
  { id: 153466, name: "Gojo Satoru", image: "https://s4.anilist.co/file/anilistcdn/character/large/b116383-LacHLjB4fx5H.png" },
  { id: 153467, name: "Itadori Yuji", image: "https://s4.anilist.co/file/anilistcdn/character/large/b116384-NxFz5rVH4hFy.png" },
  { id: 158927, name: "Sanji", image: "https://s4.anilist.co/file/anilistcdn/character/large/b25-YOGDtLGMq3jn.png" },
  { id: 157230, name: "Kakashi Hatake", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-Hxh3f1Vq6wxK.png" },
  { id: 153468, name: "Ryomen Sukuna", image: "https://s4.anilist.co/file/anilistcdn/character/large/b116385-WEkO465cIkEP.png" },
  { id: 153469, name: "Megumi Fushiguro", image: "https://s4.anilist.co/file/anilistcdn/character/large/b116386-lK3vJ9Wf8qjH.png" },
  { id: 158930, name: "Nami", image: "https://s4.anilist.co/file/anilistcdn/character/large/b25-ZxDq0gMPiN9M.png" },
  { id: 158929, name: "Usopp", image: "https://s4.anilist.co/file/anilistcdn/character/large/b25-uAuqWw3fBKqX.png" },
  { id: 157232, name: "Sakura Haruno", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-lSWhFOKIt6OD.png" },
  { id: 153470, name: "Kento Nanami", image: "https://s4.anilist.co/file/anilistcdn/character/large/b119768-zIqRvUNi2pCX.png" },
  { id: 153471, name: "Todo Aoi", image: "https://s4.anilist.co/file/anilistcdn/character/large/b116394-H0l0jGV2ZuMJ.png" },
  { id: 157235, name: "Shikamaru Nara", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-Tmq5VdAvE8Kt.png" },
  { id: 158935, name: "Boa Hancock", image: "https://s4.anilist.co/file/anilistcdn/character/large/b25-GxmP2fZ8g4R4.png" },
  { id: 157240, name: "Hinata Hyuuga", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-gOKe3HqJWMbl.png" },
  { id: 153472, name: "Toge Inumaki", image: "https://s4.anilist.co/file/anilistcdn/character/large/b119767-tWBxGtFqv1p8.png" },
  { id: 157245, name: "Might Guy", image: "https://s4.anilist.co/file/anilistcdn/character/large/b10-3RCMe1jtqwiB.png" },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  let battle = await prisma.characterBattle.findUnique({
    where: { date: today },
    include: { votes: true },
  });

  if (!battle) {
    const rand1 = seededRandom(seed);
    const rand2 = seededRandom(seed + 1);
    const idxA = Math.floor(rand1 * POPULAR_CHARACTERS.length);
    let idxB = Math.floor(rand2 * (POPULAR_CHARACTERS.length - 1));
    if (idxB >= idxA) idxB++;

    const charA = POPULAR_CHARACTERS[idxA];
    const charB = POPULAR_CHARACTERS[idxB];

    battle = await prisma.characterBattle.create({
      data: {
        date: today,
        charAId: charA.id,
        charBId: charB.id,
        charAName: charA.name,
        charBName: charB.name,
        charAImage: charA.image,
        charBImage: charB.image,
      },
      include: { votes: true },
    });
  }

  const votesA = battle.votes.filter((v) => v.choice === "A").length;
  const votesB = battle.votes.filter((v) => v.choice === "B").length;

  return NextResponse.json({
    id: battle.id,
    charA: { id: battle.charAId, name: battle.charAName, image: battle.charAImage, votes: votesA },
    charB: { id: battle.charBId, name: battle.charBName, image: battle.charBImage, votes: votesB },
    totalVotes: votesA + votesB,
    date: battle.date,
  });
}
