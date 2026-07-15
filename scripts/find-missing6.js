const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 8000);
    https.get(url, {headers:{'User-Agent':'ZyniVerse/1.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(t);
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{clearTimeout(t); resolve({s:res.statusCode,d});});
    }).on('error',e=>{clearTimeout(t); reject(e);});
  });
}
(async () => {
  // Get image URLs
  const images = [
    ['Kingdom_(2019_film)', 'Kingdom_film_(poster).jpeg', 'kingdom'],
    ['Nana_(2005_film)', 'Nana_movie.jpg', 'nana'],
  ];
  for (const [page, image, label] of images) {
    try {
      const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(page) + '&prop=imageinfo&iiprop=url&iiimages=' + encodeURIComponent(image) + '&format=json');
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        const pages = j.query?.pages || {};
        for (const p of Object.values(pages)) {
          const info = p.imageinfo?.[0];
          if (info) console.log(`✓ ${label}: ${info.url}`);
        }
      }
    } catch(e) { console.log(`✗ ${label}: ${e.message}`); }
  }
  
  // TMDB - try specific IDs via API endpoint (no auth needed for images)
  const tmdbIds = [
    ['tv', '135158', 'bloodhounds'],
    ['tv', '224635', 'viral-hit'],
    ['tv', '75519', 'kakegurui'],
    ['movie', '411088', 'jojo-film'],
    ['tv', '15552', 'nana-tv'],
    ['movie', '1090448', 'your-name'],
    ['tv', '391636', 'opm'],
  ];
  
  for (const [type, id, label] of tmdbIds) {
    try {
      const r = await fetch(`https://www.themoviedb.org/${type}/${id}/images/posters`);
      if (r.s === 200) {
        const matches = [...r.d.matchAll(/image\.tmdb\.org\/t\/p\/original\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
        if (matches.length > 0) {
          console.log(`✓ ${label}: https://image.tmdb.org/t/p/w500/${matches[0][1]}`);
        } else {
          console.log(`✗ ${label}: no posters on TMDB page`);
        }
      } else {
        console.log(`✗ ${label}: TMDB HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${label}: ${e.message}`); }
  }
})();
