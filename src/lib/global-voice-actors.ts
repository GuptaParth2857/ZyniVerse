import type { VoiceActor } from "./voice-actors";

// Curated from AniList — popular Japanese seiyuu & English dub voice actors
// (main cast of 20+ iconic anime). Detail pages fetch live AniList data.
export const GLOBAL_VOICE_ACTORS: VoiceActor[] = [
  {
    id: 95557, name: "Masako Nozawa", nativeName: "野沢雅子", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95557-5a2nnIBK05ul.png", languages: ["Japanese"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gokuu Son", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "supporting", language: "Japanese" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Gokuu Son", characterImage: "", roleType: "supporting", language: "Japanese" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95357, name: "Unshou Ishizuka", nativeName: "石塚運昇", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95357-umndcceko65h.png", languages: ["Japanese"],
    roles: [
        { animeId: 1, animeTitle: "Cowboy Bebop", animeImage: "", characterName: "Jet Black", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Yukinari Ookido", characterImage: "", roleType: "supporting", language: "Japanese" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Narrator", characterImage: "", roleType: "supporting", language: "Japanese" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Matadogas", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95016, name: "Noriaki Sugiyama", nativeName: "杉山紀彰", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95016-03m7lAUZBMDv.png", languages: ["Japanese"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "supporting", language: "Japanese" },
        { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Uryuu Ishida", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95128, name: "Ikue Ootani", nativeName: "大谷育江", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95128-9YWpE1d2U8Sj.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Chopper Tony Tony", characterImage: "", roleType: "supporting", language: "Japanese" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Pikachu", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95015, name: "Junko Takeuchi", nativeName: "竹内順子", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95015-QwI9K4FRe4Cq.png", languages: ["Japanese"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95021, name: "Kazuhiko Inoue", nativeName: "井上和彦", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95021-9qAoAn6GNZ3S.png", languages: ["Japanese"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95300, name: "Chie Nakamura", nativeName: "中村千絵", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95300-84lMPsAHkPP3.png", languages: ["Japanese"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95075, name: "Mayumi Tanaka", nativeName: "田中真弓", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95075-1qD4TeW1ON92.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Luffy Monkey", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Kuririn", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95067, name: "Kappei Yamaguchi", nativeName: "山口勝平", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95067-hqIpNxMfAuN2.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Usopp", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 1535, animeTitle: "Death Note", animeImage: "", characterName: "L Lawliet", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95518, name: "Ryou Horikawa", nativeName: "堀川りょう", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95518-6VFuLBDEPjTa.png", languages: ["Japanese"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95205, name: "Masakazu Morita", nativeName: "森田成一", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95205-5P3tKe3eTG9n.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Whis", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Ichigo Kurosaki", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95158, name: "Marina Inoue", nativeName: "井上麻里奈", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95158-OLhgs8zv5xsp.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Armin Arlert", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denji", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95063, name: "Keiji Fujiwara", nativeName: "藤原啓治", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95063-xAsEUzspuLMG.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 1535, animeTitle: "Death Note", animeImage: "", characterName: "Shuuichi Aizawa", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 11061, animeTitle: "Hunter x Hunter (2011)", animeImage: "", characterName: "Leorio Paradinight", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95073, name: "Yuki Matsuoka", nativeName: "松岡由貴", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95073-HIjUyhssrxGs.png", languages: ["Japanese"],
    roles: [
        { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Ichigo Kurosaki", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Orihime Inoue", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95014, name: "Megumi Hayashibara", nativeName: "林原めぐみ", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95014-tFYQYYhlVOF0.png", languages: ["Japanese"],
    roles: [
        { animeId: 1, animeTitle: "Cowboy Bebop", animeImage: "", characterName: "Faye Valentine", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Musashi", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95058, name: "Yuuji Ueda", nativeName: "うえだゆうじ", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95058-fGnId7E4tgx3.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Takeshi", characterImage: "", roleType: "main", language: "Japanese" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Sonans", characterImage: "", roleType: "supporting", language: "Japanese" },
    ],
  },
  {
    id: 95727, name: "Ema Kogure", nativeName: "小暮英麻", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95727-qwSGmin4kQ7D.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 105013, name: "Mutsumi Tamura", nativeName: "田村睦心", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n105013-DffN0XN2Zw7G.png", languages: ["Japanese"],
    roles: [
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95005, name: "Kenichi Suzumura", nativeName: "鈴村健一", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95005-SkoVN02iOglr.png", languages: ["Japanese"],
    roles: [
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95130, name: "Yuriko Yamaguchi", nativeName: "山口由里子", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95130-GoO41ve3YWQw.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95983, name: "Yuuko Kobayashi", nativeName: "小林優子", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95983-lqRFYTojbkRi.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 16463, name: "Anzu Nagai", nativeName: "永井杏", image: "https://s4.anilist.co/file/anilistcdn/staff/large/16463.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95123, name: "Kazuya Nakai", nativeName: "中井和哉", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95123-54LrTiD9kGwY.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 101663, name: "Megumi Urawa", nativeName: "浦和めぐみ", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n101663-0ioQAduoHX8j.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95131, name: "Kazuki Yao", nativeName: "矢尾一樹", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95131-TCVTgxb08tfE.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Franky", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95277, name: "Junko Noda", nativeName: "野田順子", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95277-hcE9l52SPjNP.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Franky", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 107480, name: "Subaru Kimura", nativeName: "木村昴", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n107480-h2RgLXNP7hcj.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Franky", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95125, name: "Hiroaki Hirata", nativeName: "平田広明", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95125-NeFFiJupoDVj.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Sanji", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95420, name: "Kazue Ikura", nativeName: "伊倉一恵", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95420-or3epAZNwUdi.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Chopper Tony Tony", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95076, name: "Akemi Okamura", nativeName: "岡村明美", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95076-itRGy8F3x5Em.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Nami", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95496, name: "Wakana Yamazaki", nativeName: "山崎和佳奈", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95496-PAwWafRnHtEf.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Nami", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95898, name: "Choo", nativeName: "チョー ", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95898-XHSESV65G8Jv.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Brook", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95744, name: "Daisuke Gouri", nativeName: "郷里大輔", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95744-Iu1p0eNvShfN.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Jinbe", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 100317, name: "Katsuhisa Houki", nativeName: "宝亀克寿", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n100317-8qR7ph0AKfXu.png", languages: ["Japanese"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Jinbe", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95673, name: "Toshio Furukawa", nativeName: "古川登志夫", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95673-jNN4GqGgpssj.png", languages: ["Japanese"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Piccolo", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95354, name: "Hiromi Tsuru", nativeName: "鶴ひろみ", image: "https://s4.anilist.co/file/anilistcdn/staff/large/95354-Ds90swc530OH.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Bulma", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 111635, name: "Natsuki Hanae", nativeName: "花江夏樹", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n111635-L385UcjTKCBq.png", languages: ["Japanese"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Tanjirou Kamado", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 101560, name: "Satomi Satou", nativeName: "佐藤聡美", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n101560-YN8w6EZZtIhb.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Tanjirou Kamado", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 119722, name: "Akari Kitou", nativeName: "鬼頭明里", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n119722-Ls7ORfBejJEP.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Nezuko Kamado", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 106817, name: "Yoshitsugu Matsuoka", nativeName: "松岡禎丞", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n106817-mioGQjbTWWQ6.png", languages: ["Japanese"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Inosuke Hashibira", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95356, name: "Hiro Shimono", nativeName: "下野紘", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95356-PFaZRlI9oJ56.png", languages: ["Japanese"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Zenitsu Agatsuma", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 100142, name: "Yui Ishikawa", nativeName: "石川由依", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n100142-k6RP0HzXffUG.png", languages: ["Japanese"],
    roles: [
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Mikasa Ackerman", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95672, name: "Yuuki Kaji", nativeName: "梶裕貴", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95672-RN4nm0OFwCyU.png", languages: ["Japanese"],
    roles: [
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Eren Yeager", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 119617, name: "Yuuma Uchida", nativeName: "内田雄馬", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n119617-icFDk96OdV5k.png", languages: ["Japanese"],
    roles: [
        { animeId: 113415, animeTitle: "JUJUTSU KAISEN", animeImage: "", characterName: "Megumi Fushiguro", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 119319, name: "Junya Enoki", nativeName: "榎木淳弥", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n119319-yIrrUOUaJuSm.png", languages: ["Japanese"],
    roles: [
        { animeId: 113415, animeTitle: "JUJUTSU KAISEN", animeImage: "", characterName: "Yuuji Itadori", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95513, name: "Yuuichi Nakamura", nativeName: "中村悠一", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95513-up9ZDuocHgRs.png", languages: ["Japanese"],
    roles: [
        { animeId: 113415, animeTitle: "JUJUTSU KAISEN", animeImage: "", characterName: "Satoru Gojou", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 106787, name: "Asami Seto", nativeName: "瀬戸麻沙美", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n106787-ojpoY7XEGYgc.jpg", languages: ["Japanese"],
    roles: [
        { animeId: 113415, animeTitle: "JUJUTSU KAISEN", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95270, name: "Nobuhiko Okamoto", nativeName: "岡本信彦", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95270-LqNIF238L59u.png", languages: ["Japanese"],
    roles: [
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "Katsuki Bakugou", characterImage: "", roleType: "main", language: "Japanese" },
    ],
  },
  {
    id: 95253, name: "Christopher Sabat", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95253-Z7Yqog73M7E8.png", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "English" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "supporting", language: "English" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Piccolo", characterImage: "", roleType: "supporting", language: "English" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95225, name: "Yuri Lowenthal", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95225-CbmI6oDkbbkL.jpg", languages: ["English"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "supporting", language: "English" },
        { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Renji Abarai", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95905, name: "Veronica Taylor", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95905-X3mxkcZkmmKN.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "English" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Satoshi", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95722, name: "Eric Stuart", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95722-wMVQYDidBpBb.jpg", languages: ["English"],
    roles: [
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Takeshi", characterImage: "", roleType: "main", language: "English" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Kojirou", characterImage: "", roleType: "supporting", language: "English" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Matadogas", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95609, name: "Maile Flanagan", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95609-pxXj5Wah2x70.jpg", languages: ["English"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95349, name: "Dave Wittenberg", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95349-ZeWKAJFiOL7W.jpg", languages: ["English"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95318, name: "Kate Higgins", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95318-TvQyppjjRIH2.jpg", languages: ["English"],
    roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1735, animeTitle: "Naruto: Shippuden", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 20498, name: "Chuck Powers", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/20498.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Luffy Monkey", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Usopp", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 659, name: "Brina Palencia", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/659.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Chopper Tony Tony", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95189, name: "Luci Christian", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95189-M2IkMNRzHYcF.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Nami", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "Ochako Uraraka", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 360, name: "Sonny Strait", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/360.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Usopp", characterImage: "", roleType: "main", language: "English" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Kuririn", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 104087, name: "Ian Sinclair", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n104087-3g10GTeSoeuW.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Brook", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Whis", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 96000, name: "Sean Schemmel", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n96000-2o6VuDoBKFam.png", languages: ["English"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gokuu Son", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Gokuu Son", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 9843, name: "Stephanie Nadolny", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/9843.jpg", languages: ["English"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gokuu Son", characterImage: "", roleType: "main", language: "English" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 96370, name: "Jillian Michaels", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n96370-COImdRiSWcxu.png", languages: ["English"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gokuu Son", characterImage: "", roleType: "main", language: "English" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95515, name: "Brian Drummond", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95515-jCqOzlX9iNhC.png", languages: ["English"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1535, animeTitle: "Death Note", animeImage: "", characterName: "Ryuk", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95336, name: "Kyle Hebert", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95336-VVMKFINwPYZ8.jpg", languages: ["English"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95370, name: "Brad Swaile", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95370-1Z9Us8CD2IVs.jpg", languages: ["English"],
    roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gohan Son", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1535, animeTitle: "Death Note", animeImage: "", characterName: "Light Yagami", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95036, name: "Wendee Lee", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95036-UkyIYVtEhoPk.png", languages: ["English"],
    roles: [
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Bulma", characterImage: "", roleType: "main", language: "English" },
        { animeId: 1, animeTitle: "Cowboy Bebop", animeImage: "", characterName: "Faye Valentine", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 103491, name: "Kaiji Tang", nativeName: "Kaiji Tang", image: "https://s4.anilist.co/file/anilistcdn/staff/large/n103491-m720HzpwMA2o.jpg", languages: ["English"],
    roles: [
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "English" },
        { animeId: 113415, animeTitle: "JUJUTSU KAISEN", animeImage: "", characterName: "Satoru Gojou", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 129181, name: "Zach Aguilar", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n129181-WaHZNnZqavRo.png", languages: ["English"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Tanjirou Kamado", characterImage: "", roleType: "main", language: "English" },
        { animeId: 21087, animeTitle: "One-Punch Man", animeImage: "", characterName: "Genos", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 732, name: "Bryce Papenbrook", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/732.jpg", languages: ["English"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Inosuke Hashibira", characterImage: "", roleType: "main", language: "English" },
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Eren Yeager", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 147792, name: "Aleks Le", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n147792-KGOUdKPClg7d.png", languages: ["English"],
    roles: [
        { animeId: 101922, animeTitle: "Demon Slayer: Kimetsu no Yaiba", animeImage: "", characterName: "Zenitsu Agatsuma", characterImage: "", roleType: "main", language: "English" },
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Jin-U Seong", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 96503, name: "Rachael Lillis", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n96503-BpnE3dFXJnyF.jpg", languages: ["English"],
    roles: [
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Kasumi", characterImage: "", roleType: "main", language: "English" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Musashi", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 1416, name: "Ted Lewis", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/1416.jpg", languages: ["English"],
    roles: [
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Kojirou", characterImage: "", roleType: "main", language: "English" },
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Kenji", characterImage: "", roleType: "supporting", language: "English" },
    ],
  },
  {
    id: 95472, name: "Colleen Clinkenbeard", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95472-fznpewUW95vm.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Luffy Monkey", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 101906, name: "Erica Schroeder", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n101906-Cul50rrR8cSA.png", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Luffy Monkey", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 95475, name: "Stephanie Young", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95475-QV9KFgsYrsPb.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 101729, name: "Jad Saxton", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n101729-tga5Umgm17Mj.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 107011, name: "Natasha Parker", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n107011-kf5aXlTCoYG9.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Robin Nico", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 851, name: "Cynthia Cranz", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/851.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 96418, name: "Marc Diraison", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n96418-YX8M20y11AMs.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 20510, name: "Brian Zimmerman", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/20510.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 100200, name: "Andrew Rannells", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n100200-QHK44gRDbWfm.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Zoro Roronoa", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 95340, name: "Patrick Seitz", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/n95340-W5PAwurtgtXs.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Franky", characterImage: "", roleType: "main", language: "English" },
    ],
  },
  {
    id: 9078, name: "Terri Doty", nativeName: undefined, image: "https://s4.anilist.co/file/anilistcdn/staff/large/9078.jpg", languages: ["English"],
    roles: [
        { animeId: 21, animeTitle: "ONE PIECE", animeImage: "", characterName: "Franky", characterImage: "", roleType: "main", language: "English" },
    ],
  },
];

export async function getGlobalVoiceActors(): Promise<VoiceActor[]> {
  return GLOBAL_VOICE_ACTORS;
}
