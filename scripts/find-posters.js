const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'ZyniVerse/1.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}
(async () => {
  // Try to get One Piece poster from the actual TV series page HTML
  const r = await fetch('https://en.wikipedia.org/wiki/One_Piece_(2023_TV_series)');
  if (r.s === 200) {
    const matches = r.d.match(/upload\.wikimedia\.org[^"'\s]+\.(jpg|jpeg|png|webp)/gi) || [];
    const posters = matches.filter(m => m.includes('One_Piece') || m.includes('One_piece') || m.includes('one_piece'));
    console.log('One Piece images found:');
    [...new Set(posters)].forEach(p => console.log('https://' + p));
    
    // Check infobox
    const infobox = r.d.match(/class="infobox.*?<img[^>]+src="([^"]+)"/s);
    if (infobox) console.log('Infobox image:', 'https://' + infobox[1]);
  }

  // Kimi ni Todoke Netflix page
  const r2 = await fetch('https://en.wikipedia.org/wiki/From_Me_to_You:_Kimi_ni_Todoke_(TV_series)');
  if (r2.s === 200) {
    const matches = r2.d.match(/upload\.wikimedia\.org[^"'\s]+\.(jpg|jpeg|png|webp)/gi) || [];
    const posters = matches.filter(m => m.includes('Kimi') || m.includes('kimi') || m.includes('Todoke') || m.includes('todoke'));
    console.log('\nKimi ni Todoke images:');
    [...new Set(posters)].forEach(p => console.log('https://' + p));
    const infobox = r2.d.match(/class="infobox.*?<img[^>]+src="([^"]+)"/s);
    if (infobox) console.log('Infobox:', 'https://' + infobox[1]);
  }

  // Yu Yu Hakusho live-action
  const r3 = await fetch('https://en.wikipedia.org/wiki/YuYu_Hakusho_(2023_TV_series)');
  if (r3.s === 200) {
    const matches = r3.d.match(/upload\.wikimedia\.org[^"'\s]+\.(jpg|jpeg|png|webp)/gi) || [];
    const posters = matches.filter(m => m.includes('Yu') || m.includes('yu') || m.includes('Hakusho') || m.includes('hakusho'));
    console.log('\nYu Yu Hakusho images:');
    [...new Set(posters)].forEach(p => console.log('https://' + p));
    const infobox = r3.d.match(/class="infobox.*?<img[^>]+src="([^"]+)"/s);
    if (infobox) console.log('Infobox:', 'https://' + infobox[1]);
  }
})();
