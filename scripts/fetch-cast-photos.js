const https = require('https');
const fs = require('fs');
const path = require('path');

function wikiFetch(name) {
  return new Promise((resolve) => {
    const base = name.replace(/\s+/g, '_').replace(/\./g, '');
    const variants = [base, base + '_(actor)', base + '_(actress)'];
    tryVariant(0);
    function tryVariant(i) {
      if (i >= variants.length) { resolve(null); return; }
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variants[i])}`;
      const req = https.get(url, { headers: { 'User-Agent': 'ZyniVerse/1.0' } }, res => {
        if (res.statusCode === 200) {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => {
            try {
              const j = JSON.parse(d);
              resolve(j.thumbnail?.source?.replace(/\/\d+px-/, '/200px-') || null);
            } catch { resolve(null); }
          });
        } else { tryVariant(i + 1); }
      });
      req.on('error', () => tryVariant(i + 1));
      req.setTimeout(8000, () => { req.destroy(); tryVariant(i + 1); });
    }
  });
}

async function fetchBatch(names, concurrency = 8) {
  const results = {};
  let i = 0;
  async function worker() {
    while (i < names.length) {
      const idx = i++;
      const name = names[idx];
      results[name] = await wikiFetch(name);
    }
  }
  const workers = [];
  for (let w = 0; w < concurrency; w++) workers.push(worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const filePath = path.join(__dirname, '..', 'src', 'lib', 'live-action-anime.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  const names = new Set();
  for (const section of ['cast:', 'crew:', 'voiceActors:']) {
    let idx = 0;
    while ((idx = content.indexOf(section, idx)) !== -1) {
      const start = content.indexOf('[', idx);
      if (start === -1) break;
      let depth = 0, end = start;
      for (let i = start; i < content.length; i++) {
        if (content[i] === '[') depth++;
        if (content[i] === ']') depth--;
        if (depth === 0) { end = i; break; }
      }
      for (const m of content.substring(start, end + 1).matchAll(/name:\s*"([^"]+)"/g)) {
        if (m[1] !== 'TBA' && m[1].length > 1) names.add(m[1]);
      }
      idx = end + 1;
    }
  }

  const nameList = [...names];
  console.log(`Fetching photos for ${nameList.length} people (8 parallel)...\n`);

  const photoMap = await fetchBatch(nameList, 8);

  let found = 0, notFound = 0;
  for (const name of nameList) {
    if (photoMap[name]) found++; else notFound++;
    console.log(`${photoMap[name] ? '✓' : '✗'} ${name}`);
  }
  console.log(`\n${found} found, ${notFound} not found`);

  // Save JSON
  fs.writeFileSync(path.join(__dirname, 'cast-photos.json'), JSON.stringify(photoMap, null, 2));

  // Patch data file
  let patched = content;
  let patchCount = 0;
  for (const name of nameList) {
    const photo = photoMap[name];
    if (!photo) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(\\{\\s*name:\\s*"${escaped}"\\s*,\\s*role:\\s*"[^"]*")\\s*\\}`, 'g');
    const photoEsc = photo.replace(/"/g, '\\"');
    const newPatched = patched.replace(re, `$1, imageUrl: "${photoEsc}" }`);
    if (newPatched !== patched) { patchCount++; patched = newPatched; }
  }
  fs.writeFileSync(filePath, patched);
  console.log(`\nPatched ${patchCount} entries with imageUrl in data file`);
}

main().catch(console.error);
