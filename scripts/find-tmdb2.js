const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  // Scrape TMDB poster page for Yu Yu Hakusho (ID 121659)
  console.log('=== Yu Yu Hakusho TMDB posters ===');
  try {
    const r = await fetch('https://www.themoviedb.org/tv/121659-yu-yu-hakusho/images/posters');
    if (r.s === 200) {
      const matches = [...r.d.matchAll(/image\.tmdb\.org\/t\/p\/original\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
      matches.forEach(m => console.log('https://image.tmdb.org/t/p/w500/' + m[1]));
    }
  } catch(e) { console.log('Error:', e.message); }

  // Kimi ni Todoke Netflix - find TMDB ID first
  console.log('\n=== Kimi ni Todoke TMDB search ===');
  try {
    const r = await fetch('https://www.themoviedb.org/search?query=Kimi+ni+Todoke+live+action');
    if (r.s === 200) {
      const matches = [...r.d.matchAll(/\/tv\/(\d+)-/g)];
      matches.forEach(m => console.log('TMDB TV ID:', m[1]));
      // Also look for poster images
      const posters = [...r.d.matchAll(/image\.tmdb\.org\/t\/p\/(?:w\d+|original)\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
      posters.forEach(m => console.log('Poster:', 'https://image.tmdb.org/t/p/w500/' + m[1]));
    }
  } catch(e) { console.log('Error:', e.message); }

  // Naruto live action - find TMDB ID
  console.log('\n=== Naruto live action TMDB search ===');
  try {
    const r = await fetch('https://www.themoviedb.org/search?query=Naruto+live+action');
    if (r.s === 200) {
      const matches = [...r.d.matchAll(/\/movie\/(\d+)-/g)];
      matches.forEach(m => console.log('TMDB Movie ID:', m[1]));
    }
  } catch(e) { console.log('Error:', e.message); }

  // Dragon Ball live action new - find TMDB ID
  console.log('\n=== Dragon Ball live action TMDB search ===');
  try {
    const r = await fetch('https://www.themoviedb.org/search?query=Dragon+Ball+live+action+20th+Century');
    if (r.s === 200) {
      const matches = [...r.d.matchAll(/\/movie\/(\d+)-/g)];
      matches.slice(0, 5).forEach(m => console.log('TMDB Movie ID:', m[1]));
    }
  } catch(e) { console.log('Error:', e.message); }
})();
