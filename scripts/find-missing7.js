const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 10000);
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
    // Kakegurui live-action - try Wikipedia images
    ['Kakegurui_Twin_(TV_series)', 'kakegurui-twin'],
    ['Kakegurui_(TV_series)', 'kakegurui-la'],
    // Try some known TMDB poster paths
    ['Kakegurui TMDB', 'https://image.tmdb.org/t/p/w500/dFfKJgqy0kG0fA3M5W8m4e2C1e2.jpg'],
    ['JoJo TMDB', 'https://image.tmdb.org/t/p/w500/oRkTOobtJCpGNMGi23CVIyK0xjo.jpg'],
    ['Nana TMDB', 'https://image.tmdb.org/t/p/w500/kkG0NRx0D9fXRbSGtEDq6gIhxgS.jpg'],
    ['Your Name TMDB', 'https://image.tmdb.org/t/p/w500/fQFXmXZ0w4R0xO2Fq29WxvO5s4c.jpg'],
    ['OPM TMDB', 'https://image.tmdb.org/t/p/w500/cFgn5mJbNc1PkPwVt8V2dMfFvG0.jpg'],
    // Kingdom - from Wikipedia
    ['Kingdom Wiki', 'https://upload.wikimedia.org/wikipedia/en/4/48/Kingdom_film_%28poster%29.jpeg'],
    ['Nana Wiki', 'https://upload.wikimedia.org/wikipedia/en/a/ac/Nana_movie.jpg'],
  ];
  for (const [label, val] of urls) {
    if (val.startsWith('http')) {
      try {
        const r = await fetch(val);
        console.log(`${r.s===200 && r.d>1000 ? '✓' : '✗'} ${label}: HTTP ${r.s} (${r.d} bytes)`);
      } catch(e) { console.log(`✗ ${label}: ${e.message}`); }
    } else {
      // Wikipedia API
      try {
        const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(val));
        if (r.s === 200) {
          const j = JSON.parse(r.d);
          console.log(`${j.thumbnail ? '✓' : '~'} ${label}: ${j.thumbnail?.source || 'no thumb'}`);
        } else {
          console.log(`✗ ${label}: HTTP ${r.s}`);
        }
      } catch(e) { console.log(`✗ ${label}: ${e.message}`); }
    }
  }
})();
