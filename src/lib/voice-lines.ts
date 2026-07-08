export interface VoiceLine {
  id: string;
  character: string;
  characterId?: number;
  animeTitle: string;
  animeId: number;
  line: string;
  lineJapanese?: string;
  lineHindi?: string;
  context?: string;
  episode?: number;
  timestamp?: string;
  language: "english" | "japanese" | "hindi" | "tamil" | "telugu";
  type: "iconic" | "funny" | "inspiring" | "sad" | "badass" | "romantic";
  likes: number;
}

const allVoiceLines: VoiceLine[] = [
  // ==================== NARUTO ====================
  {
    id: "naruto-1",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto",
    animeId: 20,
    line: "I never go back on my word! That's my nindo: my ninja way!",
    lineJapanese: "俺は自分の言葉に決して裏切らない！それが俺の忍道だ！",
    lineHindi: "Maine apni baat kabhi nahi toda. Yeh mera ninja way hai!",
    context: "To Sasuke at the Valley of the End",
    episode: 133,
    language: "english",
    type: "inspiring",
    likes: 8540
  },
  {
    id: "naruto-2",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "I'm not gonna run away. I never go back on my word! That's my nindo!",
    lineJapanese: "逃げない！俺は自分の言葉に裏切らない！それが俺の忍道だ！",
    context: "To Pain after Hinata is struck down",
    episode: 167,
    language: "english",
    type: "badass",
    likes: 12300
  },
  {
    id: "naruto-3",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto",
    animeId: 20,
    line: "Believe it!",
    lineJapanese: "ってばよ！",
    context: "Signature catchphrase",
    language: "english",
    type: "iconic",
    likes: 7600
  },
  {
    id: "naruto-4",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "I will become Hokage someday! Believe it!",
    lineJapanese: "いつか火影になるってばよ！",
    context: "His lifelong dream",
    language: "english",
    type: "inspiring",
    likes: 6200
  },
  {
    id: "sasuke-1",
    character: "Sasuke Uchiha",
    characterId: 18,
    animeTitle: "Naruto",
    animeId: 20,
    line: "I don't care. I'm not interested.",
    lineJapanese: "別に。興味ない。",
    context: "Replying to Naruto's enthusiasm",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 5200
  },
  {
    id: "sasuke-2",
    character: "Sasuke Uchiha",
    characterId: 18,
    animeTitle: "Naruto",
    animeId: 20,
    line: "I will restore my clan. And I will kill a certain man.",
    lineJapanese: "一族を再興する。そして、ある男を殺す。",
    context: "To Naruto at the Academy rooftop",
    episode: 7,
    language: "english",
    type: "badass",
    likes: 6800
  },
  {
    id: "sasuke-3",
    character: "Sasuke Uchiha",
    characterId: 18,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "You're still so annoying, Naruto.",
    lineJapanese: "お前は相変わらずうるさいな、ナルト。",
    context: "Final battle at the Valley of the End",
    episode: 476,
    language: "english",
    type: "sad",
    likes: 4900
  },
  {
    id: "itachi-1",
    character: "Itachi Uchiha",
    characterId: 19,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "Forgive me, Sasuke. This is the last time.",
    lineJapanese: "許せ、サスケ。これで最後だ。",
    context: "Poking Sasuke's forehead one last time",
    episode: 138,
    language: "english",
    type: "sad",
    likes: 15200
  },
  {
    id: "itachi-2",
    character: "Itachi Uchiha",
    characterId: 19,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "Those who aren't capable of acknowledging themselves will eventually fail.",
    lineJapanese: "自分を認められない者は、いずれ失敗する。",
    context: "Advice to Sasuke",
    episode: 85,
    language: "english",
    type: "inspiring",
    likes: 9800
  },
  {
    id: "itachi-3",
    character: "Itachi Uchiha",
    characterId: 19,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "People live their lives bound by what they accept as correct and true. That's how they define reality.",
    lineJapanese: "人は自分の正しいと認めたものに縛られて生きている。それが現実の定義だ。",
    context: "To Sasuke about the Sharingan",
    episode: 85,
    language: "english",
    type: "iconic",
    likes: 8700
  },
  {
    id: "kakashi-1",
    character: "Kakashi Hatake",
    characterId: 20,
    animeTitle: "Naruto",
    animeId: 20,
    line: "Those who break the rules are scum, but those who abandon their friends are worse than scum.",
    lineJapanese: "規則を破る奴はクズだが、仲間を捨てる奴はそれ以下のクズだ。",
    context: "To Team 7 during the Land of Waves arc",
    episode: 6,
    language: "english",
    type: "inspiring",
    likes: 11300
  },
  {
    id: "kakashi-2",
    character: "Kakashi Hatake",
    characterId: 20,
    animeTitle: "Naruto",
    animeId: 20,
    line: "In the ninja world, those who break the rules are scum. But those who abandon their friends are worse.",
    lineJapanese: "忍者世界で規則を破る奴はゴミだ。だが、仲間を捨てる奴はもっとゴミだ。",
    context: "To Team 7",
    episode: 6,
    language: "english",
    type: "inspiring",
    likes: 6100
  },
  {
    id: "kakashi-3",
    character: "Kakashi Hatake",
    characterId: 20,
    animeTitle: "Naruto",
    animeId: 20,
    line: "I'm late... I got lost on the road of life.",
    lineJapanese: "遅れました…人生の道に迷ってしまいました。",
    context: "His classic excuse for being late",
    episode: 3,
    language: "english",
    type: "funny",
    likes: 5900
  },
  {
    id: "madara-1",
    character: "Madara Uchiha",
    characterId: 170,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "Wake up to reality! Nothing ever goes as planned in this world.",
    lineJapanese: "現実に目を覚ませ！この世の中で思い通りにならないことなどない。",
    context: "To the Allied Shinobi Forces",
    episode: 322,
    language: "english",
    type: "badass",
    likes: 14100
  },
  {
    id: "madara-2",
    character: "Madara Uchiha",
    characterId: 170,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "In this world, wherever there is light, there are also shadows.",
    lineJapanese: "この世に光あれば影もある。",
    context: "Philosophy on the ninja world",
    episode: 322,
    language: "english",
    type: "iconic",
    likes: 9300
  },
  {
    id: "gaara-1",
    character: "Gaara",
    characterId: 22,
    animeTitle: "Naruto",
    animeId: 20,
    line: "My existence has no meaning whatsoever... I am nothing but a weapon.",
    lineJapanese: "僕の存在に意味なんてない…僕はただの武器だ。",
    context: "Confessing to Naruto before their fight",
    episode: 76,
    language: "english",
    type: "sad",
    likes: 5600
  },
  {
    id: "gaara-2",
    character: "Gaara",
    characterId: 22,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "I've finally found it... a reason to live. I want to protect those I care about.",
    lineJapanese: "やっと見つけた…生きる意味を。大切な人を守りたい。",
    context: "After becoming Kazekage",
    episode: 1,
    language: "english",
    type: "inspiring",
    likes: 7200
  },
  {
    id: "jiraiya-1",
    character: "Jiraiya",
    characterId: 21,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "A ninja's life is not measured by how they lived, but by what they did before dying.",
    lineJapanese: "忍者の人生はどう生きたかではなく、死ぬ前に何をしたかで測られる。",
    context: "Final thoughts before dying",
    episode: 133,
    language: "english",
    type: "inspiring",
    likes: 8800
  },
  {
    id: "pain-1",
    character: "Pain (Nagato)",
    characterId: 175,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "Peace is the ultimate jutsu. But it can only be achieved through pain.",
    lineJapanese: "平和は究極の術だ。しかし、それは痛みを通してのみ達成できる。",
    context: "To Naruto about his philosophy",
    episode: 175,
    language: "english",
    type: "iconic",
    likes: 6500
  },
  {
    id: "hinata-1",
    character: "Hinata Hyuga",
    characterId: 23,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "I've always been chasing after you. I've always wanted to catch up to you.",
    lineJapanese: "ずっと追いかけてきた。あなたに追いつきたかった。",
    context: "Confessing her love during Pain fight",
    episode: 166,
    language: "english",
    type: "romantic",
    likes: 11200
  },
  {
    id: "naruto-hindi-1",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto",
    animeId: 20,
    line: "Maine apni baat kabhi nahi toda. Yeh mera ninja way hai!",
    context: "Hindi dub - Valley of the End",
    episode: 133,
    language: "hindi",
    type: "inspiring",
    likes: 3400
  },
  {
    id: "naruto-hindi-2",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto",
    animeId: 20,
    line: "Yakeen karo!",
    context: "Hindi dub catchphrase - Believe it!",
    language: "hindi",
    type: "iconic",
    likes: 2800
  },
  // ==================== ONE PIECE ====================
  {
    id: "luffy-1",
    character: "Monkey D. Luffy",
    characterId: 40,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I'm gonna be the King of the Pirates!",
    lineJapanese: "俺は海賊王になる！",
    context: "Luffy's lifelong declaration",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 16500
  },
  {
    id: "luffy-2",
    character: "Monkey D. Luffy",
    characterId: 40,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I don't want to conquer anything. I just want the freedom of the sea.",
    lineJapanese: "何も征服したいわけじゃない。ただ海の自由が欲しい。",
    context: "Explaining his dream",
    episode: 516,
    language: "english",
    type: "inspiring",
    likes: 9800
  },
  {
    id: "luffy-3",
    character: "Monkey D. Luffy",
    characterId: 40,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I can't become Pirate King without you!",
    lineJapanese: "お前なしでは海賊王になれない！",
    context: "To Sanji at Whole Cake Island",
    episode: 797,
    language: "english",
    type: "inspiring",
    likes: 12100
  },
  {
    id: "luffy-4",
    character: "Monkey D. Luffy",
    characterId: 40,
    animeTitle: "One Piece",
    animeId: 21,
    line: "Meat! I want meat!",
    lineJapanese: "肉！肉が食いたい！",
    context: "Classic Luffy hunger",
    episode: 1,
    language: "english",
    type: "funny",
    likes: 5100
  },
  {
    id: "zoro-1",
    character: "Roronoa Zoro",
    characterId: 41,
    animeTitle: "One Piece",
    animeId: 21,
    line: "If I die here, I'm just a man who couldn't fulfill his promise.",
    lineJapanese: "ここで死んだら、約束を果たせなかったただの男だ。",
    context: "To Mihawk at Baratie",
    episode: 24,
    language: "english",
    type: "badass",
    likes: 9500
  },
  {
    id: "zoro-2",
    character: "Roronoa Zoro",
    characterId: 41,
    animeTitle: "One Piece",
    animeId: 21,
    line: "Nothing happened.",
    lineJapanese: "何もなかった。",
    context: "After taking Luffy's pain at Thriller Bark",
    episode: 377,
    language: "english",
    type: "badass",
    likes: 18500
  },
  {
    id: "zoro-3",
    character: "Roronoa Zoro",
    characterId: 41,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I'll become the world's greatest swordsman!",
    lineJapanese: "世界最強の剣豪になる！",
    context: "His vow to Kuina",
    episode: 2,
    language: "english",
    type: "inspiring",
    likes: 7800
  },
  {
    id: "zoro-4",
    character: "Roronoa Zoro",
    characterId: 41,
    animeTitle: "One Piece",
    animeId: 21,
    line: "Scars on the back are a swordsman's shame.",
    lineJapanese: "背中の傷は剣士の恥だ。",
    context: "To his crew about honor",
    episode: 24,
    language: "english",
    type: "badass",
    likes: 6800
  },
  {
    id: "sanji-1",
    character: "Sanji",
    characterId: 42,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I'll never kick a woman, even if it means my death.",
    lineJapanese: "女は絶対に蹴らない。死んでもな。",
    context: "His chivalrous code",
    episode: 39,
    language: "english",
    type: "iconic",
    likes: 8200
  },
  {
    id: "sanji-2",
    character: "Sanji",
    characterId: 42,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I needed a light.",
    lineJapanese: "火が欲しかったんだ。",
    context: "Last words to Luffy before leaving",
    episode: 808,
    language: "english",
    type: "sad",
    likes: 10100
  },
  {
    id: "whitebeard-1",
    character: "Edward Newgate (Whitebeard)",
    characterId: 125,
    animeTitle: "One Piece",
    animeId: 21,
    line: "The One Piece... it exists!",
    lineJapanese: "ワンピース…実在する！",
    context: "Final declaration before dying",
    episode: 485,
    language: "english",
    type: "iconic",
    likes: 13400
  },
  {
    id: "robin-1",
    character: "Nico Robin",
    characterId: 43,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I want to live! Take me out to sea with you!",
    lineJapanese: "生きたい！連れて行ってくれ！",
    context: "To the Straw Hats at Enies Lobby",
    episode: 278,
    language: "english",
    type: "inspiring",
    likes: 14500
  },
  {
    id: "law-1",
    character: "Trafalgar D. Water Law",
    characterId: 499,
    animeTitle: "One Piece",
    animeId: 21,
    line: "The loser is the one who gives up first.",
    lineJapanese: "諦めた方が負けだ。",
    context: "His philosophy on losing",
    episode: 665,
    language: "english",
    type: "inspiring",
    likes: 6300
  },
  {
    id: "nami-1",
    character: "Nami",
    characterId: 44,
    animeTitle: "One Piece",
    animeId: 21,
    line: "Luffy... help me!",
    lineJapanese: "ルフィ…助けて！",
    context: "Begging Luffy for help at Arlong Park",
    episode: 44,
    language: "english",
    type: "sad",
    likes: 7900
  },
  {
    id: "ace-1",
    character: "Portgas D. Ace",
    characterId: 130,
    animeTitle: "One Piece",
    animeId: 21,
    line: "I don't want to die... but I still want to live!",
    lineJapanese: "死にたくない…それでも生きたい！",
    context: "Thanking Luffy at Marineford",
    episode: 483,
    language: "english",
    type: "sad",
    likes: 11100
  },
  {
    id: "shanks-1",
    character: "Shanks",
    characterId: 128,
    animeTitle: "One Piece",
    animeId: 21,
    line: "It's not a crime to exist. No matter who you are.",
    lineJapanese: "存在することは罪じゃない。誰であろうとな。",
    context: "To Whitebeard about Ace",
    episode: 316,
    language: "english",
    type: "inspiring",
    likes: 7000
  },
  // ==================== ATTACK ON TITAN ====================
  {
    id: "eren-1",
    character: "Eren Yeager",
    characterId: 920,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "Tatakae! Fight!",
    lineJapanese: "戦え！戦え！",
    context: "To himself in the mirror",
    episode: 5,
    language: "english",
    type: "badass",
    likes: 11900
  },
  {
    id: "eren-2",
    character: "Eren Yeager",
    characterId: 920,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "I will destroy every last one of them!",
    lineJapanese: "一匹残らず駆逐してやる！",
    context: "Vowing to kill all Titans",
    episode: 5,
    language: "english",
    type: "badass",
    likes: 8700
  },
  {
    id: "eren-3",
    character: "Eren Yeager",
    characterId: 920,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "This world is cruel. It's also very beautiful.",
    lineJapanese: "この世界は残酷だ。そしてとても美しい。",
    context: "To Mikasa after learning the truth",
    episode: 9,
    language: "english",
    type: "iconic",
    likes: 7500
  },
  {
    id: "eren-4",
    character: "Eren Yeager",
    characterId: 920,
    animeTitle: "Attack on Titan Final Season",
    animeId: 110277,
    line: "I'll keep moving forward until all my enemies are destroyed.",
    lineJapanese: "前に進み続ける。全ての敵を駆逐するまで。",
    context: "Declaration in Marley",
    episode: 80,
    language: "english",
    type: "badass",
    likes: 13500
  },
  {
    id: "levi-1",
    character: "Levi Ackerman",
    characterId: 1800,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "Give up on your dreams and die.",
    lineJapanese: "夢を諦めて死ね。",
    context: "To a recruit who hesitated",
    episode: 23,
    language: "english",
    type: "badass",
    likes: 10500
  },
  {
    id: "levi-2",
    character: "Levi Ackerman",
    characterId: 1800,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "No matter what happens, you have to keep moving forward.",
    lineJapanese: "何が起ころうとも、前に進み続けなければならない。",
    context: "Advice to his squad",
    episode: 25,
    language: "english",
    type: "inspiring",
    likes: 6900
  },
  {
    id: "erwin-1",
    character: "Erwin Smith",
    characterId: 1801,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "My soldiers, rage! My soldiers, scream! My soldiers, fight!",
    lineJapanese: "兵士たちよ、怒れ！兵士たちよ、叫べ！兵士たちよ、戦え！",
    context: "Final charge against the Beast Titan",
    episode: 54,
    language: "english",
    type: "badass",
    likes: 15800
  },
  {
    id: "erwin-2",
    character: "Erwin Smith",
    characterId: 1801,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "I have no regrets. I gave my heart for humanity.",
    lineJapanese: "後悔はない。人類に心臓を捧げた。",
    context: "Last words before the charge",
    episode: 54,
    language: "english",
    type: "inspiring",
    likes: 9200
  },
  {
    id: "armin-1",
    character: "Armin Arlert",
    characterId: 1802,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "Nobody can control anything. That's what makes it all so terrifying.",
    lineJapanese: "誰も何もコントロールできない。それが全てを恐ろしくしている。",
    context: "Philosophizing about life",
    episode: 10,
    language: "english",
    type: "iconic",
    likes: 5600
  },
  {
    id: "armin-2",
    character: "Armin Arlert",
    characterId: 1802,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "Someone who can't give up anything can't change anything.",
    lineJapanese: "何も捨てられない者は、何も変えられない。",
    context: "To Eren about making sacrifices",
    episode: 16,
    language: "english",
    type: "inspiring",
    likes: 8000
  },
  {
    id: "mikasa-1",
    character: "Mikasa Ackerman",
    characterId: 1803,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "This world is cruel. And it's also very beautiful.",
    lineJapanese: "この世界は残酷だ。そしてとても美しい。",
    context: "Echoing Eren's words",
    episode: 12,
    language: "english",
    type: "sad",
    likes: 6400
  },
  {
    id: "mikasa-2",
    character: "Mikasa Ackerman",
    characterId: 1803,
    animeTitle: "Attack on Titan",
    animeId: 16498,
    line: "I have to protect him. That's what I live for.",
    lineJapanese: "彼を守らなければ。それが私の生きる意味だ。",
    context: "About Eren",
    episode: 7,
    language: "english",
    type: "romantic",
    likes: 5100
  },
  // ==================== DEATH NOTE ====================
  {
    id: "light-1",
    character: "Light Yagami",
    characterId: 140,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "I'll become the god of a new world.",
    lineJapanese: "新世界の神になる。",
    context: "Declaring his ultimate goal",
    episode: 2,
    language: "english",
    type: "badass",
    likes: 10200
  },
  {
    id: "light-2",
    character: "Light Yagami",
    characterId: 140,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "I am justice! I am the one who will pass judgment on you!",
    lineJapanese: "俺が正義だ！俺がお前を裁く！",
    context: "Confronting L",
    episode: 25,
    language: "english",
    type: "badass",
    likes: 7800
  },
  {
    id: "light-3",
    character: "Light Yagami",
    characterId: 140,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "Just as planned.",
    lineJapanese: "計画通り。",
    context: "His signature phrase",
    episode: 7,
    language: "english",
    type: "iconic",
    likes: 8800
  },
  {
    id: "l-1",
    character: "L",
    characterId: 141,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "I am L. I'll catch you, Kira. I swear it.",
    lineJapanese: "俺はLだ。必ずお前を捕まえる、キラ。",
    context: "First contact with Light",
    episode: 2,
    language: "english",
    type: "iconic",
    likes: 9100
  },
  {
    id: "l-2",
    character: "L",
    characterId: 141,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "Light-kun... you're so interesting.",
    lineJapanese: "ライト君…君はとても面白い。",
    context: "To Light during their first meeting",
    episode: 2,
    language: "english",
    type: "funny",
    likes: 4500
  },
  {
    id: "ryuk-1",
    character: "Ryuk",
    characterId: 142,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "Humans are so interesting.",
    lineJapanese: "人間は本当に面白い。",
    context: "Observing human behavior",
    episode: 1,
    language: "english",
    type: "funny",
    likes: 7200
  },
  {
    id: "ryuk-2",
    character: "Ryuk",
    characterId: 142,
    animeTitle: "Death Note",
    animeId: 1535,
    line: "I'll write your name in my notebook if you bore me.",
    lineJapanese: "退屈させたら名前を書くぞ。",
    context: "Threatening Light",
    episode: 1,
    language: "english",
    type: "funny",
    likes: 5300
  },
  // ==================== DEMON SLAYER ====================
  {
    id: "tanjiro-1",
    character: "Tanjiro Kamado",
    characterId: 113275,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "Get up. You have to live. Don't give up.",
    lineJapanese: "立て。生きろ。諦めるな。",
    context: "Encouraging himself and others",
    episode: 1,
    language: "english",
    type: "inspiring",
    likes: 7800
  },
  {
    id: "tanjiro-2",
    character: "Tanjiro Kamado",
    characterId: 113275,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "Never give up! Keep your heart burning!",
    lineJapanese: "決して諦めるな！心を燃やせ！",
    context: "During battle with Rui",
    episode: 19,
    language: "english",
    type: "inspiring",
    likes: 6300
  },
  {
    id: "rengoku-1",
    character: "Kyojuro Rengoku",
    characterId: 119498,
    animeTitle: "Demon Slayer: Mugen Train",
    animeId: 110277,
    line: "Set your heart ablaze!",
    lineJapanese: "心を燃やせ！",
    context: "His motto to Tanjiro",
    episode: 1,
    language: "english",
    type: "inspiring",
    likes: 14200
  },
  {
    id: "rengoku-2",
    character: "Kyojuro Rengoku",
    characterId: 119498,
    animeTitle: "Demon Slayer: Mugen Train",
    animeId: 110277,
    line: "My mother told me that one born fortunate should help others with that fortune.",
    lineJapanese: "母が言っていた。生まれつき恵まれた者は、その恵みを人のために使うべきだと。",
    context: "Final moments with Tanjiro",
    episode: 1,
    language: "english",
    type: "inspiring",
    likes: 10100
  },
  {
    id: "zenitsu-1",
    character: "Zenitsu Agatsuma",
    characterId: 114594,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "I'm gonna die!! I'm definitely gonna die!!",
    lineJapanese: "死ぬ！絶対死ぬ！",
    context: "Classic cowardly behavior",
    episode: 4,
    language: "english",
    type: "funny",
    likes: 4200
  },
  {
    id: "zenitsu-2",
    character: "Zenitsu Agatsuma",
    characterId: 114594,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "Nezuko-chan! You're so beautiful!",
    lineJapanese: "禰豆子ちゃん！可愛い！",
    context: "Fawning over Nezuko",
    episode: 5,
    language: "english",
    type: "funny",
    likes: 3600
  },
  {
    id: "inosuke-1",
    character: "Inosuke Hashibira",
    characterId: 115467,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "I'm the boss! I'll take down the demon!",
    lineJapanese: "俺がボスだ！俺が鬼を倒す！",
    context: "Charging into battle",
    episode: 11,
    language: "english",
    type: "funny",
    likes: 4100
  },
  {
    id: "muzan-1",
    character: "Muzan Kibutsuji",
    characterId: 113277,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "I will conquer the sun. I will become the perfect being.",
    lineJapanese: "俺は太陽を征服する。完全なる存在になる。",
    context: "His ultimate goal",
    episode: 7,
    language: "english",
    type: "badass",
    likes: 5500
  },
  {
    id: "nezuko-1",
    character: "Nezuko Kamado",
    characterId: 113276,
    animeTitle: "Demon Slayer",
    animeId: 101922,
    line: "Ummu! (Fierce determined growls)",
    lineJapanese: "うんう！",
    context: "Her expressive sounds",
    episode: 2,
    language: "japanese",
    type: "funny",
    likes: 6200
  },
  // ==================== FULLMETAL ALCHEMIST ====================
  {
    id: "edward-1",
    character: "Edward Elric",
    characterId: 764,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    animeId: 5114,
    line: "Equivalent exchange! That's the law of alchemy.",
    lineJapanese: "等価交換！それが錬金術の法則だ。",
    context: "Explaining alchemy's core principle",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 6800
  },
  {
    id: "edward-2",
    character: "Edward Elric",
    characterId: 764,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    animeId: 5114,
    line: "I'll get Al's body back! I swear it!",
    lineJapanese: "アルの体を取り戻す！誓って！",
    context: "Vowing to restore his brother",
    episode: 1,
    language: "english",
    type: "inspiring",
    likes: 6200
  },
  {
    id: "roy-1",
    character: "Roy Mustang",
    characterId: 766,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    animeId: 5114,
    line: "It's a terrible day for rain.",
    lineJapanese: "雨の日は嫌いだ。",
    context: "Faking tears while actually crying",
    episode: 19,
    language: "english",
    type: "sad",
    likes: 13500
  },
  {
    id: "alphonse-1",
    character: "Alphonse Elric",
    characterId: 765,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    animeId: 5114,
    line: "Humans are so weak... that's why they struggle. That's what makes them strong.",
    lineJapanese: "人間は弱い…だからこそ、もがく。それが強さになる。",
    context: "Philosophizing about human nature",
    episode: 54,
    language: "english",
    type: "inspiring",
    likes: 4900
  },
  // ==================== JUJUTSU KAISEN ====================
  {
    id: "gojo-1",
    character: "Satoru Gojo",
    characterId: 113814,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "Throughout Heaven and Earth, I alone am the honored one.",
    lineJapanese: "天上天下、唯我独尊。",
    context: "After awakening to his full power",
    episode: 20,
    language: "english",
    type: "badass",
    likes: 17600
  },
  {
    id: "gojo-2",
    character: "Satoru Gojo",
    characterId: 113814,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "I'm the strongest.",
    lineJapanese: "俺が最強だ。",
    context: "His simple declaration of power",
    episode: 7,
    language: "english",
    type: "badass",
    likes: 12100
  },
  {
    id: "gojo-3",
    character: "Satoru Gojo",
    characterId: 113814,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "Nah, I'd win.",
    lineJapanese: "いや、勝つわ。",
    context: "To Yuuji about fighting Sukuna",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 15300
  },
  {
    id: "yuji-1",
    character: "Yuji Itadori",
    characterId: 113812,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "I don't need a reason. I'll save people when they're crying.",
    lineJapanese: "理由なんていらない。泣いてる人を救う。",
    context: "Explaining his philosophy to Junpei",
    episode: 12,
    language: "english",
    type: "inspiring",
    likes: 8900
  },
  {
    id: "yuji-2",
    character: "Yuji Itadori",
    characterId: 113812,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "I'm cursed... I'll die surrounded by curses.",
    lineJapanese: "呪われてる…呪いに囲まれて死ぬ。",
    context: "Reflecting on his fate",
    episode: 5,
    language: "english",
    type: "sad",
    likes: 4400
  },
  {
    id: "sukuna-1",
    character: "Ryomen Sukuna",
    characterId: 113815,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "You're boring me.",
    lineJapanese: "退屈だ。",
    context: "Dismissing weak opponents",
    episode: 2,
    language: "english",
    type: "badass",
    likes: 8100
  },
  {
    id: "sukuna-2",
    character: "Ryomen Sukuna",
    characterId: 113815,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "I'll show you what true jujutsu looks like.",
    lineJapanese: "教えてやろう、真の呪術ってやつを。",
    context: "Taking over Yuji's body",
    episode: 2,
    language: "english",
    type: "badass",
    likes: 6500
  },
  {
    id: "geto-1",
    character: "Suguru Geto",
    characterId: 113817,
    animeTitle: "Jujutsu Kaisen",
    animeId: 113415,
    line: "Are you the strongest because you're Gojo Satoru, or are you Gojo Satoru because you're the strongest?",
    lineJapanese: "最強だから五条悟なのか、五条悟だから最強なのか？",
    context: "To Gojo about their friendship",
    episode: 29,
    language: "english",
    type: "iconic",
    likes: 9200
  },
  // ==================== DRAGON BALL ====================
  {
    id: "goku-1",
    character: "Goku",
    characterId: 73,
    animeTitle: "Dragon Ball Z",
    animeId: 813,
    line: "I am the hope of the universe!",
    lineJapanese: "俺は宇宙の希望だ！",
    context: "To Frieza on Namek",
    episode: 95,
    language: "english",
    type: "inspiring",
    likes: 8700
  },
  {
    id: "goku-2",
    character: "Goku",
    characterId: 73,
    animeTitle: "Dragon Ball Z",
    animeId: 813,
    line: "It's over 9000!",
    lineJapanese: "9000を超えている！",
    context: "Sensing Vegeta's power level",
    episode: 28,
    language: "english",
    type: "iconic",
    likes: 11500
  },
  {
    id: "vegeta-1",
    character: "Vegeta",
    characterId: 74,
    animeTitle: "Dragon Ball Z",
    animeId: 813,
    line: "I am the prince of all Saiyans!",
    lineJapanese: "俺はサイヤ人の王子だ！",
    context: "His iconic declaration",
    episode: 24,
    language: "english",
    type: "badass",
    likes: 9200
  },
  {
    id: "vegeta-2",
    character: "Vegeta",
    characterId: 74,
    animeTitle: "Dragon Ball Z",
    animeId: 813,
    line: "My pride is more important than my life!",
    lineJapanese: "誇りは命より大事だ！",
    context: "About Saiyan pride",
    episode: 55,
    language: "english",
    type: "badass",
    likes: 6100
  },
  {
    id: "frieza-1",
    character: "Frieza",
    characterId: 75,
    animeTitle: "Dragon Ball Z",
    animeId: 813,
    line: "This planet has 5 minutes left!",
    lineJapanese: "この星の寿命はあと5分だ！",
    context: "Announcing Namek's destruction",
    episode: 100,
    language: "english",
    type: "iconic",
    likes: 9700
  },
  {
    id: "piccolo-1",
    character: "Piccolo",
    characterId: 76,
    animeTitle: "Dragon Ball Z",
    animeId: 813,
    line: "DODGE!",
    lineJapanese: "避けろ！",
    context: "To Gohan during training",
    episode: 9,
    language: "english",
    type: "funny",
    likes: 5600
  },
  // ==================== COWBOY BEBOP ====================
  {
    id: "spike-1",
    character: "Spike Spiegel",
    characterId: 10,
    animeTitle: "Cowboy Bebop",
    animeId: 1,
    line: "Whatever happens, happens.",
    lineJapanese: "なるようになるさ。",
    context: "His life philosophy",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 8600
  },
  {
    id: "spike-2",
    character: "Spike Spiegel",
    characterId: 10,
    animeTitle: "Cowboy Bebop",
    animeId: 1,
    line: "Bang.",
    context: "Last word before collapsing",
    episode: 26,
    language: "english",
    type: "sad",
    likes: 14700
  },
  {
    id: "spike-3",
    character: "Spike Spiegel",
    characterId: 10,
    animeTitle: "Cowboy Bebop",
    animeId: 1,
    line: "I'm not going there to die. I'm going to find out if I'm really alive.",
    lineJapanese: "死にに行くんじゃない。本当に生きているのか確かめに行くんだ。",
    context: "To Jet before the final battle",
    episode: 26,
    language: "english",
    type: "sad",
    likes: 8100
  },
  // ==================== BLEACH ====================
  {
    id: "ichigo-1",
    character: "Ichigo Kurosaki",
    characterId: 95,
    animeTitle: "Bleach",
    animeId: 269,
    line: "I can't see or hear you anymore, but I know you're still there.",
    lineJapanese: "もう見えないし聞こえないけど、君がまだそこにいるってわかってる。",
    context: "To Rukia after losing his powers",
    episode: 63,
    language: "english",
    type: "sad",
    likes: 6200
  },
  {
    id: "ichigo-2",
    character: "Ichigo Kurosaki",
    characterId: 95,
    animeTitle: "Bleach",
    animeId: 269,
    line: "Getsuga Tenshou!",
    lineJapanese: "月牙天衝！",
    context: "His signature attack",
    episode: 57,
    language: "japanese",
    type: "iconic",
    likes: 9100
  },
  {
    id: "aizen-1",
    character: "Sosuke Aizen",
    characterId: 96,
    animeTitle: "Bleach",
    animeId: 269,
    line: "Admiration is the furthest thing from understanding.",
    lineJapanese: "崇拝は理解から最も遠いものだ。",
    context: "To Hinamori before betraying her",
    episode: 55,
    language: "english",
    type: "iconic",
    likes: 10200
  },
  {
    id: "aizen-2",
    character: "Sosuke Aizen",
    characterId: 96,
    animeTitle: "Bleach",
    animeId: 269,
    line: "Since when did you think I wasn't using Kyoka Suigetsu?",
    lineJapanese: "いつから俺が鏡花水月を使わないと思うようになった？",
    context: "Revealing his ultimate illusion",
    episode: 55,
    language: "english",
    type: "badass",
    likes: 7800
  },
  // ==================== EVANGELION ====================
  {
    id: "shinji-1",
    character: "Shinji Ikari",
    characterId: 280,
    animeTitle: "Neon Genesis Evangelion",
    animeId: 30,
    line: "I mustn't run away. I mustn't run away.",
    lineJapanese: "逃げちゃだめだ。逃げちゃだめだ。",
    context: "Convincing himself to pilot the Eva",
    episode: 1,
    language: "english",
    type: "inspiring",
    likes: 7600
  },
  {
    id: "rei-1",
    character: "Rei Ayanami",
    characterId: 281,
    animeTitle: "Neon Genesis Evangelion",
    animeId: 30,
    line: "I am only myself.",
    lineJapanese: "私は私だけ。",
    context: "Defining her identity",
    episode: 14,
    language: "english",
    type: "iconic",
    likes: 5400
  },
  {
    id: "misato-1",
    character: "Misato Katsuragi",
    characterId: 282,
    animeTitle: "Neon Genesis Evangelion",
    animeId: 30,
    line: "Shinji, get in the robot!",
    lineJapanese: "シンジ、エヴァに乗れ！",
    context: "Ordering Shinji to pilot Eva",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 8200
  },
  // ==================== HUNTER X HUNTER ====================
  {
    id: "gon-1",
    character: "Gon Freecss",
    characterId: 30,
    animeTitle: "Hunter x Hunter (2011)",
    animeId: 11061,
    line: "I don't care if it's a monster. I'll destroy it.",
    lineJapanese: "化け物でも構わない。ぶっ壊す。",
    context: "To Killua about Neferpitou",
    episode: 126,
    language: "english",
    type: "badass",
    likes: 9400
  },
  {
    id: "killua-1",
    character: "Killua Zoldyck",
    characterId: 31,
    animeTitle: "Hunter x Hunter (2011)",
    animeId: 11061,
    line: "I don't want to be friends with you anymore. I want to be your partner.",
    lineJapanese: "もう友達じゃない。相棒だ。",
    context: "To Gon about their relationship",
    episode: 34,
    language: "english",
    type: "iconic",
    likes: 7300
  },
  {
    id: "hisoka-1",
    character: "Hisoka Morrow",
    characterId: 32,
    animeTitle: "Hunter x Hunter (2011)",
    animeId: 11061,
    line: "The game has just begun.",
    lineJapanese: "ゲームは始まったばかりだ。",
    context: "His favorite phrase",
    episode: 40,
    language: "english",
    type: "badass",
    likes: 6800
  },
  {
    id: "hisoka-2",
    character: "Hisoka Morrow",
    characterId: 32,
    animeTitle: "Hunter x Hunter (2011)",
    animeId: 11061,
    line: "Bungee Gum possesses the properties of both rubber and gum.",
    lineJapanese: "バンジーガムはゴムとガムの性質を持つ。",
    context: "Explaining his ability",
    episode: 44,
    language: "english",
    type: "funny",
    likes: 7200
  },
  {
    id: "kurapika-1",
    character: "Kurapika",
    characterId: 33,
    animeTitle: "Hunter x Hunter (2011)",
    animeId: 11061,
    line: "I will avenge my clan. I will reclaim their scarlet eyes.",
    lineJapanese: "一族の復讐を果たす。彼らの緋色の眼を取り戻す。",
    context: "His life mission",
    episode: 1,
    language: "english",
    type: "badass",
    likes: 4600
  },
  // ==================== OTHER POPULAR ANIME ====================
  {
    id: "lelouch-1",
    character: "Lelouch vi Britannia",
    characterId: 103,
    animeTitle: "Code Geass",
    animeId: 1575,
    line: "I, Lelouch vi Britannia, command you! Obey me!",
    lineJapanese: "我はルルーシュ・ヴィ・ブリタニアが命じる！我に従え！",
    context: "Activating his Geass",
    episode: 1,
    language: "english",
    type: "badass",
    likes: 8800
  },
  {
    id: "thorfinn-1",
    character: "Thorfinn",
    characterId: 31448,
    animeTitle: "Vinland Saga",
    animeId: 101348,
    line: "A true warrior needs no sword.",
    lineJapanese: "真の戦士は剣を必要としない。",
    context: "His ideal in the slave arc",
    episode: 24,
    language: "english",
    type: "inspiring",
    likes: 8600
  },
  {
    id: "saitama-1",
    character: "Saitama",
    characterId: 73977,
    animeTitle: "One Punch Man",
    animeId: 30276,
    line: "OK.",
    lineJapanese: "はい。",
    context: "Signature understated response",
    episode: 1,
    language: "english",
    type: "funny",
    likes: 6300
  },
  {
    id: "saitama-2",
    character: "Saitama",
    characterId: 73977,
    animeTitle: "One Punch Man",
    animeId: 30276,
    line: "I'm not a hero for recognition. I do it because I want to.",
    lineJapanese: "認められたいからじゃない。やりたいからやってる。",
    context: "Explaining his motivation",
    episode: 9,
    language: "english",
    type: "inspiring",
    likes: 5800
  },
  {
    id: "kaneki-1",
    character: "Ken Kaneki",
    characterId: 207,
    animeTitle: "Tokyo Ghoul",
    animeId: 20605,
    line: "This world is wrong.",
    lineJapanese: "この世界は間違っている。",
    context: "Realizing the harsh truth",
    episode: 12,
    language: "english",
    type: "sad",
    likes: 7800
  },
  {
    id: "allmight-1",
    character: "All Might",
    characterId: 76793,
    animeTitle: "My Hero Academia",
    animeId: 102526,
    line: "I am here!",
    lineJapanese: "来たぞ！",
    context: "His iconic arrival",
    episode: 1,
    language: "english",
    type: "iconic",
    likes: 10500
  },
  {
    id: "deku-1",
    character: "Izuku Midoriya",
    characterId: 76795,
    animeTitle: "My Hero Academia",
    animeId: 102526,
    line: "Go beyond! Plus Ultra!",
    lineJapanese: "行くぞ！Plus Ultra!",
    context: "Pushing past his limits",
    episode: 10,
    language: "english",
    type: "inspiring",
    likes: 7300
  },
  {
    id: "simon-1",
    character: "Simon",
    animeTitle: "Gurren Lagann",
    animeId: 2001,
    line: "Believe in the me that believes in you!",
    lineJapanese: "お前を信じる俺を信じろ！",
    context: "To Kamina",
    episode: 8,
    language: "english",
    type: "inspiring",
    likes: 9700
  },
  {
    id: "kamina-1",
    character: "Kamina",
    animeTitle: "Gurren Lagann",
    animeId: 2001,
    line: "Who the hell do you think I am!?",
    lineJapanese: "俺様を誰だと思ってやがる！",
    context: "Signature battle cry",
    episode: 1,
    language: "english",
    type: "badass",
    likes: 8400
  },
  {
    id: "denji-1",
    character: "Denji",
    characterId: 188760,
    animeTitle: "Chainsaw Man",
    animeId: 127230,
    line: "I want to touch boobs! That's my dream!",
    lineJapanese: "おっぱい揉みたい！それが俺の夢だ！",
    context: "Proclaiming his simple dream",
    episode: 1,
    language: "english",
    type: "funny",
    likes: 8200
  },
  {
    id: "dio-1",
    character: "Dio Brando",
    animeTitle: "JoJo's Bizarre Adventure",
    animeId: 14719,
    line: "You thought it was your girlfriend, but it was me, Dio!",
    lineJapanese: "お前の彼女だと思ったか？だが、DIOだ！",
    context: "The most meme'd Dio moment",
    episode: 22,
    language: "english",
    type: "funny",
    likes: 10100
  },
  {
    id: "dio-2",
    character: "Dio Brando",
    animeTitle: "JoJo's Bizarre Adventure",
    animeId: 14719,
    line: "Za Warudo! Time has stopped!",
    lineJapanese: "ザ・ワールド！時よ止まれ！",
    context: "Activating The World's time stop",
    episode: 22,
    language: "japanese",
    type: "iconic",
    likes: 13000
  },
  {
    id: "jotaro-1",
    character: "Jotaro Kujo",
    animeTitle: "JoJo's Bizarre Adventure",
    animeId: 14719,
    line: "Yare yare daze...",
    lineJapanese: "やれやれだぜ…",
    context: "His signature catchphrase",
    episode: 1,
    language: "japanese",
    type: "iconic",
    likes: 7800
  },
  {
    id: "makima-1",
    character: "Makima",
    animeTitle: "Chainsaw Man",
    animeId: 127230,
    line: "I want a dog. You'll be my dog, Denji.",
    lineJapanese: "犬が欲しい。お前が犬になれ、デンジ。",
    context: "Manipulating Denji",
    episode: 4,
    language: "english",
    type: "badass",
    likes: 6100
  },
  // ==================== INDIAN / HINDI DUB SPECIALS ====================
  {
    id: "shinchan-hindi-1",
    character: "Shinchan Nohara",
    animeTitle: "Shinchan",
    animeId: 243,
    line: "Mera naam hai Shinchan Nohara!",
    context: "Hindi dub - Self-introduction",
    language: "hindi",
    type: "funny",
    likes: 4200
  },
  {
    id: "doraemon-hindi-1",
    character: "Nobita Nobi",
    animeTitle: "Doraemon",
    animeId: 247,
    line: "Doraemon! Kuch toh karo!",
    context: "Hindi dub - Nobita's classic cry for help",
    language: "hindi",
    type: "funny",
    likes: 3600
  },
  {
    id: "doraemon-hindi-2",
    character: "Doraemon",
    animeTitle: "Doraemon",
    animeId: 247,
    line: "Nobita, tumse na hoga!",
    context: "Hindi dub - Doraemon's frustration",
    language: "hindi",
    type: "funny",
    likes: 3100
  },
  {
    id: "naruto-hindi-3",
    character: "Naruto Uzumaki",
    characterId: 17,
    animeTitle: "Naruto Shippuden",
    animeId: 4565,
    line: "Main Hokage banunga! Yakeen karo!",
    context: "Hindi dub - His lifelong goal",
    language: "hindi",
    type: "inspiring",
    likes: 2900
  },
  {
    id: "luffy-hindi-1",
    character: "Monkey D. Luffy",
    characterId: 40,
    animeTitle: "One Piece",
    animeId: 21,
    line: "Main Pirate King banunga!",
    context: "Hindi dub - His iconic declaration",
    episode: 1,
    language: "hindi",
    type: "inspiring",
    likes: 2700
  },
  {
    id: "pokemon-hindi-1",
    character: "Ash Ketchum",
    animeTitle: "Pokemon",
    animeId: 527,
    line: "Main pakdaunga! Pokemon!",
    context: "Hindi dub - Gotta catch 'em all!",
    language: "hindi",
    type: "iconic",
    likes: 2200
  },
  {
    id: "meta-1",
    character: "ZyniVerse",
    animeTitle: "ZyniVerse",
    animeId: 0,
    line: "ZyniVerse pe filler guide dekho! Skip filler, watch only canon!",
    context: "Meta-humor promotional",
    language: "hindi",
    type: "funny",
    likes: 1500
  },
  {
    id: "meta-2",
    character: "ZyniVerse",
    animeTitle: "ZyniVerse",
    animeId: 0,
    line: "Check out the filler guide on ZyniVerse! Skip filler, watch only canon!",
    context: "Meta-humor promotional",
    language: "english",
    type: "funny",
    likes: 1200
  },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const KNOWN_ANIME_MAP: Record<string, number> = {
  naruto: 20,
  "naruto shippuden": 4565,
  "one piece": 21,
  "attack on titan": 16498,
  "shingeki no kyojin": 16498,
  bleach: 269,
  "death note": 1535,
  "fullmetal alchemist": 5114,
  "full metal alchemist": 5114,
  "dragon ball z": 813,
  "dragon ball": 813,
  "dragon ball super": 22319,
  "demon slayer": 101922,
  "kimetsu no yaiba": 101922,
  "jujutsu kaisen": 113415,
  "hunter x hunter": 11061,
  "cowboy bebop": 1,
  evangelion: 30,
  "neon genesis evangelion": 30,
  "one punch man": 30276,
  "tokyo ghoul": 20605,
  "my hero academia": 102526,
  "code geass": 1575,
  steins: 9253,
  "chainsaw man": 127230,
  "spirited away": 129,
  "princess mononoke": 164,
  "your name": 16664,
};

let animechanCache: { data: VoiceLine[]; timestamp: number }[] = [];
const ANIMECHAN_CACHE_TTL = 60 * 60 * 1000;

const ANIMECHAN_BASE = "https://animechan.xyz/api";

function classifyQuote(quote: string): "iconic" | "funny" | "inspiring" | "sad" | "badass" | "romantic" {
  const q = quote.toLowerCase();
  if (q.includes("!") && (q.includes("never") || q.includes("fight") || q.includes("destroy") || q.includes("kill"))) return "badass";
  if (q.includes("love") || q.includes("heart") || q.includes("protect")) return "romantic";
  if (q.includes("!")) return "inspiring";
  if (q.includes("die") || q.includes("death") || q.includes("cry") || q.includes("sad")) return "sad";
  if (q.includes("haha") || q.includes("funny") || q.length < 30) return "funny";
  return "iconic";
}

async function fetchFromAnimechanRandom(): Promise<VoiceLine[]> {
  try {
    const res = await fetch(`${ANIMECHAN_BASE}/random`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (!data || !data.quote) return [];
    const animeKey = data.anime?.toLowerCase() || "";
    const animeId = Object.entries(KNOWN_ANIME_MAP).find(([k]) => animeKey.includes(k))?.[1] || 0;
    return [{
      id: `animechan-${Date.now()}`,
      character: data.character || "Unknown",
      animeTitle: data.anime || "Unknown",
      animeId,
      line: data.quote,
      language: "english",
      type: classifyQuote(data.quote),
      likes: Math.floor(Math.random() * 5000) + 1000,
    }];
  } catch { return []; }
}

async function fetchFromAnimechanSearch(query: string): Promise<VoiceLine[]> {
  try {
    const res = await fetch(`${ANIMECHAN_BASE}/quotes/anime?title=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    const animeKey = data[0]?.anime?.toLowerCase() || query.toLowerCase();
    const animeId = Object.entries(KNOWN_ANIME_MAP).find(([k]) => animeKey.includes(k))?.[1] || 0;
    return data.map((q: any, i: number) => ({
      id: `animechan-s-${query.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      character: q.character || "Unknown",
      animeTitle: q.anime || query,
      animeId,
      line: q.quote || "",
      language: "english",
      type: classifyQuote(q.quote || ""),
      likes: Math.floor(Math.random() * 3000) + 500,
    })).filter((v) => v.line) as VoiceLine[];
  } catch { return []; }
}

export async function getDynamicRandomVoiceLine(): Promise<VoiceLine> {
  const apiQuotes = await fetchFromAnimechanRandom();
  if (apiQuotes.length > 0) return apiQuotes[0];
  return allVoiceLines[Math.floor(Math.random() * allVoiceLines.length)];
}

export async function getDynamicVoiceLines(
  search?: string,
  animeId?: number,
  character?: string,
  language?: string,
  type?: string
): Promise<VoiceLine[]> {
  let results = [...allVoiceLines];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (v) =>
        v.line.toLowerCase().includes(q) ||
        v.character.toLowerCase().includes(q) ||
        v.animeTitle.toLowerCase().includes(q) ||
        (v.context && v.context.toLowerCase().includes(q))
    );

    try {
      const apiResults = await fetchFromAnimechanSearch(search);
      const seen = new Set(results.map((r) => r.line.toLowerCase()));
      for (const api of apiResults) {
        if (!seen.has(api.line.toLowerCase())) {
          results.push(api);
          seen.add(api.line.toLowerCase());
        }
      }
    } catch {}
  }

  if (animeId) {
    results = results.filter((v) => v.animeId === animeId);
  }

  if (character) {
    results = results.filter((v) =>
      v.character.toLowerCase().includes(character.toLowerCase())
    );
  }

  if (language && language !== "all") {
    results = results.filter((v) => v.language === language);
  }

  if (type && type !== "all") {
    results = results.filter((v) => v.type === type);
  }

  return results;
}

export function getVoiceLine(id: string): VoiceLine | undefined {
  return allVoiceLines.find((v) => v.id === id);
}

export function getCharacters(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const v of allVoiceLines) {
    map.set(v.character, (map.get(v.character) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRandomVoiceLine(): VoiceLine {
  return allVoiceLines[Math.floor(Math.random() * allVoiceLines.length)];
}

export async function getDynamicQuoteOfTheDay(): Promise<VoiceLine> {
  const now = new Date();
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const rng = seededRandom(dateSeed);

  try {
    const apiQuotes = await fetchFromAnimechanRandom();
    if (apiQuotes.length > 0) {
      const idx = Math.floor(rng() * Math.min(apiQuotes.length, 3));
      return apiQuotes[idx];
    }
  } catch {}

  const index = Math.floor(rng() * allVoiceLines.length);
  return allVoiceLines[index];
}

export function getQuoteOfTheDay(): VoiceLine {
  const now = new Date();
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const rng = seededRandom(dateSeed);
  const index = Math.floor(rng() * allVoiceLines.length);
  return allVoiceLines[index];
}


