import { NextRequest, NextResponse } from "next/server";

interface SilhouetteGame { mediaId: number; character: string; anime: string; imageUrl: string; hint: string; }

const GAMES: SilhouetteGame[] = [
  { mediaId: 16498, character: "Eren Yeager", anime: "Attack on Titan", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b134498-UizS1qWmT3y8.png", hint: "Titan shifter who wants to freedom" },
  { mediaId: 1535, character: "Light Yagami", anime: "Death Note", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b21228-SuFqLVMnZG9Z.png", hint: "High school student with a god complex" },
  { mediaId: 1535, character: "L Lawliet", anime: "Death Note", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b21230-T4sIyIGlOq2d.png", hint: "Eccentric detective with a sweet tooth" },
  { mediaId: 5114, character: "Edward Elric", anime: "Fullmetal Alchemist Brotherhood", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107482-IoRfXSRCLxq3.png", hint: "Alchemist with a metal arm who hates being called short" },
  { mediaId: 20, character: "Naruto Uzumaki", anime: "Naruto", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107498-25QMGSCfVRqL.png", hint: "Loud ninja who loves ramen and dreams of being Hokage" },
  { mediaId: 21, character: "Monkey D. Luffy", anime: "One Piece", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107511-qS90v1P4mr6V.png", hint: "Rubber-powered pirate captain with a straw hat" },
  { mediaId: 30276, character: "Saitama", anime: "One Punch Man", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107523-zIj5VxsmMsJP.png", hint: "Bald hero in a yellow suit who defeats everyone in one punch" },
  { mediaId: 40748, character: "Gojo Satoru", anime: "Jujutsu Kaisen", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b1191941-vqVdRC0iHjy6.png", hint: "Blindfolded sorcerer with white hair and blue eyes" },
  { mediaId: 11061, character: "Killua Zoldyck", anime: "Hunter x Hunter", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107548-cmG0a5yCQB4Q.png", hint: "Lightning-fast assassin turned friend" },
  { mediaId: 101922, character: "Tanjiro Kamado", anime: "Demon Slayer", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b117543-t3u4cn62fjWr.png", hint: "Kind demon slayer with a scar and checkered haori" },
  { mediaId: 9253, character: "Okabe Rintarou", anime: "Steins;Gate", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107565-4J8IYBPhlKfo.png", hint: "Self-proclaimed mad scientist who talks to a cell phone" },
  { mediaId: 32281, character: "Taki Tachibana", anime: "Your Name", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b101061-CQxWsOwdbPYp.png", hint: "Tokyo high school boy who swaps bodies with a country girl" },
  { mediaId: 199, character: "Shinji Ikari", anime: "Neon Genesis Evangelion", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107617-xd2Ej1yHw2wN.png", hint: "Reluctant pilot of a biomechanical robot" },
  { mediaId: 2001, character: "Spike Spiegel", anime: "Cowboy Bebop", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107623-tMUH2dVFjPvu.png", hint: "Martial arts-loving bounty hunter who smokes" },
  { mediaId: 42299, character: "Loid Forger", anime: "Spy x Family", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b1433141-Iqk2wRfKU7Ir.png", hint: "Master spy living under a fake identity with a fake family" },
  { mediaId: 22319, character: "Kaneki Ken", anime: "Tokyo Ghoul", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107685-tLdSxWFv9L7l.png", hint: "College student who becomes half-ghoul after a date" },
  { mediaId: 37779, character: "Emma", anime: "The Promised Neverland", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b101281-hdPIYQQNlLgD.png", hint: "Athletic orphan girl who discovers the truth" },
  { mediaId: 28223, character: "Sora", anime: "No Game No Life", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107695-OEGFFZvVd9Lm.png", hint: "Unbeatable gamer transported to a game-only world" },
  { mediaId: 5114, character: "Roy Mustang", anime: "Fullmetal Alchemist Brotherhood", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107485-0wcDd0C0g9lM.png", hint: "Fire-wielding State Alchemist who wants to be Führer" },
  { mediaId: 20507, character: "Kaori Miyazono", anime: "Your Lie in April", imageUrl: "https://s4.anilist.co/file/anilistcdn/character/large/b107803-sEx6v3UFm7eB.png", hint: "Free-spirited violinist who changes a pianist's world" },
];

function getDailyGame(): SilhouetteGame {
  const start = new Date("2024-01-01").getTime();
  const dayIndex = Math.floor((Date.now() - start) / 86400000);
  return GAMES[dayIndex % GAMES.length];
}

export async function GET() {
  const game = getDailyGame();
  return NextResponse.json({
    mediaId: game.mediaId,
    imageUrl: game.imageUrl,
    hint: game.hint,
  });
}

export async function POST(req: NextRequest) {
  const { guess, attempts } = await req.json();
  if (!guess || typeof guess !== "string") {
    return NextResponse.json({ error: "Guess required" }, { status: 400 });
  }
  const game = getDailyGame();
  const guessLower = guess.toLowerCase().trim();
  const correct = guessLower === game.character.toLowerCase() || guessLower === game.anime.toLowerCase();

  const hints: string[] = [];
  if (correct) {
    hints.push("Correct!");
  } else {
    hints.push(game.hint);
    const n = (attempts || 0) + 1;
    if (n >= 2) hints.push(`First letter of name: ${game.character[0].toUpperCase()}`);
    if (n >= 3) hints.push(`Name has ${game.character.split(" ").length} words / ${game.character.length} letters`);
    if (n >= 4) hints.push(`From: ${game.anime}`);
    if (n >= 5) hints.push(`Full name: ${game.character}`);
  }

  return NextResponse.json({
    correct,
    hints,
    attempts: (attempts || 0) + 1,
    gameOver: correct || (attempts || 0) + 1 >= 6,
    target: (correct || (attempts || 0) + 1 >= 6) ? { character: game.character, anime: game.anime, mediaId: game.mediaId, imageUrl: game.imageUrl } : undefined,
  });
}
