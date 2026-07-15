const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 10000);
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(t);
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{clearTimeout(t); resolve({s:res.statusCode,d:d.length});});
    }).on('error',e=>{clearTimeout(t); reject(e);});
  });
}
(async () => {
  // Kakegurui Hollywood (BET) - TMDB ID 255779, try poster page
  console.log('=== BET Kakegurui poster page ===');
  try {
    const r = await fetch('https://www.themoviedb.org/tv/255779-kakegurui-live-action/images/posters');
    if (r.s === 200) {
      // Read as text for regex
      let data = '';
      const t2 = setTimeout(() => {}, 1000);
      https.get('https://www.themoviedb.org/tv/255779-kakegurui-live-action/images/posters', {headers:{'User-Agent':'Mozilla/5.0'}}, res2 => {
        let d2=''; res2.on('data',c=>d2+=c); res2.on('end',()=>{
          const matches = [...d2.matchAll(/image\.tmdb\.org\/t\/p\/original\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
          if (matches.length > 0) {
            console.log('✓ BET:', 'https://image.tmdb.org/t/p/w500/' + matches[0][1]);
          } else {
            console.log('✗ BET: no poster images found');
          }
        });
      });
    }
  } catch(e) { console.log('BET error:', e.message); }

  // Kingdom film - try TMDB search
  console.log('\n=== Kingdom film ===');
  try {
    https.get('https://www.themoviedb.org/movie/457799-kingdom/images/posters', {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{
        const matches = [...d.matchAll(/image\.tmdb\.org\/t\/p\/original\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
        if (matches.length > 0) {
          console.log('✓ Kingdom:', 'https://image.tmdb.org/t/p/w500/' + matches[0][1]);
        } else {
          console.log('✗ Kingdom: no posters found');
        }
      });
    });
  } catch(e) { console.log('Kingdom error:', e.message); }

  // JoJo Diamond Unbreakable film - TMDB search
  console.log('\n=== JoJo film ===');
  try {
    https.get('https://www.themoviedb.org/movie/411088/images/posters', {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{
        const matches = [...d.matchAll(/image\.tmdb\.org\/t\/p\/original\/([a-zA-Z0-9]+\.(?:jpg|png))/g)];
        if (matches.length > 0) {
          console.log('✓ JoJo:', 'https://image.tmdb.org/t/p/w500/' + matches[0][1]);
        } else {
          console.log('✗ JoJo: no posters found');
        }
      });
    });
  } catch(e) { console.log('JoJo error:', e.message); }

  // Your Name live-action - use anime poster from AniList
  console.log('\n=== Your Name ===');
  console.log('Your Name live-action: no poster exists on TMDB, using anime poster');
  
  // Wait for async requests
  await new Promise(r => setTimeout(r, 5000));
})();
