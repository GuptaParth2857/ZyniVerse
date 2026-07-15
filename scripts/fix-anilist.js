const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (ZyniVerse)'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  const searches = [
    ['One_Piece_(live-action_TV_series)', 'one-piece-la-s1'],
    ['Yu_Yu_Hakusho_(TV_series)', 'yu-yu-hakusho-la'],
    ['Kimi_ni_Todoke_(TV_series)', 'kimi-ni-todoke-la'],
    ['Naruto_(live-action_film)', 'naruto-live-action'],
    ['My_Hero_Academia:_You%27re_Next', 'my-hero-academia-film'],
    ['Sakamoto_Days_(TV_series)', 'sakamoto-days-film'],
    ['Dragon_Ball_(upcoming_film)', 'dragon-ball-live-action'],
    ['One_Piece_(live-action_TV_series)', 'one-piece-la-s3'],
    ['Yu_Yu_Hakusho_(2023_TV_series)', 'yu-yu-hakusho-la-2023'],
  ];
  for (const [title, id] of searches) {
    try {
      const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        if (j.thumbnail) {
          console.log(`✓ ${id}: ${j.thumbnail.source}`);
        } else {
          console.log(`✗ ${id}: no thumbnail`);
        }
      } else {
        console.log(`✗ ${id}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ERROR`); }
  }
})();
