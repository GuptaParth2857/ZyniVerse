import { writeFileSync } from 'fs';

// Titles that need live-action poster URLs from Wikipedia
// Format: [dataFileTitle, wikiSearchTitle | null, currentPosterUrl]
// null wikiSearchTitle means use the dataFileTitle
const NEED_UPDATE = [
  // These currently have anilist anime covers - need live-action posters
  ["One Piece", "One Piece (2023 TV series)"],
  ["Alice in Borderland", "Alice in Borderland (TV series)"],
  ["Yu Yu Hakusho", "Yu Yu Hakusho (2023 TV series)"],
  ["Rurouni Kenshin Films", "Rurouni Kenshin (film series)"],
  ["Death Note", "Death Note (2017 film)"],
  ["Parasyte: The Grey", null],
  ["Kakegurui", null],
  ["From Me to You: Kimi ni Todoke", null],
  ["Golden Kamuy", "Golden Kamuy (film)"],
  ["Naruto Live-Action", null], // upcoming - skip
  ["My Hero Academia Film", null], // upcoming - skip
  ["Sakamoto Days Film", null], // upcoming - skip
  ["Dragon Ball", null], // upcoming - skip
  ["One Piece Season 3", null], // upcoming - skip

  // These currently have manga volume covers - need film/TV posters
  ["Tokyo Revengers", "Tokyo Revengers (film)"],
  ["Fullmetal Alchemist", "Fullmetal Alchemist (film)"],
  ["Tokyo Ghoul", "Tokyo Ghoul (2017 film)"],
  ["Attack on Titan", "Attack on Titan (film series)"],
  ["Assassination Classroom", "Assassination Classroom (film)"],
  ["Blade of the Immortal", "Blade of the Immortal (film)"],
  ["Inuyashiki", "Inuyashiki (film)"],
  ["Gantz", "Gantz (film series)"],
  ["Zom 100: Bucket List of the Dead", "Zom 100: Bucket List of the Dead"],
  ["The Way of the Househusband", "The Way of the Househusband (TV series)"],
  ["Ajin: Demi-Human", "Ajin (film)"],
  ["Drops of God", "Drops of God (TV series)"],
  ["Space Brothers", "Space Brothers (film)"],
];

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary";

async function fetchPoster(title) {
  const encoded = encodeURIComponent(title);
  const url = `${WIKI_API}/${encoded}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        return { status: 404, title, error: "Page not found" };
      }
      if (res.status === 429) {
        return { status: 429, title, error: "Rate limited" };
      }
      return { status: res.status, title, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    if (data.thumbnail && data.thumbnail.source) {
      return { status: 200, title, posterUrl: data.thumbnail.source };
    }
    return { status: 200, title, posterUrl: null, error: "No thumbnail field" };
  } catch (err) {
    return { status: 0, title, error: err.message };
  }
}

async function main() {
  // Filter out upcoming titles (no poster needed)
  const toFetch = NEED_UPDATE.filter(([_, wikiTitle]) => {
    // Skip upcoming titles
    const skipUpcoming = ["Naruto Live-Action", "My Hero Academia Film", "Sakamoto Days Film", "Dragon Ball", "One Piece Season 3"];
    return !skipUpcoming.includes(_);
  });

  const results = [];
  
  for (let i = 0; i < toFetch.length; i++) {
    const [dataTitle, wikiTitle] = toFetch[i];
    const search = wikiTitle || dataTitle;
    
    // Rate limiting - delay between requests
    if (i > 0) {
      await new Promise(r => setTimeout(r, 500));
    }
    
    const result = await fetchPoster(search);
    results.push({ dataTitle, wikiSearch: search, ...result });
    
    const status = result.status === 200 && result.posterUrl ? "OK" : result.status === 404 ? "404" : result.status === 429 ? "429" : "FAIL";
    console.log(`[${status}] ${dataTitle} (${search}): ${result.posterUrl || result.error || "no poster"}`);
  }
  
  // Write results to JSON file
  const output = JSON.stringify(results, null, 2);
  writeFileSync('wiki-poster-results.json', output);
  console.log("\nResults written to wiki-poster-results.json");
}

main().catch(console.error);
