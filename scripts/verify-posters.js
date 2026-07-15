const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0 (ZyniVerse)'}}, res => {
      if(res.statusCode>=300&&res.statusCode<400&&res.headers.location) {
        console.log(`  REDIRECT → ${res.headers.location}`);
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({s:res.statusCode,len:d.length}));
    }).on('error',reject);
  });
}

const fs = require('fs');
const content = fs.readFileSync('C:/Users/Parth Gupta/Desktop/ZyniVerse/src/lib/live-action-anime.ts', 'utf8');

// Extract all posterUrl entries with their IDs
const posterRegex = /id:\s*"([^"]+)"[\s\S]*?posterUrl:\s*"([^"]+)"/g;
let match;
const entries = [];
while ((match = posterRegex.exec(content)) !== null) {
  entries.push({ id: match[1], url: match[2] });
}

(async () => {
  console.log(`Testing ${entries.length} poster URLs...\n`);
  let ok = 0, fail = 0, rateLimit = 0;
  for (const { id, url } of entries) {
    try {
      const r = await fetch(url);
      if (r.s === 200) { ok++; console.log(`✓ ${id} (${r.len} bytes)`); }
      else if (r.s === 429) { rateLimit++; console.log(`⚠ ${id} rate-limited`); }
      else { fail++; console.log(`✗ ${id} HTTP ${r.s}`); }
    } catch(e) { fail++; console.log(`✗ ${id} ERROR: ${e.message}`); }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }
  console.log(`\n=== RESULTS: ${ok} OK, ${fail} FAILED, ${rateLimit} RATE-LIMITED ===`);
})();
