import { writeFileSync } from 'fs';

// Titles that need fixing - rate limited (429) or 404 or wrong results
const TITLES = [
  // 429 - rate limited, try with HTML scraper
  { dataTitle: "Fullmetal Alchemist", url: "https://en.wikipedia.org/wiki/Fullmetal_Alchemist_(film)" },
  { dataTitle: "Tokyo Ghoul", url: "https://en.wikipedia.org/wiki/Tokyo_Ghoul_(2017_film)" },
  { dataTitle: "Attack on Titan", url: "https://en.wikipedia.org/wiki/Attack_on_Titan_(film_series)" },
  { dataTitle: "Assassination Classroom", url: "https://en.wikipedia.org/wiki/Assassination_Classroom_(film)" },
  { dataTitle: "Blade of the Immortal", url: "https://en.wikipedia.org/wiki/Blade_of_the_Immortal_(film)" },
  
  // 404 - page not found, try alternative names
  { dataTitle: "Yu Yu Hakusho", url: "https://en.wikipedia.org/wiki/Yu_Yu_Hakusho_(TV_series)" },
  { dataTitle: "Rurouni Kenshin Films", url: "https://en.wikipedia.org/wiki/Rurouni_Kenshin_(2012_film)" },
  { dataTitle: "From Me to You: Kimi ni Todoke", url: "https://en.wikipedia.org/wiki/Kimi_ni_Todoke_(TV_series)" },
  { dataTitle: "The Way of the Househusband", url: "https://en.wikipedia.org/wiki/The_Way_of_the_Househusband_(TV_series)" },
  { dataTitle: "Ajin: Demi-Human", url: "https://en.wikipedia.org/wiki/Ajin_(film)" },
  { dataTitle: "Space Brothers", url: "https://en.wikipedia.org/wiki/Space_Brothers_(film)" },

  // One Piece - got no thumbnail, try alternate page
  { dataTitle: "One Piece", url: "https://en.wikipedia.org/wiki/One_Piece_(2023_TV_series)" },

  // Kakegurui - returned manga cover, need LA poster
  { dataTitle: "Kakegurui", url: "https://en.wikipedia.org/wiki/Kakegurui_(TV_series)" },

  // Zom 100 - returned manga cover, need film poster
  { dataTitle: "Zom 100: Bucket List of the Dead", url: "https://en.wikipedia.org/wiki/Zom_100:_Bucket_List_of_the_Dead" },
];

async function extractPosterFromHTML(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) {
      return { status: res.status, error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    
    // Try to find infobox image
    // Look for various image patterns
    const patterns = [
      /<img[^>]*src="([^"]*upload\.wikimedia\.org[^"]*)"[^>]*class="[^"]*infobox-image[^"]*"/i,
      /<img[^>]*class="[^"]*infobox-image[^"]*"[^>]*src="([^"]*upload\.wikimedia\.org[^"]*)"/i,
      /<td[^>]*class="[^"]*infobox-image[^"]*"[^>]*>.*?<img[^>]*src="([^"]*upload\.wikimedia\.org[^"]*)"/is,
      /<img[^>]*src="([^"]*upload\.wikimedia\.org[^"]*(?:poster|film|movie|series)[^"]*)"/i,
      /<img[^>]*src="([^"]*upload\.wikimedia\.org[^"]*\/[a-z0-9]+\/[a-z0-9]+_[^"]*(?:poster|film|key_visual)[^"]*)"/i,
      /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i,
    ];
    
    // First try specific patterns
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let imgUrl = match[1];
        // Remove thumbnail size suffixes
        imgUrl = imgUrl.replace(/\/\d+px-[^/]+$/, (m) => m.replace(/\/\d+px-/, "/"));
        return { status: 200, posterUrl: imgUrl, method: "pattern" };
      }
    }
    
    // Fallback: find any infobox image
    const allImgs = html.matchAll(/<img[^>]*src="([^"]*upload\.wikimedia\.org[^"]*)"[^>]*>/gi);
    const imgs = [...allImgs];
    
    for (const imgMatch of imgs) {
      const imgUrl = imgMatch[1];
      // Prefer larger images (not thumbnails), and images with poster/key visual/key art in name
      if (imgUrl.includes("poster") || imgUrl.includes("Poster") || imgUrl.includes("key_visual") || imgUrl.includes("Key_visual") || imgUrl.includes("film") || imgUrl.includes("Film")) {
        const clean = imgUrl.replace(/\/\d+px-[^/]+$/, (m) => m.replace(/\/\d+px-/, "/"));
        return { status: 200, posterUrl: clean, method: "fallback_keyword" };
      }
    }
    
    // Last resort: try og:image
    const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
    if (ogMatch) {
      return { status: 200, posterUrl: ogMatch[1], method: "og" };
    }
    
    return { status: 200, posterUrl: null, error: "No poster found in HTML" };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function main() {
  const results = [];
  
  for (let i = 0; i < TITLES.length; i++) {
    const { dataTitle, url } = TITLES[i];
    
    // Delay between requests
    if (i > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
    
    const result = await extractPosterFromHTML(url);
    results.push({ dataTitle, url, ...result });
    
    const status = result.posterUrl ? "OK" : "FAIL";
    console.log(`[${status}] ${dataTitle}: ${result.posterUrl || result.error || "no poster"}`);
  }
  
  writeFileSync('wiki-poster-results-remaining.json', JSON.stringify(results, null, 2));
  console.log("\nResults written to wiki-poster-results-remaining.json");
}

main().catch(console.error);
