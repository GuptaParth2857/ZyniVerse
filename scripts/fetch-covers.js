const titles = [
  "One Piece", "Alice in Borderland", "Yu Yu Hakusho",
  "Rurouni Kenshin", "Death Note", "Cowboy Bebop",
  "Parasyte", "Kakegurui", "Kimi ni Todoke",
  "Golden Kamuy", "Bloodhounds", "Avatar The Last Airbender",
  "Naruto", "My Hero Academia", "Sakamoto Days",
  "Kingdom", "Dragon Ball", "Terra Formars"
];

async function fetchCover(search) {
  const query = `query { Media(search: "${search}", type: ANIME) { id title { romaji english } coverImage { large } } }`;
  const r = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const d = await r.json();
  const m = d.data?.Media;
  if (!m) return null;
  return { search, title: m.title.english || m.title.romaji, id: m.id, image: m.coverImage?.large };
}

(async () => {
  for (const t of titles) {
    try {
      const r = await fetchCover(t);
      if (r) console.log(`${r.search} | ${r.id} | ${r.image}`);
      else console.log(`${t} | NOT FOUND`);
    } catch (e) {
      console.log(`${t} | ERROR: ${e.message}`);
    }
  }
})();
