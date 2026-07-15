const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}

async function testPersonPhoto(name) {
  try {
    const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(name));
    if (r.s === 200) {
      const j = JSON.parse(r.d);
      const thumb = j.thumbnail?.source || null;
      const orig = j.originalimage?.source || null;
      console.log(`${name}: thumb=${thumb ? 'YES' : 'NO'} orig=${orig ? 'YES' : 'NO'} | ${thumb || 'NONE'}`);
    } else {
      console.log(`${name}: HTTP ${r.s}`);
    }
  } catch(e) { console.log(`${name}: ERROR ${e.message}`); }
}

async function testPoster(url, label) {
  try {
    const r = await fetch(url);
    console.log(`${label}: HTTP ${r.s} (${r.d.length} bytes)`);
  } catch(e) { console.log(`${label}: ERROR ${e.message}`); }
}

(async () => {
  console.log("=== PERSON PHOTOS ===");
  const people = [
    'Tom_Holland', 'Chris_Pratt', 'Ryan_Gosling', 'Gong_Yoo', 'Park_Seojun',
    'Takeru_Satoh', 'Mackenyu', 'Mila_Kunis', 'Takeshi_Kaneshiro'
  ];
  for (const p of people) await testPersonPhoto(p);

  console.log("\n=== POSTER URLS (sampling broken ones) ===");
  const posters = [
    ['https://upload.wikimedia.org/wikipedia/en/b/b1/Tokyo_Revengers_volume_1_cover.jpg', 'tokyo-revengers (manga)'],
    ['https://upload.wikimedia.org/wikipedia/en/9/9d/Fullmetal123.jpg', 'fma (manga)'],
    ['https://upload.wikimedia.org/wikipedia/en/4/47/Bleach_(2018_film)_poster.jpg', 'bleach-film'],
    ['https://upload.wikimedia.org/wikipedia/en/b/bf/Dragonball_Evolution_(2009_film).jpg', 'dragon-ball'],
    ['https://upload.wikimedia.org/wikipedia/en/6/67/Oldboykoreanposter.jpg', 'oldboy'],
    ['https://upload.wikimedia.org/wikipedia/en/0/05/All_You_Need_Is_Kill.jpg', 'edge-of-tomorrow'],
    ['https://upload.wikimedia.org/wikipedia/en/2/24/All_of_Us_Are_Dead.jpeg', 'all-of-us-dead'],
    ['https://upload.wikimedia.org/wikipedia/en/0/01/InitialD.jpg', 'initial-d'],
    ['https://upload.wikimedia.org/wikipedia/en/9/94/Lupin_III-_The_First_poster.jpg', 'lupin'],
    ['https://upload.wikimedia.org/wikipedia/en/5/57/Rurouni_Kenshin_The_Beginning.jpg', 'rurouni-kenshin'],
    ['https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg', 'one-piece (anilist)'],
  ];
  for (const [url, label] of posters) await testPoster(url, label);
})();
