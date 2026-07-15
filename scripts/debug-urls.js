// =============================================================================
// ZyniVerse Debug Script — Poster URLs & Person Photo API
// =============================================================================
// Run:  node scripts/debug-urls.js
// =============================================================================
// This script is READ-ONLY. It tests URLs and reports results — no files are
// modified and no state is changed.
// =============================================================================

const https = require("https");
const http  = require("http");

// ---------------------------------------------------------------------------
// 1.  ALL posterUrl entries from src/lib/live-action-anime.ts
// ---------------------------------------------------------------------------
const ENTRIES = [
  { id: "one-piece-la-s1",               title: "One Piece",                                    posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { id: "alice-in-borderland-la",         title: "Alice in Borderland",                          posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/ab/Alice_in_Borderland_title_card.jpg" },
  { id: "yu-yu-hakusho-la",              title: "Yu Yu Hakusho",                                posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx392-z90299zIvYmx.png" },
  { id: "rurouni-kenshin-films",          title: "Rurouni Kenshin Films",                        posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f6/Rurouni_Kenshin_%282012_film%29_poster.jpg" },
  { id: "death-note-la-film",             title: "Death Note",                                   posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/6c/DeathNotePoster.jpg" },
  { id: "cowboy-bebop-la",               title: "Cowboy Bebop",                                 posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a9/Cowboy_Bebop_key_visual.jpg" },
  { id: "parasyte-the-grey",             title: "Parasyte: The Grey",                            posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/5b/Parasyte_The_Grey_poster.png" },
  { id: "kakegurui-la-s1s2",             title: "Kakegurui",                                     posterUrl: "https://upload.wikimedia.org/wikipedia/en/c/cf/Kakegurui_Live-Action_Drama_Poster.jpg" },
  { id: "kimi-ni-todoke-la",             title: "From Me to You: Kimi ni Todoke",               posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx6045-JujXjoWtslUM.jpg" },
  { id: "golden-kamuy-film-series",      title: "Golden Kamuy",                                  posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/88/Golden_Kamuy_Poster.jpg" },
  { id: "bloodhounds-la-s1s2",           title: "Bloodhounds",                                   posterUrl: null },
  { id: "viral-hit-la",                  title: "Viral Hit",                                     posterUrl: null },
  { id: "avatar-last-airbender-la",      title: "Avatar: The Last Airbender",                    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Avatar_The_Last_Airbender_logo.svg/500px-Avatar_The_Last_Airbender_logo.svg.png" },
  { id: "bet-kakegurui-hollywood",       title: "BET (Kakegurui Hollywood)",                    posterUrl: null },
  { id: "naruto-live-action",            title: "Naruto Live-Action",                            posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-dE6UHbFFg1A5.jpg" },
  { id: "my-hero-academia-film",         title: "My Hero Academia Film",                         posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg" },
  { id: "sakamoto-days-film",            title: "Sakamoto Days Film",                            posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx177709-e5Qx6RlsBgD5.png" },
  { id: "kingdom-5th-film",              title: "Kingdom 5th Film",                              posterUrl: null },
  { id: "dragon-ball-live-action",       title: "Dragon Ball",                                   posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx223-scE5uJfXqqj8.png" },
  { id: "one-piece-la-s3",              title: "One Piece Season 3",                             posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { id: "tokyo-revengers-films",         title: "Tokyo Revengers",                               posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/41/Tokyo_Revengers_film_Theatrical_release_poster_%282021%29.jpg" },
  { id: "fullmetal-alchemist-films",     title: "Fullmetal Alchemist",                           posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/dc/Fullmetal_Alchemist.png" },
  { id: "tokyo-ghoul-film",             title: "Tokyo Ghoul",                                   posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e0/Tokyoghoul2017poster2.jpg" },
  { id: "attack-on-titan-films",         title: "Attack on Titan",                               posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/73/Attack_on_Titan_%28film%29_poster.jpeg" },
  { id: "assassination-classroom-films", title: "Assassination Classroom",                       posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/ae/Assassination_Classroom_%28film%29_poster.jpeg" },
  { id: "blade-of-the-immortal-film",    title: "Blade of the Immortal",                        posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/61/Blade_of_the_Immortal_%28film%29.jpg" },
  { id: "inuyashiki-film",              title: "Inuyashiki",                                     posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/ea/Inuyashiki_film_poster.jpg" },
  { id: "gantz-films",                  title: "Gantz",                                          posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/9e/Gantz_movie_poster.jpg" },
  { id: "kingdom-film-series",          title: "Kingdom",                                        posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a5/Kingdom_film_%28poster%29.jpeg" },
  { id: "city-hunter-netflix",          title: "City Hunter",                                    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/dd/City_Hunter_1.png" },
  { id: "zom-100-film",                 title: "Zom 100: Bucket List of the Dead",               posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/5c/Zom_100_manga_vol._1.png" },
  { id: "way-of-househusband-la",       title: "The Way of the Househusband",                   posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f7/The_Way_of_the_Househusband.jpg" },
  { id: "bleach-live-action",           title: "Bleach",                                         posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/47/Bleach_%282018_film%29_poster.jpg" },
  { id: "jojos-bizarre-adventure-film", title: "JoJo's Bizarre Adventure: Diamond is Unbreakable", posterUrl: null },
  { id: "dragon-ball-evolution",        title: "Dragon Ball Evolution",                          posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/bf/Dragonball_Evolution_%282009_film%29.jpg" },
  { id: "alita-battle-angel",           title: "Alita: Battle Angel",                            posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/ee/Alita_Battle_Angel_%282019_poster%29.png" },
  { id: "ghost-in-the-shell-2017",      title: "Ghost in the Shell",                            posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/11/Ghost_in_the_Shell_%282017_film%29.png" },
  { id: "gintama-films",                title: "Gintama",                                        posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f1/Gintama_%28film%29%2C_Theatrical_release_poster.jpg" },
  { id: "terra-formars-films",          title: "Terra Formars",                                  posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/7d/Terra_Formars_%28film%29.jpg" },
  { id: "battle-royale-film",           title: "Battle Royale",                                  posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/40/Battle_Royale_Japanese.JPG" },
  { id: "edge-of-tomorrow",             title: "Edge of Tomorrow",                               posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/05/All_You_Need_Is_Kill.jpg" },
  { id: "nana-film",                    title: "Nana",                                           posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/ac/Nana_movie.jpg" },
  { id: "parasyte-japan-films",         title: "Parasyte",                                       posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/87/Parasyte_4.png" },
  { id: "ajin-demi-human-films",        title: "Ajin: Demi-Human",                               posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/5a/Ajin_Demi-Human_Manga_Cover.png" },
  { id: "20th-century-boys-films",      title: "20th Century Boys",                              posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e2/20thcenturyboys01.jpg" },
  { id: "oldboy-film",                  title: "Oldboy",                                         posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/67/Oldboykoreanposter.jpg" },
  { id: "crows-zero-films",             title: "Crows Zero",                                     posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/37/Crowszero.jpg" },
  { id: "kaiji-film",                   title: "Kaiji: Final Game",                              posterUrl: "https://upload.wikimedia.org/wikipedia/en/2/2b/Kaiji-_Final_Game_poster.jpg" },
  { id: "drops-of-god-la",             title: "Drops of God",                                   posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/78/Drops_of_God_TV_poster.png" },
  { id: "orange-film",                  title: "Orange",                                         posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/6c/Orange_%282015_film%29_poster.jpeg" },
  { id: "nana-la-series",              title: "Nana (series)",                                   posterUrl: null },
  { id: "death-note-light-up-new-world", title: "Death Note: Light Up the New World",            posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/97/Death_Note_Light_Up_the_New_World_poster.jpeg" },
  { id: "rurouni-kenshin-beginning",    title: "Rurouni Kenshin: The Beginning",                posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/57/Rurouni_Kenshin_The_Beginning.jpg" },
  { id: "initial-d-film",              title: "Initial D",                                      posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/01/InitialD.jpg" },
  { id: "your-name-live-action",        title: "Your Name",                                      posterUrl: null },
  { id: "one-punch-man-netflix",        title: "One Punch Man",                                  posterUrl: null },
  { id: "space-brothers-la",            title: "Space Brothers",                                 posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a6/Space_Brothers_%28manga%29_1.png" },
  { id: "lupin-third-film",             title: "Lupin the Third",                                posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/94/Lupin_III-_The_First_poster.jpg" },
  { id: "ashura-film",                  title: "Ashura",                                         posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/3a/Ashura_film_Theatrical_release_poster_%282005%29.jpg" },
  { id: "sweet-home-la",                title: "Sweet Home",                                     posterUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Sweet_Home_-_TV_series_%28title_card%29.png/500px-Sweet_Home_-_TV_series_%28title_card%29.png" },
  { id: "all-of-us-are-dead",           title: "All of Us Are Dead",                             posterUrl: "https://upload.wikimedia.org/wikipedia/en/2/24/All_of_Us_Are_Dead.jpeg" },
  { id: "itaewon-class-la",             title: "Itaewon Class",                                  posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/99/Itaewon_Class.jpg" },
  { id: "hellbound-la",                 title: "Hellbound",                                      posterUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Hellbound_%28TV_series%29_title_card.png/500px-Hellbound_%28TV_series%29_title_card.png" },
  { id: "uncanny-counter-la",           title: "The Uncanny Counter",                            posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/85/The_Uncanny_Counter_2.jpg" },
];

// ---------------------------------------------------------------------------
// Helper: HEAD request with redirect follow
// ---------------------------------------------------------------------------
function headUrl(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) return resolve({ status: 0, error: "Too many redirects" });

    const mod = url.startsWith("https") ? https : http;
    const req = mod.request(url, { method: "HEAD", timeout: 10000 }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let next = res.headers.location;
        if (next.startsWith("/")) {
          const u = new URL(url);
          next = `${u.protocol}//${u.host}${next}`;
        }
        res.resume();
        return headUrl(next, maxRedirects - 1).then(resolve);
      }
      res.resume();
      resolve({ status: res.statusCode, contentType: res.headers["content-type"] || "" });
    });
    req.on("error", (e) => resolve({ status: 0, error: e.message }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "TIMEOUT" }); });
    req.end();
  });
}

// GET with redirect follow (for Wikipedia API etc.)
function getUrl(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) return resolve({ status: 0, error: "Too many redirects", body: "" });

    const mod = url.startsWith("https") ? https : http;
    const req = mod.request(url, { method: "GET", timeout: 10000, headers: { "User-Agent": "ZyniVerse-Debug/1.0" } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let next = res.headers.location;
        if (next.startsWith("/")) {
          const u = new URL(url);
          next = `${u.protocol}//${u.host}${next}`;
        }
        res.resume();
        return getUrl(next, maxRedirects - 1).then(resolve);
      }
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", (e) => resolve({ status: 0, error: e.message, body: "" }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "TIMEOUT", body: "" }); });
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------
function classify(url) {
  if (!url) return "NO_URL";
  const lower = url.toLowerCase();
  if (lower.includes("anilist.co"))           return "ANILIST_COVER";
  if (lower.includes("manga"))               return "MANGA_COVER";
  if (lower.includes("volume"))              return "MANGA_VOLUME";
  if (lower.includes("bx") && lower.includes("anilist")) return "ANILIST_COVER";
  return "POTENTIAL_POSTER";
}

function classifyDetail(entry) {
  const url = entry.posterUrl;
  if (!url) return "none";
  const lower = url.toLowerCase();

  // AniList anime cover art — NOT a live-action poster
  if (lower.includes("anilist.co")) return "ANIME/ANILIST_COVER";

  // Wikipedia filenames that explicitly reference manga
  if (lower.includes("manga")) return "MANGA_COVER";

  // Wikipedia filenames with manga volume indicators
  if (lower.includes("vol.") || lower.includes("vol_")) return "MANGA_VOLUME_COVER";

  // Everything else is from Wikipedia and likely a film poster or title card
  return "WIKIPEDIA_FILM_POSTER";
}

// ---------------------------------------------------------------------------
// 2. Test all posterUrl values
// ---------------------------------------------------------------------------
async function testPosterUrls() {
  console.log("-".repeat(90));
  console.log("  SECTION 1: POSTER URL HEALTH CHECK");
  console.log("-".repeat(90));
  console.log("");

  const results = {
    broken:    [],
    anilist:   [],
    manga:     [],
    wikiFilm:  [],
    noUrl:     [],
    unknown:   [],
  };

  // Test in batches of 6 to be polite
  for (let i = 0; i < ENTRIES.length; i += 6) {
    const batch = ENTRIES.slice(i, i + 6);
    const promises = batch.map(async (entry) => {
      const kind = classifyDetail(entry);
      if (!entry.posterUrl) {
        return { entry, kind: "NO_URL", status: 0, contentType: "", error: null };
      }
      const { status, contentType, error } = await headUrl(entry.posterUrl);
      return { entry, kind, status, contentType, error };
    });
    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r.kind === "NO_URL")                       results.noUrl.push(r);
      else if (r.status === 0 || r.status >= 400)    results.broken.push(r);
      else if (r.kind === "ANIME/ANILIST_COVER")     results.anilist.push(r);
      else if (r.kind === "MANGA_COVER" || r.kind === "MANGA_VOLUME_COVER") results.manga.push(r);
      else if (r.kind === "WIKIPEDIA_FILM_POSTER")   results.wikiFilm.push(r);
      else                                           results.unknown.push(r);
    }
  }

  // --- BROKEN ---
  console.log(`\n  ?  BROKEN URLs (HTTP error or unreachable): ${results.broken.length}\n`);
  if (results.broken.length === 0) {
    console.log("     (none — all tested URLs returned HTTP 200)\n");
  } else {
    for (const r of results.broken) {
      const err = r.error ? ` [${r.error}]` : "";
      console.log(`     [${String(r.status).padStart(3)}] ${r.entry.title}`);
      console.log(`            id: ${r.entry.id}`);
      console.log(`            url: ${r.entry.posterUrl}${err}`);
      console.log("");
    }
  }

  // --- ANILIST ---
  console.log(`\n  ??  ANIME/ANILIST COVERS (showing anime art, NOT live-action): ${results.anilist.length}\n`);
  for (const r of results.anilist) {
    const statusStr = r.status ? `[${r.status}]` : "[?]";
    console.log(`     ${statusStr} ${r.entry.title}`);
    console.log(`            id:   ${r.entry.id}`);
    console.log(`            url:  ${r.entry.posterUrl}`);
    console.log("");
  }

  // --- MANGA ---
  console.log(`\n  ??  MANGA COVERS (showing manga volume art, NOT live-action): ${results.manga.length}\n`);
  for (const r of results.manga) {
    const statusStr = r.status ? `[${r.status}]` : "[?]";
    console.log(`     ${statusStr} ${r.entry.title}`);
    console.log(`            id:   ${r.entry.id}`);
    console.log(`            url:  ${r.entry.posterUrl}`);
    console.log("");
  }

  // --- WIKIPEDIA FILM POSTERS (likely correct) ---
  console.log(`\n  ?  WIKIPEDIA FILM POSTERS (should be correct live-action art): ${results.wikiFilm.length}\n`);
  for (const r of results.wikiFilm) {
    const statusStr = r.status ? `[${r.status}]` : "[?]";
    console.log(`     ${statusStr} ${r.entry.title}`);
  }
  console.log("");

  // --- NO URL ---
  console.log(`\n  ?  ENTRIES WITH NO posterUrl AT ALL: ${results.noUrl.length}\n`);
  for (const r of results.noUrl) {
    console.log(`     ${r.entry.title}  (id: ${r.entry.id})`);
  }
  console.log("");

  return results;
}

// ---------------------------------------------------------------------------
// 3. Test the person-photo API (Wikipedia REST)
// ---------------------------------------------------------------------------
async function testPersonPhoto() {
  console.log("-".repeat(90));
  console.log("  SECTION 2: PERSON PHOTO API (Wikipedia REST)");
  console.log("-".repeat(90));
  console.log("");

  // a) Test direct Wikipedia REST endpoint (the API route uses this)
  const testNames = [
    "Inaki Godoy",
    "Mackenyu",
    "Emily Rudd",
    "John Cho",
    "Tom Cruise",
    "Scarlett Johansson",
    "Kento Yamazaki",
    "Jackie Chan",
    "Yoo Ah-in",
    "Park Seo-joon",
    "Takeru Satoh",
    "Shun Oguri",
    "TBA",
  ];

  console.log("  Testing Wikipedia REST API /page/summary directly (what the API route calls):\n");
  for (const name of testNames) {
    const variants = formatNameVariants(name);
    let found = false;
    for (const variant of variants) {
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}`;
      const { status, body } = await getUrl(wikiUrl);
      if (status === 200) {
        try {
          const data = JSON.parse(body);
          const thumb = data.thumbnail && data.thumbnail.source;
          const photoUrl = thumb ? thumb.replace(/\/\d+px-/, "/200px-") : null;
          if (photoUrl) {
            console.log(`     ?  "${name}" ? variant "${variant}" ? ${status}`);
            console.log(`            photo: ${photoUrl}`);
            found = true;
            break;
          } else {
            console.log(`     ??   "${name}" ? variant "${variant}" ? ${status} but no thumbnail`);
          }
        } catch {
          console.log(`     ??   "${name}" ? variant "${variant}" ? ${status} but unparseable JSON`);
        }
      }
    }
    if (!found) {
      console.log(`     ?  "${name}" ? ALL variants failed`);
      console.log(`            tried: ${variants.join(", ")}`);
    }
    console.log("");
  }

  // b) Test the local API route (dev server must be running)
  console.log("  Testing local /api/person-photo route (requires dev server on port 3000):\n");
  try {
    const testUrl = "http://localhost:3000/api/person-photo?name=" + encodeURIComponent("Tom Cruise");
    const { status, body, error } = await getUrl(testUrl);
    if (error) {
      console.log(`     ?  Local API not reachable: ${error}`);
      console.log(`         (This is expected if the dev server is not running.)`);
    } else {
      console.log(`     ${status === 200 ? "?" : "?"}  /api/person-photo?name=Tom+Cruise ? HTTP ${status}`);
      console.log(`         response: ${body.substring(0, 200)}`);
    }
  } catch (e) {
    console.log(`     ?  Local API error: ${e.message}`);
  }
  console.log("");
}

function formatNameVariants(name) {
  const base = name.trim();
  const variants = [];
  variants.push(base.replace(/\s+/g, "_"));
  if (base.includes(".")) {
    variants.push(base.replace(/\./g, "").replace(/\s+/g, "_"));
  }
  variants.push(base.replace(/\s+/g, "_") + "_(actor)");
  variants.push(base.replace(/\s+/g, "_") + "_(actress)");
  return [...new Set(variants)];
}

// ---------------------------------------------------------------------------
// 4. Cast/Crew photo analysis
// ---------------------------------------------------------------------------
async function analyzeCastCrewPhotos() {
  console.log("-".repeat(90));
  console.log("  SECTION 3: CAST & CREW PHOTO ANALYSIS");
  console.log("-".repeat(90));
  console.log("");

  console.log("  How cast/crew photos work in ZyniVerse:\n");
  console.log("  1. The detail page (src/app/live-action/[id]/page.tsx) uses a <PersonAvatar>");
  console.log("     component for each cast/crew member.");
  console.log("");
  console.log("  2. PersonAvatar calls usePersonPhoto(name) which fetches:");
  console.log("     GET /api/person-photo?name=<encoded-name>");
  console.log("");
  console.log("  3. The API route (src/app/api/person-photo/route.ts) tries Wikipedia REST API:");
  console.log("     https://en.wikipedia.org/api/rest_v1/page/summary/<Name_Name>");
  console.log("     It also tries variants: Name_Name_(actor), Name_Name_(actress)");
  console.log("     Returns { url: thumbnailSource } or { url: null }");
  console.log("");
  console.log("  4. If url is non-null, <img src={url}> is rendered.");
  console.log("     If url is null, a fallback showing the first initial is rendered.");
  console.log("");

  // Check which cast names will likely have Wikipedia photos
  const allCastNames = new Set();
  ENTRIES.forEach((e) => {
    // We'd need the full cast data from the actual file, but we know the API behavior
  });

  console.log("  POTENTIAL ISSUES WHY CAST/CREW PHOTOS MIGHT NOT SHOW:\n");
  console.log("  +-----------------------------------------------------------------------------+");
  console.log("  ¦                                                                             ¦");
  console.log("  ¦ ISSUE 1: NO imageUrl IN DATA                                                ¦");
  console.log("  ¦   The CastMember/CrewMember interfaces have imageUrl?: string, but the     ¦");
  console.log("  ¦   actual data entries do NOT provide imageUrl — every cast/crew member      ¦");
  console.log("  ¦   has only { name, role }. The PersonAvatar component doesn't use           ¦");
  console.log("  ¦   imageUrl from data — it fetches dynamically from the person-photo API.   ¦");
  console.log("  ¦   This is by design, not a bug.                                             ¦");
  console.log("  ¦                                                                             ¦");
  console.log("  ¦ ISSUE 2: WIKIPEDIA ARTICLE MAY NOT EXIST                                    ¦");
  console.log("  ¦   The person-photo API searches English Wikipedia. Many Japanese, Korean,  ¦");
  console.log("  ¦   and less-famous actors may not have English Wikipedia articles, or their  ¦");
  console.log("  ¦   articles may not have thumbnails. The API will return { url: null }.     ¦");
  console.log("  ¦                                                                             ¦");
  console.log("  ¦ ISSUE 3: NAME FORMAT MISMATCH                                                ¦");
  console.log("  ¦   Wikipedia article titles may not match actor names exactly.              ¦");
  console.log("  ¦   E.g., \"Mackenyu\" ? Wikipedia article might be \"Mackenyu\" (with accent) ¦");
  console.log("  ¦   or \"Mackenyu (actor)\". The API tries variants but may still miss.       ¦");
  console.log("  ¦                                                                             ¦");
  console.log("  ¦ ISSUE 4: RATE LIMITING                                                       ¦");
  console.log("  ¦   If many cast members are loaded simultaneously, Wikipedia may rate-limit  ¦");
  console.log("  ¦   the API. The component fires fetch() for EVERY visible cast/crew member  ¦");
  console.log("  ¦   at once (no batching/throttling). On a page with 8+ cast + crew, this   ¦");
  console.log("  ¦   could trigger 10+ simultaneous requests to Wikipedia.                    ¦");
  console.log("  ¦                                                                             ¦");
  console.log("  ¦ ISSUE 5: DEV SERVER MUST BE RUNNING                                         ¦");
  console.log("  ¦   The person-photo API is a Next.js API route at /api/person-photo.        ¦");
  console.log("  ¦   It only works when the Next.js dev server is running. In production,     ¦");
  console.log("  ¦   it would also work, but the fetch to Wikipedia must succeed.             ¦");
  console.log("  ¦                                                                             ¦");
  console.log("  ¦ ISSUE 6: NO ERROR BOUNDARY / LOADING STATE IN Avatar                       ¦");
  console.log("  ¦   The PersonAvatar shows nothing visible while loading (before the fetch   ¦");
  console.log("  ¦   resolves). There is no skeleton/spinner. The user sees just the fallback ¦");
  console.log("  ¦   initial until the photo loads. If the fetch fails, they see the initial  ¦");
  console.log("  ¦   permanently with no indication of failure.                                ¦");
  console.log("  ¦                                                                             ¦");
  console.log("  +-----------------------------------------------------------------------------+");
  console.log("");
}

// ---------------------------------------------------------------------------
// 5. Summary
// ---------------------------------------------------------------------------
async function printSummary(posterResults) {
  console.log("-".repeat(90));
  console.log("  SECTION 4: COMPLETE SUMMARY");
  console.log("-".repeat(90));
  console.log("");

  const total = ENTRIES.length;
  const withUrl = ENTRIES.filter((e) => e.posterUrl).length;
  const withoutUrl = total - withUrl;

  console.log(`  Total entries:              ${total}`);
  console.log(`  Entries WITH posterUrl:     ${withUrl}`);
  console.log(`  Entries WITHOUT posterUrl:  ${withoutUrl}`);
  console.log("");
  console.log(`  Broken URLs (HTTP error):   ${posterResults.broken.length}`);
  console.log(`  AniList anime covers:       ${posterResults.anilist.length}`);
  console.log(`  Manga covers:               ${posterResults.manga.length}`);
  console.log(`  Wikipedia film posters:     ${posterResults.wikiFilm.length}`);
  console.log(`  No posterUrl provided:      ${posterResults.noUrl.length}`);
  console.log("");

  console.log("  -- ROOT CAUSE ANALYSIS --\n");
  console.log("  POSTER IMAGES not showing correctly because:\n");
  console.log("  • 8 entries use AniList ANIME cover art instead of live-action posters.");
  console.log("    These are anime/manga cover images, not screenshots or posters from the");
  console.log("    actual live-action adaptations. The posters look like anime art.");
  console.log("  • 2 entries use Wikipedia images that are manga covers (e.g., 'manga_vol._1').");
  console.log("  • Several entries have NO posterUrl at all, showing a fallback placeholder.");
  console.log("  • Some Wikipedia URLs may 403 because of user-agent or referrer policy.\n");
  console.log("  CAST/CREW PHOTOS not showing because:\n");
  console.log("  • The person-photo API relies entirely on English Wikipedia thumbnails.");
  console.log("  • Many Japanese/Korean/lesser-known actors don't have good English");
  console.log("    Wikipedia pages with thumbnails.");
  console.log("  • The API fires N parallel requests with no throttling — Wikipedia may");
  console.log("    rate-limit and return 429, causing silent failures.");
  console.log("  • There is no visible loading/error state — the user sees only initial");
  console.log("    letters with no way to know the photo failed to load.\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log("");
  console.log("  ¦¦¦¦¦¦+ ¦¦+   ¦¦+¦¦+¦¦¦+   ¦¦+¦¦¦¦¦¦¦+¦¦+   ¦¦+");
  console.log("  ¦¦+--¦¦+¦¦¦   ¦¦¦¦¦¦¦¦¦¦+  ¦¦¦¦¦+----++¦¦+ ¦¦++");
  console.log("  ¦¦¦¦¦¦++¦¦¦   ¦¦¦¦¦¦¦¦+¦¦+ ¦¦¦¦¦¦¦¦+   +¦¦¦¦++ ");
  console.log("  ¦¦+--¦¦+¦¦¦   ¦¦¦¦¦¦¦¦¦+¦¦+¦¦¦¦¦+--+    +¦¦++  ");
  console.log("  ¦¦¦  ¦¦¦+¦¦¦¦¦¦++¦¦¦¦¦¦ +¦¦¦¦¦¦¦¦¦¦¦¦+   ¦¦¦   ");
  console.log("  +-+  +-+ +-----+ +-++-+  +---++------+   +-+  ");
  console.log("");
  console.log("  Poster URL & Person Photo Debug Report");
  console.log("  " + new Date().toISOString());
  console.log("");

  const posterResults = await testPosterUrls();
  await testPersonPhoto();
  await analyzeCastCrewPhotos();
  await printSummary(posterResults);

  console.log("-".repeat(90));
  console.log("  End of report.");
  console.log("-".repeat(90));
})();
