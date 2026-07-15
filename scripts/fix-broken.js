const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (ZyniVerse)'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  // Fix rurouni-kenshin-films - find correct poster
  const rk = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Rurouni_Kenshin_(film_series)');
  const rkj = JSON.parse(rk.d);
  console.log('Rurouni Kenshin series:', rkj.thumbnail?.source || 'NONE');
  
  // Try individual film
  const rk2 = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Rurouni_Kenshin:_The_Beginning');
  const rk2j = JSON.parse(rk2.d);
  console.log('RK The Beginning:', rk2j.thumbnail?.source || 'NONE');

  // Fix kakegurui-la
  const kg = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Kakegurui_(TV_series)');
  const kgj = JSON.parse(kg.d);
  console.log('Kakegurui TV:', kgj.thumbnail?.source || 'NONE');

  // Try Kakegurui Twin
  const kg2 = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Kakegurui_Twin');
  const kg2j = JSON.parse(kg2.d);
  console.log('Kakegurui Twin:', kg2j.thumbnail?.source || 'NONE');
})();
