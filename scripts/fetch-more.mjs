import { writeFileSync } from 'fs';

// Remaining 404s - try alternative URLs
const TITLES = [
  // Tokyo Ghoul - try without (2017 film)
  { dataTitle: "Tokyo Ghoul", url: "https://en.wikipedia.org/wiki/Tokyo_Ghoul_(film)" },
  
  // Attack on Titan - the film series page might not exist
  { dataTitle: "Attack on Titan", url: "https://en.wikipedia.org/wiki/Attack_on_Titan_(film)" },
  { dataTitle: "Attack on Titan", url2: "https://en.wikipedia.org/wiki/Shingeki_no_Kyojin_(film)" },

  // Yu Yu Hakusho - try without year
  { dataTitle: "Yu Yu Hakusho", url: "https://en.wikipedia.org/wiki/Yu_Yu_Hakusho_(live-action_TV_series)" },

  // Kimi ni Todoke - try different title
  { dataTitle: "From Me to You: Kimi ni Todoke", url: "https://en.wikipedia.org/wiki/Kimi_ni_Todoke_(live-action_TV_series)" },

  // Way of the Househusband  
  { dataTitle: "The Way of the Househusband", url: "https://en.wikipedia.org/wiki/The_Way_of_the_Househusband_(live-action_TV_series)" },

  // Ajin
  { dataTitle: "Ajin: Demi-Human", url: "https://en.wikipedia.org/wiki/Ajin_(film_series)" },

  // Space Brothers
  { dataTitle: "Space Brothers", url: "https://en.wikipedia.org/wiki/Space_Brothers_(live-action_film)" },

  // Kakegurui - try the series page
  { dataTitle: "Kakegurui", url: "https://en.wikipedia.org/wiki/Kakegurui_(live-action_TV_series)" },

  // Alice in Borderland got title card, try for poster
  { dataTitle: "Alice in Borderland", url: "https://en.wikipedia.org/wiki/Alice_in_Borderland_(TV_series)" },

  // Sweet Home - title card, find poster
  { dataTitle: "Sweet Home", url: "https://en.wikipedia.org/wiki/Sweet_Home_(TV_series)" },

  // Hellbound - title card, find poster
  { dataTitle: "Hellbound", url: "https://en.wikipedia.org/wiki/Hellbound_(TV_series)" },

  // The Uncanny Counter - already has S2 poster, but check for better
  { dataTitle: "The Uncanny Counter", url: "https://en.wikipedia.org/wiki/The_Uncanny_Counter" },
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
    
    // Find infobox images
    const allImgs = html.matchAll(/<img\s[^>]*src="([^"]*)"[^>]*>/gi);
    const imgs = [...allImgs];
    
    // Score images - prefer those in infobox and with "poster" or descriptive names
    let best = null;
    let bestScore = 0;
    
    for (const match of imgs) {
      let imgUrl = match[1];
      const fullTag = match[0];
      
      // Must be from wikipedia
      if (!imgUrl.includes('upload.wikimedia.org')) continue;
      
      // Skip small icons, logos
      if (imgUrl.includes('Commons-logo') || imgUrl.includes('Disambig') || imgUrl.includes('Edit')) continue;
      
      // Prefer images in infobox
      const inInfobox = fullTag.includes('infobox') || fullTag.includes('Infobox');
      
      let score = 0;
      if (inInfobox) score += 10;
      
      const urlLower = imgUrl.toLowerCase();
      if (urlLower.includes('poster')) score += 8;
      if (urlLower.includes('key_visual') || urlLower.includes('keyvisual')) score += 8;
      if (urlLower.includes('film')) score += 5;
      if (urlLower.includes('title_card')) score += 2; // lower priority
      if (urlLower.includes('logo')) score -= 5; // lower priority
      if (urlLower.includes('icon')) score -= 5;
      
      // Larger images (not thumbnails with px)
      if (imgUrl.includes('/thumb/')) {
        score -= 2;
      } else {
        score += 3;
      }
      
      if (score > bestScore) {
        bestScore = score;
        best = imgUrl;
      }
    }
    
    if (best) {
      // Clean up thumbnail URLs to get full size
      best = best.replace(/\/thumb\//, '/');
      best = best.replace(/\/\d+px-[^/]+$/, (m) => m.replace(/\/\d+px-/, '/'));
      // Also handle protocol relative URLs
      if (best.startsWith('//')) best = 'https:' + best;
      return { status: 200, posterUrl: best, score: bestScore };
    }
    
    return { status: 200, posterUrl: null, error: "No suitable image found" };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function main() {
  const results = [];
  
  for (let i = 0; i < TITLES.length; i++) {
    const entry = TITLES[i];
    const urls = [entry.url, entry.url2].filter(Boolean);
    
    // Delay between requests
    if (i > 0) {
      await new Promise(r => setTimeout(r, 1500));
    }
    
    let result = null;
    for (const url of urls) {
      result = await extractPosterFromHTML(url);
      if (result.posterUrl) break;
      // If first URL failed with 404, try next
      if (result.status === 404 && urls.length > 1) {
        console.log(`  -> ${entry.dataTitle}: trying alternate URL`);
      }
    }
    
    results.push({ dataTitle: entry.dataTitle, url: urls[0], ...result });
    
    const status = result?.posterUrl ? "OK" : "FAIL";
    console.log(`[${status}] ${entry.dataTitle}: ${result?.posterUrl || result?.error || "no poster"}`);
  }
  
  writeFileSync('wiki-poster-results-more.json', JSON.stringify(results, null, 2));
  console.log("\nDone");
}

main().catch(console.error);
