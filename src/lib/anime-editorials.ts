// ─────────────────────────────────────────────────────────────────────────
// ZyniVerse Editorial — original, per-anime written content.
//
// Why this exists:
//  ● Anime detail pages pull their synopsis/description from AniList, so that
//    text is duplicated across thousands of sites. Google treats it as thin /
//    auto-generated content → pages stay "crawled-not-indexed" and AdSense
//    flags the site for "Low Value Content".
//  ● This file is the fix: each entry is original editorial writing — our
//    honest verdict, what's actually worth your time, and Indian-audience
//    notes (dub availability, pacing, filler). Hand-written, unique, specific.
//
// How to add/edit:
//  ● Key = lowercased English (romaji) title, e.g. one piece, naruto, bleach.
//  ● Add an entry here and it renders automatically on /anime/{id} the moment
//    the resolved anime's title matches. Nothing else to change.
//  ● Keep the writing genuinely specific to THAT show — no copy-paste generic
//    blurbs. One unique paragraph + 2 realistic highlights beats five sentences
//    of filler.
// ─────────────────────────────────────────────────────────────────────────

export interface AnimeEditorial {
  /** Our rating out of 5 (shows as e.g. 4.5 / 5). */
  rating: number;
  /** Short human label for the rating chip, e.g. "Masterpiece", "Must Watch". */
  ratingLabel: string;
  /** 2–4 sentence original verdict. Unique to this show. */
  verdict: string;
  /** 2–4 specific "why you'll stay" highlights. */
  highlights: string[];
  /** Indian-audience notes: dub availability, pacing, where to start. */
  indianNote: string;
  /** Optional: Hindi / Tamil / Telugu dub availability info shown as badges. */
  dubStatus?: {
    hindi?: string;
    tamil?: string;
    telugu?: string;
  };
}

// Keyed by lowercased romaji title.
export const ANIME_EDITORIALS: Record<string, AnimeEditorial> = {
  "one piece": {
    rating: 5,
    ratingLabel: "Legendary",
    verdict:
      "One Piece isn't just the longest-running shonen — it's the one that earns every one of its 1000+ episodes. Oda writes the kind of slow-burn, payoff-rich arcs (Enies Lobby, Marineford, Wano) that most series can only dream of. Start with the manga if you can; if you insist on anime, watch it with the filler list open so the pacing never kills the hype.",
    highlights: [
      "Characters that actually grow — Luffy's crew is family, not a gimmick",
      "Foreshadowing rewards patient viewers from episode one",
    ],
    indianNote:
      "Hindi dub is sparse and years behind, so most Indian fans watch subtitled. Arcs are long — don't binge more than an arc at a time. Use our One Piece filler page to skip the 5% filler that pads the early arcs.",
    dubStatus: {
      hindi: "Limited, very few arcs",
      tamil: "Early arcs only",
      telugu: "Early arcs only",
    },
  },
  naruto: {
    rating: 4.5,
    ratingLabel: "Must Watch",
    verdict:
      "Naruto is the coming-of-age battle classic — Chunin Exams and Sasuke Retrieval arcs are as good as shonen gets. The filler is infamous, so use the skip guide or you'll hit 90 consecutive filler episodes in a row. The war arc drags, but the character payoff in the finale is worth the grind.",
    highlights: [
      "Sasuke Retrieval arc — peak 2000s shonen choreography",
      "A supporting cast (Shikamaru, Gaara, Rock Lee) that steals whole arcs",
    ],
    indianNote:
      "The Hindi dub is beloved in India — genuinely good VA casting that most of us grew up on. Start at episode 1 and skip straight to the filler list to keep it tight.",
    dubStatus: {
      hindi: "Complete Hindi dub available",
      tamil: "Partial",
      telugu: "Partial",
    },
  },
  "dragon ball z": {
    rating: 4.5,
    ratingLabel: "Must Watch",
    verdict:
      "Dragon Ball Z is the show that built modern anime's obsession with transformations — Super Saiyan still gives chills three decades later. The pacing is 1990s-filler-heavy (the Namek arc drags horribly), but the Frieza and Cell sagas are iconic. Skip the sagas you can and use the filler guide; the core fights have aged beautifully.",
    highlights: [
      "Frieza saga — anime's most iconic villain arc",
      "Super Saiyan transformation that changed the genre forever",
    ],
    indianNote:
      "The Hindi dub is legendary in India — almost every 90s kid grew up on the Cartoon Network Hindi broadcast. Nostalgia factor is through the roof; the filler list keeps it bingeable.",
    dubStatus: {
      hindi: "Complete Hindi dub",
      tamil: "Partial",
      telugu: "Partial",
    },
  },
  "dragon ball super": {
    rating: 4,
    ratingLabel: "Great",
    verdict:
      "Dragon Ball Super brings the saga back with Beerus, the Tournament of Power and the fan-favourite Goku Black arc. It's lighter and comfier than Z — the animation dips mid-series but the Tournament of Power finale is top-tier spectacle. A must for anyone who outgrew Z but still loves the gang.",
    highlights: [
      "Tournament of Power — 48 teams, one arena, pure chaos",
      "Goku Black arc — genuinely tense, best Super storyline",
    ],
    indianNote:
      "Hindi dub exists for Super and is good — the same beloved VA cast returns. New canon is ongoing (the Super Hero movie and manga continuity split opinions).",
    dubStatus: {
      hindi: "Complete Hindi dub",
      tamil: "No",
      telugu: "No",
    },
  },
  "tokyo ghoul": {
    rating: 4,
    ratingLabel: "Great",
    verdict:
      "Tokyo Ghoul starts as a brilliant psychological horror — Kaneki's descent into ghoulhood is gripping and the first season is near-perfect. The problem is what came after: the second season goes anime-original and diverges hard. Watch Season 1, then switch straight to Tokyo Ghoul:re Season 2 for the manga-accurate continuation.",
    highlights: [
      "Kaneki's transformation — one of anime's most iconic character arcs",
      "The Owl fight sequences are brutal and gorgeous",
    ],
    indianNote:
      "No Hindi dub — subtitles only. Big watch-order warning: skipping around saves you a confusing S2. Manga-readers say the manga is better; newcomers should start with the anime's complete version on Crunchyroll.",
  },
  "sword art online": {
    rating: 4,
    ratingLabel: "Great",
    verdict:
      "Sword Art Online is the isekai that defined the genre — trapped-in-a-videogame stakes, Kirito's lone-wolf charm, and the Aincrad arc's emotional core. Later arcs (Gun Gale, Alicization) get divisive, but the first half is iconic. It's a comfort watch, not a critique piece — pure escapism done well.",
    highlights: [
      "Aincrad arc — 'dies in game, dies in real life' tension",
      "Alicization is a legitimately great long-form arc",
    ],
    indianNote:
      "No Hindi dub. Furiously popular in India on streaming (Crunchyroll carries the full remastered order). The Progressive movies are an alternative companion take on the Aincrad arc.",
  },
  "steins;gate": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Steins;Gate is a slow-burn sci-fi masterpiece — the first half is a quirky slice-of-life that quietly builds, then the second half detonates. Okabe's time-leap dilemma ('El Psy Kongroo!') is the most emotionally affecting time-travel story in anime. You must survive the build-up to earn the payoff — it is worth it.",
    highlights: [
      "Second half is a masterclass in tension and sacrifice",
      "Time travel that follows its own rules consistently",
    ],
    indianNote:
      "No Hindi dub. Small commitment: only 24 episodes. Watch order matters little here, but do NOT skip the epilogue episode 23β route before the movie if you're a completionist.",
  },
  "vinland saga": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Vinland Saga is a Viking revenge epic that flips into a meditation on redemption — Thorfinn's journey from rage to 'I have no enemies' is one of the most mature arcs in anime. The prologue (season 1) is a masterclass in tragedy; season 2 is slower, pastoral, and philosophically richer. Bring patience; it rewards it.",
    highlights: [
      "Askeladd — the best-written villain in recent anime",
      "A protagonist arc that genuinely changes who he is",
    ],
    indianNote:
      "No Hindi dub, subs only. It's violent and mature — not for kids. Only ~48 episodes across two seasons; a dense weekend watch for serious anime fans.",
  },
  "chainsaw man": {
    rating: 4.5,
    ratingLabel: "Must Watch",
    verdict:
      "Chainsaw Man is nihilistic, horny, violent and weirdly heartfelt — Denji's hustle to just live a decent life is surprisingly relatable under all the gore. MAPPA's direction is incredible, the openings are cinema, and the seasonal pacing keeps it tight. Added to the 'hope it gets a full adaptation' tier.",
    highlights: [
      "MAPPA's cinematic directing and fight choreography",
      "A cast of unhinged, unforgettable characters",
    ],
    indianNote:
      "No Hindi dub — subs only (English dub is good but JP is better). Explicit content; definitely 18+ viewing. Watch order: Season 1 (12 eps) directly into the Reze Arc movie.",
  },
  "mob psycho 100": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Mob Psycho 100 is Bones at their creative peak — Mob's psychic powers are a metaphor for repressed emotion, and the '???%' release moments are the best action scenes of the decade. It's overwhelmingly kind underneath the weirdness. Three seasons, completed, perfect to the end — a happy pick-me-up with shockingly good fights.",
    highlights: [
      "???% sequences are top-tier sakuga",
      "A genuinely uplifting story about controlling your emotions",
    ],
    indianNote:
      "No Hindi dub. 37 episodes total, completely finished — an easy, feel-good binge that still respects your time. Ideal for 'I want good anime but nothing too heavy' nights.",
  },
  "sousou no frieren": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Frieren is a meditation on grief disguised as a fantasy journey — after the hero party defeats the Demon King, the elf mage outlives them all and only then starts to properly know them. Its quiet, contemplative pacing and superb 'slice-of-life after the adventure' structure make it the most acclaimed fantasy series of the decade. Nothing explosive, everything profound.",
    highlights: [
      "A contemplative, mature tone most fantasy lacks",
      "The 'after the adventure' premise is genuinely fresh",
    ],
    indianNote:
      "No Hindi dub. Unusually calm pacing — ADHD binge-watchers may struggle; everyone else will be moved. A recent phenomenon you'll hear about everywhere at cons.",
  },
  "spy x family": {
    rating: 4.5,
    ratingLabel: "Must Watch",
    verdict:
      "Spy x Family is the wholesome family sitcom of anime — a spy, an assassin and a telepath form a fake family, none knowing the others' secrets, and Anya wins every scene she's in. It's warmth, spy capers and found-family comedy with genuinely funny writing. The perfect 'everyone in the house' watch.",
    highlights: [
      "Anya Forger — the most beloved character of the decade",
      "A no-darkness, genuinely charming tone",
    ],
    indianNote:
      "No Hindi dub currently, and it's a Netflix exclusive — subtitled only on JP audio. Great first anime for kids/family; zero graphic content.",
  },
  "naruto shippuden": {
    rating: 4.5,
    ratingLabel: "Must Watch",
    verdict:
      "Shippuden is where the war escalates and Naruto grows up — Pain Arc (137–175) is an all-timer. Be warned: the filler here is the worst offender in anime history, including a 2-year filler streak before the finale. Watch with our filler guide and it's a totally different, much tighter show.",
    highlights: [
      "Pain Invades Konoha — one of the best single arcs ever animated",
      "Naruto's progression from underdog to village hero is earned",
    ],
    indianNote:
      "Hindi dub is complete and well-regarded — most Indian Naruto fans watch this version. Big filler check: use the Shippuden filler list or you'll burn 40% of your time on non-canon episodes.",
    dubStatus: {
      hindi: "Complete Hindi dub",
      tamil: "Partial",
      telugu: "Partial",
    },
  },
  bleach: {
    rating: 4,
    ratingLabel: "Great",
    verdict:
      "Bleach is style over substance done right — Soul Society and the Hueco Mundo invasion deliver the most stylish fights in shonen. The bankai reveals still look incredible today. The Thousand-Year Blood War anime fixes the rushed manga ending, so watch it all the way through.",
    highlights: [
      "Soul Society arc — classic 2000s anime aesthetic",
      "Bankai reveals are the most hype moments in the medium",
    ],
    indianNote:
      "Hindi dub exists for the early seasons and is decent. Filler-wise Bleach has many long standalone arcs; the filler list helps you skip straight through the Bount arc and later bloat.",
    dubStatus: {
      hindi: "Early seasons only",
      tamil: "No",
      telugu: "No",
    },
  },
  "fullmetal alchemist: brotherhood": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "FMAB is the gold standard — a thematically complete story with an ending where every sacrifice means something and nothing is wasted. The Brotherhood version follows the manga exactly: 64 dense episodes, no filler, no loose threads. If you want manga-accurate, there is literally nothing to skip here.",
    highlights: [
      "A perfect, closed arc — no loose threads, no filler",
      "Scar and the Homunculi are villains with real depth",
    ],
    indianNote:
      "No Hindi or regional dub, so it's a subtitled watch in India. It's only 64 episodes — short, dense, and the single best entry point for newcomers. After this, every other battle-shonen feels long.",
  },
  "code geass: lelouch of the rebellion": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Code Geass is a chess match disguised as a mecha-anime — Lelouch out-plans everyone as he dismantles the Britannian empire into a worldwide rebellion. The Geass power turns every strategy meeting into a mind game, and the twist ending is anime's most argued-about finale. Years later, people still can't agree on what happened.",
    highlights: [
      "Lelouch is the smartest strategic protagonist in anime",
      "That ending — don't let anyone spoil you",
    ],
    indianNote:
      "No Indian dub, so subtitled. Watch order: Season 1 (25 eps) → Season 2 (25 eps); the OVAs are side stories, skip them for the main plot. A second movie-trilogy reboot exists — skip it unless you're a completionist.",
  },
  "attack on titan": {
    rating: 5,
    ratingLabel: "Legendary",
    verdict:
      "Attack on Titan is a thriller disguised as a battle-shonen — it keeps asking 'who is the real enemy' until none of the answers are comfortable. The animation and scale skyrocket every season. Go in blind; every twist matters and spoilers destroy half the fun.",
    highlights: [
      "3D maneuver gear fights are gloriously animated",
      "A story that evolves from survival-horror to geopolitical tragedy",
    ],
    indianNote:
      "No Hindi dub — subtitled is the way. News of a Hindi dub surfaces occasionally but nothing official; bookmark our indian dubs page to get notified if it arrives.",
  },
  "demon slayer: kimetsu no yaiba": {
    rating: 4.5,
    ratingLabel: "Must Watch",
    verdict:
      "Demon Slayer's story is simple — its animation is not. Ufotable's swordsmanship sequences are the best-looking action ever put in a weekly anime. Arc by arc (Mugen Train, Entertainment District) it stays short and punchy. It won't challenge you intellectually, but it will floor you visually.",
    highlights: [
      "Ufotable's sakuga — Mugen Train, Daki & Gyutaro fights",
      "Short, tight arcs that never waste your time",
    ],
    indianNote:
      "No Hindi dub yet. The dub on Netflix is English-only, so Hindi fans watch subs. Short watch — great recommendation for newcomers who found One Piece too long.",
  },
  "jujutsu kaisen": {
    rating: 5,
    ratingLabel: "Legendary",
    verdict:
      "Jujutsu Kaisen is the modern shonen king — the Shibuya Incident remains one of the most brutal, best-directed arcs in recent memory. It inherits the Naruto DNA (curses, a school, an overpowered sensei) but turns the genre's conventions upside down. Gojo's scenes alone are worth the price of admission.",
    highlights: [
      "Shibuya arc rewrites what a shonen battle can be",
      "Villains with actual ideologies, not evil for evil's sake",
    ],
    indianNote:
      "No Hindi dub — subs only. The '0' movie (Jujutsu Kaisen 0) is optional — it's a prequel with a different lead; start with the series instead.",
  },
  "my hero academia": {
    rating: 4,
    ratingLabel: "Great",
    verdict:
      "MHA is the best Western-style 'superhero school' shonen — Deku's underdog-to-symbol journey pairs with a genuinely varied cast of quirks. The sports festivals and the war arc are highlight reels. It's more formulaic than JJK, but it nails the formula.",
    highlights: [
      "A pro-hero arc every season — great set pieces",
      "A cast where every student gets a moment",
    ],
    indianNote:
      "No Hindi dub. Crunchyroll carries it. Fillers are minimal but the filler list helps around the movie tie-in episodes. Good starter shonen for kids/teens.",
  },
  "one punch man": {
    rating: 4,
    ratingLabel: "Great",
    verdict:
      "One Punch Man is satire that forgot it's a parody — Saitama one-shots everyone, but the side characters carry the comedy and the animation (season 1 especially) is absurdly good. It's a comedy-first action show; don't expect a deep plot, expect peak entertainment. Short — only ~24 episodes across two seasons.",
    highlights: [
      "Season 1's animation is Studio Madhouse at its peak",
      "Genos and the Hero Association carry the humor",
    ],
    indianNote:
      "No Hindi dub. Short and bingeable — a perfect weekend watch for someone new to anime who wants comedy + action with zero long-term commitment.",
  },
  "death note": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Death Note is the most accessible anime to recommend to non-anime fans — a pure battle of wits between Light and L across a tight, filler-free 37 episodes. The psychological cat-and-mouse is timeless. It's the show to hand someone who says 'anime is just kids' cartoons'.",
    highlights: [
      "Light vs L — the finest rivalry in fiction",
      "Zero filler, tight 37-episode run, perfectly paced",
    ],
    indianNote:
      "No Hindi dub — subs only. Watch the original Japanese audio; the sub captures Light's tone best. Short binge, instant classic.",
  },
  "cowboy bebop": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Cowboy Bebop is jazz-cool space noir — every episode is self-contained, moody, and masterfully directed with a legendary soundtrack (Tank!). It's the gateway anime for adults. If you only ever watch one older anime, make it this one.",
    highlights: [
      "Shinichirō Watanabe's direction — pure 90s cool",
      "A soundtrack (Yoko Kanno) that carries entire scenes",
    ],
    indianNote:
      "No Hindi dub. Episodic — you can drop in anywhere, but watch from episode 1 for the crew's rhythm. Mature themes, definitely not kids' content.",
  },
  "hunter x hunter": {
    rating: 5,
    ratingLabel: "Masterpiece",
    verdict:
      "Hunter x Hunter is the shonen that out-shonen'd shonen — it starts like a happy adventure and slowly becomes a deconstruction of every genre trope. The Chimera Ant arc is a genuine magnum opus, and Togashi keeps the power system (Nen) brainy, not brawny. The 2011 version is flawless end to end.",
    highlights: [
      "The Chimera Ant arc — a masterpiece of tension and theme",
      "Nen power system is the smartest in shonen history",
    ],
    indianNote:
      "No Hindi dub — subs only. 148 episodes, no wasted runtime. The 1999 version exists but watch the 2011 series; it's strictly better.",
  },
};

export function getAnimeEditorial(title?: {
  romaji?: string | null;
  english?: string | null;
}): AnimeEditorial | null {
  if (!title) return null;
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/×|x/g, "x")
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  const candidates = [title.romaji, title.english]
    .filter((s): s is string => Boolean(s))
    .map(normalize);
  for (const key of candidates) {
    if (ANIME_EDITORIALS[key]) return ANIME_EDITORIALS[key];
  }
  return null;
}