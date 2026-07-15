const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d:d.length}));
    }).on('error',reject);
  });
}
(async () => {
  const urls = [
    // Yu Yu Hakusho live-action TMDB
    ['YYH poster1', 'https://image.tmdb.org/t/p/w500/phePxRL08ovho6OazkOjxZBJMo0.jpg'],
    ['YYH poster2', 'https://image.tmdb.org/t/p/w500/46KK5MuFtPfHrsnXfK6MSniwq9A.jpg'],
    ['YYH poster3', 'https://image.tmdb.org/t/p/w500/w7kjg8xJfrYOvVc1mQYJj2mBkN9.jpg'],
    // Naruto live-action movie (TMDB ID 1210043)
    ['Naruto movie', 'https://image.tmdb.org/t/p/w500/naruto-live-action.jpg'],
  ];
  for (const [label, url] of urls) {
    try {
      const r = await fetch(url);
      console.log(`${r.s === 200 && r.d > 1000 ? '✓' : '✗'} ${label}: HTTP ${r.s} (${r.d} bytes) ${url}`);
    } catch(e) { console.log(`✗ ${label}: ERROR`); }
  }
  
  // Get Naruto movie page to find poster path
  console.log('\n=== Naruto movie page ===');
  try {
    const r = await fetch('https://www.themoviedb.org/movie/1210043');
    if (r.s === 200) {
      const posters = [...r.d.matchAll(/image\.tmdb\.org\/t\/p\/(?:w\d+|original)\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
      posters.slice(0, 5).forEach(m => console.log('https://image.tmdb.org/t/p/w500/' + m[1]));
    }
  } catch(e) { console.log('Error:', e.message); }

  // Get Kimi ni Todoke Netflix page  
  console.log('\n=== Kimi ni Todoke Netflix search ===');
  try {
    const r = await fetch('https://www.themoviedb.org/search?query=From+Me+to+You+Kimi+ni+Todoke');
    if (r.s === 200) {
      const tvIds = [...r.d.matchAll(/\/tv\/(\d+)-/g)];
      tvIds.slice(0, 3).forEach(m => console.log('TV ID:', m[1]));
      const movieIds = [...r.d.matchAll(/\/movie\/(\d+)-/g)];
      movieIds.slice(0, 3).forEach(m => console.log('Movie ID:', m[1]));
    }
  } catch(e) { console.log('Error:', e.message); }
})();
