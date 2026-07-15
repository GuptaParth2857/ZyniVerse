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
    // One Piece live-action
    ['One_Piece_(live-action_TV_series)', 'one-piece-la-s1'],
    ['One_Piece_(TV_series)', 'one-piece-la-s1b'],
    ['One_Piece_(American_TV_series)', 'one-piece-la-s1c'],
    // Yu Yu Hakusho live-action
    ['Yu_Yu_Hakusho_(TV_series)', 'yu-yu-hakusho'],
    ['YuYu_Hakusho_(TV_series)', 'yu-yu-hakusho2'],
    // Kimi ni Todoke live-action
    ['Kimi_ni_Todoke_(TV_series)', 'kimi-ni-todoke'],
    ['From_Me_to_You_(TV_series)', 'kimi-ni-todoke2'],
    // Naruto
    ['Naruto_(upcoming_film)', 'naruto'],
    ['Naruto_(film)', 'naruto2'],
    // MHA
    ['My_Hero_Academia:_You%27re_Next', 'mha-next'],
    ['My_Hero_Academia_(film_series)', 'mha-series'],
    // Sakamoto Days
    ['Sakamoto_Days', 'sakamoto'],
    ['Sakamoto_Days_(TV_series)', 'sakamoto2'],
    // Dragon Ball live-action
    ['Dragon_Ball_(upcoming_film)', 'db-upcoming'],
    ['Dragon_Ball_(franchise)', 'db-franchise'],
    // One Piece S3
    ['One_Piece_(live-action_TV_series)_season_3', 'op-s3'],
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
