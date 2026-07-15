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
    // One Piece live-action (from TMDB 111110)
    ['One Piece S1', 'https://image.tmdb.org/t/p/w500/rCmbVbBuMM4OVrkfSWKnnNpUSGh.jpg'],
    ['One Piece S1-2', 'https://image.tmdb.org/t/p/w500/lOkv76wi8ekOuvLc3VbVQeqtih1.jpg'],
    ['One Piece alt', 'https://image.tmdb.org/t/p/w500/asDyEsFKceLkVE4SESYQlvL5Oov.jpg'],
    ['One Piece alt2', 'https://image.tmdb.org/t/p/w500/grNz36AWbJ3JDeWHZabnzk5Zmkk.jpg'],
    // Yu Yu Hakusho live-action (from TMDB 121659)
    ['Yu Yu Hakusho', 'https://image.tmdb.org/t/p/w500/8jsMCJEGnTVEIjMUQ2mV0j2mDQP.jpg'],
    ['Yu Yu Hakusho2', 'https://image.tmdb.org/t/p/w500/fD88YFGfKjkmnYkWnE2VbXRdVfM.jpg'],
    // Kimi ni Todoke (need to find TMDB ID)
    // Sakamoto Days (from TMDB 207332)
    ['Sakamoto Days', 'https://image.tmdb.org/t/p/w500/cgTRsnnVYOQyv4bj2KChGwD1lMx.jpg'],
    ['Sakamoto Days2', 'https://image.tmdb.org/t/p/w500/kvNMsSNNKG3MxxputOtLypQzjfW.jpg'],
    // MHA You're Next
    ['MHA Youre Next', 'https://image.tmdb.org/t/p/w500/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg'],
    // Naruto live-action (upcoming, probably no poster)
    // Dragon Ball (upcoming, different from DB Evolution)
    ['Dragon Ball new', 'https://image.tmdb.org/t/p/w500/5P6SmVb08hG7DpS8RqSm0dNnFMz.jpg'],
  ];
  
  for (const [label, url] of urls) {
    try {
      const r = await fetch(url);
      console.log(`${r.s === 200 && r.d > 1000 ? '✓' : '✗'} ${label}: HTTP ${r.s} (${r.d} bytes) ${url}`);
    } catch(e) { console.log(`✗ ${label}: ERROR`); }
  }
})();
