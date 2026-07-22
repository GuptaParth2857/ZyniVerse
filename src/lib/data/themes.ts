export interface ThemeSongEntry {
  mediaId: number;
  type: "OP" | "ED";
  sequence: number;
  title: string;
  artist: string;
  composer?: string;
  episodeStart?: number;
  episodeEnd?: number;
  youtubeId?: string;
}

export const THEME_SONGS: ThemeSongEntry[] = [
  { mediaId: 21, type: "OP", sequence: 1, title: "We Are!", artist: "Hiroshi Kitadani", composer: "Kohei Tanaka", episodeStart: 1, episodeEnd: 47, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 2, title: "Hikari E", artist: "The Babystars", composer: "Tanaka Ohta", episodeStart: 48, episodeEnd: 115, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 3, title: "Bon Voyage!", artist: "Bon-Bon Blanco", episodeStart: 116, episodeEnd: 168, youtubeId: "TApFCt9m0ug" },
  { mediaId: 21, type: "OP", sequence: 4, title: "Kokoro no Chizu", artist: "Boystyle", episodeStart: 169, episodeEnd: 206, youtubeId: "lj6tjz5VkQM" },
  { mediaId: 21, type: "OP", sequence: 5, title: "Brand New World", artist: "D-51", episodeStart: 207, episodeEnd: 263, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 6, title: "We Are! (Straw Hat Version)", artist: "Hiroshi Kitadani", episodeStart: 264, episodeEnd: 278, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 7, title: "Share the World", artist: "TVXQ", episodeStart: 279, episodeEnd: 324, youtubeId: "sV5R6Fyp31M" },
  { mediaId: 21, type: "OP", sequence: 8, title: "Kaze wo Sagashite", artist: "Yoshiko", episodeStart: 325, episodeEnd: 372, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 9, title: "One Day", artist: "The Rootless", episodeStart: 373, episodeEnd: 394, youtubeId: "X4SViWkqHSM" },
  { mediaId: 21, type: "OP", sequence: 10, title: "Fight Together", artist: "Namie Amuro", episodeStart: 395, episodeEnd: 425, youtubeId: "hUrjWzmBMRg" },
  { mediaId: 21, type: "OP", sequence: 11, title: "We Go!", artist: "Hiroshi Kitadani", episodeStart: 426, episodeEnd: 458, youtubeId: "-bCTlrXlnTM" },
  { mediaId: 21, type: "OP", sequence: 12, title: "Hands Up!", artist: "Kota Shinzato", episodeStart: 459, episodeEnd: 492, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 13, title: "Wake Up!", artist: "AAA", episodeStart: 493, episodeEnd: 516, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 14, title: "Hard Knock Days", artist: "Generations", episodeStart: 517, episodeEnd: 540, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 15, title: "We Can!", artist: "Hiroshi Kitadani", episodeStart: 541, episodeEnd: 560, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 16, title: "Hope", artist: "Namie Amuro", episodeStart: 561, episodeEnd: 590, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 17, title: "Super Powers", artist: "V6", episodeStart: 591, episodeEnd: 628, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 18, title: "Over the Top", artist: "Hiroshi Kitadani", episodeStart: 629, episodeEnd: 686, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 19, title: "Dreamin On", artist: "Da-iCE", episodeStart: 687, episodeEnd: 745, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 20, title: "Pain Pain", artist: "Chico", episodeStart: 746, episodeEnd: 780, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "OP", sequence: 21, title: "Gurugula", artist: "Seiko Oomori", episodeStart: 781, episodeEnd: 808 },
  { mediaId: 21, type: "OP", sequence: 22, title: "Us!", artist: "Kota Shinzato", episodeStart: 809, episodeEnd: 836 },
  { mediaId: 21, type: "OP", sequence: 23, title: "UUUUUSSS!", artist: "Hiroshi Kitadani", episodeStart: 837, episodeEnd: 855 },
  { mediaId: 21, type: "OP", sequence: 24, title: "Assu!", artist: "Tatsuro Mashiko", episodeStart: 856, episodeEnd: 878 },
  { mediaId: 21, type: "OP", sequence: 25, title: "Binks Sake", artist: "Hiroshi Kitadani", episodeStart: 879, episodeEnd: 926, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "ED", sequence: 1, title: "Memories", artist: "Maki Otsuki", episodeStart: 1, episodeEnd: 63, youtubeId: "23GCn7QaQ18" },
  { mediaId: 21, type: "ED", sequence: 2, title: "Run! Run! Run!", artist: "Maki Otsuki", episodeStart: 64, episodeEnd: 95, /* youtubeId removed (invalid) */ },
  { mediaId: 21, type: "ED", sequence: 3, title: "Watashi ga Iru Yo", artist: "Tomato n'Pine", episodeStart: 96, episodeEnd: 117, /* youtubeId removed (invalid) */ },

  { mediaId: 5114, type: "OP", sequence: 1, title: "The Hero!!", artist: "JAM Project", composer: "Hiroshi Kitadani", episodeStart: 1, episodeEnd: 48, /* youtubeId removed (invalid) */ },
  { mediaId: 5114, type: "OP", sequence: 2, title: "The Hero!! (Saitama Cypher)", artist: "JAM Project", episodeStart: 49, episodeEnd: 72, youtubeId: "juuyQNZumOw" },
  { mediaId: 5114, type: "ED", sequence: 1, title: "Hoshi Yori Saki ni Mitsukete Ageru", artist: "Shoko Nakagawa", episodeStart: 1, episodeEnd: 48, /* youtubeId removed (invalid) */ },
  { mediaId: 5114, type: "ED", sequence: 2, title: "Kanashimi Yori mo Taisetsu na Koto", artist: "Shoko Nakagawa", episodeStart: 49, episodeEnd: 72, youtubeId: "sKu3LjLW4CQ" },

  { mediaId: 23755, type: "OP", sequence: 1, title: "Kaikai Kitan", artist: "Eve", composer: "Eve", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 23755, type: "OP", sequence: 2, title: "VIVID VICE", artist: "Who-ya Extended", episodeStart: 25, episodeEnd: 47, youtubeId: "BBxgzISkCLQ" },
  { mediaId: 23755, type: "OP", sequence: 3, title: "Ichizu Sakusei", artist: "King Gnu", episodeStart: 48, episodeEnd: 60, youtubeId: "iwiP3P0Upnk" },
  { mediaId: 23755, type: "ED", sequence: 1, title: "Lost in Paradise", artist: "ALI ft. AKLO", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 23755, type: "ED", sequence: 2, title: "Give It Back", artist: "Cö shu Nie", episodeStart: 25, episodeEnd: 47, youtubeId: "s2JcedFF5RQ" },
  { mediaId: 23755, type: "ED", sequence: 3, title: "Shingo", artist: "Chansung", episodeStart: 48, episodeEnd: 60 },

  { mediaId: 16498, type: "OP", sequence: 1, title: "Guren no Yumiya", artist: "Linked Horizon", composer: "Revo", episodeStart: 1, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 16498, type: "OP", sequence: 2, title: "Jiyuu no Tsubasa", artist: "Linked Horizon", episodeStart: 26, episodeEnd: 38, youtubeId: "PbWFpzi8C94" },
  { mediaId: 16498, type: "OP", sequence: 3, title: "Shinzou wo Sasageyo!", artist: "Linked Horizon", episodeStart: 39, episodeEnd: 59, youtubeId: "LKP-vZvjbh8" },
  { mediaId: 16498, type: "OP", sequence: 4, title: "Red Swan", artist: "Yoshiki ft. Hyde", episodeStart: 60, episodeEnd: 72, youtubeId: "cQbDvCqbPno" },
  { mediaId: 16498, type: "OP", sequence: 5, title: "Shoukei to Shikabane no Michi", artist: "Linked Horizon", episodeStart: 73, episodeEnd: 88, youtubeId: "K9kwGVuYtPw" },
  { mediaId: 16498, type: "OP", sequence: 6, title: "My War", artist: "Shinsei Kamattechan", episodeStart: 89, episodeEnd: 112, youtubeId: "f1vheBGpC_o" },
  { mediaId: 16498, type: "OP", sequence: 7, title: "Rumbling", artist: "SiM", episodeStart: 113, episodeEnd: 130, youtubeId: "OBqw818mQ1E" },
  { mediaId: 16498, type: "ED", sequence: 1, title: "Utsukushiki Zankoku na Sekai", artist: "Yoko Hikasa", episodeStart: 1, episodeEnd: 13, youtubeId: "odm6a02VhO8" },
  { mediaId: 16498, type: "ED", sequence: 2, title: "Great Escape", artist: "Cinema Staff", episodeStart: 14, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 16498, type: "ED", sequence: 3, title: "Yūgure no Tori", artist: "Shinsei Kamattechan", episodeStart: 26, episodeEnd: 38, /* youtubeId removed (invalid) */ },

  { mediaId: 1735, type: "OP", sequence: 1, title: "Hero's Come Back!!", artist: "Nobodyknows+", episodeStart: 1, episodeEnd: 30, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 2, title: "Distance", artist: "Long Shot Party", episodeStart: 31, episodeEnd: 53, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 3, title: "Blue Bird", artist: "Ikimono-gakari", episodeStart: 54, episodeEnd: 77, youtubeId: "44IK60CRGw8" },
  { mediaId: 1735, type: "OP", sequence: 4, title: "CLOSER", artist: "Joe Inoue", episodeStart: 78, episodeEnd: 100, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 5, title: "Hotaru no Hikari", artist: "Ikimono-gakari", episodeStart: 101, episodeEnd: 125, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 6, title: "Sign", artist: "Flow", episodeStart: 126, episodeEnd: 153, youtubeId: "6c3dEwyfhAU" },
  { mediaId: 1735, type: "OP", sequence: 7, title: "Toumei Datta Sekai", artist: "Motohiro Hata", episodeStart: 154, episodeEnd: 179, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 8, title: "Diver", artist: "Nico Touches the Walls", episodeStart: 180, episodeEnd: 205, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 9, title: "Lovers", artist: "7!!", episodeStart: 206, episodeEnd: 230, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 10, title: "newsong", artist: "Tacica", episodeStart: 231, episodeEnd: 256, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 11, title: "Totsugeki Rock", artist: "The Cro-Magnons", episodeStart: 257, episodeEnd: 281, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 12, title: "Moshimo", artist: "Daisuke", episodeStart: 282, episodeEnd: 306, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 13, title: "Such a Beautiful Affair", artist: "Sister", episodeStart: 307, episodeEnd: 330 },
  { mediaId: 1735, type: "OP", sequence: 14, title: "Silhouette", artist: "Kana-Boon", episodeStart: 331, episodeEnd: 356, youtubeId: "zVgKnfN9i34" },
  { mediaId: 1735, type: "OP", sequence: 15, title: "Kaze", artist: "Yamazaru", episodeStart: 357, episodeEnd: 379 },
  { mediaId: 1735, type: "OP", sequence: 16, title: "LINE", artist: "Shiori", episodeStart: 380, episodeEnd: 405 },
  { mediaId: 1735, type: "OP", sequence: 17, title: "Blood Circulator", artist: "Asian Kung-Fu Generation", episodeStart: 406, episodeEnd: 430, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 18, title: "Kara no Kokoro", artist: "Anly", episodeStart: 431, episodeEnd: 458, /* youtubeId removed (invalid) */ },
  { mediaId: 1735, type: "OP", sequence: 19, title: "Reverb", artist: "Nona Reeves", episodeStart: 459, episodeEnd: 476 },
  { mediaId: 1735, type: "OP", sequence: 20, title: "Empty", artist: "Inori", episodeStart: 477, episodeEnd: 500 },

  { mediaId: 11061, type: "OP", sequence: 1, title: "Oath Sign", artist: "LiSA", composer: "Yuki Kajiura", episodeStart: 1, episodeEnd: 13, /* youtubeId removed (invalid) */ },
  { mediaId: 11061, type: "OP", sequence: 2, title: "to the beginning", artist: "Kalafina", episodeStart: 14, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 11061, type: "OP", sequence: 3, title: "Hikari Furu", artist: "Kalafina", episodeStart: 26, episodeEnd: 37, /* youtubeId removed (invalid) */ },
  { mediaId: 11061, type: "OP", sequence: 4, title: "Broken Night", artist: "LiSA", episodeStart: 38, episodeEnd: 50, /* youtubeId removed (invalid) */ },
  { mediaId: 11061, type: "ED", sequence: 1, title: "sayonara", artist: "Kanae Itou", episodeStart: 1, episodeEnd: 13, /* youtubeId removed (invalid) */ },

  { mediaId: 1535, type: "OP", sequence: 1, title: "Again", artist: "YUI", composer: "YUI", episodeStart: 1, episodeEnd: 30, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "OP", sequence: 2, title: "Hologram", artist: "NICO Touches the Walls", episodeStart: 31, episodeEnd: 50, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "OP", sequence: 3, title: "Golden Time Lover", artist: "Sukima Switch", episodeStart: 51, episodeEnd: 70, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "OP", sequence: 4, title: "Tsunaida Te", artist: "Lil'B", episodeStart: 71, episodeEnd: 90, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "OP", sequence: 5, title: "Period", artist: "Chemistry", episodeStart: 91, episodeEnd: 108, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "OP", sequence: 6, title: "Rain", artist: "SID", episodeStart: 109, episodeEnd: 130, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "OP", sequence: 7, title: "Rainbow", artist: "SID", episodeStart: 131, episodeEnd: 154, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "ED", sequence: 1, title: "Uso", artist: "SID", episodeStart: 1, episodeEnd: 30, /* youtubeId removed (invalid) */ },
  { mediaId: 1535, type: "ED", sequence: 2, title: "Mob", artist: "SID", episodeStart: 31, episodeEnd: 50, /* youtubeId removed (invalid) */ },

  { mediaId: 813, type: "OP", sequence: 1, title: "Cha-La Head-Cha-La", artist: "Hironobu Kageyama", composer: "Chiho Kiyooka", episodeStart: 1, episodeEnd: 199, /* youtubeId removed (invalid) */ },
  { mediaId: 813, type: "OP", sequence: 2, title: "We Gotta Power", artist: "Hironobu Kageyama", episodeStart: 200, episodeEnd: 291, youtubeId: "nAKieoaRKH4" },
  { mediaId: 813, type: "ED", sequence: 1, title: "Bye Bye, Blue Water", artist: "Rika Matsumoto", episodeStart: 1, episodeEnd: 199, /* youtubeId removed (invalid) */ },

  { mediaId: 11757, type: "OP", sequence: 1, title: "Guren", artist: "NAO", episodeStart: 1, episodeEnd: 13, /* youtubeId removed (invalid) */ },
  { mediaId: 11757, type: "OP", sequence: 2, title: "Rakuen", artist: "NAO", episodeStart: 14, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 11757, type: "ED", sequence: 1, title: "Resonant World", artist: "Hisako", episodeStart: 1, episodeEnd: 13, /* youtubeId removed (invalid) */ },

  { mediaId: 22319, type: "OP", sequence: 1, title: "Chozetsu Dynamic!", artist: "Kazuo Yoshida", episodeStart: 1, episodeEnd: 76, /* youtubeId removed (invalid) */ },
  { mediaId: 22319, type: "OP", sequence: 2, title: "Limits of Break", artist: "Kiyoshi Hikawa", episodeStart: 77, episodeEnd: 131 },
  { mediaId: 22319, type: "ED", sequence: 1, title: "Hello Hello Hello", artist: "Good Morning America", episodeStart: 1, episodeEnd: 76, /* youtubeId removed (invalid) */ },

  { mediaId: 30276, type: "OP", sequence: 1, title: "Colors", artist: "FLOW", episodeStart: 1, episodeEnd: 23, youtubeId: "G8CFuZ9MseQ" },
  { mediaId: 30276, type: "OP", sequence: 2, title: "Jibun wo", artist: "FLOW", episodeStart: 24, episodeEnd: 50, /* youtubeId removed (invalid) */ },
  { mediaId: 30276, type: "ED", sequence: 1, title: "Mozaiku Kakera", artist: "SunSet Swish", episodeStart: 1, episodeEnd: 23, /* youtubeId removed (invalid) */ },

  { mediaId: 34438, type: "OP", sequence: 1, title: "History Maker", artist: "Dean Fujioka", composer: "Dean Fujioka", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 34438, type: "ED", sequence: 1, title: "You Only Live Once", artist: "Yuri!!! on ICE feat. w.hatano", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 19815, type: "OP", sequence: 1, title: "Sirius", artist: "Eir Aoi", episodeStart: 1, episodeEnd: 26, /* youtubeId removed (invalid) */ },
  { mediaId: 19815, type: "OP", sequence: 2, title: "Eternal", artist: "Eir Aoi", episodeStart: 27, episodeEnd: 50, /* youtubeId removed (invalid) */ },
  { mediaId: 19815, type: "ED", sequence: 1, title: "Wishing", artist: "Rin", episodeStart: 1, episodeEnd: 26, /* youtubeId removed (invalid) */ },

  { mediaId: 23273, type: "OP", sequence: 1, title: "DEAREST DROP", artist: "fhána", episodeStart: 1, episodeEnd: 13, /* youtubeId removed (invalid) */ },
  { mediaId: 23273, type: "OP", sequence: 2, title: "chAngE", artist: "miwa", episodeStart: 14, episodeEnd: 26, /* youtubeId removed (invalid) */ },
  { mediaId: 23273, type: "ED", sequence: 1, title: "Kimi no Tonari", artist: "Hitomi Kaji", episodeStart: 1, episodeEnd: 13, /* youtubeId removed (invalid) */ },

  { mediaId: 9253, type: "OP", sequence: 1, title: "Cagayake! GIRLS", artist: "Houkago Tea Time", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 9253, type: "OP", sequence: 2, title: "GO! GO! MANIAC", artist: "Houkago Tea Time", episodeStart: 25, episodeEnd: 48, /* youtubeId removed (invalid) */ },

  { mediaId: 33352, type: "OP", sequence: 1, title: "Cinderella Step", artist: "Sari Iijima", episodeStart: 1, episodeEnd: 12 },
  { mediaId: 33352, type: "ED", sequence: 1, title: "Motto.", artist: "Riyoko", episodeStart: 1, episodeEnd: 12 },

  { mediaId: 1, type: "OP", sequence: 1, title: "Tank!", artist: "The Seatbelts", episodeStart: 1, episodeEnd: 26, youtubeId: "gdZLi9oWNZg" },
  { mediaId: 1, type: "ED", sequence: 1, title: "The Real Folk Blues", artist: "Mai Yamane", episodeStart: 1, episodeEnd: 26, /* youtubeId removed (invalid) */ },

  { mediaId: 10087, type: "OP", sequence: 1, title: "My Dearest", artist: "Supercell", composer: "Ryo", episodeStart: 1, episodeEnd: 22, /* youtubeId removed (invalid) */ },
  { mediaId: 10087, type: "OP", sequence: 2, title: "The Everlasting Guilty Crown", artist: "EGOIST", episodeStart: 23, episodeEnd: 34, /* youtubeId removed (invalid) */ },
  { mediaId: 10087, type: "ED", sequence: 1, title: "Departures", artist: "EGOIST", episodeStart: 1, episodeEnd: 22, youtubeId: "5MMWudM0420" },

  { mediaId: 2904, type: "OP", sequence: 1, title: "Connect", artist: "ClariS", composer: "Sho Watanabe", episodeStart: 1, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 2904, type: "OP", sequence: 2, title: "Luminous", artist: "ClariS", episodeStart: 26, episodeEnd: 50, /* youtubeId removed (invalid) */ },
  { mediaId: 2904, type: "ED", sequence: 1, title: "Magia", artist: "Kalafina", episodeStart: 1, episodeEnd: 25, /* youtubeId removed (invalid) */ },

  { mediaId: 2001, type: "OP", sequence: 1, title: "Hacking to the Gate", artist: "Ito Kanako", composer: "Chiyomaru Shikura", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 2001, type: "ED", sequence: 1, title: "Toki Tsubasa", artist: "Zwei", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },

  { mediaId: 20464, type: "OP", sequence: 1, title: "Let Me Hear", artist: "Fear, and Loathing in Las Vegas", episodeStart: 1, episodeEnd: 22, /* youtubeId removed (invalid) */ },
  { mediaId: 20464, type: "ED", sequence: 1, title: "It's the Right Time", artist: "Mamoru Miyano", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 31240, type: "OP", sequence: 1, title: "Kabaneri of the Iron Fortress", artist: "Egoist", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },
  { mediaId: 31240, type: "ED", sequence: 1, title: "Ninelie", artist: "Aimer", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 28755, type: "OP", sequence: 1, title: "Hikaru Nara", artist: "Goose house", episodeStart: 1, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 28755, type: "ED", sequence: 1, title: "Koi", artist: "Gen Hoshino", episodeStart: 1, episodeEnd: 12, youtubeId: "2OEL4P1Rz04" },

  { mediaId: 37991, type: "OP", sequence: 1, title: "Memento", artist: "Mori Calliope", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },
  { mediaId: 37991, type: "OP", sequence: 2, title: "Memento", artist: "Nonoc", episodeStart: 13, episodeEnd: 24 },
  { mediaId: 37991, type: "ED", sequence: 1, title: "Ishukan Communication", artist: "Mori Calliope", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 41467, type: "OP", sequence: 1, title: "Kick Back", artist: "Kenshi Yonezu", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },
  { mediaId: 41467, type: "ED", sequence: 1, title: "Lucky Brute", artist: "Official HIGE DANdism", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 24701, type: "OP", sequence: 1, title: "Bling-Bang-Bang-Born", artist: "Creepy Nuts", composer: "DJ Matsunaga", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 24701, type: "ED", sequence: 1, title: "Lied", artist: "SawanoHiroyuki[nZk]:Honoka Takahashi", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 21570, type: "OP", sequence: 1, title: "Hana ni Natte", artist: "Shugo Tokumaru", episodeStart: 1, episodeEnd: 12 },
  { mediaId: 21570, type: "ED", sequence: 1, title: "Sokuho", artist: "Shugo Tokumaru", episodeStart: 1, episodeEnd: 12 },

  { mediaId: 35760, type: "OP", sequence: 1, title: "Hikaru Nara", artist: "Goose house", episodeStart: 1, episodeEnd: 25, /* youtubeId removed (invalid) */ },
  { mediaId: 35760, type: "OP", sequence: 2, title: "Sakura", artist: "Yui Horie", episodeStart: 26, episodeEnd: 50 },
  { mediaId: 35760, type: "ED", sequence: 1, title: "Kiss", artist: "Yui Horie", episodeStart: 1, episodeEnd: 12 },
  { mediaId: 35760, type: "ED", sequence: 2, title: "Sakura", artist: "Yui Horie", episodeStart: 13, episodeEnd: 50 },

  { mediaId: 31964, type: "OP", sequence: 1, title: "Wild Side", artist: "ALI", episodeStart: 1, episodeEnd: 24, /* youtubeId removed (invalid) */ },
  { mediaId: 31964, type: "ED", sequence: 1, title: "LEMON", artist: "Kenshi Yonezu", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 21459, type: "OP", sequence: 1, title: "SYNCHRONICITY", artist: "Yuri Kasahara", episodeStart: 1, episodeEnd: 10 },
  { mediaId: 21459, type: "ED", sequence: 1, title: "Tasogare", artist: "Yuri Kasahara", episodeStart: 1, episodeEnd: 10 },

  { mediaId: 40748, type: "OP", sequence: 1, title: "KICK BACK", artist: "Kenshi Yonezu", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },
  { mediaId: 40748, type: "ED", sequence: 1, title: "CHAINSAW BLOOD", artist: "Vaundy", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },

  { mediaId: 37521, type: "OP", sequence: 1, title: "Crossing Road", artist: "Ayaka Ohashi", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },
  { mediaId: 37521, type: "ED", sequence: 1, title: "Yasashisa no Namae", artist: "Miku Itou", episodeStart: 1, episodeEnd: 12, /* youtubeId removed (invalid) */ },
];
