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
};

export function getFillerNotes(slug: string): FillerShowNotes | null {
  return NOTES[slug] || null;
}