const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,d}));
    }).on('error',reject);
  });
}

// Get some cast names from the data file
const fs = require('fs');
const content = fs.readFileSync('C:/Users/Parth Gupta/Desktop/ZyniVerse/src/lib/live-action-anime.ts', 'utf8');

// Extract first few cast member names
const castRegex = /name:\s*"([^"]+)"/g;
const names = new Set();
let m;
let count = 0;
// Find cast sections
const castSections = content.split('cast: [');
for (let i = 1; i < castSections.length && count < 10; i++) {
  const section = castSections[i].split('],')[0];
  const nameMatches = section.matchAll(/name:\s*"([^"]+)"/g);
  for (const nm of nameMatches) {
    if (count < 10 && nm[1] !== 'TBA') {
      names.add(nm[1]);
      count++;
    }
  }
}

// Also get crew names
const crewSections = content.split('crew: [');
for (let i = 1; i < crewSections.length && count < 15; i++) {
  const section = crewSections[i].split('],')[0];
  const nameMatches = section.matchAll(/name:\s*"([^"]+)"/g);
  for (const nm of nameMatches) {
    if (count < 15 && nm[1] !== 'TBA') {
      names.add(nm[1]);
      count++;
    }
  }
}

(async () => {
  console.log('Testing person photo API for cast/crew members:\n');
  for (const name of names) {
    // Format name for Wikipedia: "Tom Holland" → "Tom_Holland"
    const wikiName = name.replace(/\s+/g, '_').replace(/\./g, '');
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`);
      if (r.s === 200) {
        const j = JSON.parse(r.d);
        const hasThumb = !!j.thumbnail;
        console.log(`${hasThumb ? '✓' : '✗'} ${name} → wiki: ${wikiName} | thumb: ${hasThumb ? 'YES' : 'NO'}`);
      } else {
        // Try with (actor) suffix
        const r2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName + '_(actor)')}`);
        if (r2.s === 200) {
          const j = JSON.parse(r2.d);
          console.log(`${j.thumbnail ? '✓' : '✗'} ${name} → wiki: ${wikiName}_(actor) | thumb: ${j.thumbnail ? 'YES' : 'NO'}`);
        } else {
          console.log(`✗ ${name} → HTTP ${r.s} / ${r2.s}`);
        }
      }
    } catch(e) { console.log(`✗ ${name} → ERROR`); }
    await new Promise(r => setTimeout(r, 100));
  }
})();
