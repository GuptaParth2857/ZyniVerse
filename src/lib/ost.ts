interface OSTEntry {
  id: string;
  animeTitle: string;
  animeId: number;
  type: "OP" | "ED" | "INSERT" | "OST" | "CHARACTER";
  title: string;
  artist: string;
  composer?: string;
  lyrics?: string;
  episodeRange?: string;
  videoUrl?: string;
  image?: string;
  year: number;
  season?: string;
}

interface OSTArtist {
  name: string;
  image?: string;
  bio?: string;
  songs: OSTEntry[];
}

const database: OSTEntry[] = [
  { id: "naruto-op1", animeTitle: "Naruto", animeId: 20, type: "OP", title: "Rocks", artist: "Hound Dog", composer: "Yoshito Tanaka", year: 2002, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=84OMZRpoOLQ" },
  { id: "naruto-op3", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Blue Bird", artist: "Ikimono Gakari", composer: "Yoshiki Mizuno", year: 2008, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=N9LgkGBeQAc" },
  { id: "naruto-op16", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Silhouette", artist: "KANA-BOON", composer: "Maguro Taniguchi", year: 2014, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=lJVnRtZC76w" },
  { id: "naruto-ost1", animeTitle: "Naruto", animeId: 20, type: "OST", title: "Sadness and Sorrow", artist: "Toshio Masuda", composer: "Toshio Masuda", year: 2002, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=o8XEf5mg9Mk" },
  { id: "naruto-ed1", animeTitle: "Naruto", animeId: 20, type: "ED", title: "Wind", artist: "Akeboshi", composer: "Akeboshi", year: 2002, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=njtXgf7iOYQ" },
  { id: "aot-op1", animeTitle: "Attack on Titan", animeId: 16498, type: "OP", title: "Guren no Yumiya", artist: "Linked Horizon", composer: "Revo", year: 2013, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=bHUcvHx9zlA" },
  { id: "aot-op3", animeTitle: "Attack on Titan Season 2", animeId: 20958, type: "OP", title: "Shinzou wo Sasageyo", artist: "Linked Horizon", composer: "Revo", year: 2017, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=3SNUrr_2CiA" },
  { id: "aot-op4", animeTitle: "Attack on Titan Season 3", animeId: 35760, type: "OP", title: "Red Swan", artist: "Yoshiki feat. Hyde", composer: "Yoshiki", year: 2018, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=eHah5KzzC_M" },
  { id: "aot-op6", animeTitle: "Attack on Titan The Final Season", animeId: 40028, type: "OP", title: "Akuma no Ko", artist: "Ai Higuchi", composer: "Ai Higuchi", year: 2022, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=9lnh--ZOPyo" },
  { id: "aot-ost1", animeTitle: "Attack on Titan", animeId: 16498, type: "OST", title: "Vogel im Käfig", artist: "Hiroyuki Sawano", composer: "Hiroyuki Sawano", year: 2013, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=b7QEAIS5XOU" },
  { id: "aot-ost2", animeTitle: "Attack on Titan", animeId: 16498, type: "OST", title: "ətˈæk 0N tάɪtn", artist: "Hiroyuki Sawano", composer: "Hiroyuki Sawano", year: 2013, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=zroFzv7sFis" },
  { id: "ds-op1", animeTitle: "Demon Slayer", animeId: 38000, type: "OP", title: "Gurenge", artist: "LiSA", composer: "Yuki Kajiura", year: 2019, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=pmanD_s7G3U" },
  { id: "ds-op2", animeTitle: "Demon Slayer: Entertainment District Arc", animeId: 113416, type: "OP", title: "Zankyou Sanka", artist: "Aimer", composer: "Yuki Kajiura", year: 2021, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=1SPI9x5AYzA" },
  { id: "ds-insert1", animeTitle: "Demon Slayer", animeId: 38000, type: "INSERT", title: "Kamado Tanjiro no Uta", artist: "Nami Nakagawa", composer: "Yuki Kajiura", year: 2019, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=6mSnT6PFo28" },
  { id: "ds-ed1", animeTitle: "Demon Slayer", animeId: 38000, type: "ED", title: "From the Edge", artist: "FictionJunction feat. LiSA", composer: "Yuki Kajiura", year: 2019, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=odjYVZoPY3c" },
  { id: "op-op1", animeTitle: "One Piece", animeId: 21, type: "OP", title: "We Are!", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", year: 1999, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=PQCOSsj97zU" },
  { id: "op-op20", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Hope", artist: "Namie Amuro", composer: "Namie Amuro", year: 2017, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=vypDzdMqX0g" },
  { id: "op-insert1", animeTitle: "One Piece", animeId: 21, type: "INSERT", title: "Binks' Sake", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", year: 2006, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=Sc8u1jLe0zc" },
  { id: "op-ed1", animeTitle: "One Piece", animeId: 21, type: "ED", title: "Memories", artist: "Maki Otsuki", composer: "Maki Otsuki", year: 1999, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=2FJlbPqka3M" },
  { id: "fma-op1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "OP", title: "Again", artist: "YUI", composer: "YUI", year: 2009, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=L-0AEY9lI3Q" },
  { id: "fma-op5", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "OP", title: "Rain", artist: "SID", composer: "Mao", year: 2010, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=Vn3N9fhVCwM" },
  { id: "fma-insert1", animeTitle: "Fullmetal Alchemist", animeId: 121, type: "INSERT", title: "Brothers", artist: "Yoshino Nanjo", composer: "Michiru Oshima", year: 2003, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=BXQLrkW33f0" },
  { id: "dn-op1", animeTitle: "Death Note", animeId: 1535, type: "OP", title: "The World", artist: "Nightmare", composer: "Ruka", year: 2006, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=RRl_E8EGER4" },
  { id: "dn-op2", animeTitle: "Death Note", animeId: 1535, type: "OP", title: "What's Up, People?!", artist: "Maximum the Hormone", composer: "Maximum the Ryu-kun", year: 2007, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=wiE3XXRkdpc" },
  { id: "dn-ed1", animeTitle: "Death Note", animeId: 1535, type: "ED", title: "Alumina", artist: "Nightmare", composer: "Ruka", year: 2006, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=hVj24vPjn0A" },
  { id: "jjk-op1", animeTitle: "Jujutsu Kaisen", animeId: 40748, type: "OP", title: "Kaikai Kitan", artist: "Eve", composer: "Eve", year: 2020, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=-xY9-qxu0HY" },
  { id: "jjk-op2", animeTitle: "Jujutsu Kaisen", animeId: 40748, type: "OP", title: "Vivid Vice", artist: "Who-ya Extended", composer: "Who-ya Extended", year: 2020, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=BBxgzISkCLQ" },
  { id: "jjk-ed1", animeTitle: "Jujutsu Kaisen", animeId: 40748, type: "ED", title: "Lost in Paradise", artist: "ALI feat. AKLO", composer: "ALI", year: 2020, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=CXCpgsqYFQw" },
  { id: "mha-op1", animeTitle: "My Hero Academia", animeId: 31964, type: "OP", title: "The Day", artist: "Porno Graffitti", composer: "Akihito Okano", year: 2016, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=-FaS66lwEMM" },
  { id: "mha-op2", animeTitle: "My Hero Academia", animeId: 31964, type: "OP", title: "Peace Sign", artist: "Kenshi Yonezu", composer: "Kenshi Yonezu", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=CLI6gnP1dQ4" },
  { id: "mha-ed2", animeTitle: "My Hero Academia", animeId: 31964, type: "ED", title: "Polaris", artist: "BLUE ENCOUNT", composer: "Yoshimitsu Ohashi", year: 2018, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=Isb7Q4jEA04" },
  { id: "csm-op1", animeTitle: "Chainsaw Man", animeId: 44511, type: "OP", title: "KICK BACK", artist: "Kenshi Yonezu", composer: "Kenshi Yonezu", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=CTd8VjAm0sg" },
  { id: "csm-ed1", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Chu, Tayousei", artist: "Eve", composer: "Eve", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=z0F_RkRvew0" },
  { id: "tokrev-op1", animeTitle: "Tokyo Revengers", animeId: 108728, type: "OP", title: "Cry Baby", artist: "Official HIGE DANdism", composer: "Fujihara Satoshi", year: 2021, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=eNXiKJOxnDQ" },
  { id: "db-op1", animeTitle: "Dragon Ball Z", animeId: 813, type: "OP", title: "Cha-La Head Cha-La", artist: "Hironobu Kageyama", composer: "Chiho Kiyooka", year: 1989, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=JsD0eOwZxs0" },
  { id: "db-op2", animeTitle: "Dragon Ball Z", animeId: 813, type: "OP", title: "We Gotta Power", artist: "Hironobu Kageyama", composer: "Chiho Kiyooka", year: 1993, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=Za0aDhAusjs" },
  { id: "eva-op1", animeTitle: "Neon Genesis Evangelion", animeId: 30, type: "OP", title: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", composer: "Hidetoshi Sato", year: 1995, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=tCSvi3v-TYE" },
  { id: "bebop-op1", animeTitle: "Cowboy Bebop", animeId: 1, type: "OP", title: "Tank!", artist: "Yoko Kanno & Seatbelts", composer: "Yoko Kanno", year: 1998, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=WtebaFnCXH8" },
  { id: "bebop-ed1", animeTitle: "Cowboy Bebop", animeId: 1, type: "ED", title: "The Real Folk Blues", artist: "Yoko Kanno & Seatbelts", composer: "Yoko Kanno", year: 1998, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=jI_DWGOVN2c" },
  { id: "ghibli-howl", animeTitle: "Howl's Moving Castle", animeId: 431, type: "OST", title: "Merry-Go-Round of Life", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 2004, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=ngFB1Eo9yHE" },
  { id: "ghibli-spirited", animeTitle: "Spirited Away", animeId: 199, type: "OST", title: "One Summer's Day", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 2001, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=aRYGvrDmXRs" },
  { id: "ghibli-totoro", animeTitle: "My Neighbor Totoro", animeId: 523, type: "OST", title: "The Path of the Wind", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 1988, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=IvENKyiHEZs" },
  { id: "yourname-op1", animeTitle: "Your Name", animeId: 32281, type: "OST", title: "Zen Zen Zense", artist: "Radwimps", composer: "Radwimps", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=nWrCkR-h_gs" },
  { id: "yourname-op2", animeTitle: "Your Name", animeId: 32281, type: "OST", title: "Sparkle", artist: "Radwimps", composer: "Radwimps", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=SCQOw1UBsVI" },
  { id: "yourname-ed1", animeTitle: "Your Name", animeId: 32281, type: "ED", title: "Nandemonaiya", artist: "Radwimps", composer: "Radwimps", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=tuY5BuKKrl4" },
  { id: "sao-op1", animeTitle: "Sword Art Online", animeId: 11757, type: "OP", title: "Crossing Field", artist: "LiSA", composer: "Tomoya Tabuchi", year: 2012, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=ovkHHiXPN3M" },
  { id: "sao-op2", animeTitle: "Sword Art Online II", animeId: 11757, type: "OP", title: "IGNITE", artist: "Eir Aoi", composer: "Tomoya Tabuchi", year: 2014, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=ATdimQIDOnQ" },
  { id: "sao-ed1", animeTitle: "Sword Art Online", animeId: 11757, type: "ED", title: "Yume Sekai", artist: "Haruka Tomatsu", composer: "Tomoya Tabuchi", year: 2012, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=mGDqtAT5jc4" },
  { id: "steins-op1", animeTitle: "Steins;Gate", animeId: 9253, type: "OP", title: "Hacking to the Gate", artist: "Kanako Ito", composer: "Chiyomaru Shikura", year: 2011, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=3TqBzg2T_xg" },
  { id: "rezero-op1", animeTitle: "Re:Zero", animeId: 31240, type: "OP", title: "Redo", artist: "Konomi Suzuki", composer: "Konomi Suzuki", year: 2016, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=Mbs329_I77c" },
  { id: "rezero-op2", animeTitle: "Re:Zero", animeId: 31240, type: "OP", title: "Paradisus-Paradoxum", artist: "Miyuna", composer: "Miyuna", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=Jo5HjzgoiZA" },
  { id: "ve-op1", animeTitle: "Violet Evergarden", animeId: 33352, type: "OP", title: "Sincerely", artist: "TRUE", composer: "TRUE", year: 2018, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=GY_Twrj3A3Q" },
  { id: "ve-insert1", animeTitle: "Violet Evergarden", animeId: 33352, type: "INSERT", title: "Violet's Letter", artist: "Minori Chihara", composer: "Evan Call", year: 2018, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=t4v4EUrPfXc" },
  { id: "bleach-op1", animeTitle: "Bleach", animeId: 269, type: "OP", title: "Asterisk", artist: "ORANGE RANGE", composer: "ORANGE RANGE", year: 2004, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=TvL_-lP0ZS8" },
  { id: "bleach-op13", animeTitle: "Bleach", animeId: 269, type: "OP", title: "Ranbu no Melody", artist: "SID", composer: "Mao", year: 2010, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=hC6NBO2Vugs" },
  { id: "hxh-op1", animeTitle: "Hunter x Hunter (2011)", animeId: 11061, type: "OP", title: "Departure!", artist: "Masatoshi Ono", composer: "Kohei Tanaka", year: 2011, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=egvF99NulYo" },
  { id: "hxh-ed5", animeTitle: "Hunter x Hunter (2011)", animeId: 11061, type: "ED", title: "Hyori Ittai", artist: "Yuzu", composer: "Yuzu", year: 2012, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=EF5ILuCfgug" },
  { id: "mob-op1", animeTitle: "Mob Psycho 100", animeId: 32182, type: "OP", title: "99", artist: "Mob Choir", composer: "Kenji Kawai", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=F5OJPUXJvHk" },
  { id: "mob-op2", animeTitle: "Mob Psycho 100 II", animeId: 37510, type: "OP", title: "99.9", artist: "Mob Choir", composer: "Kenji Kawai", year: 2019, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=D6g-qbYEEX8" },
  { id: "haikyuu-op1", animeTitle: "Haikyuu!!", animeId: 20583, type: "OP", title: "Imagination", artist: "SPYAIR", composer: "Kentaro Nishino", year: 2014, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=89Ckx-CtmAw" },
  { id: "haikyuu-op5", animeTitle: "Haikyuu!! To The Top", animeId: 38865, type: "OP", title: "Phoenix", artist: "Burnout Syndromes", composer: "Burnout Syndromes", year: 2020, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=b5lsuPxMFmw" },
  { id: "vinland-op1", animeTitle: "Vinland Saga", animeId: 39338, type: "OP", title: "MUKANJYO", artist: "Survive Said the Prophet", composer: "Survive Said the Prophet", year: 2019, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=l5wAdQ-UkWY" },
  { id: "vinland-op2", animeTitle: "Vinland Saga Season 2", animeId: 49387, type: "OP", title: "Dark Crow", artist: "Man with a Mission", composer: "Man with a Mission", year: 2023, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=c2L6D1-Dif8" },
  { id: "spy-op1", animeTitle: "Spy x Family", animeId: 50265, type: "OP", title: "Mixed Nuts", artist: "Official HIGE DANdism", composer: "Fujihara Satoshi", year: 2022, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=kaiLGNrKMtY" },
  { id: "spy-op2", animeTitle: "Spy x Family Season 2", animeId: 53890, type: "OP", title: "Souvenir", artist: "BUMP OF CHICKEN", composer: "Fujifabric", year: 2023, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=2c2ZpEamGNw" },
  { id: "sl-op1", animeTitle: "Solo Leveling", animeId: 157064, type: "OP", title: "LEveL", artist: "SawanoHiroyuki[nZk] feat. TOMORROW X TOGETHER", composer: "Hiroyuki Sawano", year: 2024, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=XqD0oCHLIF8" },
  { id: "onk-op1", animeTitle: "Oshi no Ko", animeId: 160201, type: "OP", title: "Idol", artist: "YOASOBI", composer: "Ayase", year: 2023, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=5OW-gNXTjuE" },
  { id: "fmab-ed1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "ED", title: "Uso", artist: "SID", composer: "Mao", year: 2009, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=Jzfd-jQDCZI" },
  { id: "naruto-shippuden-op6", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Sign", artist: "FLOW", composer: "Takeshi Asakawa", year: 2010, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=97dkzVU4p-M" },
  { id: "aot-op2", animeTitle: "Attack on Titan", animeId: 16498, type: "OP", title: "Jiyuu no Tsubasa", artist: "Linked Horizon", composer: "Revo", year: 2013, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=ErgcCrXU0Ig" },
  { id: "op-op6", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Brand New World", artist: "D-51", composer: "D-51", year: 2004, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=vMDv6S_szyE" },
  { id: "jjk-s2-op1", animeTitle: "Jujutsu Kaisen Season 2", animeId: 145064, type: "OP", title: "Where Our Blue Is", artist: "Tatsuya Kitani", composer: "Tatsuya Kitani", year: 2023, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=gcgKUcJKxIs" },
  { id: "mha-op3", animeTitle: "My Hero Academia Season 2", animeId: 33486, type: "OP", title: "Sora ni Utaeba", artist: "amazarashi", composer: "amazarashi", year: 2017, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=-owtG3xsQAg" },
  { id: "csm-ed2", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "FightSong", artist: "Eve", composer: "Eve", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=H7utILhQnJE" },
  { id: "csm-ed3", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "CHAINSAW BLOOD", artist: "Vaundy", composer: "Vaundy", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=FL1QjjkZVm4" },
  { id: "csm-ed4", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Deep down", artist: "Aimer", composer: "Aimer", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=Irsuv4UBm-E" },
  { id: "codegeass-op1", animeTitle: "Code Geass", animeId: 1575, type: "OP", title: "Colors", artist: "FLOW", composer: "Takeshi Asakawa", year: 2006, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=FUH9S44D1BM" },
  { id: "codegeass-op2", animeTitle: "Code Geass", animeId: 1575, type: "OP", title: "Kaidoku Funou", artist: "Jinn", composer: "Jinn", year: 2007, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=6sLZCJTh9dY" },
  { id: "fmab-op2", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "OP", title: "Hologram", artist: "NICO Touches the Walls", composer: "Tatsuya Mitsumura", year: 2009, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=QBZOARw8XWA" },
  { id: "gurrenlagann-op1", animeTitle: "Gurren Lagann", animeId: 2001, type: "OP", title: "Sorairo Days", artist: "Shoko Nakagawa", composer: "Shoko Nakagawa", year: 2007, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=VgV8ztO2-wY" },
  { id: "fmab-insert1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "INSERT", title: "Trisha's Lullaby", artist: "Ami Fujii", composer: "Akira Senju", year: 2009, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=l2kwie-gs2o" },
  { id: "samurai7-op1", animeTitle: "Samurai Champloo", animeId: 205, type: "OP", title: "Battlecry", artist: "Nujabes feat. Shing02", composer: "Nujabes", year: 2004, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=z8N9QP-RtO8" },
  { id: "fmab-character1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "CHARACTER", title: "Kesenai Tsumi", artist: "Nana Kitade", composer: "Nana Kitade", year: 2003, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=NaVClolW2bc" },
  { id: "naruto-shippuden-op9", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Lovers", artist: "7!!", composer: "Keita Tachibana", year: 2011, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=H_x14khyZrQ" },
  { id: "naruto-shippuden-op18", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Line", artist: "Sukima Switch", composer: "Sukima Switch", year: 2015, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=GKSMAqeOxT0" },
  { id: "aot-s4-op2", animeTitle: "Attack on Titan The Final Season Part 2", animeId: 48583, type: "OP", title: "The Rumbling", artist: "SiM", composer: "SiM", year: 2022, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=OBqw818mQ1E" },
  { id: "aot-s4-ed1", animeTitle: "Attack on Titan The Final Season", animeId: 40028, type: "ED", title: "Shogeki", artist: "Yuko Ando", composer: "Yuko Ando", year: 2020, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=5epvP9unL3Q" },
  { id: "spy-ed1", animeTitle: "Spy x Family", animeId: 50265, type: "ED", title: "Kigeki", artist: "Gen Hoshino", composer: "Gen Hoshino", year: 2022, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=wTPnagFkPcE" },
  { id: "op-op21", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Super Powers", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", year: 2018, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=t7xHamn5inQ" },
  { id: "naruto-shippuden-op19", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Blood Circulator", artist: "ASIAN KUNG-FU GENERATION", composer: "Masafumi Gotoh", year: 2015, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=w6Tp48pGidI" },
  { id: "ds-swordsmith-op", animeTitle: "Demon Slayer: Swordsmith Village Arc", animeId: 145134, type: "OP", title: "Kizuna no Kiseki", artist: "Man with a Mission x milet", composer: "Man with a Mission", year: 2023, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=zlNdKU92drA" },
  { id: "jujutsu-kaisen-0-ed", animeTitle: "Jujutsu Kaisen 0", animeId: 131016, type: "ED", title: "Greatest Strength", artist: "Aimer", composer: "Masahiro Tobinai", year: 2021, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=yRh7C1vidVs" },
  { id: "mha-op10", animeTitle: "My Hero Academia Season 6", animeId: 145000, type: "OP", title: "Hitamuki", artist: "Super Beaver", composer: "Super Beaver", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=frEEfN0dueQ" },
  { id: "op-op23", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Dreamin On", artist: "Da-iCE", composer: "Da-iCE", year: 2020, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=Kk8bl9n2h68" },
  { id: "frieren-op1", animeTitle: "Frieren: Beyond Journey's End", animeId: 154587, type: "OP", title: "Yuusha", artist: "YOASOBI", composer: "Ayase", year: 2023, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=kD-XFdB_dpg" },
  { id: "frieren-ed1", animeTitle: "Frieren: Beyond Journey's End", animeId: 154587, type: "ED", title: "Anytime Anywhere", artist: "milet", composer: "milet", year: 2023, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=Hcqm87gIPsI" },
  { id: "mob-op3", animeTitle: "Mob Psycho 100 III", animeId: 50837, type: "OP", title: "1", artist: "Mob Choir", composer: "Kenji Kawai", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=3RtBTSdVuFQ" },
  { id: "csmed-all", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Violence", artist: "Queen Bee", composer: "Avu Barazono", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=JTCXVP-RyJs" },
  { id: "csmed5", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Rendezvous", artist: "Kanaria", composer: "Kanaria", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=Adu66u_v9UM" },
  { id: "csmed6", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "In the Back Room", artist: "Syudou", composer: "Syudou", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=Na-AjymKzpI" },
  { id: "csmed7", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Time Left", artist: "ZUTOMAYO", composer: "ACAね", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=C3CvCudJPDI" },
  { id: "csmed8", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "First Death", artist: "TK from Ling Tosite Sigure", composer: "TK", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=okkHaF7palw" },
  { id: "csmed9", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Hawatari 2-oku Centi", artist: "Maximum the Hormone", composer: "Maximum the Hormone", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=HEwAiwttN10" },
  { id: "csmed10", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Jouzai", artist: "TOOBOE", composer: "TOOBOE", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=SYacywLE-AA" },
  { id: "csmed11", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "DOGLAND", artist: "PEOPLE 1", composer: "PEOPLE 1", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=AL2v0N5Mbxs" },
  { id: "naruto-shippuden-op8", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Diver", artist: "NICO Touches the Walls", composer: "Tatsuya Mitsumura", year: 2011, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=P1yJ51DH-18" },
  { id: "fmab-ed5", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "ED", title: "Ray of Light", artist: "Shoko Nakagawa", composer: "Shoko Nakagawa", year: 2010, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=Uue5cLDVucM" },
  { id: "ghibli-mononoke", animeTitle: "Princess Mononoke", animeId: 29, type: "OST", title: "The Legend of Ashitaka", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 1997, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=uC1QfFPj27Q" },
  { id: "ghibli-kiki", animeTitle: "Kiki's Delivery Service", animeId: 512, type: "OST", title: "A Town with an Ocean View", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 1989, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=Ucp6_dcXP3U" },
  { id: "ds-hashira-op", animeTitle: "Demon Slayer: Hashira Training Arc", animeId: 167144, type: "OP", title: "Mugen", artist: "Miyavi", composer: "Miyavi", year: 2024, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=E33dFgpDMCs" },
  { id: "jjk-s2-op2", animeTitle: "Jujutsu Kaisen Season 2", animeId: 145064, type: "OP", title: "Specialz", artist: "King Gnu", composer: "King Gnu", year: 2023, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=n6y87k3BncE" },
  { id: "jjk-s2-ed1", animeTitle: "Jujutsu Kaisen Season 2", animeId: 145064, type: "ED", title: "Akari", artist: "Sou", composer: "Sou", year: 2023, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=W_U0eh5tMUs" },
  { id: "aot-s4p3-op", animeTitle: "Attack on Titan The Final Season Part 3", animeId: 157872, type: "OP", title: "Yūgure no Tori", artist: "Shinsei Kamattechan", composer: "Shinsei Kamattechan", year: 2023, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=qe6isMShLgs" },
  { id: "naruto-shippuden-op20", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Kara no Kokoro", artist: "Anly", composer: "Anly", year: 2016, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=sucGeier2Po" },
  { id: "opm-op1", animeTitle: "One Punch Man", animeId: 30276, type: "OP", title: "THE HERO!! ~Okoreru Kobushi ni Hi wo Tsukero~", artist: "JAM Project", year: 2015, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=QImBolnTVH8" },
  { id: "tg-op1", animeTitle: "Tokyo Ghoul", animeId: 22319, type: "OP", title: "Unravel", artist: "TK from Ling tosite sigure", composer: "TK", year: 2014, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=kQDN3Sy42to" },
  { id: "kaguya-op1", animeTitle: "Kaguya-sama: Love is War", animeId: 37999, type: "OP", title: "Love Dramatic", artist: "Masayuki Suzuki", composer: "Yasuo Ijichi", year: 2019, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=YL_Jyp2i-tU" },
  { id: "ylia-op1", animeTitle: "Your Lie in April", animeId: 23273, type: "OP", title: "Hikaru Nara", artist: "Goose house", composer: "Yoshiki Mizuno", year: 2014, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=y30bzYIj1fc" },
  { id: "ylia-ed1", animeTitle: "Your Lie in April", animeId: 23273, type: "ED", title: "Orange", artist: "7!!", composer: "Keita Tachibana", year: 2014, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=xzFHINArHPU" },
  { id: "ac-op1", animeTitle: "Assassination Classroom", animeId: 24833, type: "OP", title: "Seishun Satsubatsu-ron", artist: "3-nen E-gumi Utatan", year: 2015, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=obXMqZ4tpqY" },
  { id: "bc-op1", animeTitle: "Black Clover", animeId: 34572, type: "OP", title: "Haruka Mirai", artist: "Kankaku Piero", year: 2017, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=_6KZI74zKfE" },
  { id: "drstone-op1", animeTitle: "Dr. Stone", animeId: 38691, type: "OP", title: "Good Morning World!", artist: "BURNOUT SYNDROMES", composer: "Kazuumi Kumagai", year: 2019, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=HCzZNf3toWM" },
  { id: "ff-op1", animeTitle: "Fire Force", animeId: 38671, type: "OP", title: "Inferno", artist: "Mrs. GREEN APPLE", composer: "Motoki Ohmori", year: 2019, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=gtMhLkjSDQE" },
  { id: "ngnl-op1", animeTitle: "No Game No Life", animeId: 19815, type: "OP", title: "This Game", artist: "Konomi Suzuki", composer: "Konomi Suzuki", year: 2014, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=gPUf8UZT1F0" },
  { id: "klk-op1", animeTitle: "Kill la Kill", animeId: 18679, type: "OP", title: "Sirius", artist: "Eir Aoi", year: 2013, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=a81JGBKAX5U" },
  { id: "madoka-op1", animeTitle: "Puella Magi Madoka Magica", animeId: 9756, type: "OP", title: "Connect", artist: "ClariS", composer: "Sho Watanabe", year: 2011, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=_fdQFvKKRXw" },
  { id: "madoka-ed1", animeTitle: "Puella Magi Madoka Magica", animeId: 9756, type: "ED", title: "Magia", artist: "Kalafina", composer: "Yuki Kajiura", year: 2011, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=5tbjEwsC36c" },
  { id: "ab-op1", animeTitle: "Angel Beats!", animeId: 6547, type: "OP", title: "My Soul, Your Beats!", artist: "Lia", composer: "Jun Maeda", year: 2010, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=NIrdy1Ni5Sk" },
  { id: "konosuba-op1", animeTitle: "KonoSuba: God's Blessing on This Wonderful World!", animeId: 30831, type: "OP", title: "fantastic dreamer", artist: "Machico", year: 2016, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=hsfVmpGdxoE" },
  { id: "overlord-op1", animeTitle: "Overlord", animeId: 29803, type: "OP", title: "Clattanoia", artist: "OxT", composer: "Tom-H@ck", year: 2015, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=KOWcj7XKnfQ" },
  { id: "toradora-op1", animeTitle: "Toradora!", animeId: 4224, type: "OP", title: "Pre-Parade", artist: "Rie Kugimiya, Eri Kitamura & Yui Horie", year: 2008, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=BDoNRDqgmT0" },
  { id: "bluelock-op1", animeTitle: "Blue Lock", animeId: 49596, type: "OP", title: "Chaos ga Kiwamaru", artist: "UNISON SQUARE GARDEN", composer: "Tomoya Tabuchi", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=DRPSM9Ci0_0" },
  { id: "bocchi-op1", animeTitle: "Bocchi the Rock!", animeId: 47917, type: "OP", title: "Seishun Complex", artist: "Kessoku Band", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=wFFekPCvqC0" },
  { id: "eighty-six-ed1", animeTitle: "86", animeId: 41457, type: "ED", title: "Hands Up to the Sky", artist: "SawanoHiroyuki[nZk]:Laco", composer: "Hiroyuki Sawano", year: 2021, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=P1Ptsns1BQI" },
  { id: "edgerunners-ed1", animeTitle: "Cyberpunk: Edgerunners", animeId: 42310, type: "ED", title: "I Really Want to Stay at Your House", artist: "Rosa Walton", composer: "Rosa Walton", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=h4VJGNNSQnw" },
  { id: "dandadan-op1", animeTitle: "Dandadan", animeId: 57334, type: "OP", title: "Otonoke", artist: "Creepy Nuts", composer: "DJ Matsunaga", year: 2024, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=m5YLks5Ge4Q" },
  { id: "kaiju-op1", animeTitle: "Kaiju No. 8", animeId: 52588, type: "OP", title: "Abyss", artist: "YUNGBLUD", year: 2024, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=qtkYCWlNJFc" },
  { id: "dungeonmeshi-op1", animeTitle: "Delicious in Dungeon", animeId: 52701, type: "OP", title: "Sleep Walking Orchestra", artist: "BUMP OF CHICKEN", composer: "Motoo Fujiwara", year: 2024, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=XMKcghEkxQ0" },
];

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function getOSTs(search?: string, type?: string, artist?: string, animeId?: number): OSTEntry[] {
  let results = [...database];

  if (search) {
    const q = normalize(search);
    results = results.filter(
      (e) =>
        normalize(e.title).includes(q) ||
        normalize(e.artist).includes(q) ||
        normalize(e.animeTitle).includes(q)
    );
  }

  if (type) {
    const t = type.toUpperCase();
    results = results.filter((e) => e.type === t);
  }

  if (artist) {
    const a = normalize(artist);
    results = results.filter((e) => normalize(e.artist).includes(a));
  }

  if (animeId !== undefined) {
    results = results.filter((e) => e.animeId === animeId);
  }

  return results;
}

export function getArtist(name: string): OSTArtist | undefined {
  const songs = database.filter((e) => normalize(e.artist).includes(normalize(name)));
  if (songs.length === 0) return undefined;
  return { name: songs[0].artist, songs };
}

export function getAllArtists(): string[] {
  const set = new Set(database.map((e) => e.artist));
  return Array.from(set).sort();
}

export function getOSTByAnime(animeId: number): OSTEntry[] {
  return database.filter((e) => e.animeId === animeId);
}

const ANIME_COVERS: Record<string, string> = {
  "Naruto": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20-dE6UHbFFg1A5.jpg",
  "Naruto Shippuden": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1735-kGfVm0YqCPcu.png",
  "Attack on Titan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg",
  "Attack on Titan Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20958-HuFJyr54Mmir.jpg",
  "Attack on Titan Season 3": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx99147-AiPDD8cwlCfi.jpg",
  "Attack on Titan The Final Season": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx110277-sKUNXAsWMNFw.jpg",
  "Attack on Titan The Final Season Part 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx131681-5ooUqvqNtee1.jpg",
  "Attack on Titan The Final Season Part 3": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx162314-qIWdAAFtvY8J.jpg",
  "Demon Slayer": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101922-WBsBl0ClmgYL.jpg",
  "Demon Slayer: Entertainment District Arc": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx142329-kET1PIXJv2eW.jpg",
  "Demon Slayer: Swordsmith Village Arc": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx145139-rRimpHGWLhym.png",
  "Demon Slayer: Hashira Training Arc": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx166240-PBV7zukIHW7V.png",
  "One Piece": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg",
  "Fullmetal Alchemist: Brotherhood": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx5114-nSWCgQlmOMtj.jpg",
  "Fullmetal Alchemist": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx121-zjmixZ428Mwv.png",
  "Death Note": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1535-kUgkcrfOrkUM.jpg",
  "Jujutsu Kaisen": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-LHBAeoZDIsnF.jpg",
  "Jujutsu Kaisen Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx145064-hSNRJM03pvv1.jpg",
  "Jujutsu Kaisen 0": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx131573-rpl82vDEDRm6.jpg",
  "My Hero Academia": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21459-nYh85uj2Fuwr.jpg",
  "My Hero Academia Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21856-gutauxhWAwn6.png",
  "My Hero Academia Season 6": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx139630-3v4gxWtNZxLV.jpg",
  "Chainsaw Man": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx127230-DdP4vAdssLoz.png",
  "Tokyo Revengers": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx120120-cWDmnmeEntSe.jpg",
  "Dragon Ball Z": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png",
  "Neon Genesis Evangelion": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx30-AI1zr74Dh4ye.jpg",
  "Cowboy Bebop": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-GCsPm7waJ4kS.png",
  "Howl's Moving Castle": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx431-o8Lj3XkjHm2k.jpg",
  "Spirited Away": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx199-sWefXJvXkDOb.jpg",
  "My Neighbor Totoro": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx523-fErBvxOHP7IX.jpg",
  "Your Name": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21519-SUo3ZQuCbYhJ.png",
  "Sword Art Online": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx11757-SxYDUzdr9rh2.jpg",
  "Sword Art Online II": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx20594-FhRgZ1H9Istt.jpg",
  "Steins;Gate": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx9253-tIUXF2gfU8Sg.jpg",
  "Re:Zero": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21355-wRVUrGxpvIQQ.jpg",
  "Violet Evergarden": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21827-ubzq619ZA2E9.png",
  "Bleach": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx269-d2GmRkJbMopq.png",
  "Hunter x Hunter (2011)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx11061-y5gsT1hoHuHw.png",
  "Mob Psycho 100": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21507-6YUSbh2m0N1p.jpg",
  "Mob Psycho 100 II": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101338-rokVscjRYzdP.jpg",
  "Mob Psycho 100 III": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx140439-bPKmhe1wNxc9.jpg",
  "Haikyuu!!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20464-ooZUyBe4ptp9.png",
  "Haikyuu!! To The Top": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx106625-UR22wB2NuNVi.png",
  "Vinland Saga": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101348-2fhDFPCuMNiz.jpg",
  "Vinland Saga Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx136430-gsBsJjA7hGh9.jpg",
  "Spy x Family": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx140960-Kb6R5nYQfjmP.jpg",
  "Spy x Family Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b158927-lfO85WVguYgc.png",
  "Solo Leveling": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx151807-it355ZgzquUd.png",
  "Oshi no Ko": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx150672-WqmmwZ4nMzAy.png",
  "Code Geass": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1575-hsmWM2ydNm1m.jpg",
  "Gurren Lagann": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx2001-XwRnjzGeFWRQ.png",
  "Samurai Champloo": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx205-7tHVFu6dPBm9.png",
  "Frieren: Beyond Journey's End": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-qQTzQnEJJ3oB.jpg",
  "Princess Mononoke": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx164-ySuGzCWVw2cL.jpg",
  "Kiki's Delivery Service": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx512-UwP8X4BR8YoM.png",
  "One Punch Man": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21087-B5DHjqZ3kW4b.jpg",
  "Tokyo Ghoul": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b20605-k665mVkSug8D.jpg",
  "Kaguya-sama: Love is War": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101921-ufrjLzhSz7L1.jpg",
  "Your Lie in April": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20665-TLgkL8T8IRFd.png",
  "Assassination Classroom": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20755-dWrhs569YGUO.jpg",
  "Black Clover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx97940-fyh8o7gNbha0.png",
  "Dr. Stone": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx105333-GybuoSoOZfpH.jpg",
  "Fire Force": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx105310-2PKUvoaA6fTn.jpg",
  "No Game No Life": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b19815-sEOQ9yQaPKlk.jpg",
  "Kill la Kill": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b18679-lbkq7iYESoFW.png",
  "Puella Magi Madoka Magica": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx9756-QnUGwlwwnsuN.jpg",
  "Angel Beats!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx6547-SYexAn5aFyss.png",
  "KonoSuba: God's Blessing on This Wonderful World!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21202-mPOr80AEjUcZ.png",
  "Overlord": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20832-vUNm5zrYWifc.jpg",
  "Toradora!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx4224-PXVMBLNwy2aF.jpg",
  "Blue Lock": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx137822-U8naszP96vzC.png",
  "Bocchi the Rock!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx130003-HTDmeL4RGeJ4.png",
  "86": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx116589-KawXHB6sApFt.jpg",
  "Cyberpunk: Edgerunners": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx120377-ayZPoxiWt4Li.jpg",
  "Dandadan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx171018-60q1B6GK2Ghb.jpg",
  "Kaiju No. 8": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx153288-25FBfFJzEQ5O.jpg",
  "Delicious in Dungeon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx153518-IVXPDY5ph3kO.jpg",
};

export function getCoverImage(animeTitle: string): string {
  return ANIME_COVERS[animeTitle] || "";
}

export function getPopularOSTs(): OSTEntry[] {
  const popularIds = [
    "aot-op1", "naruto-op3", "ds-op1", "jjk-op1", "csm-op1",
    "eva-op1", "bebop-op1", "naruto-op16", "onk-op1",
    "yourname-op1", "fma-op1", "mha-op1", "db-op1", "steins-op1",
    "ghibli-spirited", "naruto-ost1", "aot-op3", "op-op1", "frieren-op1",
    "sl-op1", "spy-op1", "tokrev-op1", "codegeass-op1", "sao-op1",
  ];
  return database.filter((e) => popularIds.includes(e.id));
}

export type { OSTEntry, OSTArtist };
