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
    schedule: "Egghead arc dubs release in batches — see the live Hindi dub schedule for this week's uploads",
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
    schedule: "Crunchyroll releases Hindi dubs in batches — no fixed weekly slot",
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
    schedule: "Batched rollout on Crunchyroll — no fixed weekly slot",
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

  // ── Crunchyroll Hindi (classics & modern hits) ──
  {
    slug: "demon-slayer-hindi-dub",
    name: "Demon Slayer",
    anilistId: 101922,
    genres: ["Action", "Fantasy", "Shounen"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "55+ episodes (all released seasons & arcs)",
    schedule: "All released seasons carry Hindi audio on Crunchyroll",
    dubSince: "2022",
    studio: "Crunchyroll India",
    tagline: "Tanjiro's demon-hunting journey in Hindi — every released season on Crunchyroll India.",
    intro:
      "Demon Slayer: Kimetsu no Yaiba is one of the biggest anime in the world, and it became one of the first modern hits to get a Hindi dub on Crunchyroll India in 2022. From Tanjiro's first clash with the demons that killed his family to the swordsmith village and Hashira training arcs, the Hindi audio follows the show's seasonal releases. For most Indian fans it is the easiest big shounen to watch start to finish in Hindi.",
    history:
      "Crunchyroll added a Hindi audio track for Demon Slayer in 2022 as part of its India localisation push, covering the first season and continuing through the later arcs. The dub uses an Indian voice cast and sits alongside Japanese and English inside the player, so you switch languages without changing where you watch.",
    watch:
      "Open Demon Slayer on Crunchyroll India and pick Hindi from the audio options. Every released season and arc — including the Mugen Train arc — carries the Hindi track.",
    faq: [
      {
        q: "Is Demon Slayer dubbed in Hindi?",
        a: "Yes. The released seasons and arcs of Demon Slayer carry an official Hindi dub on Crunchyroll India.",
      },
      {
        q: "Where can I watch Demon Slayer in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi inside the player.",
      },
      {
        q: "Does Demon Slayer have a Tamil or Telugu dub?",
        a: "Crunchyroll India's Demon Slayer catalogue is primarily Hindi. Tamil and Telugu availability varies by arc, so check the audio options for the season you're watching.",
      },
    ],
  },
  {
    slug: "my-hero-academia-hindi-dub",
    name: "My Hero Academia",
    anilistId: 21459,
    genres: ["Action", "Comedy", "School", "Shounen"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "138+ episodes (all seven seasons)",
    schedule: "All released seasons available in Hindi on Crunchyroll",
    dubSince: "2022",
    studio: "Crunchyroll India",
    tagline: "Deku's climb to become the world's greatest hero — in Hindi, season by season.",
    intro:
      "My Hero Academia turns superheroes into a school subject, and the Hindi dub lets Indian viewers follow Izuku Midoriya's rise through U.A. High in their own language. Crunchyroll added Hindi audio for the series in 2022, covering the story from the entrance exam all the way through the later, darker seasons. It's a natural starting point for younger shounen fans discovering anime.",
    history:
      "The Hindi dub arrived on Crunchyroll India from 2022, tracking the anime's seasons as they released. With seven seasons already out and the story reaching its final arc, the show now offers a long, complete Hindi run rather than a short taster.",
    watch:
      "Stream My Hero Academia on Crunchyroll India and select Hindi from the audio tracks. Seasons release in order, so simply start from Season 1.",
    faq: [
      {
        q: "Is My Hero Academia dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for My Hero Academia, covering the released seasons.",
      },
      {
        q: "Where can I watch MHA in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi inside the player.",
      },
      {
        q: "How many seasons of My Hero Academia are in Hindi?",
        a: "The Hindi dub covers the seasons released on Crunchyroll India, spanning roughly 138 episodes across seven seasons.",
      },
    ],
  },
  {
    slug: "chainsaw-man-hindi-dub",
    name: "Chainsaw Man",
    anilistId: 127230,
    genres: ["Action", "Fantasy", "Horror"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi", "Tamil", "Telugu"],
    status: "Completed",
    episodeCount: "12 episodes (Season 1)",
    schedule: "Complete on Crunchyroll in all three Indian languages",
    dubSince: "Hindi 2023 · Tamil/Telugu 2024",
    studio: "Crunchyroll India",
    tagline: "The blood-soaked breakout hit — Hindi, Tamil and Telugu, all on Crunchyroll India.",
    intro:
      "Chainsaw Man arrived as one of the most talked-about anime of its year, and Indian viewers got it in three languages. Denji's story — a broke teenager fused with his chainsaw devil — landed in Hindi on Crunchyroll in 2023, with Tamil and Telugu following in 2024. It's a fast, twelve-episode watch, which makes it a perfect show to sample a regional dub.",
    history:
      "Crunchyroll released the Hindi dub of Chainsaw Man in 2023, then extended the same season to Tamil and Telugu audiences in 2024. The original 12-episode season is complete, and the story continues in the manga and later anime entries.",
    watch:
      "Watch Chainsaw Man on Crunchyroll India and choose Hindi, Tamil or Telugu from the audio options. All 12 episodes are available.",
    faq: [
      {
        q: "Is Chainsaw Man dubbed in Hindi?",
        a: "Yes. Season 1 of Chainsaw Man has an official Hindi dub on Crunchyroll India.",
      },
      {
        q: "Does Chainsaw Man have Tamil or Telugu audio?",
        a: "Yes — Crunchyroll added Tamil and Telugu dubs for Chainsaw Man's first season in 2024, alongside the Hindi track.",
      },
      {
        q: "How many Chainsaw Man episodes are dubbed?",
        a: "The full first season of 12 episodes is dubbed in Hindi, Tamil and Telugu.",
      },
    ],
  },
  {
    slug: "sword-art-online-hindi-dub",
    name: "Sword Art Online",
    anilistId: 11757,
    genres: ["Action", "Adventure", "Fantasy", "Romance"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "96 episodes (all seasons)",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2022",
    studio: "Crunchyroll India",
    tagline: "Kirito's death-game saga, dubbed in Hindi — all the way through Alicization.",
    intro:
      "Sword Art Online is one of the defining isekai of the 2010s, and its Hindi dub on Crunchyroll covers the whole ride — from the original Aincrad death game through Gun Gale Online and the Alicization arc. Indian viewers got Hindi audio from 2022, making it a rare long-running series with a full regional track across its seasons.",
    history:
      "Crunchyroll began adding Hindi audio for Sword Art Online in 2022, tracking the anime's multi-season run. Because the series was already complete, the Hindi catalogue covers a large episode count rather than a single season.",
    watch:
      "Stream Sword Art Online on Crunchyroll India and set the audio to Hindi. Start at Season 1 for the intended experience — later arcs assume you know the earlier ones.",
    faq: [
      {
        q: "Is Sword Art Online dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Sword Art Online across its seasons.",
      },
      {
        q: "Where can I watch SAO in Hindi?",
        a: "On Crunchyroll India — switching the audio track to Hindi inside the player.",
      },
      {
        q: "How many SAO episodes are dubbed in Hindi?",
        a: "The Hindi run spans roughly 96 episodes across the main Sword Art Online seasons.",
      },
    ],
  },
  {
    slug: "spy-x-family-hindi-dub",
    name: "Spy x Family",
    anilistId: 140960,
    genres: ["Action", "Comedy", "Slice of Life"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "37+ episodes (Seasons 1–2)",
    schedule: "Released seasons available in Hindi on Crunchyroll",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "A spy, an assassin and a telepath — the world's most chaotic fake family, in Hindi.",
    intro:
      "Spy x Family's premise — a spy, an assassin and a mind-reading child pretending to be a family — made it a global phenomenon, and Crunchyroll brought it to India in Hindi from 2023. The Hindi dub captures the show's blend of slapstick and warmth, following the Forgers across the first two seasons. It's an easy recommendation for viewers who want comedy over heavy action.",
    history:
      "The Hindi dub arrived on Crunchyroll India in 2023 and covers the released seasons of the anime. As new seasons air, the Indian audio track is expected to follow the same seasonal pattern.",
    watch:
      "Watch Spy x Family on Crunchyroll India and select Hindi from the audio options. Start from Season 1 — the comedy builds on the family's ongoing cover story.",
    faq: [
      {
        q: "Is Spy x Family dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Spy x Family's released seasons.",
      },
      {
        q: "Where can I watch Spy x Family in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi inside the player.",
      },
      {
        q: "How many episodes of Spy x Family are in Hindi?",
        a: "The Hindi dub covers roughly 37 episodes across the first two seasons.",
      },
    ],
  },
  {
    slug: "bleach-thousand-year-blood-war-hindi-dub",
    name: "Bleach: Thousand-Year Blood War",
    anilistId: 116674,
    genres: ["Action", "Fantasy", "Shounen"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "The final arc's cours (26+ episodes)",
    schedule: "Completed cours available in Hindi on Crunchyroll",
    dubSince: "2024",
    studio: "Crunchyroll India",
    tagline: "Bleach's epic final arc — the Thousand-Year Blood War — arrives in Hindi.",
    intro:
      "Bleach's long-awaited final arc returned as 'Thousand-Year Blood War', and Crunchyroll India gave it a Hindi dub in 2024. This is the modern, high-budget continuation that finally adapts the manga's ending, picking up with Ichigo back in Karakura Town as the Quincy wage war. For fans who grew up with Bleach, hearing it in Hindi is a full-circle moment.",
    history:
      "The Thousand-Year Blood War arc released as seasonal cours rather than one long run. Crunchyroll India added Hindi audio from 2024, covering the released parts of the arc, with the manga's original ending now fully in view.",
    watch:
      "Stream Bleach: Thousand-Year Blood War on Crunchyroll India and set the audio to Hindi. It follows the original Bleach series, so newcomers may want to start with the earlier arcs first.",
    faq: [
      {
        q: "Is Bleach: Thousand-Year Blood War dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for the Thousand-Year Blood War arc.",
      },
      {
        q: "Do I need to watch the original Bleach first?",
        a: "Yes — the Thousand-Year Blood War is the final arc, so it assumes you know the earlier Bleach story.",
      },
      {
        q: "Where can I watch TYBW in Hindi?",
        a: "On Crunchyroll India — choose the Hindi audio track in the player.",
      },
    ],
  },
  {
    slug: "hunter-x-hunter-hindi-dub",
    name: "Hunter x Hunter",
    anilistId: 136,
    genres: ["Action", "Adventure", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "148 episodes (2011 series)",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "Gon's search for his father — all 148 episodes of HxH (2011) in Hindi.",
    intro:
      "Hunter x Hunter's 2011 adaptation is a fan-favourite adventure, and Crunchyroll brought the full 148-episode run to India in Hindi in 2023. Following Gon Freecss as he becomes a Hunter to find his father, the series shifts from bright adventure to some of shounen's darkest arcs. The complete Hindi dub makes it a low-commitment entry point to a beloved classic.",
    history:
      "Crunchyroll India added Hindi audio for the 2011 Hunter x Hunter in 2023, covering the series in full. Because the anime ended in 2014, the Hindi catalogue is complete rather than ongoing.",
    watch:
      "Watch Hunter x Hunter on Crunchyroll India and pick Hindi from the audio options. It runs in order through several arcs, ending at the anime's original stopping point.",
    faq: [
      {
        q: "Is Hunter x Hunter dubbed in Hindi?",
        a: "Yes. The 2011 Hunter x Hunter has a Hindi dub on Crunchyroll India covering all 148 episodes.",
      },
      {
        q: "Where can I watch HxH in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi inside the player.",
      },
      {
        q: "Is the whole series dubbed?",
        a: "Yes — the complete 148-episode 2011 series is available in Hindi on Crunchyroll India.",
      },
    ],
  },
  {
    slug: "haikyuu-hindi-dub",
    name: "Haikyuu!!",
    anilistId: 20464,
    genres: ["Comedy", "Drama", "Sports"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "85 episodes (all four seasons)",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "Volleyball, heart and underdogs — Haikyuu!! spikes into Hindi.",
    intro:
      "Haikyuu!! is the sports anime that converts people who don't watch sports anime, and Crunchyroll India gave it a Hindi dub in 2023. Across four seasons and 85 episodes, it follows Hinata Shoyo's dream of reaching the top of volleyball despite his height. The Hindi track makes the team's underdog run easy to binge in your own language.",
    history:
      "Crunchyroll added Hindi audio for Haikyuu!! in 2023, covering the television seasons. The story later continues in film format, but the four main seasons form a complete Hindi-viewable arc.",
    watch:
      "Stream Haikyuu!! on Crunchyroll India and select Hindi from the audio options. Watch in season order for the team's full progression.",
    faq: [
      {
        q: "Is Haikyuu!! dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Haikyuu!! across its four seasons.",
      },
      {
        q: "Where can I watch Haikyuu!! in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many Haikyuu!! episodes are in Hindi?",
        a: "Roughly 85 episodes across the four television seasons are available in Hindi.",
      },
    ],
  },
  {
    slug: "tokyo-revengers-hindi-dub",
    name: "Tokyo Revengers",
    anilistId: 120120,
    genres: ["Action", "Drama", "Shounen"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "37 episodes (Seasons 1–2)",
    schedule: "Released seasons available in Hindi on Crunchyroll",
    dubSince: "2022",
    studio: "Crunchyroll India",
    tagline: "Time-travel, gangs and second chances — Tokyo Revengers in Hindi.",
    intro:
      "Tokyo Revengers mixes time travel with Tokyo's gang underworld, and its Hindi dub arrived on Crunchyroll India in 2022. Takemichi's jumps back in time to save his friends give the show a thriller pace that plays well in any language. The Hindi track covers the first two seasons.",
    history:
      "Crunchyroll added Hindi audio for Tokyo Revengers from 2022, following the anime's early seasons. Later seasons continue the story, with the Indian dub tracking the releases.",
    watch:
      "Watch Tokyo Revengers on Crunchyroll India and choose Hindi from the audio options. Start at Season 1 — the time-travel rules build up episode by episode.",
    faq: [
      {
        q: "Is Tokyo Revengers dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Tokyo Revengers' released seasons.",
      },
      {
        q: "Where can I watch Tokyo Revengers in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many episodes are dubbed in Hindi?",
        a: "The Hindi dub covers roughly 37 episodes across the first two seasons.",
      },
    ],
  },
  {
    slug: "blue-lock-hindi-dub",
    name: "Blue Lock",
    anilistId: 137822,
    genres: ["Sports", "Drama"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "24+ episodes (Seasons 1–2)",
    schedule: "Released seasons available in Hindi on Crunchyroll",
    dubSince: "2024",
    studio: "Crunchyroll India",
    tagline: "300 strikers, one spot — Blue Lock's egoist football project in Hindi.",
    intro:
      "Blue Lock takes a ruthless approach to sports anime: isolate Japan's best young strikers and make them compete until only one stands. Crunchyroll India added a Hindi dub in 2024, and the show's high-energy matches have made it a hit with Indian football fans. The Hindi track covers the released seasons of the project.",
    history:
      "Crunchyroll began the Hindi dub for Blue Lock in 2024, matching the anime's seasonal rollout. The tournament structure makes it easy to follow arc by arc.",
    watch:
      "Stream Blue Lock on Crunchyroll India and pick Hindi from the audio options. Start from Season 1 to follow the selection rounds in order.",
    faq: [
      {
        q: "Is Blue Lock dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Blue Lock's released seasons.",
      },
      {
        q: "Where can I watch Blue Lock in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many Blue Lock episodes are in Hindi?",
        a: "The Hindi dub covers 24+ episodes across the first two seasons.",
      },
    ],
  },
  {
    slug: "code-geass-hindi-dub",
    name: "Code Geass",
    anilistId: 1575,
    genres: ["Action", "Drama", "Mecha", "Sci-Fi"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "50 episodes (both seasons)",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2022",
    studio: "Crunchyroll India",
    tagline: "Lelouch's rebellion, chess-like and operatic — Code Geass in Hindi.",
    intro:
      "Code Geass is a political mecha thriller built on mind games, and its Hindi dub came to Crunchyroll India in 2022. Lelouch's power of absolute command turns a rebellion into a chess match of betrayals and reveals across 50 episodes. It's often recommended to viewers who want a smarter, darker shounen, and the Hindi track covers both seasons.",
    history:
      "Crunchyroll India added Hindi audio for Code Geass from 2022, covering the anime's two seasons. The complete run gives Hindi viewers the full, famously divisive ending rather than a partial taste.",
    watch:
      "Watch Code Geass on Crunchyroll India and set the audio to Hindi. Watch Seasons 1 and 2 in order — the second season's payoff depends on the first.",
    faq: [
      {
        q: "Is Code Geass dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Code Geass across both seasons.",
      },
      {
        q: "Where can I watch Code Geass in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many episodes are dubbed in Hindi?",
        a: "All 50 episodes across the two Code Geass seasons are available in Hindi.",
      },
    ],
  },
  {
    slug: "oshi-no-ko-hindi-dub",
    name: "Oshi no Ko",
    anilistId: 150672,
    genres: ["Drama", "Supernatural", "Showbiz"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "11+ episodes (Season 1)",
    schedule: "Released season available in Hindi on Crunchyroll",
    dubSince: "2024",
    studio: "Crunchyroll India",
    tagline: "The idol-industry drama that shocked everyone — Oshi no Ko in Hindi.",
    intro:
      "Oshi no Ko opens with a premise that became one of anime's most talked-about in years, then settles into a sharp look at the entertainment industry's darker side. Crunchyroll India added a Hindi dub in 2024, letting Indian viewers follow Aqua and Ruby's story in their own language. It's a strong pick for fans who want drama over battles.",
    history:
      "The Hindi dub arrived on Crunchyroll India in 2024, covering the first season. The series continued in later seasons and films, with the Indian audio track following the releases.",
    watch:
      "Stream Oshi no Ko on Crunchyroll India and select Hindi from the audio options. Watch from episode 1 — the story's hook depends on the opening.",
    faq: [
      {
        q: "Is Oshi no Ko dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Oshi no Ko's first season.",
      },
      {
        q: "Where can I watch Oshi no Ko in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many episodes are in Hindi?",
        a: "The Hindi dub covers 11+ episodes of the first season.",
      },
    ],
  },
  {
    slug: "naruto-hindi-dub",
    name: "Naruto",
    anilistId: 20,
    genres: ["Action", "Adventure", "Comedy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi", "Tamil"],
    status: "Completed",
    episodeCount: "220 episodes (original series)",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2021",
    studio: "Crunchyroll India",
    tagline: "Where it all begins — the original Naruto, all 220 episodes, in Hindi and Tamil.",
    intro:
      "Before Shippuden, there was the original Naruto — the story of an outcast boy with a sealed nine-tailed fox and a dream of becoming Hokage. Crunchyroll brought the full 220-episode series to India in Hindi from 2021, with Tamil following on the same rollout. It's the essential starting point for the entire Naruto universe in Indian languages.",
    history:
      "Crunchyroll began releasing the Hindi dub of the original Naruto in 2021, followed by Tamil, and later extended the same treatment to Naruto: Shippuden. Because both series were already complete, the regional dubs rolled out in batches.",
    watch:
      "Watch Naruto on Crunchyroll India and switch to Hindi or Tamil in the audio options. Start here before Shippuden, and use ZyniVerse's Naruto filler guide to skip the standalone arcs.",
    faq: [
      {
        q: "Is the original Naruto dubbed in Hindi?",
        a: "Yes. All 220 episodes of the original Naruto have a Hindi dub on Crunchyroll India, with a Tamil track as well.",
      },
      {
        q: "Should I watch Naruto or Shippuden first?",
        a: "Watch the original Naruto first — Shippuden continues its story directly.",
      },
      {
        q: "Can I skip Naruto filler?",
        a: "Yes. A large block of later Naruto episodes is filler; ZyniVerse has a numbered Naruto filler guide.",
      },
    ],
  },
  {
    slug: "boruto-hindi-dub",
    name: "Boruto: Naruto Next Generations",
    anilistId: 97938,
    genres: ["Action", "Adventure", "Comedy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "293 episodes",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2022",
    studio: "Crunchyroll India",
    tagline: "The next generation takes over — Boruto's 293-episode run in Hindi.",
    intro:
      "Boruto follows Naruto's son as he steps out of his father's shadow, and Crunchyroll brought the full 293-episode series to India in Hindi from 2022. It's a heavy watch — much of the show is anime-original — but for fans who want more time in the Naruto world, the complete Hindi dub is available. It pairs best with the Naruto and Shippuden dubs.",
    history:
      "The Hindi dub of Boruto arrived on Crunchyroll India from 2022, covering the series' long run. Because Boruto mixes manga adaptations with large anime-canon stretches, the Hindi catalogue is complete across all 293 episodes.",
    watch:
      "Stream Boruto on Crunchyroll India and select Hindi from the audio options. Watch Naruto and Shippuden first for the full context — and use the Boruto filler guide to skip the anime-only arcs.",
    faq: [
      {
        q: "Is Boruto dubbed in Hindi?",
        a: "Yes. All 293 episodes of Boruto have a Hindi dub on Crunchyroll India.",
      },
      {
        q: "Do I need to watch Naruto first?",
        a: "Yes — Boruto assumes you know the original Naruto and Shippuden stories.",
      },
      {
        q: "Is Boruto mostly filler?",
        a: "A large portion is anime-original. ZyniVerse's Boruto filler guide marks which blocks to skip.",
      },
    ],
  },
  {
    slug: "mashle-hindi-dub",
    name: "Mashle: Magic and Muscles",
    anilistId: 151801,
    genres: ["Action", "Comedy", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "24 episodes (Seasons 1–2)",
    schedule: "Released seasons available in Hindi on Crunchyroll",
    dubSince: "2023",
    studio: "Crunchyroll India",
    tagline: "No magic? No problem — Mash's all-muscle heroics in Hindi.",
    intro:
      "Mashle is a comedy-fantasy about a boy with zero magic in a world obsessed with it, who punches his way through a wizard school instead. Crunchyroll India added a Hindi dub in 2023, and the show's deadpan jokes land well in the localised audio. It's a light, funny companion to the heavier shounen titles.",
    history:
      "The Hindi dub arrived on Crunchyroll India in 2023, covering the released seasons. Mashle's short, gag-driven arcs make it easy to watch in chunks.",
    watch:
      "Watch Mashle on Crunchyroll India and pick Hindi from the audio options. Start at Season 1 — the running gags build across episodes.",
    faq: [
      {
        q: "Is Mashle dubbed in Hindi?",
        a: "Yes. Crunchyroll India carries a Hindi dub for Mashle across its released seasons.",
      },
      {
        q: "Where can I watch Mashle in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many Mashle episodes are in Hindi?",
        a: "The Hindi dub covers 24 episodes across the first two seasons.",
      },
    ],
  },
  {
    slug: "dragon-ball-z-hindi-dub",
    name: "Dragon Ball Z",
    anilistId: 813,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    platforms: ["Crunchyroll"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "291 episodes",
    schedule: "Complete on Crunchyroll India",
    dubSince: "2021",
    studio: "Crunchyroll India",
    tagline: "The anime that raised a generation — Dragon Ball Z in Hindi, all 291 episodes.",
    intro:
      "For a whole generation of Indian fans, Dragon Ball Z was the gateway anime, and Crunchyroll brought Goku's battles with Cell, Frieza and Majin Buu to India in Hindi from 2021. The full 291-episode run is available, making it one of the biggest classic Hindi catalogues on the platform. Whether you grew up with it or are starting fresh, the Hindi dub is the nostalgic way in.",
    history:
      "Crunchyroll began adding Hindi audio for Dragon Ball Z in 2021, covering the complete original series. The show's legacy in India spans decades of TV reruns, and the streaming dub gives that fandom an on-demand, official home.",
    watch:
      "Stream Dragon Ball Z on Crunchyroll India and select Hindi from the audio options. Watch in order through the Saiyan, Frieza, Cell and Buu arcs.",
    faq: [
      {
        q: "Is Dragon Ball Z dubbed in Hindi?",
        a: "Yes. All 291 episodes of Dragon Ball Z have a Hindi dub on Crunchyroll India.",
      },
      {
        q: "Where can I watch DBZ in Hindi?",
        a: "On Crunchyroll India — switch the audio track to Hindi in the player.",
      },
      {
        q: "Should I watch Dragon Ball first?",
        a: "It helps, but DBZ recap its early arcs well enough to start here. Dragon Ball Super continues after Z.",
      },
    ],
  },

  // ── Netflix India ──
  {
    slug: "kakegurui-hindi-dub",
    name: "Kakegurui",
    anilistId: 98314,
    genres: ["Drama", "Psychological", "School"],
    platforms: ["Netflix"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "24 episodes (Seasons 1–2)",
    schedule: "Complete on Netflix India",
    dubSince: "2022",
    studio: "Netflix India",
    tagline: "High-stakes gambling and mind games — Kakegurui in Hindi on Netflix.",
    intro:
      "Kakegurui is a psychological thriller set in a school where status is decided by gambling, and Netflix brought it to India in Hindi from 2022. The show's escalating bets and mind games make it a binge-friendly watch across its two seasons. It's one of Netflix India's staple anime dubs.",
    history:
      "Netflix India added a Hindi dub for Kakegurui in 2022, covering the series' seasons. Netflix's in-house localisation has made it one of the platform's recognisable anime titles for Indian viewers.",
    watch:
      "Watch Kakegurui on Netflix India and select Hindi from the audio and subtitle options. Both seasons are available.",
    faq: [
      {
        q: "Is Kakegurui dubbed in Hindi?",
        a: "Yes. Netflix India carries a Hindi dub for Kakegurui across its seasons.",
      },
      {
        q: "Where can I watch Kakegurui in Hindi?",
        a: "On Netflix India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many episodes are in Hindi?",
        a: "Both Kakegurui seasons, 24 episodes, are available in Hindi on Netflix India.",
      },
    ],
  },
  {
    slug: "cyberpunk-edgerunners-hindi-dub",
    name: "Cyberpunk: Edgerunners",
    anilistId: 120377,
    genres: ["Action", "Drama", "Sci-Fi"],
    platforms: ["Netflix"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "10 episodes",
    schedule: "Complete on Netflix India",
    dubSince: "2022",
    studio: "Netflix India",
    tagline: "Night City burns bright — Cyberpunk: Edgerunners in Hindi.",
    intro:
      "Cyberpunk: Edgerunners is a tight, ten-episode story set in the Cyberpunk 2077 universe, following a street kid trying to survive as an edgerunner. Netflix India gave it a Hindi dub in 2022, and its neon-soaked animation plus a lean runtime make it one of the easiest premium anime on the platform to finish in a night.",
    history:
      "The Hindi dub landed on Netflix India in 2022 alongside the show's global release. It's a self-contained story, so the ten episodes are the whole tale.",
    watch:
      "Stream Cyberpunk: Edgerunners on Netflix India and set the audio to Hindi. All 10 episodes are available.",
    faq: [
      {
        q: "Is Cyberpunk: Edgerunners dubbed in Hindi?",
        a: "Yes. Netflix India carries a Hindi dub for all 10 episodes of Cyberpunk: Edgerunners.",
      },
      {
        q: "Do I need to know Cyberpunk 2077?",
        a: "No — Edgerunners is a standalone story set in the same universe.",
      },
      {
        q: "Where can I watch it in Hindi?",
        a: "On Netflix India — switch the audio track to Hindi in the player.",
      },
    ],
  },
  {
    slug: "record-of-ragnarok-hindi-dub",
    name: "Record of Ragnarok",
    anilistId: 127399,
    genres: ["Action", "Fantasy", "Supernatural"],
    platforms: ["Netflix"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "24 episodes (Seasons 1–2)",
    schedule: "Released seasons available in Hindi on Netflix",
    dubSince: "2023",
    studio: "Netflix India",
    tagline: "Gods versus humanity, one duel at a time — Record of Ragnarok in Hindi.",
    intro:
      "Record of Ragnarok pits history's greatest humans against gods in a tournament for humanity's survival. Netflix India added a Hindi dub in 2023, and the show's tournament structure gives it an easy, fight-by-fight rhythm. It's a solid pick for fans of high-stakes battle anime.",
    history:
      "The Hindi dub arrived on Netflix India in 2023, covering the released seasons. The tournament format continues in later seasons as the roster of fighters grows.",
    watch:
      "Watch Record of Ragnarok on Netflix India and pick Hindi from the audio options. Start at Season 1 to follow the duels in order.",
    faq: [
      {
        q: "Is Record of Ragnarok dubbed in Hindi?",
        a: "Yes. Netflix India carries a Hindi dub for Record of Ragnarok's released seasons.",
      },
      {
        q: "Where can I watch it in Hindi?",
        a: "On Netflix India — switch the audio track to Hindi in the player.",
      },
      {
        q: "How many episodes are in Hindi?",
        a: "The Hindi dub covers roughly 24 episodes across the first two seasons.",
      },
    ],
  },
  {
    slug: "great-pretender-hindi-dub",
    name: "Great Pretender",
    anilistId: 110349,
    genres: ["Action", "Adventure", "Comedy"],
    platforms: ["Netflix"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "23 episodes",
    schedule: "Complete on Netflix India",
    dubSince: "2022",
    studio: "Netflix India",
    tagline: "The slickest con-artist caper in anime — Great Pretender in Hindi.",
    intro:
      "Great Pretender is a stylish heist series following a group of con artists across the world, and Netflix India gave it a Hindi dub in 2022. Its globe-trotting arcs and colourful art make it stand out from typical anime, and the Hindi track suits its snappy, dialogue-heavy tone.",
    history:
      "The Hindi dub landed on Netflix India in 2022, covering the full run of 23 episodes. The show's case-of-the-arc structure makes it easy to watch in parts.",
    watch:
      "Stream Great Pretender on Netflix India and set the audio to Hindi. Watch the arcs in order for the con artists' evolving schemes.",
    faq: [
      {
        q: "Is Great Pretender dubbed in Hindi?",
        a: "Yes. Netflix India carries a Hindi dub for all 23 episodes of Great Pretender.",
      },
      {
        q: "Where can I watch it in Hindi?",
        a: "On Netflix India — switch the audio track to Hindi in the player.",
      },
      {
        q: "Is it a complete story?",
        a: "Yes — the 23-episode run forms complete arcs with a satisfying finish.",
      },
    ],
  },

  // ── Prime Video / Anime Times ──
  {
    slug: "one-punch-man-hindi-dub",
    name: "One Punch Man",
    anilistId: 21087,
    genres: ["Action", "Comedy", "Parody"],
    platforms: ["Prime Video"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "24 episodes (Seasons 1–2)",
    schedule: "Released seasons available in Hindi on Prime Video",
    dubSince: "2022",
    studio: "Anime Times",
    tagline: "The hero who wins in one hit — One Punch Man in Hindi.",
    intro:
      "One Punch Man spoofs superhero tropes with Saitama, a hero so strong every fight ends instantly — and he's bored of it. Anime Times brought a Hindi dub to Prime Video in 2022, covering the first two seasons. It's a great comedy entry point and one of the better-known Hindi dubs outside Crunchyroll.",
    history:
      "Anime Times produced the Hindi dub of One Punch Man for Prime Video from 2022, covering the released seasons. It sits alongside the channel's other Indian-language dubs like Tokyo Ghoul and Attack on Titan.",
    watch:
      "Watch One Punch Man on Prime Video (via the Anime Times channel) and select Hindi from the audio options. Start at Season 1.",
    faq: [
      {
        q: "Is One Punch Man dubbed in Hindi?",
        a: "Yes. Prime Video's Anime Times channel carries a Hindi dub for One Punch Man's released seasons.",
      },
      {
        q: "Where can I watch One Punch Man in Hindi?",
        a: "On Prime Video through the Anime Times channel — switch the audio track to Hindi.",
      },
      {
        q: "How many episodes are in Hindi?",
        a: "The Hindi dub covers roughly 24 episodes across the first two seasons.",
      },
    ],
  },
  {
    slug: "tokyo-ghoul-hindi-dub",
    name: "Tokyo Ghoul",
    anilistId: 20605,
    genres: ["Action", "Horror", "Mystery", "Supernatural"],
    platforms: ["Prime Video"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "48 episodes (all seasons)",
    schedule: "Complete on Prime Video (Anime Times)",
    dubSince: "2022",
    studio: "Anime Times",
    tagline: "Half-human, half-ghoul — Tokyo Ghoul's dark saga in Hindi.",
    intro:
      "Tokyo Ghoul turns a college student into a half-ghoul caught between two worlds, and it became one of the earliest big Hindi dubs on Anime Times via Prime Video in 2022. Across 48 episodes the story runs from Ken Kaneki's transformation to the series' dark later arcs. It's a strong pick for viewers who like horror-tinged action.",
    history:
      "Anime Times produced the Hindi dub for Prime Video from 2022, covering the anime's seasons. It was part of the same India push that also brought the Hindi dub of Naruto: Shippuden.",
    watch:
      "Stream Tokyo Ghoul on Prime Video through the Anime Times channel and pick Hindi from the audio options. Watch the seasons in order.",
    faq: [
      {
        q: "Is Tokyo Ghoul dubbed in Hindi?",
        a: "Yes. Prime Video's Anime Times channel carries a Hindi dub for Tokyo Ghoul across its seasons.",
      },
      {
        q: "Where can I watch Tokyo Ghoul in Hindi?",
        a: "On Prime Video through Anime Times — switch the audio track to Hindi.",
      },
      {
        q: "How many episodes are in Hindi?",
        a: "The Hindi dub covers roughly 48 episodes across all seasons.",
      },
    ],
  },

  // ── Muse India (YouTube) ──
  {
    slug: "steins-gate-hindi-dub",
    name: "Steins;Gate",
    anilistId: 9253,
    genres: ["Drama", "Sci-Fi", "Thriller"],
    platforms: ["Muse India (YouTube)"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "24 episodes",
    schedule: "Complete on Muse India's YouTube channel",
    dubSince: "2023",
    studio: "Muse India",
    tagline: "Time travel, conspiracy and heartbreak — Steins;Gate in Hindi, free on YouTube.",
    intro:
      "Steins;Gate is one of the highest-rated anime ever, a slow-burn time-travel thriller that turns into something devastating. Muse India gave it a Hindi dub on YouTube in 2023, making a legendary title accessible to Indian viewers for free with a local voice cast. Stick past the slow first act — it pays off enormously.",
    history:
      "Muse India, the regional arm that streams anime legally on YouTube across South and Southeast Asia, added the Hindi dub of Steins;Gate in 2023. It's the same channel that later re-dubbed Attack on Titan in Hindi, Tamil and Telugu.",
    watch:
      "Watch Steins;Gate in Hindi on Muse India's YouTube channel — free and legal. Follow the numbered broadcast order for the intended reveal.",
    faq: [
      {
        q: "Is Steins;Gate dubbed in Hindi?",
        a: "Yes. Muse India streams a Hindi dub of Steins;Gate on its YouTube channel.",
      },
      {
        q: "Is it free to watch?",
        a: "Yes — Muse India's Hindi dub is available free on YouTube.",
      },
      {
        q: "How many episodes are in Hindi?",
        a: "All 24 episodes of Steins;Gate are available in Hindi.",
      },
    ],
  },
  {
    slug: "fate-zero-hindi-dub",
    name: "Fate/Zero",
    anilistId: 10087,
    genres: ["Action", "Fantasy", "Supernatural"],
    platforms: ["Muse India (YouTube)"],
    languages: ["Hindi"],
    status: "Completed",
    episodeCount: "25 episodes",
    schedule: "Complete on Muse India's YouTube channel",
    dubSince: "2023",
    studio: "Muse India",
    tagline: "Seven mages, seven heroes, one Grail — Fate/Zero in Hindi.",
    intro:
      "Fate/Zero is the dark prequel to the Fate franchise: a battle royale between mages and the legendary heroes they summon for the Holy Grail. Muse India added a Hindi dub on YouTube in 2023, giving Indian viewers a free, legal way into a notoriously complex franchise — and this is the right place to start it.",
    history:
      "Muse India released the Hindi dub of Fate/Zero on YouTube in 2023. As a prequel, it's the recommended entry point to the Fate timeline, which otherwise branches confusingly across adaptations.",
    watch:
      "Watch Fate/Zero in Hindi on Muse India's YouTube channel for free. Use ZyniVerse's watch-order guide if you want to continue into Fate/stay night and the rest of the franchise.",
    faq: [
      {
        q: "Is Fate/Zero dubbed in Hindi?",
        a: "Yes. Muse India streams a Hindi dub of Fate/Zero on YouTube.",
      },
      {
        q: "Should I start Fate with Fate/Zero?",
        a: "Fate/Zero is a common and clean starting point as the prequel — but check a watch-order guide before moving to Fate/stay night.",
      },
      {
        q: "Is it free to watch?",
        a: "Yes — Muse India's Hindi dub is free on YouTube.",
      },
    ],
  },
];