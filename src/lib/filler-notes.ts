export interface FillerArcNote {
  range: string;
  name: string;
  verdict: "watch" | "skip" | "optional";
  why: string;
}

export interface FillerShowNotes {
  intro: string;
  arcs: FillerArcNote[];
}

const NOTES: Record<string, FillerShowNotes> = {
  "naruto": {
    intro:
      "Original Naruto runs for 220 episodes, and its final third is famously padded. The key canon content ends with the Sasuke Retrieval arc, after which the anime stalls with a long block of standalone arcs. Those later arcs rarely touch the main story, so a filler guide saves you hours without missing a beat.",
    arcs: [
      { range: "26", name: "Dung Beetle / A Proud Failure", verdict: "skip", why: "A standalone excuse plot wedged between Land of Waves and the Chunin Exams. Nothing here matters later." },
      { range: "101-106", name: "Curry of Life", verdict: "skip", why: "Naruto, Ino and Shikamaru hunt a spicy curry recipe. Pure comedy filler with zero story relevance." },
      { range: "136-141", name: "Land of Rice Fields Investigation", verdict: "skip", why: "A forgettable mission arc during the post-Retrieval stall. Kiba and Naruto make noise, nothing moves forward." },
      { range: "142-147", name: "Kurosuki Family Removal", verdict: "skip", why: "A samey 'save the village from a gang' arc. Safe to skip for the main plot." },
      { range: "148-151", name: "Gantetsu Escort Mission", verdict: "skip", why: "Yet another escort-to-the-forest mission. Throwaway." },
      { range: "152-157", name: "Sunagakure Support", verdict: "optional", why: "Follows Temari and Kankuro, which some fans enjoy for the side-character time. Not essential." },
      { range: "178-183", name: "Star Guard Mission", verdict: "skip", why: "The infamous Peacock Method arc. Often cited as the low point of Part 1 filler." },
      { range: "197-201", name: "Konoha Plans Recapture Mission", verdict: "skip", why: "An extended chase arc that exists only to burn episodes before the finale." },
      { range: "203-207", name: "Yakumo Kurama Rescue", verdict: "optional", why: "A Genjutsu-focused arc with a twist. Some viewers like the horror tone; still fully skippable." },
      { range: "209-212", name: "Sora's Traitor Arc", verdict: "skip", why: "Late-inserted filler villain story that interferes with the pace right before the finish." },
    ],
  },
  "naruto-shippuden": {
    intro:
      "Naruto Shippuden has 203 fillers across its 500 episodes — roughly 41%. Many of its filler arcs are actually good, but none are required to follow the story. Watch the canon listed above, then cherry-pick the arcs below that match your taste (the Akatsuki-adjacent ones are the best).",
    arcs: [
      { range: "57-71", name: "Twelve Guardian Ninja", verdict: "watch", why: "A genuinely fun land-of-fire arc with real stakes and decent fights. The best early Shippuden filler." },
      { range: "91-112", name: "Three-Tails' Appearance", verdict: "optional", why: "An Akatsuki-centric arc with a Jinchuriki subplot. Feel the thirty percent filler; fine to skip." },
      { range: "144-151", name: "Six-Tails Unleashed", verdict: "watch", why: "Emotional and tightly paced — widely considered the best filler in the show." },
      { range: "170-171", name: "Quest for the Fourth Hokage's Legacy", verdict: "skip", why: "A two-part comedic adventure with little to say. Trivial." },
      { range: "176-196", name: "Past Arc: Locus of Konoha", verdict: "optional", why: "Flashback-driven slice-of-life set between arcs. Nice character moments but utterly skippable." },
      { range: "223-242", name: "Paradise Life on a Boat", verdict: "skip", why: "A long boat journey padding toward the war. Drains momentum — skip unless you love Jiraya's books." },
      { range: "257-260", name: "Sasuke Uchiha's Tale", verdict: "skip", why: "Flashback mini-arc about Team 7's past. Recap-heavy." },
      { range: "347-361", name: "Kakashi: Shadow of the ANBU Black Ops", verdict: "watch", why: "A full Kakashi backstory arc — essential for anyone who loves the character." },
      { range: "376-377", name: "Mecha Naruto", verdict: "optional", why: "Chibi comedy with a robot Naruto. Stupid on purpose; a fun palette cleanser." },
      { range: "394-413", name: "Friends' Paths / Second Chunin Exam", verdict: "optional", why: "A flashback to Part 1's exams with Konoha 11 focus. Fan service for character lovers." },
      { range: "422-423", name: "Young Konohamaru", verdict: "skip", why: "Short and forgettable." },
      { range: "427-450", name: "Jiraiya's Tale", verdict: "optional", why: "Alternate-universe novel adaptation. Long, but a treat if you love Jiraya's writing." },
      { range: "464-468", name: "Ashura and Indra", verdict: "watch", why: "Crucial lore for the back half — it's the reincarnation story in one arc." },
      { range: "480-483", name: "Childhood Days", verdict: "watch", why: "Wholesome epilogue scenes with pairings. A warm way to finish the series." },
    ],
  },
  "one-piece": {
    intro:
      "One Piece runs 1100+ episodes and filler is actually rare up front — but it concentrates in a few distinct arcs. The single filler arc fans actually recommend is G-8, which is so well written many people think it's canon. Everything else on the skip list is safe to jump.",
    arcs: [
      { range: "54-61", name: "Warship Island", verdict: "skip", why: "The very first One Piece filler, an island adventure with a dragon. Charming but pointless." },
      { range: "131-135", name: "Post-Alabasta", verdict: "skip", why: "Three filler episodes glued after the Alabasta climax. Lulls after the big win." },
      { range: "196-206", name: "G-8", verdict: "watch", why: "The legendary filler arc — a military-base infiltration with the crew pretending to be marines. Arguably better than some canon arcs." },
      { range: "225-228", name: "Foxy's Return", verdict: "skip", why: "A second Davy Back Fight that runs the comedy premise into the ground." },
      { range: "326-336", name: "Ice Hunter", verdict: "skip", why: "A cold-turkey island plot with a Devil Fruit gimmick. Safe to skip." },
      { range: "382-384", name: "Spa Island", verdict: "skip", why: "Fanservice filler. Prod." },
      { range: "426-429", name: "Navy Skypiea / Unluckies", verdict: "skip", why: "Scattered standalone episodes before Thriller Bark. Skip them all." },
      { range: "457-458", name: "Marine Prospective", verdict: "skip", why: "A Coby/Helmeppo side episode. Only for completionists." },
      { range: "575-578", name: "Little East Blue", verdict: "skip", why: "A 'what if the crew met early' mini-arc. Skip if you don't care for the nostalgia." },
    ],
  },
  "bleach": {
    intro:
      "Bleach has 46% filler, and it clusters into four big arcs that interrupt the main story at the worst possible times. If you only follow the manga canon episodes you get the complete Tite Kubo plot — the filler arcs below are isolated from it entirely.",
    arcs: [
      { range: "64-108", name: "The Bount Arc", verdict: "skip", why: "The infamous vampire-style arc that jumps in mid-Soul Society. Long, unrelated to the manga, and almost universally skipped." },
      { range: "128-137", name: "TheSealed Sword / pre-Arrancar", verdict: "skip", why: "A bridging mini-arc letting the manga get ahead. Safe to skip." },
      { range: "168-189", name: "The New Captain Shusuke Amagai", verdict: "skip", why: "A filler captain with a flame zanpakuto. Entirely outside the manga timeline." },
      { range: "228-266", name: "Zanpakuto Unknown Tales", verdict: "optional", why: "A 'parallel world' arc where zanpakuto spirits rebel. Some love the lore for bankai spirits; it's still 100% filler." },
      { range: "287", name: "Ikkaku & Renji: Back in the Docks", verdict: "skip", why: "A standalone comedy episode. Skip." },
      { range: "298-299", name: "Shinigami Cup", verdict: "skip", why: "Another standalone gag episode." },
      { range: "317-341", name: "Gotei 13 Invading Army", verdict: "skip", why: "A late, lengthy filler war with mod-souls. Often the breaking point for binge-watchers." },
    ],
  },
  "dragon-ball-z": {
    intro:
      "Dragon Ball Z filler is mostly short interstitial padding — a couple of episodes between major events rather than a single giant arc. None of it matters to the story. The good news: the two big exceptions referenced by fans are the Garlic Jr. arc and the Other World tournament, and both are listed below if you want them.",
    arcs: [
      { range: "108-117", name: "Garlic Jr. Saga", verdict: "optional", why: "A full movie-style saga inserted mid-Saiyan-fight downtime. Not canon, but action-packed." },
      { range: "195-199", name: "Other World Tournament", verdict: "optional", why: "Goku vs. dead strong guys in a tournament of the afterlife — the most-liked DBZ filler." },
      { range: "288-291", name: "Great Saiyaman filler block", verdict: "skip", why: "Light comedy padding before the Buu arc. Only if you like Gohan's high school era." },
    ],
  },
  "fairy-tail": {
    intro:
      "Fairy Tail mixes canon and anime-original content unusually freely, so a plain 'filler or not' split misses nuance. The two long, clearly-separable filler arcs are below — everything else marked filler is a scatter of one-offs inside otherwise-canon seasons.",
    arcs: [
      { range: "69-75", name: "Daphne", verdict: "skip", why: "A dragon-hunters arc set after the Laxus arc. Chunky and skippable." },
      { range: "125-150", name: "Key of the Starry Sky", verdict: "optional", why: "A 26-episode anime-original saga. Some enjoy the Oracion Seis return; it's long." },
      { range: "204-226", name: "Wolves / filler interstitials", verdict: "skip", why: "Scattered filler mixed with canon pacing. Follow the episode list above." },
    ],
  },
  "black-clover": {
    intro:
      "Black Clover cleaves sharply around episode 132: at that point the anime caught the manga and began running anime-original content. The stretch from there down to the actual manga climax is 'anime canon' — fine to watch if you want more screen time with the Bulls, but entirely skippable if you only want the written story.",
    arcs: [
      { range: "132-140", name: "Devil Banishers arc", verdict: "skip", why: "Anime-original triangle right before the real Devil arc begins. Padding." },
      { range: "141-158", name: "Anime-original filler block", verdict: "skip", why: "A long non-manga stretch about memories and a fake crisis. This is the section most guides tell you to jump." },
    ],
  },
  "hunter-x-hunter": {
    intro:
      "Hunter x Hunter (2011) is nearly filler-free — a rarity for a long shounen. There are no filler arcs at all, only a small handful of standalone episodes. That makes the series a clean watch-to-the-end experience.",
    arcs: [
      { range: "13", name: "Episode 13", verdict: "optional", why: "A recap-style standalone. Skip if you value time." },
      { range: "47", name: "Episode 47", verdict: "optional", why: "A one-off Hunter exam throwback. Skip." },
      { range: "61", name: "Episode 61", verdict: "optional", why: "A standalone comedy episode in the middle of Yorknew. Skip." },
    ],
  },
  "attack-on-titan": {
    intro:
      "Attack on Titan has essentially zero filler — every episode advances the mystery that keeps the show compelling. You can watch the entire 87-episode run end to end and skip nothing.",
    arcs: [],
  },
  "fullmetal-alchemist-brotherhood": {
    intro:
      "Fullmetal Alchemist: Brotherhood is a tight adaptation with almost no filler. The story never stalls, which is exactly why it was designed as a 64-episode complete run. Watch everything.",
    arcs: [],
  },
  "dragon-ball-super": {
    intro:
      "Dragon Ball Super runs 131 episodes and only a handful are filler — mostly recap or tournament appetizers. None forms a standalone arc, so you can safely watch straight through and just skip the episodes flagged below.",
    arcs: [
      { range: "3-4", name: "God of Destruction chit-chat", verdict: "skip", why: "Setup padding before the Beerus fight. Skip to the action." },
      { range: "22-24", name: "Copy Vegeta", verdict: "optional", why: "A fun Vegeta-in-the-shadow gag arc. Harmless and short." },
      { range: "70-72", name: "Dr. Slump / filler detours", verdict: "skip", why: "Comedy crossovers between tournament blocks. Skip for pace." },
    ],
  },
  "tokyo-ghoul": {
    intro:
      "Tokyo Ghoul's anime diverges from the manga sharply — most of season 2 ('Root A') and parts of season 3 are anime-original retellings rather than strict adaption. Filler guides for it focus on the episodes that are neither manga nor relevant, listed below.",
    arcs: [
      { range: "13-14", name: "OVA-style recap", verdict: "skip", why: "Recap episodes that pad the transition between seasons. Skip." },
      { range: "36-39", name: "Anime-original Root A tail", verdict: "optional", why: "Not in the manga — watch only if you want the anime's own ending to Tokyo Ghoul." },
      { range: "47-48", name: "Between Root A and root", verdict: "skip", why: "Transitional filler before the :re era. Skip." },
    ],
  },
  "detective-conan": {
    intro:
      "Detective Conan inverts the filler problem: nearly every episode is a self-contained case, and episodes flagged as 'anime original' are standalone mysteries with their own conclusions. None of them matter to the Black Organization arc that actually carries the long story.",
    arcs: [
      { range: "Any anime-original case", name: "Standalone mysteries", verdict: "optional", why: "Watch them as one-off episodes — they're complete whodunits and often great; skip them if you only want the BO mainline." },
    ],
  },
  "gintama": {
    intro:
      "Gintama is an episodic comedy where 'filler' versus 'canon' barely matters — every episode is mostly self-contained comedy with occasional dramatic arcs. Most Gintama fans just watch everything. Only a few recaps exist, listed below.",
    arcs: [
      { range: "Recap episodes", name: "Best-of recaps", verdict: "skip", why: "The handful of best-of compilation episodes. Harmless to skip." },
    ],
  },
  "boruto-naruto-next-generations": {
    intro:
      "Boruto is the most filler-heavy Naruto series of all: only a minority of its 290+ episodes adapt material from the manga, and huge stretches are 'anime canon' written for the show. Unlike Naruto and Shippuden there is no clean canon spine to follow, so use the episode list above and treat most non-manga blocks as optional — excellent if you want more time with the new gen, skippable if you want the main plot.",
    arcs: [
      { range: "See list above", name: "Anime-canon / filler blocks", verdict: "optional", why: "Most of Boruto is anime-original. The manga-adapted arcs matter; the rest can be skipped without losing the main story." },
    ],
  },
  "dragon-ball": {
    intro:
      "The original Dragon Ball is overwhelmingly faithful to Akira Toriyama's manga — the filler is a scatter of short gaps and training episodes rather than whole arcs. You can watch it start to finish and only lose a handful of episodes.",
    arcs: [
      { range: "See list above", name: "Scattered one-offs", verdict: "optional", why: "A handful of standalone episodes pad between story beats. Harmless to skip, harmless to keep." },
    ],
  },
  "dragon-ball-gt": {
    intro:
      "Dragon Ball GT is entirely anime-original — it has no manga source at all, so 'filler versus canon' doesn't apply in the usual way. Either you watch the whole thing as its own self-contained sequel or you skip it completely. Toriyama's actual continuation is Super, not GT.",
    arcs: [],
  },
  "dragon-ball-z-kai": {
    intro:
      "Dragon Ball Z Kai is the recut of DBZ built specifically to remove filler, so there is virtually nothing to skip — except a small number of episodes that are unique to Kai (mostly bridging or recap material added during production). Watch it through and you already have the tightest possible Z experience.",
    arcs: [
      { range: "See list above", name: "Kai-only additions", verdict: "optional", why: "A few episodes are unique to Kai rather than the manga or original anime. Safe to skip." },
    ],
  },
  "inuyasha": {
    intro:
      "Inuyasha runs 167 episodes, and a real chunk is anime-original — standalone demon hunts that don't advance the search for the Shikon jewel. The core Inuyasha/Kikyo/Naraku story is intact without them, though many of the filler monster-of-the-week episodes are fun on their own.",
    arcs: [
      { range: "See list above", name: "Anime-original hunts", verdict: "optional", why: "Standalone episodes written for the anime. Watch the ones that sound fun; the manga plot does not depend on any of them." },
    ],
  },
  "yu-gi-oh-duel-monsters": {
    intro:
      "Yu-Gi-Oh! Duel Monsters mainly adapts the manga, but three lengthy arcs were written for the anime to let the manga get ahead. All three sit fully outside the main Battle City → Pharaoh's Memory storyline, so you can skip straight through and still follow everything that matters.",
    arcs: [
      { range: "145-184", name: "Waking the Dragons (Doma)", verdict: "skip", why: "A giant anime-original arc about the Doma organization and the Legendary Dragons. Entirely separate from the manga plot." },
      { range: "185-199", name: "KC Grand Championship", verdict: "skip", why: "A filler tournament arc inserted before the final story stretch. Low stakes, no lasting consequences." },
      { range: "106-121", name: "Virtual World", verdict: "optional", why: "A virtual-reality detour between story beats. Some fans enjoy the duels; none of it is required." },
    ],
  },
  "d-gray-man": {
    intro:
      "D.Gray-man follows the manga closely for its first run and only drifts at the very end, where the anime catches up and writes its own resolution. Everything before that tail is worth watching in order.",
    arcs: [
      { range: "see list above", name: "Anime-original ending", verdict: "optional", why: "The final stretch departs from the manga. Watch it for closure, or continue with the manga instead." },
    ],
  },
  "soul-eater": {
    intro:
      "Soul Eater starts faithful to the manga and then splits off into a completely anime-original final act once it catches up to the source. The divergence point is around episode 36 — before that, watch everything.",
    arcs: [
      { range: "36-51", name: "Anime-original finale", verdict: "optional", why: "From roughly episode 36 the anime writes its own ending, which differs sharply from the manga. Watch for the anime's take or switch to the manga." },
    ],
  },
  "death-note": {
    intro:
      "Death Note has no filler at all — all 37 episodes drive Light and L's cat-and-mouse story forward. Watch every episode; there is nothing to skip.",
    arcs: [],
  },
  "claymore": {
    intro:
      "Claymore is a tight adaptation for most of its run, then invents an anime-original ending because the manga was still ongoing. Only the last few episodes leave the source material behind.",
    arcs: [
      { range: "24-26", name: "Anime-original ending", verdict: "optional", why: "The finale departs from the manga. Watch it to finish the anime, or read the manga for the canon conclusion." },
    ],
  },
  "trigun": {
    intro:
      "Trigun is a complete, self-contained adaptation rather than a panel-for-panel manga retelling, so 'filler' isn't really the right frame — there are no throwaway arcs to skip. The 1998 series tells its own version of Vash's story from start to finish.",
    arcs: [],
  },
  "gurren-lagann": {
    intro:
      "Tengen Toppa Gurren Lagann is an original anime with essentially no filler — with one exception. Episode 16 is a clip-show recap, and it is the only episode most guides tell you to skip.",
    arcs: [
      { range: "16", name: "Recap episode", verdict: "skip", why: "A mid-series clip show that reuses footage. Skip it and continue straight into the second half." },
    ],
  },
  "akame-ga-kill": {
    intro:
      "Akame ga Kill! adapts the manga for most of its run, then races to an anime-original ending once it overtakes the source. There's no filler padding along the way — only that final divergence.",
    arcs: [
      { range: "see list above", name: "Anime-original ending", verdict: "optional", why: "The last stretch departs from the manga and kills off characters differently. Watch the anime's version or read the manga." },
    ],
  },
  "vinland-saga": {
    intro:
      "Vinland Saga is a faithful, filler-free adaptation — every episode serves Thorfinn's arc. There is nothing to skip in either season.",
    arcs: [],
  },
  "berserk": {
    intro:
      "Berserk's 'filler' answer depends which version you mean. The 1997 anime is largely faithful to the Golden Age arc and adds very little, while later adaptations re-tell or skip material. There are no disposable filler arcs in the 1997 run.",
    arcs: [],
  },
  "nanatsu-no-taizai": {
    intro:
      "The Seven Deadly Sins adapts the manga across its seasons, but the anime's later stretches are notorious for anime-original padding and a clip-show recap. Follow the episode list above; the recap specials are pure skip.",
    arcs: [
      { range: "see list above", name: "Recap specials", verdict: "skip", why: "The series includes summary/recap specials between seasons. They add nothing new." },
    ],
  },
  "blue-exorcist": {
    intro:
      "Blue Exorcist follows the manga at first, then branches into a fully anime-original second half before the manga's own story was fully adapted elsewhere. The divergence begins around episode 16.",
    arcs: [
      { range: "16-25", name: "Anime-original finale", verdict: "optional", why: "The last chunk invents its own plotline. Watch it for the anime's ending or pick up the manga for the real continuation." },
    ],
  },
  "black-butler": {
    intro:
      "Black Butler's first season tracks the manga, then the show does something unusual: its entire second season is anime-original. Treat everything after the original run's close as its own invented story.",
    arcs: [
      { range: "25-36", name: "Anime-original second season", verdict: "skip", why: "Not from the manga and later contradicted by the canon continuations. Safely skipped unless you specifically want the invented arc." },
    ],
  },
  "a-certain-scientific-railgun": {
    intro:
      "A Certain Scientific Railgun mixes manga arcs with some anime-original episodes, but its most famous arcs are adaptations. There are no long throwaway filler sagas — the recommendations above cover the isolated ones.",
    arcs: [
      { range: "see list above", name: "Anime-original episodes", verdict: "optional", why: "A small number of standalone episodes written for the anime. Skippable without breaking the arc flow." },
    ],
  },
  "fate-zero": {
    intro:
      "Fate/Zero is a tightly plotted prequel with no filler whatsoever — all 25 episodes advance the Holy Grail War and its tragic end. Watch every episode.",
    arcs: [],
  },
  "clannad": {
    intro:
      "Clannad is a faithful visual-novel adaptation and has essentially no filler in its first season — every route feeds into the emotional payoff. Watch it straight through, then After Story.",
    arcs: [],
  },
  "clannad-after-story": {
    intro:
      "Clannad: After Story has no filler — it is the emotional core the first season sets up, and every episode matters. Watch it complete.",
    arcs: [],
  },
  "great-teacher-onizuka": {
    intro:
      "Great Teacher Onizuka (GTO) is mostly faithful to the manga with a handful of anime-original episodes. The comedy-and-redemption structure holds together without them, but none of them are a chore.",
    arcs: [
      { range: "see list above", name: "Anime-original episodes", verdict: "optional", why: "A few stand-alone episodes written for the anime. Watch or skip freely." },
    ],
  },
  "time-i-got-reincarnated-slime": {
    intro:
      "That Time I Got Reincarnated as a Slime is largely faithful and filler-free, with the notable exception of recap episodes that summarise the story so far. Those recaps are the main thing to skip.",
    arcs: [
      { range: "Recap episodes", name: "Season recaps", verdict: "skip", why: "Summary/clip episodes between cours that repeat earlier footage. Skip and continue the story." },
    ],
  },
  "rising-shield-hero": {
    intro:
      "The Rising of the Shield Hero is a straightforward, filler-free adaptation — and the recap episodes are the only padding. Watch the story arcs and skip the summaries.",
    arcs: [
      { range: "Recap episodes", name: "Recap specials", verdict: "skip", why: "Clip-show summaries that add nothing. Skip them." },
    ],
  },
  "mob-psycho-100": {
    intro:
      "Mob Psycho 100 has no filler to speak of — it's a punchy, tightly structured adaptation. Watch all of it.",
    arcs: [],
  },
  "kaiju-no8": {
    intro:
      "Kaiju No. 8 is a modern, tight adaptation with no filler episodes — it moves fast and every episode advances the story. Watch through.",
    arcs: [],
  },
  "made-abyss": {
    intro:
      "Made in Abyss has no filler — every episode deepens the descent and the dread. Watch everything.",
    arcs: [],
  },
  "goblin-slayer": {
    intro:
      "Goblin Slayer is a lean, filler-free adaptation. There are no episodes to skip.",
    arcs: [],
  },
  "seraph-end": {
    intro:
      "Seraph of the End adapts the manga fairly directly, though its second season uses more anime-original material to create a closing point. There are no disposable filler arcs early on.",
    arcs: [
      { range: "see list above", name: "Anime-original back half", verdict: "optional", why: "Season 2 leans on original material and an invented conclusion. Watch it for closure or continue with the manga." },
    ],
  },
  "demon-slayer-fifth-season": {
    intro:
      "Demon Slayer is famously filler-free — a glossy, direct adaptation of the manga. There is nothing to skip across its seasons.",
    arcs: [],
  },
  "spy-x-family-third-season": {
    intro:
      "Spy x Family is episodic by design, so 'filler' barely applies — the standalone family-comedy chapters are the point. There are no throwaway arcs to skip.",
    arcs: [],
  },
  "promised-neverland-second-season": {
    intro:
      "The Promised Neverland's second season is the cautionary tale: it skips large chunks of the manga and rushes to an anime-original ending. If you want the true story, read the manga after season 1.",
    arcs: [
      { range: "Season 2", name: "Compressed / anime-original", verdict: "optional", why: "Season 2 cuts major arcs and invents an ending. Watch only as a companion; the manga is the real continuation." },
    ],
  },
  "another": {
    intro:
      "Another is a self-contained 12-episode horror with no filler — every episode tightens the mystery. Watch all of it.",
    arcs: [],
  },
  "revolutionary-girl-utena": {
    intro:
      "Revolutionary Girl Utena is a deliberate, symbol-heavy classic with recap episodes rather than filler — the only thing most viewers skip is the mid-series recap.",
    arcs: [
      { range: "Recap episode", name: "Mid-series recap", verdict: "skip", why: "A single recap episode that reuses footage. Skip it and continue." },
    ],
  },
  "cardcaptor-sakura": {
    intro:
      "Cardcaptor Sakura is a magical-girl show where episodic card-hunting is the format, so anime-original episodes feel natural rather than like padding. Half the charm is in those stand-alone episodes.",
    arcs: [
      { range: "see list above", name: "Anime-original episodes", verdict: "optional", why: "Most are charming, self-contained card hunts. Watch for fun; the main romance arc doesn't depend on them." },
    ],
  },
  "your-lie-april": {
    intro:
      "Your Lie in April has no filler — it's a compact, emotionally driven story. Watch the whole thing.",
    arcs: [],
  },
  "fatestay-night": {
    intro:
      "Fate/stay night has several adaptation versions, and 'filler' depends which one you're watching — the 2006 Studio Deen series mixes routes and adds its own content, while later versions adapt more directly. Check which entry this list refers to before skipping.",
    arcs: [
      { range: "see list above", name: "Mixed-route additions", verdict: "optional", why: "The 2006 adaptation blends story routes and adds original material. It's optional viewing next to Fate/Zero and UBW." },
    ],
  },
};

export function getFillerNotes(slug: string): FillerShowNotes | null {
  return NOTES[slug] || null;
}