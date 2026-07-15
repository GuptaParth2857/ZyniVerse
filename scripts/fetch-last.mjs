import { writeFileSync } from 'fs';

const TITLES = [
  // Attack on Titan - URL got doubled in previous result, fix it
  { dataTitle: "Attack on Titan", url: "https://en.wikipedia.org/wiki/Attack_on_Titan_(film)" },

  // Yu Yu Hakusho - try regular TV series page
  { dataTitle: "Yu Yu Hakusho", url: "https://en.wikipedia.org/wiki/Yu_Yu_Hakusho_(live-action)" },
  
  // Kimi ni Todoke 
  { dataTitle: "From Me to You: Kimi ni Todoke", url: "https://en.wikipedia.org/wiki/Kimi_ni_Todoke_(live-action)" },

  // Way of the Househusband - try the actual drama
  { dataTitle: "The Way of the Househusband", url: "https://en.wikipedia.org/wiki/The_Way_of_the_Househusband_(live-action)" },

  // Ajin
  { dataTitle: "Ajin: Demi-Human", url: "https://en.wikipedia.org/wiki/Ajin_(live-action_film)" },

  // Space Brothers
  { dataTitle: "Space Brothers", url: "https://en.wikipedia.org/wiki/Space_Brothers_(2012_film)" },

  // Kakegurui - try the TV drama
  { dataTitle: "Kakegurui", url: "https://en.wikipedia.org/wiki/Kakegurui_(live-action)" },

  // Sweet Home - try to find a poster
  { dataTitle: "Sweet Home", url: "https://en.wikipedia.org/wiki/Sweet_Home_(TV_series)" },

  // One Piece - try to find a real poster not logo
  { dataTitle: "One Piece", url: "https://en.wikipedia.org/wiki/One_Piece_(2023_TV_series)" },

  // Death Note 2017 - already has poster but check
  { dataTitle: "Death Note", url: "https://en.wikipedia.org/wiki/Death_Note_(2017_film)" },

  // Zom 100 - already got manga cover, try again
  { dataTitle: "Zom 100: Bucket List of the Dead", url: "https://en.wikipedia.org/wiki/Zom_100:_Bucket_List_of_the_Dead_(film)" },
];

async function extractPosterFromHTML(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) {
      return { status: res.status, url, error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    
    // Try infobox images specifically
    const infoboxSection = html.match(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>.*?<\/table>/is);
    const searchHtml = infoboxSection ? infoboxSection[0] : html;
    
    const allImgs = searchHtml.matchAll(/<img\s[^>]*src="([^"]*)"[^>]*>/gi);
    const imgs = [...allImgs];
    
    let best = null;
    let bestScore = 0;
    
    for (const match of imgs) {
      let imgUrl = match[1];
      const fullTag = match[0];
      
      if (!imgUrl.includes('upload.wikimedia.org')) continue;
      if (imgUrl.includes('Commons-logo') || imgUrl.includes('Disambig') || imgUrl.includes('Edit') || imgUrl.includes('Question')) continue;
      
      let score = 0;
      const urlLower = imgUrl.toLowerCase();
      
      // Penalize: logos, title cards
      if (urlLower.includes('logo')) score -= 10;
      if (urlLower.includes('title_card')) score -= 5;
      if (urlLower.includes('manga') || urlLower.includes('volume')) score -= 5;
      if (urlLower.includes('icon')) score -= 5;
      
      // Reward: poster keywords
      if (urlLower.includes('poster')) score += 10;
      if (urlLower.includes('key_visual')) score += 10;
      if (urlLower.includes('film_theatrical')) score += 8;
      if (urlLower.includes('theatrical_release')) score += 8;
      if (urlLower.includes('film_poster')) score += 10;
      
      // Image dimensions - check if it's a wide image vs tall (posters are tall)
      const widthMatch = fullTag.match(/width="(\d+)"/);
      const heightMatch = fullTag.match(/height="(\d+)"/);
      if (widthMatch && heightMatch) {
        const w = parseInt(widthMatch[1]);
        const h = parseInt(heightMatch[1]);
        if (h > w) score += 5; // portrait = poster
        if (w > h * 1.5) score -= 5; // too wide = unlikely poster
      }
      
      // Thumbnail suffix removal
      if (!imgUrl.includes('/thumb/')) score += 2;
      
      if (score > bestScore) {
        bestScore = score;
        best = imgUrl;
      }
    }
    
    if (best && bestScore >= 0) {
      // Clean URL
      best = best.replace(/\/thumb\//, '/');
      best = best.replace(/\/\d+px-[^/]+$/, (m) => m.replace(/\/\d+px-/, '/'));
      if (best.startsWith('//')) best = 'https:' + best;
      return { status: 200, posterUrl: best, score: bestScore };
    }
    
    // Fallback: just return the highest scored even if negative
    if (best) {
      best = best.replace(/\/thumb\//, '/');
      best = best.replace(/\/\d+px-[^/]+$/, (m) => m.replace(/\/\d+px-/, '/'));
      if (best.startsWith('//')) best = 'https:' + best;
      return { status: 200, posterUrl: best, score: bestScore, note: "low score" };
    }
    
    return { status: 200, posterUrl: null, error: "No image found" };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function main() {
  const results = [];
  
  for (let i = 0; i < TITLES.length; i++) {
    const { dataTitle, url } = TITLES[i];
    
    if (i > 0) {
      await new Promise(r => setTimeout(r, 1500));
    }
    
    const result = await extractPosterFromHTML(url);
    results.push({ dataTitle, url, ...result });
    
    const status = result.posterUrl ? "OK" : "FAIL";
    console.log(`[${status}] ${dataTitle}: ${result.posterUrl || result.error}`);
  }
  
  writeFileSync('wiki-poster-results-last.json', JSON.stringify(results, null, 2));
  console.log("\nDone");
}

main().catch(console.error);
