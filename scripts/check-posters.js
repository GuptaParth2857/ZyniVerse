const fs = require('fs');
const content = fs.readFileSync('src/lib/live-action-anime.ts', 'utf8');
const lines = content.split('\n');
let currentId = '';
let currentTitle = '';
let foundPoster = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('id:')) {
    if (currentId && !foundPoster) {
      console.log('NO POSTER:', currentId, '-', currentTitle);
    }
    currentId = line.match(/id:\s*"([^"]*)"/)?.[1] || '';
    currentTitle = '';
    foundPoster = false;
  }
  if (line.startsWith('title:') && currentId) {
    currentTitle = line.match(/title:\s*"([^"]*)"/)?.[1] || '';
  }
  if (line.startsWith('posterUrl:') && currentId) {
    foundPoster = true;
  }
}
// Check last entry
if (currentId && !foundPoster) {
  console.log('NO POSTER:', currentId, '-', currentTitle);
}
