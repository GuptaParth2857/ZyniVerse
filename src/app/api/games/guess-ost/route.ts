import { NextRequest, NextResponse } from "next/server";

interface OstGame { mediaId: number; title: string; song: string; artist: string; type: "OP" | "ED" | "OST"; hint: string; }

const GAMES: OstGame[] = [
  { mediaId: 16498, title: "Attack on Titan", song: "Guren no Yumiya", artist: "Linked Horizon", type: "OP", hint: "German-titled first opening with a dramatic choir" },
  { mediaId: 5114, title: "Fullmetal Alchemist Brotherhood", song: "again", artist: "YUI", type: "OP", hint: "Emotional rock opener about starting over" },
  { mediaId: 1535, title: "Death Note", song: "the WORLD", artist: "Nightmare", type: "OP", hint: "Gothic rock opener for a cat-and-mouse thriller" },
  { mediaId: 9253, title: "Steins;Gate", song: "Hacking to the Gate", artist: "Kanako Ito", type: "OP", hint: "Sci-fi themed song about breaking through time" },
  { mediaId: 20, title: "Naruto", song: "Haruka Kanata", artist: "ASIAN KUNG-FU GENERATION", type: "OP", hint: "Fast-paced J-rock opener for a ninja anime" },
  { mediaId: 11061, title: "Hunter x Hunter (2011)", song: "departure!", artist: "Masatoshi Ono", type: "OP", hint: "Uplifting song about adventure and dreams" },
  { mediaId: 101922, title: "Demon Slayer", song: "Gurenge", artist: "LiSA", type: "OP", hint: "Powerful rock anthem about flames and resolve" },
  { mediaId: 31964, title: "My Hero Academia", song: "The Day", artist: "Porno Graffitti", type: "OP", hint: "Energetic opener about becoming a hero" },
  { mediaId: 20507, title: "Your Lie in April", song: "Hikaru Nara", artist: "Goose house", type: "OP", hint: "Gentle ensemble song about light and music" },
  { mediaId: 199, title: "Neon Genesis Evangelion", song: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", type: "OP", hint: "Iconic 90s anime opener about a cruel angel" },
  { mediaId: 2001, title: "Cowboy Bebop", song: "Tank!", artist: "The Seatbelts", type: "OP", hint: "Explosive jazz opening with a saxophone riff" },
  { mediaId: 32281, title: "Your Name", song: "Zenzenzense", artist: "RADWIMPS", type: "OST", hint: "Fast rock track about searching across lifetimes" },
  { mediaId: 36456, title: "Re:Zero", song: "Redo", artist: "Konomi Suzuki", type: "OP", hint: "Song about starting over from the beginning" },
  { mediaId: 37779, title: "The Promised Neverland", song: "Touch Off", artist: "UVERworld", type: "OP", hint: "Tense opener for a children's escape thriller" },
  { mediaId: 21, title: "One Piece", song: "We Are!", artist: "Hiroshi Kitadani", type: "OP", hint: "The iconic pirate adventure theme song" },
  { mediaId: 42299, title: "Spy x Family", song: "Mixed Nuts", artist: "Official HIGE DANdism", type: "OP", hint: "Upbeat pop opener about a dysfunctional family" },
  { mediaId: 22319, title: "Tokyo Ghoul", song: "unravel", artist: "TK from Ling Tosite Sigure", type: "OP", hint: "Haunting falsetto song about identity and pain" },
  { mediaId: 28223, title: "No Game No Life", song: "This game", artist: "Konomi Suzuki", type: "OP", hint: "Dramatic song about a world decided by games" },
  { mediaId: 40748, title: "Jujutsu Kaisen", song: "Kaikai Kitan", artist: "Eve", type: "OP", hint: "Stylish opener about curses and sorcery" },
  { mediaId: 51235, title: "Oshi no Ko", song: "Idol", artist: "YOASOBI", type: "OP", hint: "Massive viral hit about the dark side of idol culture" },
  { mediaId: 30276, title: "One Punch Man", song: "THE HERO !!", artist: "JAM Project", type: "OP", hint: "Over-the-top heavy metal opener for a parody hero" },
  { mediaId: 38680, title: "KonoSuba", song: "fantastic dreamer", artist: "Machico", type: "OP", hint: "Cheerful pop opener for a comedy isekai" },
  { mediaId: 121, title: "Trigun", song: "H.T.", artist: "Tsuneo Imahori", type: "OP", hint: "Energetic blues-rock for a desert planet gunslinger" },
  { mediaId: 1735, title: "Naruto Shippuden", song: "Blue Bird", artist: "Ikimono-gakari", type: "OP", hint: "Sentimental J-pop about a bird taking flight" },
  { mediaId: 5680, title: "Clannad: After Story", song: "Toki wo Kizamu Uta", artist: "Lia", type: "OP", hint: "Melancholic piano-driven song about time passing" },
];

function getDailyGame(): OstGame {
  const start = new Date("2024-01-01").getTime();
  const dayIndex = Math.floor((Date.now() - start) / 86400000);
  return GAMES[dayIndex % GAMES.length];
}

export async function GET() {
  const game = getDailyGame();
  return NextResponse.json({
    mediaId: game.mediaId,
    song: game.song,
    artist: game.artist,
    type: game.type,
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
  const targetLower = game.title.toLowerCase();
  const correct = guessLower === targetLower;

  const hints: string[] = [];
  if (correct) {
    hints.push("Correct!");
  } else {
    hints.push(`Type: ${game.type} ${game.type === "OP" ? "(Opening)" : game.type === "ED" ? "(Ending)" : "(Soundtrack)"}`);
    const guessWords = guessLower.split(/\s+/);
    const targetWords = targetLower.split(/\s+/);
    const shared = guessWords.filter((w) => w.length > 2 && targetWords.some((tw) => tw.includes(w) || w.includes(tw)));
    if (shared.length > 0) hints.push(`Shared words with answer: ${shared.join(", ")}`);
    hints.push(`Year: ${game.mediaId > 40000 ? "2020s" : game.mediaId > 20000 ? "2010s" : "older"}`);
    hints.push(`Anime has ${game.type === "OP" ? "a popular opening" : game.type === "ED" ? "a memorable ending" : "an iconic soundtrack"}`);
  }

  return NextResponse.json({
    correct,
    hints,
    attempts: (attempts || 0) + 1,
    gameOver: correct || (attempts || 0) + 1 >= 6,
    target: (correct || (attempts || 0) + 1 >= 6) ? { title: game.title, mediaId: game.mediaId } : undefined,
  });
}
