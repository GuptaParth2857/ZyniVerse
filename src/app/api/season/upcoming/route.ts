import { NextResponse } from "next/server";

const SEASONS = ["winter", "spring", "summer", "fall"];

export async function GET() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const seasonIdx = Math.floor(month / 3);
  const nextSeason = (seasonIdx + 1) % 4;
  const nextYear = nextSeason === 0 ? year + 1 : year;
  const season = SEASONS[nextSeason];

  let anime: any[] = [];

  try {
    const resp = await fetch(`https://api.jikan.moe/v4/seasons/${nextYear}/${season}`, { signal: AbortSignal.timeout(8000) });
    if (resp.ok) {
      const data = await resp.json();
      anime = (data.data || []).slice(0, 30).map((a: any) => ({
        malId: a.mal_id,
        title: a.title,
        titleEnglish: a.title_english,
        synopsis: a.synopsis,
        image: a.images?.webp?.image_url || a.images?.jpg?.image_url,
        trailer: a.trailer?.url || a.trailer?.embed_url,
        episodes: a.episodes,
        status: a.status,
        score: a.score,
        genres: (a.genres || []).map((g: any) => g.name),
        studio: (a.studios || []).map((s: any) => s.name).join(", "),
        broadcast: a.broadcast?.string,
        airing: a.airing,
      }));
    }
  } catch {
    // Jikan API unreachable — use offline fallback
    anime = [
      { malId: 1, title: "Solo Leveling", image: "https://cdn.myanimelist.net/images/anime/1208/133320.jpg", genres: ["Action", "Fantasy"], score: 8.5, episodes: 12, studio: "A-1 Pictures", synopsis: "In a world of hunters, the weakest hunter Sung Jin-Woo gains a unique ability." },
      { malId: 2, title: "Frieren: Beyond Journey's End 2nd Season", image: "https://cdn.myanimelist.net/images/anime/1015/122612.jpg", genres: ["Adventure", "Fantasy"], score: 9.0, episodes: null, studio: "Madhouse", synopsis: "The journey of the elf mage Frieren continues." },
      { malId: 3, title: "Demon Slayer: Infinity Castle", image: "https://cdn.myanimelist.net/images/anime/1908/135788.jpg", genres: ["Action", "Fantasy"], score: 8.8, episodes: null, studio: "ufotable", synopsis: "Tanjiro and his friends confront Muzan Kibutsuji in the Infinity Castle." },
      { malId: 4, title: "Attack on Titan: The Final Season", image: "https://cdn.myanimelist.net/images/anime/1422/120011.jpg", genres: ["Action", "Drama"], score: 9.2, episodes: null, studio: "MAPPA", synopsis: "The conclusion to the Attack on Titan saga." },
      { malId: 5, title: "Jujutsu Kaisen Season 3", image: "https://cdn.myanimelist.net/images/anime/1417/140280.jpg", genres: ["Action", "Supernatural"], score: 8.7, episodes: null, studio: "MAPPA", synopsis: "The Culling Game arc continues." },
      { malId: 6, title: "One Piece: Egghead Arc", image: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg", genres: ["Action", "Adventure"], score: 8.6, episodes: null, studio: "Toei Animation", synopsis: "The Straw Hats explore the futuristic island of Egghead." },
      { malId: 7, title: "Oshi no Ko Season 2", image: "https://cdn.myanimelist.net/images/anime/1325/138838.jpg", genres: ["Drama", "Supernatural"], score: 8.9, episodes: 13, studio: "Doga Kobo", synopsis: "Aqua and Ruby continue their journey through the entertainment industry." },
      { malId: 8, title: "Chainsaw Man — The Movie: Reze Arc", image: "https://cdn.myanimelist.net/images/anime/1806/136648.jpg", genres: ["Action", "Horror"], score: 8.6, episodes: null, studio: "MAPPA", synopsis: "Denji meets the mysterious Bomb Devil, Reze." },
      { malId: 9, title: "Vinland Saga Season 3", image: "https://cdn.myanimelist.net/images/anime/1796/136875.jpg", genres: ["Action", "Historical"], score: 9.0, episodes: null, studio: "MAPPA", synopsis: "Thorfinn's journey to Vinland continues." },
      { malId: 10, title: "Mob Psycho 100 Season 4", image: "https://cdn.myanimelist.net/images/anime/1302/136835.jpg", genres: ["Action", "Comedy"], score: 8.7, episodes: null, studio: "Bones", synopsis: "Mob faces new psychic challenges." },
    ];
  }

  return NextResponse.json({ anime, season, year: nextYear, count: anime.length });
}
