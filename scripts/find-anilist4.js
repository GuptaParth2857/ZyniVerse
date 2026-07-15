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
    // Netflix One Piece
    ['One_Piece_(2023_TV_series)', 'netflix-one-piece-summary'],
    ['One_Piece_(American_TV_series)', 'one-piece-american'],
    // Naruto
    ['Naruto_(franchise)', 'naruto-franchise'],
    // Check the actual Yu Yu Hakusho page content for live-action section
    ['YuYu_Hakusho_(2023_TV_series)', 'yu-yu-2023-series'],
    // Sakamoto Days live action adaptation  
    ['Sakamoto_Days_(live-action)', 'sakamoto-live-action'],
    // My Hero Academia: You're Next
    ['My_Hero_Academia:_You%27re_Next', 'mha-youre-next'],
    // One Piece season
    ['List_of_One_Piece_episodes', 'one-piece-episodes'],
  ];
  for (const [title, id] of searches) {
    try {
      const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        console.log(`[${r.s}] ${id} (page: ${j.title}): thumb=${j.thumbnail ? j.thumbnail.source : 'NONE'}, original=${j.originalimage ? j.originalimage.source : 'NONE'}`);
      } else {
        console.log(`✗ ${id}: HTTP ${r.s}`);
      }
    } catch(e) { console.log(`✗ ${id}: ERROR ${e.message}`); }
  }
  
  // Also get the full content of the One Piece TV series page to find infobox image
  console.log('\n--- Fetching One Piece (2023) page HTML for poster ---');
  try {
    const r = await fetch('https://en.wikipedia.org/w/api.php?action=parse&page=One_Piece_(2023_TV_series)&prop=images&format=json');
    if (r.s === 200) {
      const j = JSON.parse(r.d);
      const images = j.parse?.images || [];
      console.log('Images on One Piece 2023 page:', images.filter(i => i.match(/poster|key|logo|cover/i)).slice(0, 10));
      console.log('All images:', images.slice(0, 20));
    }
  } catch(e) { console.log('Error:', e.message); }
  
  // Yu Yu Hakusho 2023 page images
  console.log('\n--- Fetching Yu Yu Hakusho 2023 page images ---');
  try {
    const r = await fetch('https://en.wikipedia.org/w/api.php?action=parse&page=YuYu_Hakusho_(2023_TV_series)&prop=images&format=json');
    if (r.s === 200) {
      const j = JSON.parse(r.d);
      const images = j.parse?.images || [];
      console.log('Images:', images.filter(i => i.match(/poster|key|logo|cover|netflix/i)).slice(0, 10));
      console.log('All:', images.slice(0, 20));
    }
  } catch(e) { console.log('Error:', e.message); }
})();
