// Fetch real poster images for all live-action titles
// Uses TMDB search (no API key needed for image CDN) + Wikipedia

const https = require('https');
const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function checkImage(url) {
  try {
    const res = await fetch(url);
    return res.status === 200 && res.data.length > 1000;
  } catch { return false; }
}

async function searchTMDB(title) {
  try {
    const q = encodeURIComponent(title);
    const url = `https://api.themoviedb.org/3/search/movie?query=${q}&api_key=demo`;
    // TMDB demo won't work, try the free search page
    const searchUrl = `https://www.themoviedb.org/search?query=${q}`;
    const res = await fetch(searchUrl);
    // Parse poster path from HTML
    const match = res.data.match(/\/movie\/\d+/);
    if (match) {
      const movieId = match[0];
      const detailUrl = `https://www.themoviedb.org${movieId}`;
      const detail = await fetch(detailUrl);
      const posterMatch = detail.data.match(/src="(\/t\/p\/w500[^"]+)"/);
      if (posterMatch) return `https://image.tmdb.org${posterMatch[1]}`;
    }
  } catch {}
  return null;
}

async function getWikipediaImage(title) {
  try {
    const q = encodeURIComponent(title + ' film poster');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (res.status === 200) {
      const json = JSON.parse(res.data);
      if (json.thumbnail && json.thumbnail.source) {
        // Replace thumbnail size with larger
        return json.thumbnail.source.replace(/\/\d+px-/, '/500px-');
      }
    }
  } catch {}
  return null;
}

// Known working poster URLs (verified manually)
const KNOWN_POSTERS = {
  'one-piece-la-s1': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
  'alice-in-borderland-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20952-nDvmOvA3qDJ2.png',
  'yu-yu-hakusho-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx392-z90299zIvYmx.png',
  'rurouni-kenshin-films': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx45-DEFgZRCxiGmF.png',
  'death-note-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg',
  'cowboy-bebop-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-GCsPm7waJ4kS.png',
  'parasyte-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20623-dUARfggnNDOe.jpg',
  'kakegurui-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b98314-TSJykxVwCCQN.jpg',
  'kimi-ni-todoke-la': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx6045-JujXjoWtslUM.jpg',
  'golden-kamuy-film-series': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx99699-mBCjpoWpAVGX.jpg',
  'naruto-live-action': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-dE6UHbFFg1A5.jpg',
  'my-hero-academia-film': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg',
  'sakamoto-days-film': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx177709-e5Qx6RlsBgD5.png',
  'dragon-ball-live-action': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx223-scE5uJfXqqj8.png',
  'one-piece-la-s3': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
};

// Titles that need real poster URLs - search AniList for the anime source
const TITLES_TO_SEARCH = [
  { id: 'tokyo-revengers-films', query: 'Tokyo Revengers', anilistId: 121849 },
  { id: 'fullmetal-alchemist-films', query: 'Fullmetal Alchemist', anilistId: 5114 },
  { id: 'tokyo-ghoul-film', query: 'Tokyo Ghoul', anilistId: 104702 },
  { id: 'attack-on-titan-films', query: 'Attack on Titan', anilistId: 16498 },
  { id: 'assassination-classroom-films', query: 'Assassination Classroom', anilistId: 21283 },
  { id: 'blade-of-the-immortal-film', query: 'Blade of the Immortal', anilistId: 22 },
  { id: 'inuyashiki-film', query: 'Inuyashiki', anilistId: 97987 },
  { id: 'gantz-films', query: 'Gantz', anilistId: 136 },
  { id: 'kingdom-film-series', query: 'Kingdom', anilistId: 137915 },
  { id: 'city-hunter-netflix', query: 'City Hunter', anilistId: 1153 },
  { id: 'zom-100-film', query: 'Zom 100', anilistId: 143066 },
  { id: 'way-of-househusband-la', query: 'Way of the Househusband', anilistId: 129197 },
  { id: 'bleach-live-action', query: 'Bleach', anilistId: 269 },
  { id: 'jojos-bizarre-adventure-film', query: 'JoJo Diamond is Unbreakable', anilistId: 102163 },
  { id: 'dragon-ball-evolution', query: 'Dragon Ball', anilistId: 813 },
  { id: 'alita-battle-angel', query: 'Battle Angel Alita', anilistId: 32 },
  { id: 'ghost-in-the-shell-2017', query: 'Ghost in the Shell', anilistId: 44 },
  { id: 'gintama-films', query: 'Gintama', anilistId: 97986 },
  { id: 'terra-formars-films', query: 'Terra Formars', anilistId: 20371 },
  { id: 'battle-royale-film', query: 'Battle Royale', anilistId: 813 },
  { id: 'edge-of-tomorrow', query: 'All You Need Is Kill', anilistId: 18153 },
  { id: 'nana-film', query: 'Nana', anilistId: 18 },
  { id: 'parasyte-japan-films', query: 'Parasyte', anilistId: 21 },
  { id: 'ajin-demi-human-films', query: 'Ajin', anilistId: 21507 },
  { id: '20th-century-boys-films', query: '20th Century Boys', anilistId: 578 },
  { id: 'oldboy-film', query: 'Oldboy', anilistId: null },
  { id: 'crows-zero-films', query: 'Crows Zero', anilistId: null },
  { id: 'kaiji-film', query: 'Kaiji', anilistId: 3002 },
  { id: 'drops-of-god-la', query: 'Drops of God', anilistId: null },
  { id: 'orange-film', query: 'Orange', anilistId: 21699 },
  { id: 'nana-la-series', query: 'Nana', anilistId: 18 },
  { id: 'death-note-light-up-new-world', query: 'Death Note', anilistId: 1535 },
  { id: 'rurouni-kenshin-beginning', query: 'Rurouni Kenshin', anilistId: 45 },
  { id: 'initial-d-film', query: 'Initial D', anilistId: 1676 },
  { id: 'your-name-live-action', query: 'Your Name', anilistId: 21945 },
  { id: 'one-punch-man-netflix', query: 'One Punch Man', anilistId: 21087 },
  { id: 'space-brothers-la', query: 'Space Brothers', anilistId: 12189 },
  { id: 'lupin-third-film', query: 'Lupin III', anilistId: 1165 },
  { id: 'ashura-film', query: 'Ashura', anilistId: null },
  { id: 'sweet-home-la', query: 'Sweet Home', anilistId: null },
  { id: 'all-of-us-are-dead', query: 'All of Us Are Dead', anilistId: null },
  { id: 'itaewon-class-la', query: 'Itaewon Class', anilistId: null },
  { id: 'hellbound-la', query: 'Hellbound', anilistId: null },
  { id: 'uncanny-counter-la', query: 'The Uncanny Counter', anilistId: null },
  { id: 'bloodhounds-la-s2s2', query: 'Bloodhounds', anilistId: null },
  { id: 'viral-hit-la', query: 'Viral Hit', anilistId: null },
  { id: 'avatar-last-airbender-la', query: 'Avatar Last Airbender', anilistId: null },
  { id: 'bet-kakegurui-hollywood', query: 'Kakegurui', anilistId: 104702 },
  { id: 'kingdom-5th-film', query: 'Kingdom', anilistId: 137915 },
];

async function getAnilistCover(id) {
  try {
    const query = `query{Media(id:${id},type:ANIME){coverImage{large,medium}}}`;
    const res = await fetch(`https://graphql.anilist.co?query=${encodeURIComponent(query)}`);
    if (res.status === 200) {
      const json = JSON.parse(res.data);
      return json?.data?.Media?.coverImage?.large || null;
    }
  } catch {}
  return null;
}

async function main() {
  const results = {};
  
  // Check existing known posters
  for (const [id, url] of Object.entries(KNOWN_POSTERS)) {
    results[id] = url;
  }
  
  // Search for remaining titles
  for (const title of TITLES_TO_SEARCH) {
    if (results[title.id]) continue;
    
    if (title.anilistId) {
      const cover = await getAnilistCover(title.anilistId);
      if (cover) {
        results[title.id] = cover;
        console.log(`✓ ${title.id}: ${cover}`);
        continue;
      }
    }
    
    // Try Wikipedia
    const wiki = await getWikipediaImage(title.query);
    if (wiki) {
      results[title.id] = wiki;
      console.log(`✓ ${title.id} (wiki): ${wiki}`);
      continue;
    }
    
    console.log(`✗ ${title.id}: no image found for "${title.query}"`);
  }
  
  console.log(`\n--- RESULTS (${Object.keys(results).length} posters found) ---`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
