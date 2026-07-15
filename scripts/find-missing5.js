const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 8000);
    https.get(url, {headers:{'User-Agent':'ZyniVerse/1.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(t);
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{clearTimeout(t); resolve({s:res.statusCode,d});});
    }).on('error',e=>{clearTimeout(t); reject(e);});
  });
}
(async () => {
  // Get image lists from Wikipedia pages
  const pages = [
    ['Bloodhounds_(South_Korean_TV_series)', 'bloodhounds'],
    ['Nana_(2005_film)', 'nana-film'],
    ['Viral_Hit_(TV_series)', 'viral-hit'],
    ['Kakegurui_(TV_series)', 'kakegurui'],
    ['Kingdom_(2019_film)', 'kingdom-2019'],
    ['JoJo%27s_Bizarre_Adventure:_Diamond_Is_Unbreakable_(film)', 'jojo-film'],
    ['Your_Name_(2011_TV_series)', 'your-name-la'],
    ['One_Punch_Man_(TV_series)', 'opm-tv'],
  ];
  
  for (const [wikiTitle, id] of pages) {
    try {
      // Use the parse API to get images from the page
      const r = await fetch('https://en.wikipedia.org/w/api.php?action=parse&page=' + encodeURIComponent(wikiTitle) + '&prop=images&format=json');
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        const images = j.parse?.images || [];
        const posters = images.filter(i => i.match(/poster|key|cover|title|logo/i));
        if (posters.length > 0) {
          console.log(`✓ ${id}: ${posters[0]}`);
        } else if (images.length > 0) {
          console.log(`~ ${id}: ${images.filter(i => !i.match(/svg|icon|flag|symbol/i)).slice(0, 3).join(', ')}`);
        } else {
          console.log(`✗ ${id}: no images`);
        }
      } else {
        console.log(`✗ ${id}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ${e.message}`); }
  }
})();
