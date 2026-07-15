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
    // Try different variations
    ['One_Piece_(TV_series)', 'one-piece-s1-s3'],
    ['From_Me_to_You:_Kimi_ni_Todoke', 'kimi-ni-todoke-alt'],
    ['My_Hero_Academia:_You%27re_Next_(film)', 'mha-next'],
    ['Sakamoto_Days', 'sakamoto-alt'],
    ['Naruto_the_Movie:_Ninja_Clash!', 'naruto-movie1'],
    ['Dragon_Ball_(film)', 'db-evolution'],
    ['One_Piece_(live-action_TV_series)', 'one-piece-la-alt'],
    ['YuYu_Hakusho_(TV_series)', 'yu-yu-alt'],
    // Search for specific film titles
    ['Naruto_(2015_film)', 'naruto-2015'],
    ['Dragon_Ball_Evolution', 'db-evolution-alt'],
    ['Kimi_ni_Todoke_(film)', 'kimi-ni-todoke-film'],
    ['Kimi_ni_Todoke_(TV_series)', 'kimi-ni-todoke-tv'],
    ['My_Hero_Academia:_Two_Heroes', 'mha-two-heroes'],
    ['My_Hero_Academia:_Heroes_Rising', 'mha-heroes-rising'],
    ['Sakamoto_Days_(manga)', 'sakamoto-manga'],
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
    } catch(e) { console.log(`✗ ${id}: ERROR ${e.message}`); }
  }
})();
