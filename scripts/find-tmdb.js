const https = require('https');
function fetch(url, headers) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', ...headers } };
    https.get(url, opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location, headers).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  // TMDB poster URLs are predictable if we know the path
  // Common TMDB poster paths for live-action adaptations:
  const tmdbPosters = [
    // One Piece Netflix S1 - TMDB ID 1068067
    ['https://image.tmdb.org/t/p/w500/7r4g1d6hYfx5bWcBG284w1z3U3w.jpg', 'one-piece-s1-tmdb'],
    // One Piece S3 (upcoming, unlikely to have poster)
    ['https://image.tmdb.org/t/p/w500/nJvSasstHFBgWdNwElLMDsU0qC.png', 'one-piece-s3-tmdb'],
    // Yu Yu Hakusho Netflix
    ['https://image.tmdb.org/t/p/w500/gLbGNPGYlTjXbM9E3JgG5XmzEoJ.jpg', 'yuyu-tmdb'],
    // Kimi ni Todoke Netflix
    ['https://image.tmdb.org/t/p/w500/dBxxtfKwMYJkFRLZqDwDvHjXmBd.jpg', 'kimi-ni-todoke-tmdb'],
    // Naruto live-action (upcoming)
    ['https://image.tmdb.org/t/p/w500/nhGPNHGxwqfSgFBhMzrS3YUxHjB.jpg', 'naruto-tmdb'],
    // MHA You're Next
    ['https://image.tmdb.org/t/p/w500/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg', 'mha-next-tmdb'],
    // Sakamoto Days
    ['https://image.tmdb.org/t/p/w500/fOo4dA71qMdlP1w5dKBRdC7r24O.jpg', 'sakamoto-tmdb'],
    // Dragon Ball live-action (upcoming)
    ['https://image.tmdb.org/t/p/w500/3grlFXqJPc8mCUgDvBx3h7ECfDv.jpg', 'db-live-tmdb'],
  ];
  
  for (const [url, label] of tmdbPosters) {
    try {
      const r = await fetch(url);
      if (r.s === 200 && r.d.length > 1000) {
        console.log(`✓ ${label}: ${url} (${r.d.length} bytes)`);
      } else {
        console.log(`✗ ${label}: HTTP ${r.s} (${r.d.length} bytes)`);
      }
    } catch(e) { console.log(`✗ ${label}: ERROR`); }
  }
})();
