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
  status: "Airing" | "Completed" | "Upcoming" | "On Hiatus";
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
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Airing",
    episodeCount: "1155+ episodes (Hindi / Tamil / Telugu)",
    schedule: "Egghead arc dubs (eps 1089–1155) released in batches on Mondays, Mar–Jun 2026 — next arc window not yet announced",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "The biggest shounen saga on Crunchyroll India — Hindi, Tamil and Telugu, arc by arc.",
    intro:
      "One Piece is the biggest ongoing shounen anime in the world, and India gets it in three languages. Crunchyroll began releasing the later arcs in Hindi, Tamil and Telugu from 2023, and the Egghead arc arrived in all three languages with big Monday batch drops in 2026. Indian viewers can now follow Luffy all the way past episode 1155 in their own language — something the streaming release finally makes possible. Earlier, Cartoon Network India had broadcast the Wano arc in five Indian languages as a TV premiere.",
    history:
      "Crunchyroll added the show in India from September 2023 (episodes 892–1077) and kept streaming new episodes as they aired. In 2024, Cartoon Network India aired the Land of Wano arc in Hindi, Tamil, Telugu, Malayalam and Kannada. The streaming side went fully multi-language in March 2026 when the Egghead arc's dubs for episodes 1089–1155 began dropping in Hindi, Tamil and Telugu, releasing in batches on Mondays at 1:30 AM IST.",
    watch:
      "One Piece streams on Crunchyroll India — switch the audio track to Hindi, Tamil or Telugu inside the player. The Egghead arc's batches landed on Mondays at 1:30 AM IST; a new arc window hasn't been officially announced yet, and we'll track it here when it is.",
    faq: [
      {
        q: "When does the next One Piece Hindi dub release?",
        a: "The Egghead arc's Hindi, Tamil and Telugu batches released March–June 2026 (Mondays at 1:30 AM IST). A next arc — and its Indian dub window — has not been officially announced yet; we'll track it here when it lands.",
      },
      {
        q: "Where can I watch One Piece in Hindi?",
        a: "One Piece in Hindi streams on Crunchyroll India. Switch the audio track to Hindi inside the player.",
      },
      {
        q: "Is there a Tamil or Telugu dub of One Piece?",
        a: "Yes. The Egghead arc (episodes 1089–1155) has official Hindi, Tamil and Telugu dubs on Crunchyroll since March 2026.",
      },
      {
        q: "How many One Piece episodes are dubbed in Indian languages?",
        a: "The Indian-language dubs pass 1155 episodes (through the Egghead arc), with new arc batches continuing on Crunchyroll.",
      },
    ],
  },
  {
    slug: "detective-conan-hindi-dub",
    name: "Detective Conan",
    anilistId: 235,
    malId: 22769,
    genres: ["Comedy", "Mystery", "Police"],
    platforms: ["ETV Bal Bharat (TV)"],
    languages: ["Hindi"],
    status: "On Hiatus",
    episodeCount: "257 Hindi episodes (TV dub)",
    schedule: "TV broadcast paused — last new episodes May 2024",
    dubSince: "2023",
    studio: "ETV Bal Bharat",
    tagline: "The real Conan Hindi story: 257 episodes on ETV Bal Bharat — a TV dub, not a streaming one.",
    intro:
      "Detective Conan does have a Hindi dub in India — but not on streaming. The second Hindi dub premiered on ETV Bal Bharat on 15 May 2023, in up to twelve Indian languages. The channel aired 257 episodes (covering up to Japanese episode 538 with some skipped), with the run going on hiatus after 3 May 2024 and returning for a short rerun in late 2025. Long-time Indian viewers also remember Conan from its Hungama TV and Disney XD days in the 2000s.",
    history:
      "India has had three Hindi dubs of Detective Conan. The first was broadcast on Hungama TV and Disney XD in the 2000s. The current one launched on ETV Bal Bharat in May 2023 with a multi-language feed, with Telugu episodes also uploaded to ETV Win. Crunchyroll's own Conan catalogue — celebrated for the 30th anniversary — only carries Japanese and an English-dubbed episode selection.",
    watch:
      "Detective Conan in Hindi airs on ETV Bal Bharat, India's kids' channel run by ETV Network. The broadcast is currently on hiatus; a short rerun aired between September and October 2025.",
    faq: [
      {
        q: "Is Detective Conan dubbed in Hindi?",
        a: "Yes. 257 episodes of a Hindi dub aired on ETV Bal Bharat, produced for India. The TV run is currently on hiatus.",
      },
      {
        q: "Is Detective Conan in Hindi on Crunchyroll?",
        a: "No. Crunchyroll's Conan pages carry Japanese audio plus an English-dubbed episode selection. The full Hindi dub is TV-only (ETV Bal Bharat).",
      },
      {
        q: "Does Detective Conan have a Tamil or Telugu dub?",
        a: "The ETV Bal Bharat version aired on a multi-language feed (including Tamil and Telugu), and Telugu episodes were also posted to ETV Win.",
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
    status: "Airing",
    episodeCount: "500 episodes (dub roll-out in progress)",
    schedule: "Crunchyroll dubs: first batch ep 1–32 landed Jul 6, 2026 (7:00 AM IST); further batches through Sep 2026 — no fixed weekly slot",
    dubSince: "2026",
    studio: "Crunchyroll India",
    tagline: "The full shounen classic finally gets Hindi, Tamil and Telugu dubs — rolling out on Crunchyroll.",
    intro:
      "After years of waiting, Naruto: Shippuden is finally getting official Hindi, Tamil and Telugu dubs on Crunchyroll. The multi-language rollout began in July 2026, released in batches rather than as one giant dump. That means the complete 500-episode run is on its way — and followers of Naruto's jump from werewolf-infested Konoha to the Fourth Great Ninja War can watch it in a language that actually feels like home.",
    history:
      "Crunchyroll began rolling out the regional dubs on July 6, 2026, starting with episodes 1–32 (7:00 AM IST), announced alongside Tokyo Ghoul as part of its India push. The rollout runs in batches through September 2026 in Hindi, Tamil and Telugu. Because the source series is complete, batches land faster than a weekly simulcast.",
    watch:
      "Open Naruto: Shippuden on Crunchyroll India and pick Hindi, Tamil or Telugu from the audio options as batches release. Keep an eye on the Crunchyroll 'New' shelf for each drop — and use ZyniVerse's Naruto filler guide to find which episodes you can safely jump over.",
    faq: [
      {
        q: "Is the full Naruto: Shippuden series dubbed in Hindi?",
        a: "The Hindi, Tamil and Telugu dubs are rolling out on Crunchyroll from July 2026. The complete 500-episode run is on the way, released in batches.",
      },
      {
        q: "Does Naruto: Shippuden have a Tamil or Telugu dub?",
        a: "Yes — Tamil and Telugu are part of the same official Crunchyroll rollout as the Hindi dub.",
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
    platforms: ["Anime Times", "Muse India (YouTube)"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "87 episodes (all 4 seasons)",
    schedule: "Complete on Anime Times; Muse India re-dub rolling out seasonally",
    dubSince: "2024",
    studio: "Anime Times / Muse India",
    tagline: "All four seasons dubbed in Hindi, Tamil and Telugu — via Anime Times, with a fresh Muse re-dub on YouTube.",
    intro:
      "Attack on Titan is one of the few modern classics with a complete official Indian dub. The full 87-episode run across all four seasons became available in Hindi, Tamil, Telugu and Kannada on Anime Times (a Prime Video channel) between December 2024 and April 2025. Then in March 2026, Muse India began streaming a brand-new Hindi, Tamil and Telugu dub on YouTube — a completely fresh voice cast and production running daily, season by season.",
    history:
      "Anime Times (operated by The Anime Times Company, a joint venture of Japanese publishers) released the entire AoT run in Hindi, Tamil, Telugu and Kannada between December 2024 and April 2025. A separate second Indian dub then launched in 2026: Muse India's Hindi/Tamil/Telugu version on YouTube, which started with Season 1 in March 2026 and Season 2 in April 2026 (a new episode daily), with Season 3 in production. Note that the Hindi dub of the original 'Attack on Titan' term is not to be confused with the two different Indian dubs produced by different teams.",
    watch:
      "Stream all four seasons in Hindi, Tamil or Telugu on Anime Times (Prime Video Channels). Or follow the free Muse India YouTube channel for its newer, separate Hindi/Tamil/Telugu re-dub rollout.",
    faq: [
      {
        q: "Is Attack on Titan fully dubbed in Hindi?",
        a: "Yes. All 87 episodes across the four seasons are available in Hindi on Anime Times; a second, newer Hindi dub is also rolling out on Muse India's YouTube channel.",
      },
      {
        q: "Can I watch Attack on Titan in Tamil or Telugu?",
        a: "Yes. Anime Times offers Hindi, Tamil, Telugu and Kannada dubs, and Muse India is rolling out its own Hindi, Tamil and Telugu version.",
      },
      {
        q: "Where can I watch AoT in India for free?",
        a: "Muse India streams its Hindi, Tamil and Telugu dub on YouTube — an episode a day during each season's rollout.",
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
    episodeCount: "1787+ Hindi episodes",
    schedule: "Episodes rotate on JioHotstar and TV channels; no fixed weekly IST slot",
    dubSince: "TV 2000s · streaming 2018+",
    studio: "Disney India",
    tagline: "India's most-watched anime keeps growing — the Hindi run passes 1787 episodes.",
    intro:
      "Doraemon is the most famous anime in India, full stop. The robotic cat from the future has been a fixture of Indian television since the 2000s, and the Hindi catalogue — long the biggest anime library on Indian TV — has grown past 1787 episodes. The modern home of that backlog is JioHotstar, alongside regular TV broadcasts on Disney India's kid channels. Most Indian anime fans first heard 'Koi side effect nahi hoga' through this series.",
    history:
      "Doraemon's Hindi dub has been produced for India for decades, first by licensed broadcasters of the 2000s and later by Disney India, whose kids' portfolio carried the show. With the Disney+ Hotstar merger into JioHotstar, the Hindi episode library moved along with the platform. The show remains in regular broadcast rotation, so the true episode count on TV is always slightly above any archived number.",
    watch:
      "Stream Doraemon in Hindi on JioHotstar — the catalogue has the bulk of the 1787+ episode Hindi run. The show also keeps its long-running TV broadcast rotation on Disney India's kids' channels.",
    faq: [
      {
        q: "Where can I watch Doraemon in Hindi?",
        a: "Doraemon's Hindi episodes stream on JioHotstar, with ongoing broadcast rotation on TV channels.",
      },
      {
        q: "Do Doraemon episodes release on a fixed weekly slot?",
        a: "No single confirmed IST slot — Doraemon rotates across TV and streaming, so new episodes punctuate the schedule rather than landing on a fixed weekday.",
      },
      {
        q: "How many Hindi Doraemon episodes are there?",
        a: "The Hindi run has passed 1787 episodes and keeps growing across TV and streaming.",
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
    episodeCount: "1100+ Hindi episodes",
    schedule: "Episodes rotate on JioHotstar and TV channels; no fixed weekly IST slot",
    dubSince: "TV 2000s · streaming 2018+",
    studio: "Disney India",
    tagline: "The world's cheekiest five-year-old, in Hindi, with 1100+ episodes to enjoy.",
    intro:
      "Crayon Shin-chan — or simply Shin-chan — needs no introduction to Indian families. The mischief of Nohara Shinnosuke has been a TV-era staple for well over a decade, and the Hindi catalogue on JioHotstar has crossed 1100 episodes. It remains one of the most re-watched anime for Indian kids and their parents alike, and the show stays in regular broadcast rotation on Disney India's kids' channels.",
    history:
      "Shin-chan's Hindi dub has been produced for Indian television since the 2000s, moving through the kids' channel ecosystem before Disney India took on the catalogue and the show landed prominently on JioHotstar after the Disney+ Hotstar merger. The dub is still in production as new episodes and films keep coming.",
    watch:
      "Watch Shin-chan in Hindi on JioHotstar — the catalogue carries the 1100+ episode Hindi run, and the show keeps appearing in TV broadcast rotation.",
    faq: [
      {
        q: "Is Shin-chan available in Hindi on JioHotstar?",
        a: "Yes, Shin-chan has a 1100+ episode Hindi catalogue on JioHotstar.",
      },
      {
        q: "When do new Shin-chan Hindi episodes come out?",
        a: "There's no fixed weekly IST slot — new content lands across the TV rotation and JioHotstar catalogue rather than on a single weekday.",
      },
      {
        q: "Who dubbed Shin-chan in Hindi?",
        a: "The Hindi dub is produced by Disney India for the kids' channel portfolio and JioHotstar.",
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
    episodeCount: "1250+ episodes (TV catalogue)",
    schedule: "Episodes rotate on Cartoon Network India; no fixed weekly IST slot",
    dubSince: "TV 2000s · Turner India era",
    studio: "Turner India / CN",
    tagline: "Gotta catch 'em all in Hindi — a 1250+ episode TV catalogue, airing since the 2000s.",
    intro:
      "Pokemon in Hindi is the gateway anime for an entire generation of Indian fans. Ash Ketchum's journey has aired in Hindi on Indian TV since the Hungama TV era of the early 2000s and later on Cartoon Network India, where the Hindi catalogue has passed 1250 episodes. It's a broadcast-first dub — the Hindi track was produced to play in India, and the catalogue lives on the channel's rotation rather than a single streaming shelf.",
    history:
      "Pokemon's Hindi dub first aired on Hum-Gama / Hungama-style kid TV in the 2000s, then moved channels through the Turner India era to Cartoon Network India, where it built the deepest long-running anime catalogue on Indian TV. Newer Pokemon series have continued the multi-season dub on the network. Where exactly the catalogue moves next is a question of channel line-ups, not content — the dub itself never left India.",
    watch:
      "Catch Pokemon in Hindi on Cartoon Network India's rotation. The Hindi catalogue spans 1250+ episodes and rotates across the network's anime blocks, so check the channel's weekly grid for the current airing slot.",
    faq: [
      {
        q: "Where can I watch Pokemon in Hindi?",
        a: "Pokemon's Hindi catalogue airs on Cartoon Network India's rotation.",
      },
      {
        q: "How many Pokemon episodes are dubbed in Hindi?",
        a: "The Hindi catalogue has crossed 1250 episodes across the Pokemon series.",
      },
      {
        q: "Who produced the Hindi Pokemon dub?",
        a: "The Hindi dub was produced for Indian broadcast under the Turner India umbrella for Cartoon Network.",
      },
    ],
  },
  {
    slug: "digimon-adventure-hindi-dub",
    name: "Digimon Adventure (2020)",
    anilistId: 114811,
    malId: 52991,
    genres: ["Action", "Adventure", "Comedy"],
    platforms: ["Cartoon Network"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "On Hiatus",
    episodeCount: "38 of 67 episodes aired (TV)",
    schedule: "Broadcast on hiatus since February 2023",
    dubSince: "2022",
    studio: "Turner India (WBD)",
    tagline: "The 2020 Digimon reboot reached India in Hindi, Tamil and Telugu — then paused mid-run.",
    intro:
      "The 2020 Digimon Adventure reboot brought the Digital World to Indian TV in style. It premiered on Cartoon Network India on 24 October 2022 as part of the channel's Diwali line-up, airing in Hindi, Tamil and Telugu. But the run was pulled from the schedule before finishing: episodes 1–24 aired in October–November 2022, and episodes 25–38 streamed onto TV in February 2023. The broadcast has been on hiatus since, with 38 of the 67 episodes ever broadcast in India.",
    history:
      "The launch mirrored Dragon Ball Super's 2022 revival — the same three-language format, promoted under Cartoon Network India's 'Redraw Your World' campaign. The Hindi voice cast, announced at launch, included Vaibhav Thakkar as Taichi and Dev Singha as Agumon. Announced by Warner Bros. Discovery's kids' head (Uttam Pal Singh) as part of the channel's anime push, the show followed DBS's successful pattern — but unlike DBS it wasn't completed, and the format later expanded to five languages (adding Kannada and Malayalam) for Dragon Ball Z Kai.",
    watch:
      "Digimon Adventure (2020) aired on Cartoon Network India in Hindi, Tamil and Telugu. The Hindi/Tamil/Telugu broadcast is on hiatus since February 2023 — don't expect a 'complete 67 episodes' listing anywhere yet.",
    faq: [
      {
        q: "Is Digimon Adventure (2020) available in Hindi?",
        a: "Yes — 38 of 67 episodes aired in Hindi on Cartoon Network India (Oct 2022 – Feb 2023) before the broadcast went on hiatus.",
      },
      {
        q: "Does Digimon Adventure have a Tamil or Telugu dub?",
        a: "Yes — it aired in Hindi, Tamil and Telugu on Cartoon Network India's multi-audio feed.",
      },
      {
        q: "Was the whole 2020 series broadcast in India?",
        a: "No. Only 38 of 67 episodes aired; the broadcast paused in February 2023 and has not resumed.",
      },
    ],
  },
  {
    slug: "dragon-ball-super-hindi-dub",
    name: "Dragon Ball Super",
    anilistId: 21175,
    malId: 22319,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    platforms: ["SonyLIV", "Cartoon Network (TV)"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "131 episodes",
    schedule: "Full series broadcast on CN (2022); now streaming (SonyLIV)",
    dubSince: "2022",
    studio: "Sound & Vision India",
    tagline: "Goku's modern saga — all 131 episodes, broadcast in Hindi, Tamil and Telugu.",
    intro:
      "Dragon Ball Super made its Indian-language debut on 22 May 2022 with a 'Super Sunday' marathon on Cartoon Network India, airing back-to-back episodes in Hindi, Tamil and Telugu. The network then ran all five seasons — all 131 episodes — with the run concluding by November 2022. It was the first complete full-series broadcast in Indian languages and the clearest sign that regional anime dubs had returned to Indian TV. The series now streams on SonyLIV.",
    history:
      "Before 2022, DBS had aired in India only with an English dub (Bang Zoom! Entertainment) on a late-night Toonami/CN block from September 2017. The 2022 revival was dubbed in Hindi (over the English master) at Sound & Vision India, alongside Tamil and Telugu. Because Cartoon Network India dropped its English feed in 2020, the revival ran only in Hindi/Tamil/Telugu. Fans also caught the Hindi dub of the Dragon Ball Super: Super Hero movie on Crunchyroll from July 2023.",
    watch:
      "Stream all 131 episodes of Dragon Ball Super on SonyLIV, or revisit the Hindi/Tamil/Telugu broadcast history via Cartoon Network India's archive. The 2022 CN run was the first complete broadcast.",
    faq: [
      {
        q: "Where can I watch Dragon Ball Super in Hindi?",
        a: "The Hindi dub aired on Cartoon Network India (2022); the series is now available to stream on SonyLIV.",
      },
      {
        q: "Is Dragon Ball Super fully dubbed in Hindi?",
        a: "Yes — all 131 episodes aired in Hindi (plus Tamil and Telugu) on Cartoon Network India during 2022.",
      },
      {
        q: "Is Dragon Ball Super in Hindi on Crunchyroll?",
        a: "The TV series itself is not on Crunchyroll — but the Hindi dub of the Dragon Ball Super: Super Hero movie is (since July 2023).",
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
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "25 episodes (2 seasons)",
    schedule: "Full Hindi, Tamil & Telugu dub on demand — no ongoing weekly slot",
    dubSince: "2024",
    studio: "Crunchyroll India",
    tagline: "Sung Jinwoo's rise — both seasons dubbed in Hindi, Tamil & Telugu on Crunchyroll.",
    intro:
      "Solo Leveling is the anime every Indian action fan has been talking about, and Crunchyroll brought the Hindi dub to India early — the Hindi track began in January 2024, with Tamil and Telugu following that same month. Both seasons (25 episodes) are now fully dubbed in all three languages, placing one of the biggest recent shounen alongside the older classics in Crunchyroll's Indian line-up.",
    history:
      "Crunchyroll announced the Solo Leveling Hindi dub (with Ali Fazal as Sung Jinwoo) in December 2023, famously beating most regions to the punch with a day-of-premiere launch. Season 1's Hindi dub aired on a Saturday-night slot in early 2024, with Tamil and Telugu following in late January. Season 2 followed the same all-three-languages pattern. Both seasons are complete.",
    watch:
      "Watch Solo Leveling in Hindi, Tamil or Telugu on Crunchyroll India. Both seasons are available on demand — no schedule to chase for this one.",
    faq: [
      {
        q: "When does a new Solo Leveling Hindi episode release?",
        a: "Both seasons are already fully dubbed in Hindi, Tamil and Telugu on Crunchyroll — so it's a binge job, not a wait.",
      },
      {
        q: "How many Solo Leveling episodes are dubbed in Hindi?",
        a: "25 episodes across two seasons, in Hindi, Tamil and Telugu.",
      },
      {
        q: "Where can I watch Solo Leveling in India?",
        a: "Solo Leveling streams in Hindi, Tamil and Telugu on Crunchyroll India.",
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
    languages: ["Hindi", "Tamil"],
    status: "Completed",
    episodeCount: "47 episodes (2 seasons)",
    schedule: "Full series on demand in Hindi & Tamil — no ongoing weekly slot",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "Yuji and the sorcerers — both seasons, complete in Hindi and Tamil.",
    intro:
      "Jujutsu Kaisen's Hindi and Tamil dubs were a milestone for Crunchyroll India when they launched in July 2023, with the announced Hindi voice cast including Vidit Kumar as Yuji Itadori, Sahil Kulkarni as Megumi Fushiguro, Suvela Sharma as Nobara Kugisaki and Lohit Sharma as Satoru Gojo. The Season 2 Hindi and Tamil dubs followed that September. Both seasons (47 episodes) are now complete and streaming on demand.",
    history:
      "Season 1's Hindi dub premiered on 28 July 2023 (three episodes a week), with the Tamil dub on the same day. Season 2's Hindi and Tamil dubs began on 21 September 2023 alongside the Japanese broadcast. Unlike the TV-era dubs, this was a streaming-first rollout tied to the simulcast schedule. A Telugu track was not part of this release.",
    watch:
      "Stream Jujutsu Kaisen in Hindi or Tamil on Crunchyroll India — both seasons are on demand. If you're coming in fresh, the Season 2 Hidden Inventory arc is the perfect dark-horse start.",
    faq: [
      {
        q: "Is Jujutsu Kaisen available in Hindi?",
        a: "Yes — both seasons (47 episodes) are fully dubbed in Hindi on Crunchyroll.",
      },
      {
        q: "Does Jujutsu Kaisen have a Tamil dub?",
        a: "Yes — the Tamil dub covers both seasons on Crunchyroll. There's no Telugu track for JJK.",
      },
      {
        q: "Is a third season dubbed in Hindi?",
        a: "Not yet — a Hindi dub for the next season hasn't been announced.",
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
    episodeCount: "300+ episodes (TV run)",
    schedule: "Archived Hindi run on JioHotstar — no active slot",
    dubSince: "2010s · Hungama / Disney era",
    studio: "Disney India / Hungama",
    tagline: "Ryotsu and the gang — a retro Hindi run of 300+ episodes on JioHotstar.",
    intro:
      "Kochikame is one of those quiet Indian favourites that almost nobody outside anime circles talks about. The comedy of police officer Kankichi Ryotsu and the madcap residents of the Katsushika precinct was dubbed into Hindi for the Hungama side of India's kids' TV during the 2010s, and the archived run found a second life on the platform that became JioHotstar. It's a surprisingly re-watchable slice of retro comedy.",
    history:
      "The Hindi dub was produced under the Disney India / Hungama portfolio, which had picked up the rights to series like Kochikame, and later appeared on the streaming platform that became JioHotstar after the Disney+ Hotstar merger. Kochikame's gentle, episodic comedy made it a natural fit for Indian broadcast in the way few action series could match.",
    watch:
      "Watch Kochikame in Hindi on JioHotstar — the archived Hindi run (300+ episodes) is available on the app on demand.",
    faq: [
      {
        q: "Where can I watch Kochikame in Hindi?",
        a: "Kochikame's Hindi run is archived on JioHotstar.",
      },
      {
        q: "How many Kochikame episodes are in Hindi?",
        a: "The archived Hindi run covers 300+ episodes of the series.",
      },
      {
        q: "Who dubbed Kochikame in Hindi?",
        a: "The Hindi dub was produced for India's Hungama / Disney kids' TV portfolio.",
      },
    ],
  },
  {
    slug: "beyblade-burst-hindi-dub",
    name: "Beyblade Burst",
    anilistId: 21236,
    genres: ["Action", "Sports"],
    platforms: ["Sony YAY"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "325+ episodes (all Burst seasons)",
    schedule: "Hindi run for the Burst era completed on Sony YAY",
    dubSince: "2020",
    studio: "Sony YAY",
    tagline: "Let it rip! The entire Beyblade Burst era aired in Hindi on Sony YAY.",
    intro:
      "Beyblade Burst is the modern face of the Beyblade franchise on Indian television. The Hindi dub on Sony YAY built a catalogue of 325+ episodes across the Burst seasons, replacing the 2000s Metal series for a new generation of spinners. The Burst era's Indian broadcast is now complete, and the catalogue lives on via the channel's rotation and re-runs.",
    history:
      "Sony YAY's Hindi Beyblade Burst dub ran through the franchise's multi-season structure, each season adding new Hindi episodes for Indian viewers. With the Burst era wrapped, the Hindi run is complete; any future Beyblade series (like the newer Beyblade X) would be a separate dub decision for the channel.",
    watch:
      "Find Beyblade Burst's Hindi episodes on Sony YAY — the Burst-era catalogue (325+ episodes) airs across the channel's rotation and weekend blocks.",
    faq: [
      {
        q: "Where can I watch Beyblade Burst in Hindi?",
        a: "Beyblade Burst's Hindi episodes air on Sony YAY.",
      },
      {
        q: "How many Hindi Beyblade Burst episodes exist?",
        a: "The Hindi catalogue spans 325+ episodes across the Beyblade Burst seasons.",
      },
      {
        q: "Is Beyblade Burst still airing in India?",
        a: "The Burst-era Hindi run has concluded on Sony YAY; episodes remain in re-run rotation.",
      },
    ],
  },
  {
    slug: "death-note-hindi-dub",
    name: "Death Note",
    anilistId: 1535,
    malId: 1535,
    genres: ["Mystery", "Police", "Psychological", "Thriller"],
    platforms: ["Anime Times (Prime Video Channels)"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "37 episodes",
    schedule: "Full series on demand — weekly rollout began Aug 2025, now complete",
    dubSince: "2025",
    studio: "Anime Times",
    tagline: "Light vs L — the battle of a notebook, newly dubbed in Hindi, Tamil & Telugu.",
    intro:
      "The Death Note anime finally got its Indian regional dubs in August 2025 — on Anime Times, the anime-only Prime Video channel, not the usual streamers. The Hindi, Tamil and Telugu dubs arrived with two episodes at launch and the rest released weekly until the complete 37-episode series was available. It is short, complete and one of the cleanest recent examples of multi-language dubbing for a classic.",
    history:
      "Anime Times (the joint venture of Japanese publishers launched in India in December 2023) added Death Note's Hindi, Tamil and Telugu dubs on 21 August 2025. The channel — which also streams Attack on Titan in India — released the dubs in weekly batches rather than all at once, kept the appointment-viewing feel for a 19-year-old classic.",
    watch:
      "Stream Death Note in Hindi, Tamil or Telugu on Anime Times, available through Amazon Prime Video Channels in India. All 37 episodes are on demand.",
    faq: [
      {
        q: "Is Death Note fully dubbed in Hindi?",
        a: "Yes — all 37 episodes are available in Hindi on Anime Times.",
      },
      {
        q: "Where can I watch Death Note in Hindi?",
        a: "Death Note streams in Hindi, Tamil and Telugu on Anime Times, a Prime Video channel.",
      },
      {
        q: "Did Death Note get a Tamil or Telugu dub?",
        a: "Yes — all three regional dubs (Hindi, Tamil, Telugu) launched together on Anime Times in August 2025.",
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
    episodeCount: "56 episodes (2 seasons)",
    schedule: "Full S1 & S2 on demand in Hindi, Tamil & Telugu",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "The melancholic elf's journey — both seasons in Hindi, Tamil and Telugu.",
    intro:
      "Frieren: Beyond Journey's End became the most critically loved anime of its generation, and Crunchyroll gave India one of its first full multi-language dubs for a prestige title. Season 1's Hindi and Tamil dubs arrived in November 2023, the Telugu dub in August 2024, and Season 2 streamed with all three languages as it aired in 2026. Both seasons are now complete in Hindi, Tamil and Telugu.",
    history:
      "Crunchyroll streamed Frieren in India as it aired starting October 2023, added its English dub that same month, and followed with Hindi and Tamil dubs in November 2023 — making it one of the earliest streaming-first tri-lingual releases for a non-shounen series. The Telugu dub came as a batch release in August 2024. Season 2's Hindi, Tamil and Telugu dubs streamed from February 2026.",
    watch:
      "Stream Frieren in Hindi, Tamil or Telugu on Crunchyroll India. Both seasons (56 episodes) are on demand — this is a binge-friendly, prestige-adjacent watch.",
    faq: [
      {
        q: "Is Frieren available in Hindi?",
        a: "Yes — both seasons are fully dubbed in Hindi on Crunchyroll.",
      },
      {
        q: "Does Frieren have a Tamil or Telugu dub?",
        a: "Yes — Season 1's Tamil dub began November 2023, Telugu in August 2024, and Season 2 streams in all three languages.",
      },
      {
        q: "How many Frieren episodes are dubbed in Indian languages?",
        a: "All 56 episodes across the two seasons are available in Hindi, Tamil and Telugu.",
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
    status: "Airing",
    episodeCount: "64 episodes (dub roll-out in progress)",
    schedule: "Batched rollout every ~3 weeks on Crunchyroll (July–Oct 2026)",
    dubSince: "2026",
    studio: "Crunchyroll India",
    tagline: "The highest-rated anime of all time finally gets its Indian dub — rolling out on Crunchyroll.",
    intro:
      "Fullmetal Alchemist: Brotherhood has a reputation as the highest-rated anime on the planet, and it finally reached Indian audiences with a full regional dub in 2026. The Hindi, Tamil and Telugu dubs began streaming on Crunchyroll on 27 July 2026, released in batches roughly every three weeks through October 2026. The voice cast (announced at launch) includes Anubhav Rawat as Edward Elric and Hitanshi Jha as Alphonse Elric.",
    history:
      "Crunchyroll announced the Brotherhood regional dubs as one of the biggest 'classics finally localised' moments for the Hindi anime space. All 64 episodes were dubbed in all three languages and are being released as the series' rollout completes, rather than as a single binge dump — a deliberate batched release to extend the watch window across several months.",
    watch:
      "Stream Fullmetal Alchemist: Brotherhood in Hindi, Tamil or Telugu on Crunchyroll India. New batches land roughly every three weeks, so check the Dub Meter on the hub for the next window during the July–October 2026 rollout.",
    faq: [
      {
        q: "Is Fullmetal Alchemist: Brotherhood dubbed in Hindi?",
        a: "Yes — all 64 episodes are dubbed in Hindi, Tamil and Telugu on Crunchyroll. The dubs roll out in batches between July and October 2026.",
      },
      {
        q: "Is the whole series available at once?",
        a: "Not immediately — Crunchyroll releases the dubs in batches (~every 3 weeks), so episodes unlock progressively through October 2026.",
      },
      {
        q: "Where can I watch Brotherhood in India?",
        a: "The complete series streams on Crunchyroll India in all three languages.",
      },
    ],
  },
];