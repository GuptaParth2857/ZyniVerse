import { NextRequest, NextResponse } from "next/server";

interface PlotGame { mediaId: number; title: string; plot: string; genres: string[]; year: number; }

const GAMES: PlotGame[] = [
  { mediaId: 16498, title: "Attack on Titan", plot: "A boy watches his mother get eaten by a giant humanoid creature. He joins a military unit to fight back against towering monsters that have driven humanity to live inside walled cities.", genres: ["Action","Drama","Fantasy"], year: 2013 },
  { mediaId: 9253, title: "Steins;Gate", plot: "A self-proclaimed mad scientist accidentally discovers time travel using a modified microwave. When a shadowy organization learns of his invention, he must keep undoing the deaths of people he cares about.", genres: ["Drama","Sci-Fi","Thriller"], year: 2011 },
  { mediaId: 1535, title: "Death Note", plot: "A bored high school genius finds a supernatural notebook: write any name and that person dies. He uses it to rid the world of criminals, while a eccentric detective tries to track him down.", genres: ["Mystery","Thriller","Supernatural"], year: 2006 },
  { mediaId: 5114, title: "Fullmetal Alchemist Brotherhood", plot: "Two brothers try to resurrect their dead mother using forbidden alchemy. The ritual fails, costing one brother his body and the other his arm and leg. They set out to find the Philosopher's Stone to restore what they lost.", genres: ["Action","Adventure","Drama"], year: 2009 },
  { mediaId: 11757, title: "Sword Art Online", plot: "Thousands of players are trapped in a virtual reality MMORPG where dying in-game means dying in real life. A skilled solo player must clear all 100 floors to free everyone.", genres: ["Action","Adventure","Fantasy"], year: 2012 },
  { mediaId: 30276, title: "One Punch Man", plot: "An incredibly bored superhero can defeat any enemy with a single punch. He searches for a worthy opponent while working a part-time job and dealing with bored bureaucrats.", genres: ["Action","Comedy","Supernatural"], year: 2015 },
  { mediaId: 101922, title: "Demon Slayer", plot: "A boy returns home to find his family slaughtered, with his younger sister turned into a demon. He joins an organization of demon slayers to find a cure and avenge his family.", genres: ["Action","Fantasy","Supernatural"], year: 2019 },
  { mediaId: 20, title: "Naruto", plot: "A loud, lonely orphan with a monster sealed inside him dreams of becoming the leader of his village. He trains relentlessly, befriends rivals, and uncovers conspiracies threatening his home.", genres: ["Action","Adventure","Fantasy"], year: 2002 },
  { mediaId: 11061, title: "Hunter x Hunter (2011)", plot: "A young boy sets out on a journey to find his missing father by passing an extremely dangerous exam that tests physical ability, intelligence, and moral character.", genres: ["Action","Adventure","Fantasy"], year: 2011 },
  { mediaId: 22319, title: "Tokyo Ghoul", plot: "A college student survives a deadly encounter with a flesh-eating monster. He becomes half-human, half-monster and struggles to live among both humans and ghouls in a divided Tokyo.", genres: ["Action","Drama","Horror"], year: 2014 },
  { mediaId: 31964, title: "My Hero Academia", plot: "Born without superpowers in a world where almost everyone has them, a powerless boy inherits a legendary ability from the world's greatest hero and enrolls in a prestigious hero academy.", genres: ["Action","Comedy","Super Power"], year: 2016 },
  { mediaId: 20507, title: "Your Lie in April", plot: "A piano prodigy who can no longer hear his own playing meets a free-spirited violinist who changes his world forever. Together they heal each other's emotional scars.", genres: ["Drama","Music","Romance"], year: 2014 },
  { mediaId: 199, title: "Neon Genesis Evangelion", plot: "A withdrawn teenager is recruited by his estranged father to pilot a giant biomechanical robot against mysterious beings called Angels. The battles take an increasingly psychological toll.", genres: ["Drama","Mecha","Psychological"], year: 1995 },
  { mediaId: 37779, title: "The Promised Neverland", plot: "Children in a seemingly perfect orphanage discover the horrifying truth: they are being raised as livestock for demons. They must devise a plan to escape before it is too late.", genres: ["Mystery","Psychological","Thriller"], year: 2019 },
  { mediaId: 32281, title: "Your Name", plot: "A teenage boy and girl start switching bodies with no explanation. They communicate through notes and messages. Then one day the body-swapping stops, and he sets out to find her.", genres: ["Drama","Romance","Supernatural"], year: 2016 },
  { mediaId: 5680, title: "Clannad: After Story", plot: "A young couple navigates life after high school, dealing with jobs, family conflicts, and growing apart. Their journey through adulthood becomes deeply emotional.", genres: ["Drama","Romance","Supernatural"], year: 2008 },
  { mediaId: 36456, title: "Re:Zero", plot: "A boy is summoned to a fantasy world and discovers he has the ability to return from death. Each time he dies, the world resets, and only he remembers what happened.", genres: ["Drama","Fantasy","Thriller"], year: 2016 },
  { mediaId: 42299, title: "Spy x Family", plot: "A master spy must build a fake family to carry out a mission. Unbeknownst to him, his adopted daughter is a telepath and his wife is a secret assassin.", genres: ["Action","Comedy","Slice of Life"], year: 2022 },
  { mediaId: 2001, title: "Cowboy Bebop", plot: "A ragtag crew of bounty hunters drifts through space in their ship, taking jobs and running from their pasts. The leader is a former hitman haunted by his ex-partner.", genres: ["Action","Drama","Sci-Fi"], year: 1998 },
  { mediaId: 28223, title: "No Game No Life", plot: "Two shut-in siblings who are undefeated gamers are transported to a world where everything is decided by games. They aim to challenge the god of this world.", genres: ["Comedy","Fantasy","Isekai"], year: 2014 },
  { mediaId: 121, title: "Trigun", plot: "A pacifist gunslinger with a mysterious past is chased across a desert planet by bounty hunters. Despite his peaceful philosophy, destruction seems to follow him everywhere.", genres: ["Action","Adventure","Comedy"], year: 1998 },
  { mediaId: 38680, title: "KonoSuba", plot: "A boy dies embarrassingly and is given a choice: be reborn in a fantasy world with one wish. He brings along a useless goddess, an explosion-obsessed mage, and a masochistic crusader.", genres: ["Comedy","Fantasy","Isekai"], year: 2016 },
  { mediaId: 9969, title: "Gintama", plot: "In an alien-occupied Japan, a lazy ex-swordsman runs a small business with his students. They take odd jobs and constantly get involved in absurd situations.", genres: ["Action","Comedy","Sci-Fi"], year: 2006 },
  { mediaId: 1735, title: "Naruto Shippuden", plot: "A young ninja returns after years of training to rescue his friend who has gone rogue. He uncovers a plan for world domination and must confront his own inner demon.", genres: ["Action","Adventure","Fantasy"], year: 2007 },
  { mediaId: 21, title: "One Piece", plot: "A boy made of rubber sets sail with a diverse crew to find the legendary treasure One Piece and become the King of the Pirates. Along the way he battles tyrants and uncovers ancient secrets.", genres: ["Action","Adventure","Comedy"], year: 1999 },
  { mediaId: 31043, title: "Oregairu", plot: "A cynical loner who claims to hate being forced into a volunteer services club with a seemingly perfect girl. Despite himself, he slowly learns about genuine human connections.", genres: ["Comedy","Drama","Romance"], year: 2013 },
  { mediaId: 30276, title: "Mob Psycho 100", plot: "An unremarkable middle schooler with overwhelming psychic powers works for a con man who takes credit for his exorcisms. He tries to live a normal life despite his extraordinary abilities.", genres: ["Action","Comedy","Supernatural"], year: 2016 },
  { mediaId: 40748, title: "Jujutsu Kaisen", plot: "A high schooler swallows a cursed object containing the finger of a legendary curse. He enrolls in a school for sorcerers to find all the fingers and destroy the curse within him.", genres: ["Action","Fantasy","Supernatural"], year: 2020 },
  { mediaId: 51235, title: "Oshi no Ko", plot: "A famous idol gives birth to twins in secret. The father is a fan who is reincarnated as one of the children. After a tragedy, the children navigate the entertainment industry.", genres: ["Drama","Supernatural"], year: 2023 },
];

function getDailyGame(): PlotGame {
  const start = new Date("2024-01-01").getTime();
  const dayIndex = Math.floor((Date.now() - start) / 86400000);
  return GAMES[dayIndex % GAMES.length];
}

export async function GET() {
  const game = getDailyGame();
  return NextResponse.json({
    mediaId: game.mediaId,
    plot: game.plot,
    genres: game.genres,
    year: game.year,
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
    const sharedGenres = game.genres.filter((g) => guessLower.includes(g.toLowerCase()));
    hints.push(sharedGenres.length > 0 ? `Shared genres: ${sharedGenres.join(", ")}` : "No shared genres");
    hints.push(`Decade: ${game.year >= 2020 ? "2020s" : game.year >= 2010 ? "2010s" : game.year >= 2000 ? "2000s" : "1990s or earlier"}`);
    if (!correct) hints.push(`First letter: ${game.title[0].toUpperCase()}`);
  }

  return NextResponse.json({
    correct,
    hints,
    attempts: (attempts || 0) + 1,
    gameOver: correct || (attempts || 0) + 1 >= 6,
    target: (correct || (attempts || 0) + 1 >= 6) ? { title: game.title, mediaId: game.mediaId } : undefined,
  });
}
