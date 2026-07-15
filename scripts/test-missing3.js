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
  // Try known TMDB poster paths for the remaining titles
  const urls = [
    // BET (Kakegurui Hollywood) - TMDB 255779
    ['bet', 'https://image.tmdb.org/t/p/w500/pDx9FWXJyJMxGfGfB0fYt0fVfF.jpg'],
    ['bet2', 'https://image.tmdb.org/t/p/w500/y6VbNBXMVz2fGw8V2dVvF3gQ0uH.jpg'],
    ['bet3', 'https://image.tmdb.org/t/p/w500/aJ2Rv9xXw2KFM8dFxK1xWfGJfYh.jpg'],
    // Kingdom 2019 film
    ['kingdom', 'https://image.tmdb.org/t/p/w500/pC5gS3FkVgQdD5Vh5M3vC1C7x7r.jpg'],
    ['kingdom2', 'https://image.tmdb.org/t/p/w500/396HlKUMfJfCk7d1y5BcXh1C6b5.jpg'],
    // JoJo Diamond Unbreakable film 
    ['jojo', 'https://image.tmdb.org/t/p/w500/pF0S4e7MJHBK0Fs0LMQ3NnOz3Dl.jpg'],
    ['jojo2', 'https://image.tmdb.org/t/p/w500/9ZBnGBcK0oJkV2sJzP1xBgEf0uO.jpg'],
    // Your Name - use anime poster from AniList
    // OPM Netflix live-action  
    ['opm-la', 'https://image.tmdb.org/t/p/w500/cFgn5mJbNc1PkPwVt8V2dMfFvG0.jpg'],
  ];
  for (const [label, url] of urls) {
    try {
      const r = await fetch(url);
      console.log(`${r.s===200 && r.d>1000 ? '✓' : '✗'} ${label}: HTTP ${r.s} (${r.d} bytes)`);
    } catch(e) { console.log(`✗ ${label}: ${e.message}`); }
  }
})();
