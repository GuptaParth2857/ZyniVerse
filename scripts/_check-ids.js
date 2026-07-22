const themes = require('../src/lib/data/themes.ts').THEME_SONGS;

async function checkId(id) {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return false;
    const d = await r.json();
    return d.title || false;
  } catch { return false; }
}

async function main() {
  const uniqueIds = [...new Set(themes.filter(t => t.youtubeId).map(t => t.youtubeId))];
  console.log(`Checking ${uniqueIds.length} YouTube IDs...\n`);

  const valid = [];
  const invalid = [];
  
  // Check in batches of 5
  for (let i = 0; i < uniqueIds.length; i += 5) {
    const batch = uniqueIds.slice(i, i + 5);
    const results = await Promise.all(batch.map(async (id) => {
      const title = await checkId(id);
      return { id, title };
    }));
    
    for (const r of results) {
      if (r.title) {
        valid.push(r);
      } else {
        invalid.push(r.id);
      }
    }
    process.stdout.write(`  ${Math.min(i + 5, uniqueIds.length)}/${uniqueIds.length}\r`);
  }

  console.log(`\n\n=== VALID: ${valid.length}/${uniqueIds.length} ===`);
  console.log(`=== INVALID: ${invalid.length} ===`);
  if (invalid.length > 0) {
    console.log('\nInvalid IDs:');
    for (const id of invalid) {
      const songs = themes.filter(t => t.youtubeId === id);
      for (const s of songs) {
        console.log(`  ${id} → ${s.title} (${s.artist}) [${s.type}${s.sequence}]`);
      }
    }
  }
}

main();
