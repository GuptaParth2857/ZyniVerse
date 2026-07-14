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

function cr(slug: string): string {
  return `https://www.crunchyroll.com/series/${slug}`;
}

function ytSearch(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " anime full episodes")}`;
}

function museSearch(q: string): string {
  return `https://www.youtube.com/@MuseIndiaofficial/search?query=${encodeURIComponent(q)}`;
}

function jioSearch(q: string): string {
  return `https://www.jiohotstar.com/search?q=${encodeURIComponent(q)}`;
}

function mxSearch(q: string): string {
  return `https://www.mxplayer.in/search?query=${encodeURIComponent(q)}`;
}

function sonyLivSearch(q: string): string {
  return `https://www.sonyliv.com/search/${encodeURIComponent(q)}`;
}

function animesearch(q: string): string {
  return `https://www.anime-search.in/search?q=${encodeURIComponent(q)}`;
}

add("One Piece", [
  { name: "Crunchyroll", url: cr("GRMG8ZQZR/One-Piece"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("One Piece"), logo: "Muse Asia", region: "India", languages: ["English", "Hindi"], type: "free" },
  { name: "YouTube", url: ytSearch("One Piece"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
  { name: "JioHotstar", url: jioSearch("One Piece"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80057281", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Naruto", [
  { name: "Crunchyroll", url: cr("GY9PJ5KWR/Naruto"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Naruto"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
  { name: "YouTube", url: ytSearch("Naruto"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70205012", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Naruto"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add(["Naruto Shippuden", "Naruto Shippuuden"], [
  { name: "Crunchyroll", url: cr("GYQ4MWKDY/Naruto-Shippuden"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Naruto Shippuden"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70205012", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Naruto Shippuden"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add(["Attack on Titan", "Shingeki no Kyojin", "AOT"], [
  { name: "Crunchyroll", url: cr("GR751KNZY/Attack-on-Titan"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81046419", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Attack on Titan"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=attack+on+titan", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Demon Slayer", "Kimetsu no Yaiba"], [
  { name: "Crunchyroll", url: cr("GY5P48XEY/Demon-Slayer-Kimetsu-no-Yaiba"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81091393", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Demon Slayer"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Demon Slayer"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
  { name: "YouTube", url: ytSearch("Demon Slayer"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add(["Jujutsu Kaisen", "JJK"], [
  { name: "Crunchyroll", url: cr("GRDV0019R/Jujutsu-Kaisen"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81278456", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Jujutsu Kaisen"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Death Note", [
  { name: "Crunchyroll", url: cr("G6QWD3QQR/Death-Note"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204970", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Death Note"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
  { name: "YouTube", url: ytSearch("Death Note"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add(["Fullmetal Alchemist Brotherhood", "FMAB", "Fullmetal Alchemist: Brotherhood"], [
  { name: "Crunchyroll", url: cr("GY8VM8V2R/Fullmetal-Alchemist-Brotherhood"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204980", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Fullmetal Alchemist"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Your Name", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80161371", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=your+name+anime", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Your Name"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add("Spirited Away", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/60023642", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=spirited+away", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["My Hero Academia", "Boku no Hero Academia", "MHA"], [
  { name: "Crunchyroll", url: cr("GR6VQ86QR/My-Hero-Academia"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80189685", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("My Hero Academia"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
  { name: "YouTube", url: ytSearch("My Hero Academia"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add(["One Punch Man", "One-Punch Man"], [
  { name: "Crunchyroll", url: cr("G63K98PZ5/One-Punch-Man"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80117291", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("One Punch Man"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
  { name: "YouTube", url: ytSearch("One Punch Man"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add("Solo Leveling", [
  { name: "Crunchyroll", url: cr("GDKHZEJ0K/Solo-Leveling"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81733427", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Solo Leveling"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Spy x Family"], [
  { name: "Crunchyroll", url: cr("G4PH0W5P5/Spy-x-Family"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81539619", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Spy x Family"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Chainsaw Man"], [
  { name: "Crunchyroll", url: cr("GVDHX8QNW/Chainsaw-Man"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81702817", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Chainsaw Man"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Tokyo Revengers", [
  { name: "Crunchyroll", url: cr("G79H23Z70/Tokyo-Revengers"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Disney+ Hotstar", url: "https://www.hotstar.com/in/search?query=tokyo+revengers", logo: "Disney+ Hotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Tokyo Revengers"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Vinland Saga", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81243911", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=vinland+saga", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Vinland Saga"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Bleach", [
  { name: "Crunchyroll", url: cr("GYMQPM0ZR/Bleach"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70169586", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Bleach"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Hunter x Hunter", [
  { name: "Crunchyroll", url: cr("GY3VKX1MR/Hunter-x-Hunter"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70300473", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Hunter x Hunter"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Dragon Ball", "Dragon Ball Z", "Dragon Ball Super"], [
  { name: "Crunchyroll", url: cr("G9VHN9PZR/Dragon-Ball"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "YouTube", url: ytSearch("Dragon Ball Z"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add(["Haikyuu", "Haikyuu!!"], [
  { name: "Crunchyroll", url: cr("GY8VM8V2R/Haikyuu"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80090660", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Haikyuu"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Mob Psycho 100", [
  { name: "Crunchyroll", url: cr("GY19MXM4R/Mob-Psycho-100"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80169499", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Mob Psycho 100"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Steins;Gate", "Steins Gate"], [
  { name: "Crunchyroll", url: cr("GY3VKX1MR/Steins-Gate"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70306114", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Re:Zero", "Re:Zero - Starting Life in Another World", "ReZero"], [
  { name: "Crunchyroll", url: cr("GYE5K3Q0R/Re-Zero-Starting-Life-in-Another-World"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80178930", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Re:Zero"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Code Geass", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Code-Geass"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70205007", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Code Geass"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Death Parade", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Death-Parade"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80025488", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Cowboy Bebop", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/70002832", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Cowboy-Bebop"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Cowboy Bebop"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Sword Art Online", "SAO"], [
  { name: "Crunchyroll", url: cr("GY8VM8V2R/Sword-Art-Online"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70302502", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Sword Art Online"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Fairy Tail", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Fairy-Tail"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70234006", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Black Clover", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Black-Clover"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80211991", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Black Clover"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Made in Abyss", [
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=made+in+abyss", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Made-in-Abyss"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Cyberpunk Edgerunners", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81054853", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Frieren", [
  { name: "Crunchyroll", url: cr("GYQ4MWK64/Frieren-Beyond-Journeys-End"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81730607", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Frieren"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Kaiju No. 8", [
  { name: "Crunchyroll", url: cr("G6NQ5DWZ6/Kaiju-No-8"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Kaiju No. 8"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Blue Lock", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Blue-Lock"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81676943", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Blue Lock"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Hell's Paradise", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Hells-Paradise"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81608414", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Mashle: Magic and Muscles", "Mashle"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Mashle-Magic-and-Muscles"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81557821", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Classroom of the Elite", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Classroom-of-the-Elite"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Classroom of the Elite"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Violet Evergarden", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80182123", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "YouTube", url: ytSearch("Violet Evergarden"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add("Weathering With You", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81243911", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=weathering+with+you", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["A Silent Voice", "Koe no Katachi"], [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80204897", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Amazon Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=a+silent+voice", logo: "Prime Video", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Dr. Stone", "Dr. STONE"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Dr-STONE"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81095871", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Dr Stone"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["That Time I Got Reincarnated as a Slime", "Tensura", "Slime"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/That-Time-I-Got-Reincarnated-as-a-Slime"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81030460", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("That Time I Got Reincarnated as a Slime"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Kaguya-sama: Love Is War", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Kaguya-sama-Love-Is-War"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81190323", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Dandadan", [
  { name: "Crunchyroll", url: cr("GDKHZEJ8K/Dandadan"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81767642", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Dandadan"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Mushoku Tensei", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Mushoku-Tensei-Jobless-Reincarnation"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Mushoku Tensei"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Summertime Rendering", [
  { name: "Disney+ Hotstar", url: "https://www.hotstar.com/in/search?query=summertime+rendering", logo: "Disney+ Hotstar", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("Horimiya", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Horimiya"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Horimiya"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Ranking of Kings", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Ousama-Ranking"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Ranking of Kings"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Odd Taxi", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Odd-Taxi"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add("To Your Eternity", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/To-Your-Eternity"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("To Your Eternity"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("The Apothecary Diaries", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/The-Apothecary-Diaries"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81719470", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["The Rising of the Shield Hero", "Shield Hero"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/The-Rising-of-the-Shield-Hero"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Shield Hero"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Rent-a-Girlfriend", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Rent-a-Girlfriend"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Dandadan", "DanDaDan"], [
  { name: "Crunchyroll", url: cr("GDKHZEJ8K/Dandadan"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81768228", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Kaiju No. 8", "Kaiju No 8", "Kaijuu no. 8"], [
  { name: "Crunchyroll", url: cr("G6NQ5DWZ6/Kaiju-No-8"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Kaiju No. 8"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Frieren", "Frieren: Beyond Journey's End", "Sousou no Frieren"], [
  { name: "Crunchyroll", url: cr("GYQ4MWK64/Frieren-Beyond-Journeys-End"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81730607", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Frieren"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Haikyuu", "Haikyuu!!"], [
  { name: "Crunchyroll", url: cr("GY8VM8V2R/Haikyuu"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80057281", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Haikyuu"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Black Clover"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Black-Clover"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80211991", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add(["Hunter x Hunter", "Hunter × Hunter"], [
  { name: "Crunchyroll", url: cr("GY3VKX1MR/Hunter-x-Hunter"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204980", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Hunter x Hunter"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Bleach", "Bleach: Thousand-Year Blood War"], [
  { name: "Crunchyroll", url: cr("GYMQPM0ZR/Bleach"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204970", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Disney+ Hotstar", url: "https://www.hotstar.com/in/search?query=bleach+thousand+year+blood+war", logo: "Disney+ Hotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add(["Code Geass", "Code Geass: Lelouch of the Rebellion"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Code-Geass"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204980", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Code Geass"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Sword Art Online", "SAO"], [
  { name: "Crunchyroll", url: cr("GY8VM8V2R/Sword-Art-Online"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204980", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Sword Art Online"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Steins;Gate", "Steins Gate"], [
  { name: "Crunchyroll", url: cr("GY3VKX1MR/Steins-Gate"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/70204980", logo: "Netflix", region: "India", languages: ["English", "Japanese"], type: "subscription" },
]);

add(["Mob Psycho 100"], [
  { name: "Crunchyroll", url: cr("GY19MXM4R/Mob-Psycho-100"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/80189685", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Mob Psycho 100"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add(["Tokyo Revengers"], [
  { name: "Crunchyroll", url: cr("G79H23Z70/Tokyo-Revengers"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Disney+ Hotstar", url: "https://www.hotstar.com/in/search?query=tokyo+revengers", logo: "Disney+ Hotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add("Pokemon", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/80090660", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "YouTube", url: ytSearch("Pokemon"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
  { name: "JioHotstar", url: jioSearch("Pokemon"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add("Doraemon", [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81054711", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Doraemon"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English", "Tamil", "Telugu"], type: "subscription" },
  { name: "YouTube", url: ytSearch("Doraemon"), logo: "YouTube", region: "India", languages: ["Hindi", "English"], type: "free" },
]);

add(["Shin Chan", "Crayon Shin-chan"], [
  { name: "Netflix", url: "https://www.netflix.com/in/title/81483833", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "JioHotstar", url: jioSearch("Shin Chan"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English", "Tamil", "Telugu"], type: "subscription" },
  { name: "YouTube", url: ytSearch("Shin Chan hindi"), logo: "YouTube", region: "India", languages: ["Hindi"], type: "free" },
]);

add("Boruto", [
  { name: "Crunchyroll", url: cr("G1CUNSU3R/Boruto-Naruto-Next-Generations"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81278456", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
  { name: "Muse Asia", url: museSearch("Boruto"), logo: "Muse Asia", region: "India", languages: ["English"], type: "free" },
]);

add("Beyblade Burst", [
  { name: "YouTube", url: ytSearch("Beyblade Burst"), logo: "YouTube", region: "India", languages: ["English", "Hindi"], type: "free" },
  { name: "JioHotstar", url: jioSearch("Beyblade Burst"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
]);

add(["Yu-Gi-Oh!", "Yu-Gi-Oh"], [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Yu-Gi-Oh"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "YouTube", url: ytSearch("Yu-Gi-Oh"), logo: "YouTube", region: "India", languages: ["English"], type: "free" },
]);

add("Digimon Adventure", [
  { name: "Crunchyroll", url: cr("G6M5Q7Y2R/Digimon-Adventure"), logo: "Crunchyroll", region: "India", languages: ["English", "Japanese"], type: "subscription" },
  { name: "Netflix", url: "https://www.netflix.com/in/title/81054711", logo: "Netflix", region: "India", languages: ["Hindi", "English", "Japanese"], type: "subscription" },
]);

add("Beyblade", [
  { name: "YouTube", url: ytSearch("Beyblade"), logo: "YouTube", region: "India", languages: ["English", "Hindi"], type: "free" },
  { name: "JioHotstar", url: jioSearch("Beyblade"), logo: "JioHotstar", region: "India", languages: ["Hindi", "English"], type: "subscription" },
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
