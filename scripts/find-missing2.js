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
    ['Bloodhounds_(2023_TV_series)', 'bloodhounds'],
    ['Viral_Hit_(2024_TV_series)', 'viral-hit'],
    ['Kakegurui_(TV_series)', 'bet-kakegurui'],
    ['Kingdom_(film_series)', 'kingdom-films'],
    ['JoJo%27s_Bizarre_Adventure:_Diamond_Is_Unbreakable_(film)', 'jojo-film'],
    ['Nana_(manga)', 'nana-manga'],
    ['Your_Name_(2022_film)', 'your-name-film'],
    ['One_Punch_Man_(TV_series)', 'opm-tv'],
  ];
  for (const [title, id] of searches) {
    try {
      const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        if (j.thumbnail) {
          console.log(`✓ ${id}: ${j.thumbnail.source}`);
        } else {
          console.log(`✗ ${id}: no thumbnail (${j.title})`);
        }
      } else {
        console.log(`✗ ${id}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ERROR`); }
  }
})();
