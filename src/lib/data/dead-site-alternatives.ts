export interface DeadSiteAlternative {
  slug: string;
  siteName: string;
  domain: string;
  tagline: string;
  whatWasIt: string;
  currentStatus: string;
  whyPeopleLovedIt: string;
  searchTerms: string[];
  faqs: { q: string; a: string }[];
}

export interface AlternativeSite {
  name: string;
  url: string;
  description: string;
  features: string[];
  rating: string;
  color: string;
  bestFor: string;
}

export const ZYNIVERSE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const SHUT_DOWN_SITES: DeadSiteAlternative[] = [
  {
    slug: "anitally",
    siteName: "AniTally",
    domain: "anitally.in",
    tagline: "India's anime tracker and filler guide",
    whatWasIt:
      "AniTally was a popular Indian anime tracking and filler-list website. Anime fans used it to track what they were watching, mark episodes as watched, and look up which episodes of shows like Naruto, One Piece, and Boruto were filler so they could skip them. It was especially loved by Indian anime fans because it was free and fast.",
    currentStatus:
      "As of 2026, anitally.in is no longer serving its anime content. The domain is no longer active — visiting it shows a payment-required page instead of the anime tracker, which means the site has effectively shut down or been abandoned by its owner.",
    whyPeopleLovedIt:
      "Fans loved AniTally because it combined three things in one place: a clean anime tracker, easy-to-read filler lists, and no signup friction. Many Indian anime viewers had their entire watch history and skip-lists saved on AniTally.",
    searchTerms: ["anitally", "anitally alternative", "anitally not working", "anitally down", "anitally.in"],
    faqs: [
      { q: "Is AniTally shut down?", a: "Yes. anitally.in is no longer serving anime content — the domain currently shows a payment-required page instead of the tracker, so the site is effectively dead as of 2026." },
      { q: "What is the best AniTally alternative?", a: "ZyniVerse is the best free AniTally alternative for Indian anime fans. It gives you filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker, and a community — all free." },
      { q: "Can I get my AniTally watchlist back?", a: "If AniTally is offline you can't export data directly from it. Most users rebuild their list in minutes with ZyniVerse's watch tracker, which also supports importing from MyAnimeList and AniList." },
      { q: "Is there a free AniTally alternative for filler lists?", a: "Yes. ZyniVerse has detailed episode-by-episode filler guides for 200+ anime including Naruto, One Piece, Bleach, Dragon Ball Z, Boruto, and Fairy Tail — completely free, and updated weekly." },
    ],
  },
  {
    slug: "anitusk",
    siteName: "AniTusk",
    domain: "anitusk.in",
    tagline: "Free anime streaming and tracking site",
    whatWasIt:
      "AniTusk was an anime website that Indian fans used for streaming and tracking anime. It had a large catalogue of anime series, episode lists, and a simple interface that made it easy to pick up where you left off. It was one of the many community-run anime sites that became popular in India when bigger platforms were too expensive.",
    currentStatus:
      "AniTusk is fully offline. The domain anitusk.in no longer resolves — the DNS records have been removed and the site cannot be reached at all. As of 2026, AniTusk is confirmed dead with no official replacement.",
    whyPeopleLovedIt:
      "AniTusk was appreciated for being free, having a large anime catalogue, and being easy to use on mobile data in India. Fans would check AniTusk for the latest episodes and seasonal anime.",
    searchTerms: ["anitusk", "anitusk alternative", "anitusk not working", "anitusk down", "anitusk.in"],
    faqs: [
      { q: "Is AniTusk down?", a: "Yes. The anitusk.in domain no longer resolves, which means the site has been fully shut down. It is no longer reachable as of 2026." },
      { q: "What should I use instead of AniTusk?", a: "ZyniVerse is the best free alternative for Indian anime fans — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, watchlists, manga reader, and an active community." },
      { q: "Is there any AniTusk mirror site?", a: "Avoid unofficial mirrors — they're often unsafe. Instead use a trusted free platform like ZyniVerse, which offers anime tracking, filler guides, and Indian dub schedules without ads or malware." },
    ],
  },
  {
    slug: "filleranimelist",
    siteName: "FillerAnimeList",
    domain: "filleranimelist.com",
    tagline: "Filler episode list and anime skip guide",
    whatWasIt:
      "FillerAnimeList was a specialized site that told viewers exactly which episodes of long-running anime were filler, canon, or mixed. It was a go-to resource for fans who wanted to skip filler episodes and watch only the important story, especially for shows like Naruto, One Piece, Bleach, and Dragon Ball.",
    currentStatus:
      "FillerAnimeList is offline. The domain no longer resolves, so the site cannot be accessed. As of 2026 it is effectively dead, leaving many fans looking for a replacement filler guide.",
    whyPeopleLovedIt:
      "It solved a very specific problem: which episodes to skip. FillerAnimeList fans valued quick, accurate skip lists so they could binge the story without wasting time on filler arcs.",
    searchTerms: ["filleranimelist", "filler animelist", "filleranimelist alternative", "anime filler list"],
    faqs: [
      { q: "Is FillerAnimeList still working?", a: "No. The filleranimelist.com domain no longer resolves and the site is offline as of 2026." },
      { q: "Where can I find anime filler lists now?", a: "ZyniVerse has episode-by-episode filler guides for 200+ anime, updated weekly and completely free. You can look up any show and instantly see which episodes are filler, canon, or mixed." },
      { q: "Which anime have the most filler episodes?", a: "Long-running shonen shows have the most filler — Naruto has around 220 filler episodes, Boruto and One Piece also have substantial filler arcs. Use ZyniVerse's filler guides to skip them." },
    ],
  },
  {
    slug: "animixplay",
    siteName: "AnimixPlay",
    domain: "animixplay.to",
    tagline: "The ad-free anime streaming favourite",
    whatWasIt:
      "AnimixPlay was one of the most loved free anime streaming sites of the early 2020s. Fans loved it because it was genuinely ad-free, had a clean interface, and made it easy to find both subbed and dubbed episodes of almost any show — from Naruto to Jujutsu Kaisen.",
    currentStatus:
      "AnimixPlay officially shut down in January 2023. The domain now shows a goodbye message from the owners — it is confirmed dead and will not come back as the same service. Any site claiming to be 'AnimixPlay' today is a fake clone.",
    whyPeopleLovedIt:
      "The ad-free experience was AnimixPlay's superpower. At a time when every free anime site was full of pop-ups, AnimixPlay let you just hit play and watch. That's why so many fans were heartbroken when it shut down.",
    searchTerms: ["animixplay", "animixplay alternative", "animixplay not working", "animixplay shut down", "is animixplay dead"],
    faqs: [
      { q: "Is AnimixPlay shut down?", a: "Yes. AnimixPlay officially shut down in January 2023 and its domain now shows a goodbye message. It will not return as the same service — beware of fake clones using the name." },
      { q: "What is the best AnimixPlay alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and a community, all in one clean, ad-light platform." },
      { q: "Why did AnimixPlay shut down?", a: "AnimixPlay shut down due to copyright pressure and the growing difficulty of running an unlicensed streaming service. This is the same reason most free anime sites eventually disappear." },
    ],
  },
  {
    slug: "kissanime",
    siteName: "KissAnime",
    domain: "kissanime.ru",
    tagline: "The most famous anime streaming site of all time",
    whatWasIt:
      "KissAnime was arguably the most famous anime streaming website ever. For years it was the default answer to 'where do I watch anime online?' with an enormous catalogue of subbed and dubbed series used by millions of fans worldwide, including a huge base in India.",
    currentStatus:
      "KissAnime shut down in August 2020 and the domain has been dead ever since. The original site is gone for good — every 'KissAnime' website you find today is an unofficial clone or mirror that can be risky to use.",
    whyPeopleLovedIt:
      "KissAnime was simple, free, and had almost everything. Generations of fans watched their first anime on KissAnime, which is why the name still gets searched even years after it shut down.",
    searchTerms: ["kissanime", "kissanime alternative", "kissanime not working", "kissanime shut down", "sites like kissanime"],
    faqs: [
      { q: "Is KissAnime still active?", a: "No. KissAnime shut down in August 2020. Any current 'KissAnime' site is a clone or mirror operated by someone else — avoid them and use a trusted alternative like ZyniVerse instead." },
      { q: "What happened to KissAnime?", a: "KissAnime's operators shut the site down in 2020 under copyright pressure. The name is now used by many unofficial clones, which is why searching for it is risky." },
      { q: "What is the best KissAnime alternative for Indian fans?", a: "ZyniVerse is India's best free anime platform — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, watchlists, AI recommendations and a community, with none of the clone-site risk." },
    ],
  },
  {
    slug: "animekisa",
    siteName: "AnimeKisa",
    domain: "animekisa.tv",
    tagline: "No-ads free anime streaming site",
    whatWasIt:
      "AnimeKisa was a popular free anime streaming site known for having very few ads compared to rivals. Fans used it for its huge library and a simple player that rarely broke. It built a loyal following among viewers who wanted a hassle-free experience.",
    currentStatus:
      "AnimeKisa is dead. The domain animekisa.tv no longer resolves, and the site has been offline for years. Any site using the AnimeKisa name today is an unrelated mirror or clone.",
    whyPeopleLovedIt:
      "AnimeKisa was praised for its minimal ads and fast loading. It was one of the few free sites where you could actually just sit down and watch without constant pop-ups.",
    searchTerms: ["animekisa", "animekisa alternative", "animekisa not working", "is animekisa dead"],
    faqs: [
      { q: "Is AnimeKisa shut down?", a: "Yes. The animekisa.tv domain no longer resolves and the site has been offline for years. Avoid clones using the name — use a trusted alternative like ZyniVerse." },
      { q: "What is the best AnimeKisa alternative?", a: "ZyniVerse is the best free replacement — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and an anime community." },
    ],
  },
  {
    slug: "horriblesubs",
    siteName: "HorribleSubs",
    domain: "horriblesubs.info",
    tagline: "The anime download giant",
    whatWasIt:
      "HorribleSubs was the go-to site for downloading anime episodes. Fans used it to grab high-quality, clean-release episode files directly — it was essential for anyone who wanted to keep an offline collection or watch on a low-bandwidth connection.",
    currentStatus:
      "HorribleSubs shut down in August 2022. The domain no longer resolves and the original service is gone. Since then, fans have had to find new ways to download and track anime.",
    whyPeopleLovedIt:
      "HorribleSubs had a simple, fast, reliable release pipeline. If an episode aired, it was on HorribleSubs within hours — that speed and consistency made it a daily habit for many fans.",
    searchTerms: ["horriblesubs", "horriblesubs alternative", "horriblesubs down", "horriblesubs shut down"],
    faqs: [
      { q: "Is HorribleSubs still working?", a: "No. HorribleSubs shut down in August 2022 and its domain no longer resolves. The service is gone permanently." },
      { q: "What is the best HorribleSubs alternative?", a: "For tracking and organising your anime instead of downloading, ZyniVerse is the best free option — filler guides for 200+ anime, Indian dub tracking, watchlists and AI recommendations." },
    ],
  },
  {
    slug: "zoro",
    siteName: "Zoro.to",
    domain: "zoro.to",
    tagline: "The modern 1080p anime streaming site",
    whatWasIt:
      "Zoro.to was a hugely popular modern anime streaming site that became famous for its clean design, 1080p streams and zero sign-up required. It rose fast in the early 2020s and was one of the most-visited anime sites worldwide, with a large Indian audience.",
    currentStatus:
      "Zoro.to shut down in January 2024. The operators rebranded to AniWatch and then HiAnime — both of which also shut down in March 2026. The Zoro.to domain is now dead.",
    whyPeopleLovedIt:
      "Zoro.to felt premium — fast, clean, HD streams and no registration. For a free site, it was remarkably polished, which is why its closure hit the anime community so hard.",
    searchTerms: ["zoro.to", "zoro alternative", "zoro.to not working", "zoro.to shut down", "is zoro.to dead"],
    faqs: [
      { q: "Is Zoro.to shut down?", a: "Yes. Zoro.to shut down in January 2024. The team rebranded to AniWatch and later HiAnime, and those also shut down in March 2026. The original service is fully gone." },
      { q: "What is the best Zoro.to alternative?", a: "ZyniVerse is the best free alternative for Indian anime fans — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and a community." },
    ],
  },
  {
    slug: "aniwatch",
    siteName: "AniWatch",
    domain: "aniwatch.to",
    tagline: "The rebranded Zoro.to that also shut down",
    whatWasIt:
      "AniWatch was the direct successor to Zoro.to, launched after the Zoro.to shutdown in January 2024. It kept the same clean, modern design and quickly became one of the most popular free anime streaming sites, especially in India and the US.",
    currentStatus:
      "AniWatch shut down in March 2026 after being listed in the USTR 'Notorious Markets' report and coming under heavy legal pressure. The aniwatch.to domain now returns an error — the service is confirmed dead.",
    whyPeopleLovedIt:
      "AniWatch inherited everything fans loved about Zoro.to — a clean interface, HD streams, no sign-up and fast episode updates. Many Indian fans had switched their entire watch routine to AniWatch.",
    searchTerms: ["aniwatch", "aniwatch alternative", "aniwatch not working", "aniwatch shut down", "aniwatch.to"],
    faqs: [
      { q: "Is AniWatch shut down?", a: "Yes. AniWatch shut down in March 2026 after being named in the USTR Notorious Markets report. The domain no longer serves the site." },
      { q: "What is the best AniWatch alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, watchlists, manga reading and a community, all in one place." },
      { q: "Can I get my AniWatch watchlist back?", a: "AniWatch is offline so direct export isn't possible. You can rebuild your list quickly with ZyniVerse's tracker, which also imports from MyAnimeList and AniList." },
    ],
  },
  {
    slug: "hianime",
    siteName: "HiAnime",
    domain: "hianime.to",
    tagline: "The last of the Zoro/AniWatch chain",
    whatWasIt:
      "HiAnime was the final rebrand in the Zoro.to → AniWatch → HiAnime chain. It was one of the most-visited anime streaming sites in the world in 2025, with a huge Indian user base, before everything collapsed in 2026.",
    currentStatus:
      "HiAnime shut down in March 2026 after the USTR added it to the 'Notorious Markets' list. Reports say its operators were arrested. The site is confirmed dead and mirrors are being shut down one by one.",
    whyPeopleLovedIt:
      "HiAnime kept the polished Zoro-style experience fans loved and added fast simulcast uploads. For millions of viewers it was simply the best free anime site available right until the end.",
    searchTerms: ["hianime", "hianime alternative", "hianime not working", "hianime shut down", "is hianime down"],
    faqs: [
      { q: "Is HiAnime shut down?", a: "Yes. HiAnime shut down in March 2026 after being added to the USTR Notorious Markets list, and its operators were reportedly arrested. Mirrors are also being taken down." },
      { q: "What is the best HiAnime alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, watch tracker and an Indian anime community." },
    ],
  },
  {
    slug: "9anime",
    siteName: "9anime",
    domain: "9anime.to",
    tagline: "The once-biggest anime site, now only clones",
    whatWasIt:
      "9anime was one of the largest anime streaming sites of all time, peaking at over 170 million monthly visits. It was famous for its massive catalogue, multiple streaming servers and polished browsing experience. It rebranded to AniWave in 2023.",
    currentStatus:
      "The original 9anime/AniWave was shut down in August 2024 by Vietnamese police working with ACE. Every '9anime' site you see today is an unrelated clone — many of them are risky and full of malware. The real 9anime is gone.",
    whyPeopleLovedIt:
      "9anime had the best combination of a huge library, multiple server options and a slick dark interface. For over a decade it was the default answer to 'best anime site' for millions of fans.",
    searchTerms: ["9anime", "9anime alternative", "9anime not working", "9anime down", "9anime shut down", "aniwave alternative"],
    faqs: [
      { q: "Is 9anime shut down?", a: "Yes. The original 9anime rebranded to AniWave in 2023 and was shut down in August 2024. Today's '9anime' domains are unrelated clones and can be dangerous to use." },
      { q: "What is the best 9anime alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and a community, with none of the clone-site risk." },
      { q: "Are current 9anime sites safe?", a: "No. The real 9anime is gone, and clone operators reuse the famous name to spread malware and phishing pages. Use a trusted platform like ZyniVerse instead." },
    ],
  },
  {
    slug: "animesuge",
    siteName: "AnimeSuge",
    domain: "animesuge.to",
    tagline: "Anime streaming site shut down and blocked in India",
    whatWasIt:
      "AnimeSuge was a popular free anime streaming site with a large catalogue and a dedicated following, including many Indian fans. It was part of the same network as 9anime/AniWave and FMovies.",
    currentStatus:
      "AnimeSuge was shut down in August 2024 in the same coordinated anti-piracy sweep that took down 9anime/AniWave and FMovies. Its domains were also named in a December 2025 Delhi High Court blocking order — it is confirmed dead.",
    whyPeopleLovedIt:
      "AnimeSuge had a clean, fast interface and a big library with minimal friction. Fans appreciated that episodes were added quickly and the player just worked.",
    searchTerms: ["animesuge", "animesuge alternative", "animesuge not working", "animesuge down", "animesuge shut down"],
    faqs: [
      { q: "Is AnimeSuge shut down?", a: "Yes. AnimeSuge was shut down in August 2024 in a coordinated anti-piracy sweep, and its domains were later included in a Delhi High Court blocking order." },
      { q: "What is the best AnimeSuge alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and an anime community." },
    ],
  },
  {
    slug: "funimation",
    siteName: "Funimation",
    domain: "funimation.com",
    tagline: "The giant that merged into Crunchyroll",
    whatWasIt:
      "Funimation was one of the biggest legal anime streaming platforms, especially famous for its English dubs. It had a huge catalogue of dubbed anime and a massive fanbase in the US, UK, India and beyond.",
    currentStatus:
      "Funimation no longer exists as a standalone service. It was merged into Crunchyroll (Sony completed the merger in 2022) and the standalone app and website were shut down. Official Funimation anime now lives on Crunchyroll.",
    whyPeopleLovedIt:
      "Funimation was the dub king. Fans who preferred English (and later Hindi) dubs over subtitles relied on Funimation, and its closure left a big gap for dubbed anime fans.",
    searchTerms: ["funimation", "funimation alternative", "funimation shut down", "funimation not working", "funimation app closing"],
    faqs: [
      { q: "Is Funimation shut down?", a: "Funimation was merged into Crunchyroll in 2022, and the standalone Funimation website and app were shut down. The library continues on Crunchyroll." },
      { q: "What is the best Funimation alternative for dubbed anime?", a: "For Indian fans, ZyniVerse tracks Hindi/Tamil/Telugu dubs specifically — you can see which anime have Indian dubs, get alerts for new episodes, and never miss a release." },
    ],
  },
  {
    slug: "masterani",
    siteName: "Masterani",
    domain: "masterani.me",
    tagline: "The clean anime streaming favourite of the 2010s",
    whatWasIt:
      "Masterani was a popular free anime streaming site in the mid-2010s known for its clean, modern interface and reliable streams. It was a favourite among fans who wanted quality playback without a cluttered layout.",
    currentStatus:
      "Masterani shut down years ago and the domain is dead. Since then, the famous name has been reused by mirrors and clone sites — treat anything claiming to be Masterani today with caution.",
    whyPeopleLovedIt:
      "Masterani had a genuinely good-looking interface, which was rare among free anime sites of its era. Fans also appreciated its minimal ads and reliable servers.",
    searchTerms: ["masterani", "masterani alternative", "masterani not working", "masterani shut down"],
    faqs: [
      { q: "Is Masterani still working?", a: "No. Masterani shut down years ago and its original domain is dead. Any 'Masterani' site today is a mirror or clone — use a trusted alternative like ZyniVerse instead." },
      { q: "What is the best Masterani alternative?", a: "ZyniVerse is the best free replacement — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and a community." },
    ],
  },
  {
    slug: "animekai",
    siteName: "AnimeKai",
    domain: "animekai.to",
    tagline: "Anime streaming site that went dark in 2026",
    whatWasIt:
      "AnimeKai was a popular free anime streaming site in 2024–2026, with a large catalogue and a clean interface that attracted fans after other sites shut down. It had a strong following in India and Southeast Asia.",
    currentStatus:
      "AnimeKai went dark in 2026 under legal pressure — its operators cited a 'datacenter fire' before the site stopped working completely. It is now effectively dead, and its domain has been placed under suspension.",
    whyPeopleLovedIt:
      "AnimeKai had a modern look, fast episode updates and a solid library. Many fans migrated to AnimeKai after HiAnime and AniWatch shut down — and were left stranded again when it disappeared.",
    searchTerms: ["animekai", "animekai alternative", "animekai not working", "animekai down", "is animekai dead"],
    faqs: [
      { q: "Is AnimeKai shut down?", a: "Yes. AnimeKai went dark in 2026 after its operators claimed a 'datacenter fire', and the domain has since been suspended. The site is effectively dead." },
      { q: "What is the best AnimeKai alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, watchlists and a community, with stable hosting you can rely on." },
    ],
  },
  {
    slug: "anigo",
    siteName: "AniGo",
    domain: "anigo.to",
    tagline: "Anime streaming site shut down by court order",
    whatWasIt:
      "AniGo was an anime streaming site that had grown to around 1.5 million monthly visitors in 2026. It first went dark in May 2026 (operators blamed a 'datacenter fire') before being formally suspended.",
    currentStatus:
      "AniGo's domain was placed on 'clientHold' — meaning suspended — following a Delhi High Court order in the ACE/MPA lawsuit. The site is officially shut down and its mirrors are also being disabled.",
    whyPeopleLovedIt:
      "AniGo offered free anime streaming with a large catalogue and fast uploads. It became especially popular after HiAnime and AniWatch shut down in March 2026.",
    searchTerms: ["anigo", "anigo alternative", "anigo not working", "anigo shut down", "anigo.to"],
    faqs: [
      { q: "Is AniGo shut down?", a: "Yes. AniGo's domain was suspended (clientHold) under a Delhi High Court order. The site is dead and mirrors are being taken down." },
      { q: "What is the best AniGo alternative?", a: "ZyniVerse is the best free alternative — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and a stable community." },
    ],
  },
  {
    slug: "animetake",
    siteName: "AnimeTake",
    domain: "animetake.tv",
    tagline: "Anime streaming site from the 2010s",
    whatWasIt:
      "AnimeTake was a free anime streaming and download site popular in the late 2010s. Fans used it for watching and downloading episodes of ongoing and classic series with both sub and dub options.",
    currentStatus:
      "AnimeTake is dead. The domain animetake.tv returns an error and the site has been offline for years. Any current site using the AnimeTake name is an unrelated clone.",
    whyPeopleLovedIt:
      "AnimeTake offered both streaming and direct downloads in one place, which made it convenient for fans who wanted to watch online or keep episodes for later.",
    searchTerms: ["animetake", "animetake alternative", "animetake not working", "is animetake dead"],
    faqs: [
      { q: "Is AnimeTake shut down?", a: "Yes. AnimeTake has been offline for years and its domain no longer serves content. Clones using the name are not the original site." },
      { q: "What is the best AnimeTake alternative?", a: "ZyniVerse is the best free replacement — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations and a watch tracker." },
    ],
  },
  {
    slug: "gogoanime",
    siteName: "GogoAnime",
    domain: "gogoanime3.co",
    tagline: "The famous anime site with no official domain left",
    whatWasIt:
      "GogoAnime has been one of the most searched anime site names for over a decade. The original operators stopped updating years ago, and since then the brand has lived on only as a rotating set of clone and mirror domains.",
    currentStatus:
      "GogoAnime has no official or stable domain. Old domains like gogoanime3.co are dead, and current 'gogoanime' mirrors go down and get blocked by Indian ISPs constantly. Searching 'gogoanime' today mostly surfaces fake and risky clones — the real service is effectively gone.",
    whyPeopleLovedIt:
      "GogoAnime was famous for its huge archive of subbed and dubbed anime and fast episode updates. For many Indian fans, it was the first anime site they ever used.",
    searchTerms: ["gogoanime", "gogoanime alternative", "gogoanime not working", "gogoanime down", "gogoanime blocked in india", "is gogoanime dead"],
    faqs: [
      { q: "Is GogoAnime still working?", a: "There is no official GogoAnime anymore. The original operators stopped years ago and the name now lives on through unstable clone domains that frequently go down or get blocked in India." },
      { q: "Why is GogoAnime not working in India?", a: "GogoAnime-style domains keep changing and Indian ISPs block the pirate mirrors as fast as they appear. Instead of chasing new domains, use a stable free alternative like ZyniVerse." },
      { q: "What is the best GogoAnime alternative?", a: "ZyniVerse is the best free alternative for Indian fans — filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, a watch tracker and a community." },
    ],
  },
];

export const ALTERNATIVE_SITES: AlternativeSite[] = [
  {
    name: "ZyniVerse",
    url: ZYNIVERSE_URL,
    description:
      "India's #1 free anime platform. Filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, watch tracker, manga reader, and an active community — all free.",
    features: ["Filler Guides", "Hindi/Tamil/Telugu Dubs", "AI Recommendations", "Watch Tracker", "Manga Reader", "Community"],
    rating: "4.9",
    color: "#d946ef",
    bestFor: "Indian fans who want filler lists, dub tracking and a tracker in one place",
  },
  {
    name: "AnimeFillerList",
    url: "https://www.animefillerlist.com",
    description:
      "The classic dedicated filler guide. Covers a wide range of anime with colour-coded filler, mixed, and canon episodes. Great when you just want a quick skip list.",
    features: ["Filler Lists", "Episode Classification", "Skip Guides"],
    rating: "4.6",
    color: "#2e51a2",
    bestFor: "Quick episode-by-episode filler lookups",
  },
  {
    name: "MyAnimeList",
    url: "https://myanimelist.net",
    description:
      "The world's largest anime & manga database. Track your viewing, rate shows, read reviews, and discover seasonal anime.",
    features: ["Anime Database", "Manga Database", "Reviews", "Seasonal Charts"],
    rating: "4.5",
    color: "#2e51a2",
    bestFor: "A huge database with community reviews",
  },
  {
    name: "AniList",
    url: "https://anilist.co",
    description:
      "A modern anime & manga tracker with social features, custom lists, and a clean discover tool.",
    features: ["Social Features", "Custom Lists", "Discover Tool", "Activity Feed"],
    rating: "4.6",
    color: "#02a9ff",
    bestFor: "A modern tracker with strong social features",
  },
  {
    name: "Crunchyroll",
    url: "https://crunchyroll.com",
    description:
      "The world's largest anime streaming library. Simulcasts, dubs, and subs with official apps.",
    features: ["Legal Streaming", "Simulcast", "English Dub", "Mobile Apps"],
    rating: "4.3",
    color: "#f47521",
    bestFor: "Legally streaming anime with new episodes first",
  },
];

export function getShutDownSite(slug: string): DeadSiteAlternative | undefined {
  return SHUT_DOWN_SITES.find((s) => s.slug === slug);
}
