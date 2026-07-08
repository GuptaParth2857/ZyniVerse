export interface StreamingSource {
  name: string;
  url: string;
  logo: string;
  region: string;
  languages: string[];
  type: "subscription" | "free" | "ads";
}

type AnimeEntry = string | string[];

const curatedMap: Record<string, StreamingSource[]> = {};

function add(title: AnimeEntry, sources: StreamingSource[]): void {
  const titles = Array.isArray(title) ? title : [title];
  for (const t of titles) {
    curatedMap[t.toLowerCase().trim()] = sources;
  }
}

add("One Piece", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GRMG8ZQZR/One-Piece", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Naruto", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY9PJ5KWR/Naruto", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70205012", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Naruto Shippuden", "Naruto Shippuuden"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GYQ4MWKDY/Naruto-Shippuden", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70205012", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Attack on Titan", "Shingeki no Kyojin", "AOT"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GR751KNZY/Attack-on-Titan", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70299043", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Demon Slayer", "Kimetsu no Yaiba"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY5P48XEY/Demon-Slayer-Kimetsu-no-Yaiba", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81091393", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: "https://www.jiohotstar.com/search/demon-slayer", logo: "JioHotstar", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Jujutsu Kaisen", "JJK"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GRDV0019R/Jujutsu-Kaisen", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81278456", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Death Note", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6QWD3QQR/Death-Note", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204970", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Fullmetal Alchemist Brotherhood", "FMAB", "Fullmetal Alchemist: Brotherhood"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY9PJ5KWR/Fullmetal-Alchemist-Brotherhood", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204980", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Your Name", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80161371", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Spirited Away", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/60023642", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["My Hero Academia", "Boku no Hero Academia", "MHA"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GR6VQ86QR/My-Hero-Academia", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["One Punch Man", "One-Punch Man"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G63K98PZ5/One-Punch-Man", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80117291", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Tokyo Revengers", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G79H23Z70/Tokyo-Revengers", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Chainsaw Man", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GVDHX8QNW/Chainsaw-Man", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Vinland Saga", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GEXH3WQ0R/Vinland-Saga", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81243911", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Spy x Family", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G4PH0W5P5/Spy-x-Family", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81539619", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Solo Leveling", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GJ0H9Q5Z7/Solo-Leveling", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Bleach", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GYMQPM0ZR/Bleach", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70169586", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Hunter x Hunter", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY3VKX1MR/Hunter-x-Hunter", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70300473", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Dragon Ball", "Dragon Ball Z", "Dragon Ball Super"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G9VHN9PZR/Dragon-Ball", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Haikyuu", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY8VM8V2R/Haikyu", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80090660", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Mob Psycho 100", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY19MXM4R/Mob-Psycho-100", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80169499", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Steins;Gate", "Steins Gate"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GY3VKX1MR/Steins-Gate", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70306114", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Re:Zero", "Re:Zero - Starting Life in Another World", "ReZero"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/GYE5K3Q0R/ReZero", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80178930", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Code Geass", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Code-Geass", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70205007", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Death Parade", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Death-Parade", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80025488", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Cowboy Bebop", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Cowboy-Bebop", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70002832", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Sword Art Online", "SAO"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Sword-Art-Online", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70302502", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Fairy Tail", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Fairy-Tail", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70234006", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Black Clover", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Black-Clover", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Made in Abyss", [
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Cyberpunk Edgerunners", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81054853", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Frieren: Beyond Journey's End", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Frieren", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Kaiju No. 8", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Kaiju-No-8", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Blue Lock", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Blue-Lock", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Hell's Paradise", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Hells-Paradise", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81608414", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Mashle: Magic and Muscles", "Mashle"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Mashle", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81557821", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Classroom of the Elite", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Classroom-of-the-Elite", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Violet Evergarden", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80182123", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Weathering With You", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81243911", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["A Silent Voice", "Koe no Katachi"], [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80204897", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/detail/0P7P0J6L0K", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Dr. Stone", "Dr. STONE"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Dr-Stone", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81095871", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["That Time I Got Reincarnated as a Slime", "Tensura", "Slime"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/That-Time-I-Got-Reincarnated-as-a-Slime", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81030460", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Kaguya-sama: Love Is War", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Kaguya-sama", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81190323", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Dandadan", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Dandadan", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81767642", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Mushoku Tensei", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Mushoku-Tensei", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Summertime Rendering", [
  { name: "Disney+ Hotstar", url: "https://www.hotstar.com/search/summertime-rendering", logo: "Disney+ Hotstar", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Horimiya", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Horimiya", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Ranking of Kings", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Ranking-of-Kings", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Odd Taxi", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Odd-Taxi", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("To Your Eternity", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/To-Your-Eternity", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("The Apothecary Diaries", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/The-Apothecary-Diaries", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81719470", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["The Rising of the Shield Hero", "Shield Hero"], [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Shield-Hero", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Rent-a-Girlfriend", [
  { name: "Crunchyroll", url: "https://www.crunchyroll.com/series/G6M5Q7Y2R/Rent-a-Girlfriend", logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

export function getStreamingSources(title: string): StreamingSource[] {
  if (!title) return [];

  const normalized = title.toLowerCase().trim();

  const entries = Object.entries(curatedMap);

  for (const [key, sources] of entries) {
    if (normalized === key || normalized.startsWith(key) || key.startsWith(normalized)) {
      return dedupePlatforms(sources);
    }
  }

  for (const [key, sources] of entries) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return dedupePlatforms(sources);
    }
  }

  for (const [key, sources] of entries) {
    const keyWords = key.split(/\s+/);
    const titleWords = normalized.split(/\s+/);
    const matchCount = keyWords.filter((kw) => titleWords.includes(kw)).length;
    if (matchCount >= 2 && matchCount / keyWords.length >= 0.5) {
      return dedupePlatforms(sources);
    }
  }

  return [];
}

function dedupePlatforms(sources: StreamingSource[]): StreamingSource[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = s.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
