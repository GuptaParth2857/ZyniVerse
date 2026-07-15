const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  // TMDB poster pages to scrape
  const pages = [
    ['https://www.themoviedb.org/tv/135158-bloodhounds/images/posters', 'bloodhounds'],
    ['https://www.themoviedb.org/tv/224635-viral-hit/images/posters', 'viral-hit'],
    ['https://www.themoviedb.org/tv/75519-kakegurui/images/posters', 'bet-kakegurui'],
    ['https://www.themoviedb.org/movie/457799-kingdom/images/posters', 'kingdom-film'],
    ['https://www.themoviedb.org/movie/411088-jojos-bizarre-adventure-diamond-is-unbreakable/images/posters', 'jojo-film'],
    ['https://www.themoviedb.org/tv/15552-nana/images/posters', 'nana-series'],
    ['https://www.themoviedb.org/movie/1090448-your-name/images/posters', 'your-name'],
    ['https://www.themoviedb.org/tv/391636-one-punch-man/images/posters', 'opm'],
  ];
  
  for (const [pageUrl, label] of pages) {
    try {
      const r = await fetch(pageUrl);
      if (r.s === 200) {
        const matches = [...r.d.matchAll(/image\.tmdb\.org\/t\/p\/original\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
        if (matches.length > 0) {
          console.log(`✓ ${label}: https://image.tmdb.org/t/p/w500/${matches[0][1]}`);
        } else {
          console.log(`✗ ${label}: no posters found on page`);
        }
      } else {
        console.log(`✗ ${label}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${label}: ERROR`); }
  }
})();
