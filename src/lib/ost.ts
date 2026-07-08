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
  { id: "naruto-op1", animeTitle: "Naruto", animeId: 20, type: "OP", title: "Rocks", artist: "Hound Dog", composer: "Yoshito Tanaka", year: 2002, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=HhCj9yM08jw" },
  { id: "naruto-op3", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Blue Bird", artist: "Ikimono Gakari", composer: "Yoshiki Mizuno", year: 2008, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=bGWRCtJvTwg" },
  { id: "naruto-op16", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Silhouette", artist: "KANA-BOON", composer: "Maguro Taniguchi", year: 2014, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=wQ9bL7JnG48" },
  { id: "naruto-ost1", animeTitle: "Naruto", animeId: 20, type: "OST", title: "Sadness and Sorrow", artist: "Toshio Masuda", composer: "Toshio Masuda", year: 2002, season: "Fall" },
  { id: "naruto-ed1", animeTitle: "Naruto", animeId: 20, type: "ED", title: "Wind", artist: "Akeboshi", composer: "Akeboshi", year: 2002, season: "Fall" },
  { id: "aot-op1", animeTitle: "Attack on Titan", animeId: 16498, type: "OP", title: "Guren no Yumiya", artist: "Linked Horizon", composer: "Revo", year: 2013, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=K4Beg8T_b5A" },
  { id: "aot-op3", animeTitle: "Attack on Titan Season 2", animeId: 20958, type: "OP", title: "Shinzou wo Sasageyo", artist: "Linked Horizon", composer: "Revo", year: 2017, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=dyq7JGytbVc" },
  { id: "aot-op4", animeTitle: "Attack on Titan Season 3", animeId: 35760, type: "OP", title: "Red Swan", artist: "Yoshiki feat. Hyde", composer: "Yoshiki", year: 2018, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=4q3LkFV6DwE" },
  { id: "aot-op6", animeTitle: "Attack on Titan The Final Season", animeId: 40028, type: "OP", title: "Akuma no Ko", artist: "Ai Higuchi", composer: "Ai Higuchi", year: 2022, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=dmowPGEIJjU" },
  { id: "aot-ost1", animeTitle: "Attack on Titan", animeId: 16498, type: "OST", title: "Vogel im Käfig", artist: "Hiroyuki Sawano", composer: "Hiroyuki Sawano", year: 2013, season: "Spring" },
  { id: "aot-ost2", animeTitle: "Attack on Titan", animeId: 16498, type: "OST", title: "ətˈæk 0N tάɪtn", artist: "Hiroyuki Sawano", composer: "Hiroyuki Sawano", year: 2013, season: "Spring" },
  { id: "ds-op1", animeTitle: "Demon Slayer", animeId: 38000, type: "OP", title: "Gurenge", artist: "LiSA", composer: "Yuki Kajiura", year: 2019, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=4eKvWvEV10g" },
  { id: "ds-op2", animeTitle: "Demon Slayer: Entertainment District Arc", animeId: 48583, type: "OP", title: "Zankyou Sanka", artist: "Aimer", composer: "Yuki Kajiura", year: 2021, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=1XFa73BNp3I" },
  { id: "ds-insert1", animeTitle: "Demon Slayer", animeId: 38000, type: "INSERT", title: "Kamado Tanjiro no Uta", artist: "Nami Nakagawa", composer: "Yuki Kajiura", year: 2019, season: "Spring" },
  { id: "ds-ed1", animeTitle: "Demon Slayer", animeId: 38000, type: "ED", title: "From the Edge", artist: "FictionJunction feat. LiSA", composer: "Yuki Kajiura", year: 2019, season: "Spring" },
  { id: "op-op1", animeTitle: "One Piece", animeId: 21, type: "OP", title: "We Are!", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", year: 1999, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=aiHGjqVn5Xo" },
  { id: "op-op20", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Hope", artist: "Namie Amuro", composer: "Namie Amuro", year: 2017, season: "Fall" },
  { id: "op-insert1", animeTitle: "One Piece", animeId: 21, type: "INSERT", title: "Binks' Sake", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", year: 2006, season: "Summer" },
  { id: "op-ed1", animeTitle: "One Piece", animeId: 21, type: "ED", title: "Memories", artist: "Maki Otsuki", composer: "Maki Otsuki", year: 1999, season: "Fall" },
  { id: "fma-op1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "OP", title: "Again", artist: "YUI", composer: "YUI", year: 2009, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=VRhTK1Z_LN8" },
  { id: "fma-op5", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "OP", title: "Rain", artist: "SID", composer: "Mao", year: 2010, season: "Spring" },
  { id: "fma-insert1", animeTitle: "Fullmetal Alchemist", animeId: 121, type: "INSERT", title: "Brothers", artist: "Yoshino Nanjo", composer: "Michiru Oshima", year: 2003, season: "Fall" },
  { id: "dn-op1", animeTitle: "Death Note", animeId: 1535, type: "OP", title: "The World", artist: "Nightmare", composer: "Ruka", year: 2006, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=9Dk-AJi8Q9c" },
  { id: "dn-op2", animeTitle: "Death Note", animeId: 1535, type: "OP", title: "What's Up, People?!", artist: "Maximum the Hormone", composer: "Maximum the Ryu-kun", year: 2007, season: "Spring" },
  { id: "dn-ed1", animeTitle: "Death Note", animeId: 1535, type: "ED", title: "Alumina", artist: "Nightmare", composer: "Ruka", year: 2006, season: "Fall" },
  { id: "jjk-op1", animeTitle: "Jujutsu Kaisen", animeId: 40748, type: "OP", title: "Kaikai Kitan", artist: "Eve", composer: "Eve", year: 2020, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=uAmevC84UGE" },
  { id: "jjk-op2", animeTitle: "Jujutsu Kaisen", animeId: 40748, type: "OP", title: "Vivid Vice", artist: "Who-ya Extended", composer: "Who-ya Extended", year: 2020, season: "Fall" },
  { id: "jjk-ed1", animeTitle: "Jujutsu Kaisen", animeId: 40748, type: "ED", title: "Lost in Paradise", artist: "ALI feat. AKLO", composer: "ALI", year: 2020, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=w5RLF8vQXto" },
  { id: "mha-op1", animeTitle: "My Hero Academia", animeId: 31964, type: "OP", title: "The Day", artist: "Porno Graffitti", composer: "Akihito Okano", year: 2016, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=bQ3kYClQovE" },
  { id: "mha-op2", animeTitle: "My Hero Academia", animeId: 31964, type: "OP", title: "Peace Sign", artist: "Kenshi Yonezu", composer: "Kenshi Yonezu", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=86wQ7UIO2KA" },
  { id: "mha-ed2", animeTitle: "My Hero Academia", animeId: 31964, type: "ED", title: "Polaris", artist: "Yuki Hayashi", composer: "Yuki Hayashi", year: 2016, season: "Spring" },
  { id: "csm-op1", animeTitle: "Chainsaw Man", animeId: 44511, type: "OP", title: "KICK BACK", artist: "Kenshi Yonezu", composer: "Kenshi Yonezu", year: 2022, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=Qa5WzsJ5CEI" },
  { id: "csm-ed1", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Chu, Taylity", artist: "Kukurira", composer: "Kukurira", year: 2022, season: "Fall" },
  { id: "tokrev-op1", animeTitle: "Tokyo Revengers", animeId: 108728, type: "OP", title: "Cry Baby", artist: "Official HIGE DANdism", composer: "Fujihara Satoshi", year: 2021, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=z7vY-nXL-LA" },
  { id: "db-op1", animeTitle: "Dragon Ball Z", animeId: 813, type: "OP", title: "Cha-La Head Cha-La", artist: "Hironobu Kageyama", composer: "Chiho Kiyooka", year: 1989, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=8tT8wYHF4GE" },
  { id: "db-op2", animeTitle: "Dragon Ball Z", animeId: 813, type: "OP", title: "We Gotta Power", artist: "Hironobu Kageyama", composer: "Chiho Kiyooka", year: 1993, season: "Spring" },
  { id: "eva-op1", animeTitle: "Neon Genesis Evangelion", animeId: 30, type: "OP", title: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", composer: "Hidetoshi Sato", year: 1995, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=4V8eTEN7Z18" },
  { id: "bebop-op1", animeTitle: "Cowboy Bebop", animeId: 1, type: "OP", title: "Tank!", artist: "Yoko Kanno & Seatbelts", composer: "Yoko Kanno", year: 1998, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=oRdxUFOrQ9A" },
  { id: "bebop-ed1", animeTitle: "Cowboy Bebop", animeId: 1, type: "ED", title: "The Real Folk Blues", artist: "Yoko Kanno & Seatbelts", composer: "Yoko Kanno", year: 1998, season: "Spring" },
  { id: "ghibli-howl", animeTitle: "Howl's Moving Castle", animeId: 431, type: "OST", title: "Merry-Go-Round of Life", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 2004, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=fzN2foRTh54" },
  { id: "ghibli-spirited", animeTitle: "Spirited Away", animeId: 199, type: "OST", title: "One Summer's Day", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 2001, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=RO2oi7HFVHY" },
  { id: "ghibli-totoro", animeTitle: "My Neighbor Totoro", animeId: 523, type: "OST", title: "The Path of the Wind", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 1988, season: "Spring" },
  { id: "yourname-op1", animeTitle: "Your Name", animeId: 32281, type: "OST", title: "Zen Zen Zense", artist: "Radwimps", composer: "Radwimps", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=WMlbx3tMzY4" },
  { id: "yourname-op2", animeTitle: "Your Name", animeId: 32281, type: "OST", title: "Sparkle", artist: "Radwimps", composer: "Radwimps", year: 2016, season: "Summer" },
  { id: "yourname-ed1", animeTitle: "Your Name", animeId: 32281, type: "ED", title: "Nandemonaiya", artist: "Radwimps", composer: "Radwimps", year: 2016, season: "Summer" },
  { id: "sao-op1", animeTitle: "Sword Art Online", animeId: 11757, type: "OP", title: "Crossing Field", artist: "LiSA", composer: "Tomoya Tabuchi", year: 2012, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=loAZdeGmh8g" },
  { id: "sao-op2", animeTitle: "Sword Art Online II", animeId: 20583, type: "OP", title: "IGNITE", artist: "Eir Aoi", composer: "Tomoya Tabuchi", year: 2014, season: "Summer" },
  { id: "sao-ed1", animeTitle: "Sword Art Online", animeId: 11757, type: "ED", title: "Yume Sekai", artist: "Haruka Tomatsu", composer: "Tomoya Tabuchi", year: 2012, season: "Summer" },
  { id: "steins-op1", animeTitle: "Steins;Gate", animeId: 9253, type: "OP", title: "Hacking to the Gate", artist: "Kanako Ito", composer: "Chiyomaru Shikura", year: 2011, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=j6P2_LwX_qg" },
  { id: "rezero-op1", animeTitle: "Re:Zero", animeId: 31240, type: "OP", title: "Redo", artist: "Konomi Suzuki", composer: "Konomi Suzuki", year: 2016, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=4tHlCRFaXzk" },
  { id: "rezero-op2", animeTitle: "Re:Zero", animeId: 31240, type: "OP", title: "Paradisus-Paradoxum", artist: "Miyuna", composer: "Miyuna", year: 2016, season: "Summer" },
  { id: "ve-op1", animeTitle: "Violet Evergarden", animeId: 33352, type: "OP", title: "Sincerely", artist: "TRUE", composer: "TRUE", year: 2018, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=zaw4SAXPFYM" },
  { id: "ve-insert1", animeTitle: "Violet Evergarden", animeId: 33352, type: "INSERT", title: "Violet's Letter", artist: "Minori Chihara", composer: "Evan Call", year: 2018, season: "Winter" },
  { id: "bleach-op1", animeTitle: "Bleach", animeId: 269, type: "OP", title: "Asterisk", artist: "ORANGE RANGE", composer: "ORANGE RANGE", year: 2004, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=9T1GmkGQoAo" },
  { id: "bleach-op13", animeTitle: "Bleach", animeId: 269, type: "OP", title: "Ranbu no Melody", artist: "SID", composer: "Mao", year: 2010, season: "Spring" },
  { id: "hxh-op1", animeTitle: "Hunter x Hunter (2011)", animeId: 11061, type: "OP", title: "Departure!", artist: "Masatoshi Ono", composer: "Kohei Tanaka", year: 2011, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=5U7kYPH9myM" },
  { id: "hxh-ed5", animeTitle: "Hunter x Hunter (2011)", animeId: 11061, type: "ED", title: "Hyori Ittai", artist: "Yuzu", composer: "Yuzu", year: 2012, season: "Spring" },
  { id: "mob-op1", animeTitle: "Mob Psycho 100", animeId: 32182, type: "OP", title: "99", artist: "Mob Choir", composer: "Kenji Kawai", year: 2016, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=PWzE6PZFEaw" },
  { id: "mob-op2", animeTitle: "Mob Psycho 100 II", animeId: 37510, type: "OP", title: "99.9", artist: "Mob Choir", composer: "Kenji Kawai", year: 2019, season: "Winter" },
  { id: "haikyuu-op1", animeTitle: "Haikyuu!!", animeId: 20583, type: "OP", title: "Imagination", artist: "SPYAIR", composer: "Kentaro Nishino", year: 2014, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=0dD8VZB6n1I" },
  { id: "haikyuu-op5", animeTitle: "Haikyuu!! To The Top", animeId: 38865, type: "OP", title: "Phoenix", artist: "Burnout Syndromes", composer: "Burnout Syndromes", year: 2020, season: "Winter" },
  { id: "vinland-op1", animeTitle: "Vinland Saga", animeId: 39338, type: "OP", title: "MUKANJYO", artist: "Survive Said the Prophet", composer: "Survive Said the Prophet", year: 2019, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=sqL6rO4YIDo" },
  { id: "vinland-op2", animeTitle: "Vinland Saga Season 2", animeId: 49387, type: "OP", title: "Dark Crow", artist: "Man with a Mission", composer: "Man with a Mission", year: 2023, season: "Winter" },
  { id: "spy-op1", animeTitle: "Spy x Family", animeId: 50265, type: "OP", title: "Mixed Nuts", artist: "Official HIGE DANdism", composer: "Fujihara Satoshi", year: 2022, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=HogPjgO__kw" },
  { id: "spy-op2", animeTitle: "Spy x Family Season 2", animeId: 53890, type: "OP", title: "Souvenir", artist: "BUMP OF CHICKEN", composer: "Fujifabric", year: 2023, season: "Fall" },
  { id: "sl-op1", animeTitle: "Solo Leveling", animeId: 157064, type: "OP", title: "LEveL", artist: "SawanoHiroyuki[nZk] feat. TOMORROW X TOGETHER", composer: "Hiroyuki Sawano", year: 2024, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=fI5i1LsbAQ4" },
  { id: "onk-op1", animeTitle: "Oshi no Ko", animeId: 160201, type: "OP", title: "Idol", artist: "YOASOBI", composer: "Ayase", year: 2023, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=6JtH0N4Q9Rw" },
  { id: "fmab-ed1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "ED", title: "Uso", artist: "SID", composer: "Mao", year: 2009, season: "Spring" },
  { id: "naruto-shippuden-op6", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Sign", artist: "FLOW", composer: "Takeshi Asakawa", year: 2010, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=BN1WwnED9xQ" },
  { id: "aot-op2", animeTitle: "Attack on Titan", animeId: 16498, type: "OP", title: "Jiyuu no Tsubasa", artist: "Linked Horizon", composer: "Revo", year: 2013, season: "Summer" },
  { id: "op-op6", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Brand New World", artist: "D-51", composer: "D-51", year: 2004, season: "Spring" },
  { id: "jjk-s2-op1", animeTitle: "Jujutsu Kaisen Season 2", animeId: 145064, type: "OP", title: "Where Our Blue Is", artist: "Tatsuya Kitani", composer: "Tatsuya Kitani", year: 2023, season: "Summer", videoUrl: "https://www.youtube.com/watch?v=1C3nN3Q-fvA" },
  { id: "mha-op3", animeTitle: "My Hero Academia Season 2", animeId: 33486, type: "OP", title: "Sora ni Utaeba", artist: "amazarashi", composer: "amazarashi", year: 2017, season: "Spring" },
  { id: "csm-ed2", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "FightSong", artist: "Eve", composer: "Eve", year: 2022, season: "Fall" },
  { id: "csm-ed3", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "JOKA", artist: "TOOBOE", composer: "TOOBOE", year: 2022, season: "Fall" },
  { id: "csm-ed4", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Deep down", artist: "Aimer", composer: "Aimer", year: 2022, season: "Fall" },
  { id: "codegeass-op1", animeTitle: "Code Geass", animeId: 1575, type: "OP", title: "Colors", artist: "FLOW", composer: "Takeshi Asakawa", year: 2006, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=PSWEm6qGx74" },
  { id: "codegeass-op2", animeTitle: "Code Geass", animeId: 1575, type: "OP", title: "Kaidoku Funou", artist: "Jinn", composer: "Jinn", year: 2007, season: "Spring" },
  { id: "fmab-op2", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "OP", title: "Hologram", artist: "NICO Touches the Walls", composer: "Tatsuya Mitsumura", year: 2009, season: "Fall" },
  { id: "gurrenlagann-op1", animeTitle: "Gurren Lagann", animeId: 2001, type: "OP", title: "Sorairo Days", artist: "Shoko Nakagawa", composer: "Shoko Nakagawa", year: 2007, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=GjsVQ5vFk8Y" },
  { id: "fmab-insert1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "INSERT", title: "Trisha's Lullaby", artist: "Ami Fujii", composer: "Akira Senju", year: 2009, season: "Spring" },
  { id: "samurai7-op1", animeTitle: "Samurai Champloo", animeId: 205, type: "OP", title: "Battlecry", artist: "Nujabes feat. Shing02", composer: "Nujabes", year: 2004, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=Q2U7yN4g-MI" },
  { id: "fmab-character1", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "CHARACTER", title: "Kesenai Tsumi", artist: "Nana Kitade", composer: "Nana Kitade", year: 2003, season: "Fall" },
  { id: "naruto-shippuden-op9", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Lovers", artist: "7!!", composer: "Keita Tachibana", year: 2011, season: "Summer" },
  { id: "naruto-shippuden-op18", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Line", artist: "Sukima Switch", composer: "Sukima Switch", year: 2015, season: "Winter" },
  { id: "aot-s4-op2", animeTitle: "Attack on Titan The Final Season Part 2", animeId: 48583, type: "OP", title: "The Rumbling", artist: "SiM", composer: "SiM", year: 2022, season: "Winter", videoUrl: "https://www.youtube.com/watch?v=B9r2Y7R9qTY" },
  { id: "aot-s4-ed1", animeTitle: "Attack on Titan The Final Season", animeId: 40028, type: "ED", title: "Shogeki", artist: "Yuko Ando", composer: "Yuko Ando", year: 2020, season: "Winter" },
  { id: "spy-ed1", animeTitle: "Spy x Family", animeId: 50265, type: "ED", title: "Kigeki", artist: "Gen Hoshino", composer: "Gen Hoshino", year: 2022, season: "Spring" },
  { id: "op-op21", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Super Powers", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", year: 2018, season: "Spring" },
  { id: "naruto-shippuden-op19", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Blood Circulator", artist: "ALI", composer: "ALI", year: 2015, season: "Summer" },
  { id: "ds-swordsmith-op", animeTitle: "Demon Slayer: Swordsmith Village Arc", animeId: 145134, type: "OP", title: "Kizuna no Kiseki", artist: "Man with a Mission x milet", composer: "Man with a Mission", year: 2023, season: "Spring", videoUrl: "https://www.youtube.com/watch?v=0FPBDyN4lTU" },
  { id: "jujutsu-kaisen-0-ed", animeTitle: "Jujutsu Kaisen 0", animeId: 131016, type: "ED", title: "Greatest Strength", artist: "Aimer", composer: "Masahiro Tobinai", year: 2021, season: "Winter" },
  { id: "mha-op10", animeTitle: "My Hero Academia Season 6", animeId: 145000, type: "OP", title: "Hitamuki", artist: "Super Beaver", composer: "Super Beaver", year: 2022, season: "Fall" },
  { id: "op-op23", animeTitle: "One Piece", animeId: 21, type: "OP", title: "Dreamin On", artist: "Da-iCE", composer: "Da-iCE", year: 2020, season: "Summer" },
  { id: "frieren-op1", animeTitle: "Frieren: Beyond Journey's End", animeId: 154587, type: "OP", title: "Yoru ni Natta", artist: "YOASOBI", composer: "Ayase", year: 2023, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=5h-o2MbFptA" },
  { id: "frieren-ed1", animeTitle: "Frieren: Beyond Journey's End", animeId: 154587, type: "ED", title: "Anytime Anywhere", artist: "milet", composer: "milet", year: 2023, season: "Fall" },
  { id: "mob-op3", animeTitle: "Mob Psycho 100 III", animeId: 50837, type: "OP", title: "1", artist: "Mob Choir", composer: "Kenji Kawai", year: 2022, season: "Fall" },
  { id: "csmed-all", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Violence", artist: "Queen Bee", composer: "Avu Barazono", year: 2022, season: "Fall" },
  { id: "csmed5", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Rendezvous", artist: "Kanaria", composer: "Kanaria", year: 2022, season: "Fall" },
  { id: "csmed6", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "In the Back Room", artist: "Syudou", composer: "Syudou", year: 2022, season: "Fall" },
  { id: "csmed7", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Ain't Nobody", artist: "Ling Tosite Sigure", composer: "TK", year: 2022, season: "Fall" },
  { id: "csmed8", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "First Death", artist: "TK from Ling Tosite Sigure", composer: "TK", year: 2022, season: "Fall" },
  { id: "csmed9", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Tornado", artist: "Regal Lily", composer: "Regal Lily", year: 2022, season: "Fall" },
  { id: "csmed10", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Total", artist: "Maigo Hanyu", composer: "Maigo Hanyu", year: 2022, season: "Fall" },
  { id: "csmed11", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Bye Bye", artist: "Mitsume", composer: "Mitsume", year: 2022, season: "Fall" },
  { id: "csmed12", animeTitle: "Chainsaw Man", animeId: 44511, type: "ED", title: "Edge of Chainsaw", artist: "Masayuki Nakano", composer: "Masayuki Nakano", year: 2022, season: "Fall" },
  { id: "naruto-shippuden-op8", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Diver", artist: "NICO Touches the Walls", composer: "Tatsuya Mitsumura", year: 2011, season: "Winter" },
  { id: "fmab-ed5", animeTitle: "Fullmetal Alchemist: Brotherhood", animeId: 5114, type: "ED", title: "Ray of Light", artist: "Shoko Nakagawa", composer: "Shoko Nakagawa", year: 2010, season: "Spring" },
  { id: "ghibli-mononoke", animeTitle: "Princess Mononoke", animeId: 29, type: "OST", title: "The Legend of Ashitaka", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 1997, season: "Summer" },
  { id: "ghibli-kiki", animeTitle: "Kiki's Delivery Service", animeId: 512, type: "OST", title: "A Town with an Ocean View", artist: "Joe Hisaishi", composer: "Joe Hisaishi", year: 1989, season: "Summer" },
  { id: "ds-hashira-op", animeTitle: "Demon Slayer: Hashira Training Arc", animeId: 167144, type: "OP", title: "Mugen", artist: "Miyavi", composer: "Miyavi", year: 2024, season: "Spring" },
  { id: "jjk-s2-op2", animeTitle: "Jujutsu Kaisen Season 2", animeId: 145064, type: "OP", title: "Specialz", artist: "King Gnu", composer: "King Gnu", year: 2023, season: "Fall", videoUrl: "https://www.youtube.com/watch?v=SJFZR8-1LMo" },
  { id: "jjk-s2-ed1", animeTitle: "Jujutsu Kaisen Season 2", animeId: 145064, type: "ED", title: "Akari", artist: "Sou", composer: "Sou", year: 2023, season: "Summer" },
  { id: "aot-s4p3-op", animeTitle: "Attack on Titan The Final Season Part 3", animeId: 157872, type: "OP", title: "Yūgure no Tori", artist: "Shinsei Kamattechan", composer: "Shinsei Kamattechan", year: 2023, season: "Spring" },
  { id: "naruto-shippuden-op20", animeTitle: "Naruto Shippuden", animeId: 1735, type: "OP", title: "Kara no Kokoro", artist: "Anly", composer: "Anly", year: 2016, season: "Spring" },
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

export function getPopularOSTs(): OSTEntry[] {
  const popularIds = [
    "aot-op1", "naruto-op3", "ds-op1", "jjk-op1", "csm-op1",
    "evangelion-op1", "bebop-op1", "naruto-op16", "on-idol",
    "yourname-op1", "fma-op1", "mha-op1", "db-op1", "steins-op1",
    "ghibli-spirited", "naruto-ost1", "aot-op3", "op-op1", "frieren-op1",
    "sl-op1", "spy-op1", "tokrev-op1", "codegeass-op1", "sao-op1",
  ];
  return database.filter((e) => popularIds.includes(e.id));
}

export type { OSTEntry, OSTArtist };
