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
    // One Piece live-action
    ['One_Piece_(TV_series)', 'one-piece-la-s1'],
    ['One_Piece_(American_TV_series)', 'one-piece-la-s1b'],
    // Yu Yu Hakusho
    ['Yu_Yu_Hakusho_(TV_series_2023)', 'yu-yu-hakusho-la'],
    ['YuYu_Hakusho_(TV_series)', 'yu-yu-hakusho-la2'],
    // Kimi ni Todoke
    ['Kimi_ni_Todoke_(TV_series_2023)', 'kimi-ni-todoke-la'],
    ['Kimi_ni_Todoke:_From_Me_to_You_(TV_series)', 'kimi-ni-todoke-la2'],
    // Naruto
    ['Naruto_(upcoming_film)', 'naruto'],
    // My Hero Academia
    ['My_Hero_Academia:_You%27re_Next', 'mha'],
    ['My_Hero_Academia_(film_series)', 'mha2'],
    // Sakamoto Days
    ['Sakamoto_Days', 'sakamoto'],
  ];
  for (const [title, id] of searches) {
    try {
      const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        if (j.thumbnail) {
          console.log(`✓ ${id} (${title}): ${j.thumbnail.source}`);
        } else {
          console.log(`✗ ${id} (${title}): no thumbnail`);
        }
      } else {
        console.log(`✗ ${id} (${title}): HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ERROR`); }
  }
})();
