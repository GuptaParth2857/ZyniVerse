const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 8000);
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(t);
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{clearTimeout(t); resolve({s:res.statusCode,d:d.length});});
    }).on('error',e=>{clearTimeout(t); reject(e);});
  });
}
(async () => {
  const urls = [
    // Bloodhounds TMDB
    ['bloodhounds', 'https://image.tmdb.org/t/p/w500/v8aZRHzsnghccJ4r3F0bbNj3eOm.jpg'],
    // Viral Hit TMDB
    ['viral-hit', 'https://image.tmdb.org/t/p/w500/seo8PmWofwOIGRRyx5EwA984rXv.jpg'],
    // Kakegurui Hollywood (BET) - try scraping poster page
    // Nana movie Wikipedia
    ['nana-movie', 'https://upload.wikimedia.org/wikipedia/en/a/ac/Nana_movie.jpg'],
    // Kingdom film poster Wikipedia
    ['kingdom-film', 'https://upload.wikimedia.org/wikipedia/en/4/48/Kingdom_film_%28poster%29.jpeg'],
    // OPM from TMDB
    ['opm-s1', 'https://image.tmdb.org/t/p/w500/lAPX2Zf2vwdCwPxPOm0CAVB4eV1.jpg'],
    // JoJo Diamond is Unbreakable film
    ['jojo', 'https://image.tmdb.org/t/p/w500/oRkTOobtJCpGNMGi23CVIyK0xjo.jpg'],
  ];
  for (const [label, url] of urls) {
    try {
      const r = await fetch(url);
      console.log(`${r.s===200 && r.d>1000 ? '✓' : '✗'} ${label}: HTTP ${r.s} (${r.d} bytes) ${url}`);
    } catch(e) { console.log(`✗ ${label}: ${e.message}`); }
  }
})();
