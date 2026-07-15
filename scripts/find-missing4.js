const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 8000);
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(t);
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{clearTimeout(t); resolve({s:res.statusCode,d:d.length});});
    }).on('error',e=>{clearTimeout(t); reject(e);});
  });
}
(async () => {
  // Try Wikipedia REST API for Bloodhounds and Viral Hit with exact titles
  const wikiSearches = [
    ['Bloodhounds_(South_Korean_TV_series)', 'bloodhounds'],
    ['Viral_Hit_(webtoon)', 'viral-hit-webtoon'],
    ['Kakegurui_(live-action)', 'kakegurui-la'],
    ['Kakegurui_Twin_(TV_series)', 'kakegurui-twin'],
    ['Kingdom_(2019_South_Korean_film)', 'kingdom-2019'],
    ['JoJo%27s_Bizarre_Adventure:_Diamond_Is_Unbreakable_(live-action_film)', 'jojo-la'],
    ['Nana_(2005_film)', 'nana-film-2005'],
    ['Nana_(2006_film)', 'nana-film-2006'],
    ['Your_Name_(Japanese_TV_series)', 'your-name-la'],
    ['One_Punch_Man_(2025_TV_series)', 'opm-2025'],
  ];
  for (const [title, id] of wikiSearches) {
    try {
      const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        if (j.thumbnail) {
          console.log(`✓ ${id}: ${j.thumbnail.source}`);
        } else {
          console.log(`~ ${id}: page exists but no thumbnail (${j.title})`);
        }
      } else {
        console.log(`✗ ${id}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ${e.message}`); }
  }
})();
