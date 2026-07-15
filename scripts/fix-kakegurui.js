const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  // Try various Kakegurui search terms
  const searches = [
    'Kakegurui:_Compulsive_Gambler',
    'Kakegurui_(live-action_TV_series)',
    'Kakegurui_Midnight',
    'Kakegurui_(manga)',
  ];
  for (const s of searches) {
    const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(s));
    if (r.s === 200) {
      const j = JSON.parse(r.d);
      if (j.thumbnail) {
        console.log(`✓ ${s}: ${j.thumbnail.source}`);
      } else {
        console.log(`✗ ${s}: no thumbnail`);
      }
    } else {
      console.log(`✗ ${s}: HTTP ${r.s}`);
    }
  }
})();
