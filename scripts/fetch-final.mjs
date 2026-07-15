import { writeFileSync } from 'fs';

// Let me try web search alternatives for the remaining 404 titles
// And fix the doubled URLs from previous results

const TITLES = [
  // Fix: Attack on Titan URL got doubled
  { dataTitle: "Attack on Titan", url: "https://en.wikipedia.org/wiki/Attack_on_Titan_(film)" },
  // Fix: Death Note URL got doubled
  { dataTitle: "Death Note", url: "https://en.wikipedia.org/wiki/Death_Note_(2017_film)" },

  // Yu Yu Hakusho - try the Netflix page
  { dataTitle: "Yu Yu Hakusho", url: "https://en.wikipedia.org/w/index.php?search=Yu+Yu+Hakusho+2023+Netflix&title=Special%3ASearch&ns0=1" },

  // Kimi ni Todoke - try full search
  { dataTitle: "From Me to You: Kimi ni Todoke", url: "https://en.wikipedia.org/w/index.php?search=Kimi+ni+Todoke+2023+live-action&title=Special%3ASearch&ns0=1" },

  // Way of the Househusband - search
  { dataTitle: "The Way of the Househusband", url: "https://en.wikipedia.org/w/index.php?search=The+Way+of+the+Househusband+live+action&title=Special%3ASearch&ns0=1" },

  // Ajin
  { dataTitle: "Ajin: Demi-Human", url: "https://en.wikipedia.org/w/index.php?search=Ajin+film+2017&title=Special%3ASearch&ns0=1" },

  // Space Brothers
  { dataTitle: "Space Brothers", url: "https://en.wikipedia.org/w/index.php?search=Space+Brothers+2012+film&title=Special%3ASearch&ns0=1" },

  // Kakegurui 
  { dataTitle: "Kakegurui", url: "https://en.wikipedia.org/w/index.php?search=Kakegurui+live+action+TV+series&title=Special%3ASearch&ns0=1" },

  // Sweet Home
  { dataTitle: "Sweet Home", url: "https://en.wikipedia.org/wiki/Sweet_Home_(TV_series)" },

  // One Piece - try different page
  { dataTitle: "One Piece", url: "https://en.wikipedia.org/wiki/One_Piece_(TV_series)" },

  // Zom 100
  { dataTitle: "Zom 100: Bucket List of the Dead", url: "https://en.wikipedia.org/w/index.php?search=Zom+100+live+action+film&title=Special%3ASearch&ns0=1" },

  // Alice in Borderland - title card, need poster
  { dataTitle: "Alice in Borderland", url: "https://en.wikipedia.org/wiki/Alice_in_Borderland_(TV_series)" },

  // Hellbound - URL doubled
  { dataTitle: "Hellbound", url: "https://en.wikipedia.org/wiki/Hellbound_(TV_series)" },
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
    
    const allImgs = html.matchAll(/<img\s[^>]*src="([^"]*)"[^>]*>/gi);
    const imgs = [...allImgs];
    
    let best = null;
    let bestScore = -100;
    
    for (const match of imgs) {
      let imgUrl = match[1];
      const fullTag = match[0];
      
      if (!imgUrl.includes('upload.wikimedia.org')) continue;
      if (imgUrl.includes('Commons-logo') || imgUrl.includes('Disambig') || imgUrl.includes('Edit') || imgUrl.includes('Question') || imgUrl.includes('Button')) continue;
      
      let score = 0;
      const urlLower = imgUrl.toLowerCase();
      
      if (urlLower.includes('logo')) score -= 15;
      if (urlLower.includes('title_card')) score -= 10;
      if (urlLower.includes('manga') || urlLower.includes('volume')) score -= 10;
      if (urlLower.includes('icon')) score -= 10;
      if (urlLower.includes('crystal')) score -= 10;
      
      if (urlLower.includes('poster')) score += 15;
      if (urlLower.includes('key_visual')) score += 15;
      if (urlLower.includes('film_poster')) score += 15;
      if (urlLower.includes('theatrical_release')) score += 12;
      if (urlLower.includes('_film_') || urlLower.includes('/film/')) score += 5;
      
      const widthMatch = fullTag.match(/width="(\d+)"/);
      const heightMatch = fullTag.match(/height="(\d+)"/);
      if (widthMatch && heightMatch) {
        const w = parseInt(widthMatch[1]);
        const h = parseInt(heightMatch[1]);
        if (h > w * 0.8 && h < w * 1.6) score += 3;
        if (h > w * 1.2) score += 5;
      }
      
      if (score > bestScore) {
        bestScore = score;
        best = imgUrl;
      }
    }
    
    if (best) {
      best = best.replace(/\/thumb\//, '/');
      best = best.replace(/\/\d+px-[^/]+$/, (m) => m.replace(/\/\d+px-/, '/'));
      if (best.startsWith('//')) best = 'https:' + best;
      return { status: 200, posterUrl: best, score: bestScore };
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
  
  writeFileSync('wiki-poster-results-final.json', JSON.stringify(results, null, 2));
  console.log("\nDone");
}

main().catch(console.error);
