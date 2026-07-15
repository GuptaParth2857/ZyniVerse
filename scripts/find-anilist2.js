const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'ZyniVerse/1.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  const searches = [
    // Correct Wikipedia titles from websearch
    ['One_Piece_(2023_TV_series)', 'one-piece-la-s1'],
    ['YuYu_Hakusho_(2023_TV_series)', 'yu-yu-hakusho-la'],
    ['From_Me_to_You:_Kimi_ni_Todoke_(TV_series)', 'kimi-ni-todoke-la'],
    ['My_Hero_Academia:_You%27re_Next', 'mha-film'],
    ['Sakamoto_Days_(TV_series)', 'sakamoto-la'],
    ['Naruto_(live-action_film)', 'naruto-la'],
    ['Dragon_Ball_(live-action_film)', 'dragon-ball-la'],
    ['One_Piece_season_3', 'one-piece-s3'],
  ];
  for (const [title, id] of searches) {
    try {
      const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        if (j.thumbnail) {
          console.log(`✓ ${id}: ${j.thumbnail.source}`);
        } else {
          console.log(`✗ ${id}: no thumbnail (${j.title || 'unknown'})`);
        }
      } else {
        console.log(`✗ ${id}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ERROR`); }
  }
})();
