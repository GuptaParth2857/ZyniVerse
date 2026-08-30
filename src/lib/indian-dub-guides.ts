export interface DubGuideFaq {
  q: string;
  a: string;
}

export interface IndianDubGuide {
  slug: string;
  name: string;
  anilistId?: number;
  malId?: number;
  genres: string[];
  platforms: string[];
  languages: string[];
  status: "Airing" | "Completed" | "Upcoming";
  episodeCount: string;
  schedule: string;
  dubSince: string;
  studio: string;
  tagline: string;
  intro: string;
  history: string;
  watch: string;
  faq: DubGuideFaq[];
}

export const INDIAN_DUB_GUIDES: IndianDubGuide[] = [
  {
    slug: "one-piece-hindi-dub",
    name: "One Piece",
    anilistId: 21,
    malId: 21,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "1120+ episodes",
    schedule: "New episodes every Monday at 11:30 PM IST",
    dubSince: "2021",
    studio: "Sound & Vision India",
    tagline: "The longest-running Hindi anime dub on Crunchyroll, with a new episode landing every Monday.",
    intro:
      "One Piece is the biggest ongoing dub in the Hindi anime space. Eiichiro Oda's pirate saga about Monkey D. Luffy and the Straw Hat crew has been dubbed into Hindi continuously on Crunchyroll since 2021, and the Hindi track is now well past 1120 episodes. Because the show runs behind the Japanese broadcast, fans get to follow Luffy through the English-style seasons at a steady weekly clip rather than binging the whole backlog at once.",
    history:
      "Hindi dubbing of One Piece has been handled by Sound & Vision India, the studio behind most of Crunchyroll's Hindi catalog. The dub launched in 2021 with the full existing backlog and settled into a weekly schedule, making One Piece one of the first mainstream shounen long-runners to get a proper weekly Hindi release cadence in India.",
    watch:
      "One Piece (Hindi dub) streams on Crunchyroll India. Open the show's page in the app or website, switch the audio track to Hindi, and the episode refreshes every Monday at 11:30 PM IST. Crunchyroll supports offline downloads on mobile, so you can grab the new episode before heading to work.",
    faq: [
      {
        q: "When does the new One Piece Hindi dub episode release?",
        a: "The Hindi dub releases a new episode every Monday at 11:30 PM IST on Crunchyroll.",
      },
      {
        q: "Where can I watch One Piece in Hindi?",
        a: "One Piece in Hindi is available on Crunchyroll India. Switch the audio track to Hindi inside the player.",
      },
      {
        q: "Is there a Tamil or Telugu dub of One Piece?",
        a: "Currently only the Hindi dub is available. Crunchyroll has not announced One Piece in Tamil or Telugu yet.",
      },
      {
        q: "How many Hindi dubbed episodes of One Piece are there?",
        a: "The Hindi dub has crossed 1120 episodes and continues to get a new episode every Monday.",
      },
    ],
  },
  {
    slug: "detective-conan-hindi-dub",
    name: "Detective Conan",
    anilistId: 235,
    malId: 22769,
    genres: ["Comedy", "Mystery", "Police"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "1130+ episodes",
    schedule: "New episodes every Monday at 9:00 PM IST",
    dubSince: "2023",
    studio: "Sound & Vision India",
    tagline: "India's weekly dose of Conan's cases — a new Hindi mystery every Monday night.",
    intro:
      "Case-closed fans in India finally got a steady home for Detective Conan when the Hindi dub landed on Crunchyroll. The high-school detective shrunk into a child is one of anime's longest-running series, and the Hindi track has crossed 1130 episodes. New episodes drop on Mondays, which makes Conan the perfect warm-up before One Piece later the same night.",
    history:
      "Detective Conan's Hindi dub arrived on Crunchyroll in 2023 and has followed a strict weekly cadence since. Long-time Indian viewers remember the show from its TV days, but this Crunchyroll run is the first time the mystery series has had a continuous, structured Hindi release.",
    watch:
      "Watch Detective Conan in Hindi on Crunchyroll India. The episode updates every Monday at 9:00 PM IST. Between major cases, the catalogue also lets you catch up on older arcs at your own pace.",
    faq: [
      {
        q: "When is the new Detective Conan Hindi episode available?",
        a: "A new Hindi episode arrives every Monday at 9:00 PM IST on Crunchyroll.",
      },
      {
        q: "Where can I watch Detective Conan in Hindi?",
        a: "Detective Conan streams in Hindi on Crunchyroll India with the audio set to Hindi.",
      },
      {
        q: "How many Hindi episodes of Detective Conan exist?",
        a: "The Hindi dub is past 1130 episodes and still airing weekly.",
      },
    ],
  },
  {
    slug: "naruto-shippuden-hindi-dub",
    name: "Naruto: Shippuden",
    anilistId: 1735,
    malId: 1735,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "500 episodes",
    schedule: "Full series available; dubbed reruns air Sundays at 2:00 PM IST",
    dubSince: "2022",
    studio: "Sound & Vision India",
    tagline: "All 500 episodes of Naruto's shounen classic, fully dubbed in Hindi, Tamil and Telugu.",
    intro:
      "Naruto: Shippuden is the complete package for Indian anime fans. The full 500-episode series is dubbed in Hindi, Tamil and Telugu on Crunchyroll, making it one of the largest complete multi-language dubs available in India. Whether you grew up watching Naruto on TV or are coming to the franchise fresh, the entire Shippuden run is ready to binge in your language.",
    history:
      "Crunchyroll released Shippuden in Hindi from 2022, and later expanded the show to Tamil and Telugu, giving South Indian audiences the same full run. Because the series is complete, Crunchyroll also re-runs the dub in a Sunday 2:00 PM IST slot for viewers who prefer a scheduled watch.",
    watch:
      "Open Naruto: Shippuden on Crunchyroll India and pick your language from the audio options — Hindi, Tamil or Telugu. All 500 episodes are available to stream. If you want to skip the padded arcs, head to ZyniVerse's Naruto filler guide to find which episodes you can safely jump over.",
    faq: [
      {
        q: "Is the full Naruto: Shippuden series dubbed in Hindi?",
        a: "Yes, all 500 episodes are available in Hindi on Crunchyroll.",
      },
      {
        q: "Does Naruto: Shippuden have a Tamil or Telugu dub?",
        a: "Yes, Crunchyroll offers the complete Shippuden series in Tamil and Telugu as well.",
      },
      {
        q: "Can I skip filler episodes in Naruto: Shippuden?",
        a: "Yes, most filler arcs in Shippuden can be skipped without missing the main story. ZyniVerse has a numbered Naruto: Shippuden filler guide.",
      },
    ],
  },
  {
    slug: "attack-on-titan-hindi-dub",
    name: "Attack on Titan",
    anilistId: 16498,
    malId: 16498,
    genres: ["Action", "Drama", "Fantasy", "Mystery"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "87 episodes",
    schedule: "Full series available; dubbed reruns air Sundays at 4:00 PM IST",
    dubSince: "2022",
    studio: "Sound & Vision India",
    tagline: "Every episode of the Titan war, complete in Hindi, Tamil and Telugu.",
    intro:
      "Attack on Titan is one of the few modern classics to get a complete, official multi-language dub in India. All 87 episodes across the four seasons are dubbed in Hindi, Tamil and Telugu on Crunchyroll. If you want to experience the full story — from the fall of Wall Maria to the final confrontation — it is all sitting there in your language, ready to binge.",
    history:
      "The Hindi dub of Attack on Titan began on Crunchyroll in 2022 and expanded to Tamil and Telugu, making the show a flagship pick for Crunchyroll's regional line-up. As with Shippuden, Crunchyroll keeps the series in a Sunday 4:00 PM IST rerun slot even after completion.",
    watch:
      "Stream Attack on Titan on Crunchyroll India with the audio track switched to Hindi, Tamil or Telugu. All 87 episodes are available on demand. Use ZyniVerse's Attack on Titan guide for a recap-friendly viewing order.",
    faq: [
      {
        q: "Is Attack on Titan fully dubbed in Hindi?",
        a: "Yes, all 87 episodes are available in Hindi on Crunchyroll.",
      },
      {
        q: "Can I watch Attack on Titan in Tamil or Telugu?",
        a: "Yes, the complete series is dubbed in Tamil and Telugu on Crunchyroll.",
      },
      {
        q: "What is the Attack on Titan dub schedule?",
        a: "The complete series is available on demand, and Crunchyroll re-runs the dub on Sundays at 4:00 PM IST.",
      },
    ],
  },
  {
    slug: "doraemon-hindi-dub",
    name: "Doraemon",
    anilistId: 3010,
    malId: 26349,
    genres: ["Comedy", "Sci-Fi", "Slice of Life"],
    platforms: ["JioHotstar"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "1787+ episodes",
    schedule: "New episodes every Tuesday at 8:00 PM IST",
    dubSince: "2018",
    studio: "Disney India",
    tagline: "India's most-watched anime is still going — 1787+ Hindi episodes and counting.",
    intro:
      "Doraemon is the most famous anime in India, full stop. The robotic cat from the future has been a fixture of Indian television since the 2000s, and the Hindi dub keeps growing with over 1787 episodes. The complete run now lives on JioHotstar, with fresh episodes also landing weekly for viewers who prefer to keep up.",
    history:
      "Doraemon's Hindi dub has been maintained by Disney India for years, and the show jumped to JioHotstar as Disney+ Hotstar became JioHotstar. It has one of the deepest Hindi episode catalogues of any anime in the country — most Indian anime fans first heard 'Koi side effect nahi hoga' through this series.",
    watch:
      "Stream Doraemon in Hindi on JioHotstar. The catalogue has the full 1787+ episode Hindi run, and new episodes land every Tuesday at 8:00 PM IST.",
    faq: [
      {
        q: "Where can I watch Doraemon in Hindi?",
        a: "Doraemon's Hindi episodes stream on JioHotstar.",
      },
      {
        q: "When do new Doraemon Hindi episodes release?",
        a: "New episodes release every Tuesday at 8:00 PM IST on JioHotstar.",
      },
      {
        q: "How many Hindi Doraemon episodes are there?",
        a: "The Hindi dub has more than 1787 episodes and is still ongoing.",
      },
    ],
  },
  {
    slug: "shin-chan-hindi-dub",
    name: "Shin-chan",
    anilistId: 317,
    malId: 6045,
    genres: ["Comedy", "Slice of Life"],
    platforms: ["JioHotstar"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "1100+ episodes",
    schedule: "New episodes every Wednesday at 9:00 PM IST",
    dubSince: "2018",
    studio: "Disney India",
    tagline: "The world's cheekiest five-year-old, in Hindi, with 1100+ episodes to enjoy.",
    intro:
      "Crayon Shin-chan — or simply Shin-chan — needs no introduction to Indian families. The mischief of Nohara Shinnosuke has been a TV-era staple for well over a decade, and the Hindi dub on JioHotstar has crossed 1100 episodes. It remains one of the most re-watched anime for Indian kids and their parents alike.",
    history:
      "Shin-chan's Hindi dub has been produced by Disney India and predates the streaming era by years on broadcast TV. The show moved prominently onto JioHotstar, where the full Hindi catalogue is available and newer episodes continue to be added every Wednesday at 9:00 PM IST.",
    watch:
      "Watch Shin-chan in Hindi on JioHotstar. Binge the 1100+ episode catalogue or tune in every Wednesday at 9:00 PM IST for the latest episode.",
    faq: [
      {
        q: "Is Shin-chan available in Hindi on JioHotstar?",
        a: "Yes, Shin-chan has a 1100+ episode Hindi catalogue on JioHotstar.",
      },
      {
        q: "When do new Shin-chan Hindi episodes come out?",
        a: "New episodes drop every Wednesday at 9:00 PM IST.",
      },
      {
        q: "Who dubbed Shin-chan in Hindi?",
        a: "The Hindi dub is produced by Disney India, the team behind most long-running Indian anime dubs.",
      },
    ],
  },
  {
    slug: "pokemon-hindi-dub",
    name: "Pokemon",
    anilistId: 656,
    malId: 6702,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    platforms: ["Cartoon Network"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "1250+ episodes",
    schedule: "New episodes every Wednesday at 6:00 PM IST",
    dubSince: "2019",
    studio: "Turner India",
    tagline: "Gotta catch 'em all in Hindi — 1250+ episodes and still airing on Cartoon Network.",
    intro:
      "Pokemon in Hindi is the gateway anime for an entire generation of Indian fans. Ash Ketchum's journey has been dubbed continuously for Cartoon Network India, and the Hindi run now exceeds 1250 episodes. The show remains the most reliable kids' anime pickup on Indian TV, airing fresh episodes every Wednesday.",
    history:
      "Pokemon has aired in Hindi on Cartoon Network India since 2019, with the dub produced by Turner India. Unlike streaming-first dubs, Pokemon's Hindi track has always been tuned for TV broadcast — fast, energetic and aimed squarely at the after-school slot.",
    watch:
      "Catch Pokemon in Hindi on Cartoon Network India every Wednesday at 6:00 PM IST. The Hindi catalogue also rotates across the network's anime blocks, so keep an eye on the schedule for older arcs.",
    faq: [
      {
        q: "Where can I watch Pokemon in Hindi?",
        a: "Pokemon airs in Hindi on Cartoon Network India, with new episodes every Wednesday at 6:00 PM IST.",
      },
      {
        q: "How many Pokemon episodes are dubbed in Hindi?",
        a: "The Hindi dub has crossed 1250 episodes and continues weekly.",
      },
      {
        q: "Is Pokemon dubbed by Cartoon Network?",
        a: "The Hindi dub is produced by Turner India and broadcast on Cartoon Network India.",
      },
    ],
  },
  {
    slug: "digimon-adventure-hindi-dub",
    name: "Digimon Adventure (2020)",
    anilistId: 107696,
    malId: 52991,
    genres: ["Action", "Adventure", "Comedy"],
    platforms: ["Cartoon Network"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "67 episodes",
    schedule: "Full series available; dubbed airings Fridays at 6:30 PM IST",
    dubSince: "2021",
    studio: "Turner India",
    tagline: "The 2020 Digimon reboot, fully dubbed in Hindi, Tamil and Telugu.",
    intro:
      "The 2020 Digimon Adventure reboot gave the Digital World a modern coat of paint, and Indian viewers got the complete 67-episode run in Hindi, Tamil and Telugu on Cartoon Network. If you grew up on the original Digimon on Indian TV, this is the same adventure — sharper animation, snappier pacing, and your choice of language.",
    history:
      "Turner India dubbed the 2020 Digimon Adventure for Cartoon Network, covering all three major Indian languages. The show is one of the few Indian-channel dubs to ship complete in Hindi, Tamil and Telugu simultaneously.",
    watch:
      "Digimon Adventure (2020) airs on Cartoon Network India, with dubbed reruns every Friday at 6:30 PM IST. All 67 episodes are available across the Hindi, Tamil and Telugu tracks.",
    faq: [
      {
        q: "Is Digimon Adventure (2020) available in Hindi?",
        a: "Yes, the full 67-episode 2020 series is dubbed in Hindi on Cartoon Network.",
      },
      {
        q: "Does Digimon Adventure have a Tamil or Telugu dub?",
        a: "Yes, Turner India dubbed the series in Tamil and Telugu as well.",
      },
      {
        q: "When does Digimon Adventure air in India?",
        a: "Dubbed episodes air on Cartoon Network India, with reruns every Friday at 6:30 PM IST.",
      },
    ],
  },
  {
    slug: "dragon-ball-super-hindi-dub",
    name: "Dragon Ball Super",
    anilistId: 16935,
    malId: 22319,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "131 episodes",
    schedule: "Full series available; dubbed re-runs air Sundays at 12:00 PM IST",
    dubSince: "2022",
    studio: "Sound & Vision India",
    tagline: "Goku's modern saga — all 131 episodes in Hindi on Crunchyroll.",
    intro:
      "Dragon Ball Super brought Goku and friends back for Beerus, the Tournament of Power and everything in between, and Indian fans can access the entire 131-episode series in Hindi on Crunchyroll. It is the cleanest entry point into the modern Dragon Ball era without the decades of TV-era episodes.",
    history:
      "Crunchyroll launched Dragon Ball Super in Hindi in 2022, dubbed by Sound & Vision India. With the movie-era content still arriving, the 131 TV episodes serve as the canonical Hindi starting point for the series.",
    watch:
      "Stream Dragon Ball Super in Hindi on Crunchyroll India — all 131 episodes are on demand, and the dub re-runs Sundays at 12:00 PM IST for scheduled viewers.",
    faq: [
      {
        q: "Where can I watch Dragon Ball Super in Hindi?",
        a: "All 131 episodes stream in Hindi on Crunchyroll India.",
      },
      {
        q: "Is Dragon Ball Super fully dubbed?",
        a: "Yes, the complete 131-episode series is available in Hindi.",
      },
      {
        q: "Does the Hindi dub of Dragon Ball Super have a TV slot?",
        a: "Crunchyroll re-runs the dub on Sundays at 12:00 PM IST.",
      },
    ],
  },
  {
    slug: "solo-leveling-hindi-dub",
    name: "Solo Leveling",
    anilistId: 145139,
    malId: 113415,
    genres: ["Action", "Adventure", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "24+ episodes (2 seasons)",
    schedule: "New episodes every Saturday at 10:00 PM IST",
    dubSince: "2024",
    studio: "Sound & Vision India",
    tagline: "Sung Jinwoo's rise, dubbed weekly — Saturday nights on Crunchyroll.",
    intro:
      "Solo Leveling is the anime that every Indian action fan has been talking about, and its Hindi dub keeps pace with a fresh episode every Saturday. Following the weakest hunter Sung Jinwoo as he unlocks the ability to level up without limits, the series currently spans 24 Hindi-dubbed episodes across two seasons.",
    history:
      "The Hindi dub arrived in 2024 as part of Crunchyroll's push to shrink the gap between simulcast and regional releases. Unlike older dubs that launched long after broadcast, Solo Leveling's Hindi version follows the Japanese release closely, with new dubbed episodes landing every Saturday at 10:00 PM IST.",
    watch:
      "Watch Solo Leveling in Hindi on Crunchyroll. New episodes drop every Saturday at 10:00 PM IST, and the full Hindi catalogue of past episodes is available to catch up on.",
    faq: [
      {
        q: "When does the new Solo Leveling Hindi dub episode release?",
        a: "New Hindi episodes release every Saturday at 10:00 PM IST on Crunchyroll.",
      },
      {
        q: "How many Solo Leveling episodes are dubbed in Hindi?",
        a: "The Hindi dub covers 24+ episodes across two seasons and is still airing.",
      },
      {
        q: "Where can I watch Solo Leveling in India?",
        a: "Solo Leveling streams in Hindi on Crunchyroll India.",
      },
    ],
  },
  {
    slug: "jujutsu-kaisen-hindi-dub",
    name: "Jujutsu Kaisen",
    anilistId: 113415,
    malId: 23755,
    genres: ["Action", "Fantasy", "School", "Shounen"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "48 episodes (2 seasons)",
    schedule: "Full series available; dubbed re-runs air Saturdays at 11:00 PM IST",
    dubSince: "2022",
    studio: "Sound & Vision India",
    tagline: "Yuji and the sorcerers — both seasons, complete in Hindi.",
    intro:
      "Jujutsu Kaisen exploded in popularity worldwide, and Indian fans can stream both seasons in Hindi on Crunchyroll. Yuji Itadori's battle with curses runs across 48 episodes, all fully dubbed. Whether it is the Shibuya Incident or the chaotic first season, the entire current anime is one binge away.",
    history:
      "The Hindi dub began in 2022 and covered both seasons as they aired. Season 1 and Season 2 are now complete in Hindi, with Crunchyroll keeping the series in a Saturday 11:00 PM IST rerun slot.",
    watch:
      "Stream Jujutsu Kaisen in Hindi on Crunchyroll India. Both seasons — 48 episodes — are available on demand, with reruns airing Saturdays at 11:00 PM IST.",
    faq: [
      {
        q: "Is Jujutsu Kaisen available in Hindi?",
        a: "Yes, all 48 episodes across both seasons are dubbed in Hindi on Crunchyroll.",
      },
      {
        q: "When does Jujutsu Kaisen air in Hindi?",
        a: "The full series is on demand, and Crunchyroll re-runs the dub Saturdays at 11:00 PM IST.",
      },
      {
        q: "Is a third season dubbed in Hindi?",
        a: "Jujutsu Kaisen Season 3 is expected, but it is not yet available in Hindi.",
      },
    ],
  },
  {
    slug: "kochikame-hindi-dub",
    name: "Kochikame",
    anilistId: 1867,
    malId: 869,
    genres: ["Comedy", "Slice of Life"],
    platforms: ["JioHotstar"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "380 episodes",
    schedule: "Full series available; dubbed airings Thursdays at 7:30 PM IST",
    dubSince: "2019",
    studio: "Disney India",
    tagline: "Ryotsu and the gang — 380 episodes of classic comedy in Hindi.",
    intro:
      "Kochikame is one of those quiet Indian favourites that almost nobody outside anime circles talks about. The comedy of police officer Kankichi Ryotsu and the madcap residents of the Katsushika precinct was dubbed into Hindi for JioHotstar, and the full 380-episode run remains a surprisingly re-watchable slice of retro comedy.",
    history:
      "The Hindi dub was produced by Disney India and released on the Hotstar platform, which later became JioHotstar. Kochikame's gentle, episodic comedy made it a natural fit for Indian families in the way few action series could match.",
    watch:
      "Watch Kochikame in Hindi on JioHotstar. All 380 episodes are available on the app, with dubbed airings every Thursday at 7:30 PM IST.",
    faq: [
      {
        q: "Where can I watch Kochikame in Hindi?",
        a: "Kochikame streams in Hindi on JioHotstar.",
      },
      {
        q: "How many Kochikame episodes are in Hindi?",
        a: "All 380 episodes are available in the Hindi dub.",
      },
      {
        q: "Who dubbed Kochikame in Hindi?",
        a: "The Hindi dub was produced by Disney India.",
      },
    ],
  },
  {
    slug: "beyblade-burst-hindi-dub",
    name: "Beyblade Burst",
    anilistId: 9945,
    malId: 16498,
    genres: ["Action", "Sports"],
    platforms: ["Sony YAY"],
    languages: ["Hindi"],
    status: "Airing",
    episodeCount: "325+ episodes",
    schedule: "New episodes every Tuesday at 5:30 PM IST",
    dubSince: "2020",
    studio: "Sony India",
    tagline: "Let it rip! Beyblade Burst keeps spinning with new Hindi episodes every Tuesday.",
    intro:
      "Beyblade Burst is the modern face of the Beyblade franchise on Indian television. The Hindi dub on Sony YAY has crossed 325 episodes and keeps adding new ones every Tuesday. It is the cleanest way for a new generation to get into spinning tops without touching the 2000s series.",
    history:
      "Sony India has kept Beyblade Burst dubbed for its Sony YAY channel since 2020. The show's long seasonal structure means the Hindi track stays in steady production rather than ending with a single batch.",
    watch:
      "Watch Beyblade Burst in Hindi on Sony YAY every Tuesday at 5:30 PM IST. Episodes also rotate across the channel's weekend blocks.",
    faq: [
      {
        q: "Where can I watch Beyblade Burst in Hindi?",
        a: "Beyblade Burst airs in Hindi on Sony YAY.",
      },
      {
        q: "When do new Beyblade Burst Hindi episodes release?",
        a: "New episodes release every Tuesday at 5:30 PM IST.",
      },
      {
        q: "How many Hindi Beyblade Burst episodes exist?",
        a: "The Hindi dub has crossed 325 episodes and continues airing.",
      },
    ],
  },
  {
    slug: "death-note-hindi-dub",
    name: "Death Note",
    anilistId: 1535,
    malId: 1535,
    genres: ["Mystery", "Police", "Psychological", "Thriller"],
    platforms: ["Crunchyroll", "Netflix"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "37 episodes",
    schedule: "Full series available on demand",
    dubSince: "2021",
    studio: "Sound & Vision India",
    tagline: "Light vs L — the battle of a notebook, fully dubbed in Hindi.",
    intro:
      "Death Note is the classic recommendation for newcomers to anime, and the Hindi dub makes it even easier to recommend in India. All 37 episodes of Light Yagami's war with the shinigami-turned-detective L are dubbed in Hindi. It is short, complete and one of the highest-quality Hindi dubs around.",
    history:
      "The Hindi dub was produced by Sound & Vision India and released in 2021, quickly spreading across Crunchyroll and Netflix in India. Because the series is only 37 episodes, it is the most approachable 'serious anime' for Hindi-speaking viewers.",
    watch:
      "Stream Death Note in Hindi on Crunchyroll or Netflix India. All 37 episodes are available on demand — no schedule needed for this one.",
    faq: [
      {
        q: "Is Death Note fully dubbed in Hindi?",
        a: "Yes, all 37 episodes are available in Hindi.",
      },
      {
        q: "Where can I watch Death Note in Hindi?",
        a: "Death Note streams in Hindi on Crunchyroll and Netflix in India.",
      },
      {
        q: "How long is the Death Note Hindi dub?",
        a: "The complete series is 37 episodes, all available on demand.",
      },
    ],
  },
  {
    slug: "frieren-hindi-dub",
    name: "Frieren: Beyond Journey's End",
    anilistId: 154587,
    malId: 154587,
    genres: ["Adventure", "Drama", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "28 episodes (Season 1)",
    schedule: "Full season available on demand",
    dubSince: "2024",
    studio: "Sound & Vision India",
    tagline: "The melancholic elf's journey — Season 1 in Hindi, Tamil and Telugu.",
    intro:
      "Frieren: Beyond Journey's End became the most critically loved anime of its year, and Crunchyroll rewarded Indian fans with a full regional dub. Season 1's 28 episodes are available in Hindi, Tamil and Telugu, making this one of the few 'prestige' anime fully localised for Indian audiences.",
    history:
      "The regional dub arrived in 2024, produced by the same Sound & Vision India team behind most of Crunchyroll's Indian language tracks. Its launch across three languages at once was a sign of how far Indian dubbing has come on streaming.",
    watch:
      "Stream Frieren in Hindi, Tamil or Telugu on Crunchyroll India. Season 1's 28 episodes are all on demand.",
    faq: [
      {
        q: "Is Frieren available in Hindi?",
        a: "Yes, Season 1 is fully dubbed in Hindi on Crunchyroll.",
      },
      {
        q: "Does Frieren have a Tamil or Telugu dub?",
        a: "Yes, Season 1 is also available in Tamil and Telugu.",
      },
      {
        q: "How many Frieren episodes are dubbed in Indian languages?",
        a: "All 28 episodes of Season 1 are available in Hindi, Tamil and Telugu.",
      },
    ],
  },
  {
    slug: "fullmetal-alchemist-brotherhood-hindi-dub",
    name: "Fullmetal Alchemist: Brotherhood",
    anilistId: 5114,
    malId: 5114,
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "64 episodes",
    schedule: "Full series available on demand",
    dubSince: "2026",
    studio: "Sound & Vision India",
    tagline: "The greatest shounen of all time finally gets its Indian dub.",
    intro:
      "Fullmetal Alchemist: Brotherhood has a reputation as the highest-rated anime on planet Earth, and it finally reached Indian audiences with a full regional dub in 2026. All 64 episodes are available in Hindi, Tamil and Telugu on Crunchyroll, giving Indian fans the chance to experience the Elric brothers' story in their own language.",
    history:
      "The regional dub was a milestone launch for Crunchyroll India, produced by Sound & Vision India in three languages simultaneously. Its arrival marked one of the biggest 'classics finally localised' moments in the Hindi anime space.",
    watch:
      "Stream Fullmetal Alchemist: Brotherhood in Hindi, Tamil or Telugu on Crunchyroll India. All 64 episodes are on demand.",
    faq: [
      {
        q: "Is Fullmetal Alchemist: Brotherhood dubbed in Hindi?",
        a: "Yes, all 64 episodes are available in Hindi on Crunchyroll.",
      },
      {
        q: "Does Brotherhood have Tamil and Telugu dubs?",
        a: "Yes, the series is also fully dubbed in Tamil and Telugu.",
      },
      {
        q: "Where can I watch Brotherhood in India?",
        a: "The complete series streams on Crunchyroll India in all three languages.",
      },
    ],
  },
];