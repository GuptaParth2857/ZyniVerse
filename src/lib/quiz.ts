export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  animeTitle?: string;
  animeImage?: string;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: { questionId: string; answer: string; correct: boolean }[];
  startedAt: Date;
  completedAt?: Date;
}

const QUESTIONS: QuizQuestion[] = [
  { id: "q1", question: "Which studio animated 'Demon Slayer: Mugen Train'?", options: ["Ufotable", "MAPPA", "Kyoto Animation", "Toei Animation"], correctAnswer: "Ufotable", category: "Studio", difficulty: "easy", animeTitle: "Demon Slayer" },
  { id: "q2", question: "In 'Death Note', what is L's real name?", options: ["L Lawliet", "Light Turner", "Near River", "Mello"], correctAnswer: "L Lawliet", category: "Characters", difficulty: "medium", animeTitle: "Death Note" },
  { id: "q3", question: "Which anime holds the record for most episodes (excluding 'Sazae-san')?", options: ["One Piece", "Dragon Ball", "Detective Conan", "Naruto"], correctAnswer: "One Piece", category: "General", difficulty: "hard" },
  { id: "q4", question: "What is the name of Naruto's signature technique?", options: ["Shadow Clone Jutsu", "Rasengan", "Chidori", "Talk no Jutsu"], correctAnswer: "Shadow Clone Jutsu", category: "Characters", difficulty: "easy", animeTitle: "Naruto" },
  { id: "q5", question: "Who directed 'Spirited Away'?", options: ["Hayao Miyazaki", "Isao Takahata", "Makoto Shinkai", "Mamoru Hosoda"], correctAnswer: "Hayao Miyazaki", category: "Studio", difficulty: "easy", animeTitle: "Spirited Away" },
  { id: "q6", question: "In 'Attack on Titan', what is the name of the titan that Eren can transform into?", options: ["Founding Titan", "Attack Titan", "Armored Titan", "Beast Titan"], correctAnswer: "Attack Titan", category: "Characters", difficulty: "medium", animeTitle: "Attack on Titan" },
  { id: "q7", question: "What is the name of the substance that gives Quirks in 'My Hero Academia'?", options: ["Quirk Factor", "One For All", "All For One", "Trigger"], correctAnswer: "Quirk Factor", category: "General", difficulty: "hard", animeTitle: "My Hero Academia" },
  { id: "q8", question: "Which studio produced 'Your Name' (Kimi no Na wa)?", options: ["CoMix Wave Films", "Studio Ghibli", "Kyoto Animation", "MAPPA"], correctAnswer: "CoMix Wave Films", category: "Studio", difficulty: "medium", animeTitle: "Your Name" },
  { id: "q9", question: "In 'Fullmetal Alchemist', what is the Law of Equivalent Exchange?", options: ["To gain something, something of equal value must be lost", "Energy cannot be created or destroyed", "All matter returns to dust", "Knowledge is power"], correctAnswer: "To gain something, something of equal value must be lost", category: "Plot", difficulty: "easy", animeTitle: "Fullmetal Alchemist" },
  { id: "q10", question: "What is Goku's Saiyan name?", options: ["Kakarot", "Bardock", "Raditz", "Turles"], correctAnswer: "Kakarot", category: "Characters", difficulty: "easy", animeTitle: "Dragon Ball" },
  { id: "q11", question: "Which studio animated 'Jujutsu Kaisen'?", options: ["MAPPA", "Studio Bones", "Madhouse", "Pierrot"], correctAnswer: "MAPPA", category: "Studio", difficulty: "easy", animeTitle: "Jujutsu Kaisen" },
  { id: "q12", question: "In 'One Piece', what is Luffy's Devil Fruit called?", options: ["Gomu Gomu no Mi", "Mera Mera no Mi", "Bara Bara no Mi", "Hana Hana no Mi"], correctAnswer: "Gomu Gomu no Mi", category: "Characters", difficulty: "easy", animeTitle: "One Piece" },
  { id: "q13", question: "Who composed the music for 'Attack on Titan'?", options: ["Hiroyuki Sawano", "Yoko Kanno", "Joe Hisaishi", "Yuki Kajiura"], correctAnswer: "Hiroyuki Sawano", category: "Music", difficulty: "medium", animeTitle: "Attack on Titan" },
  { id: "q14", question: "What year was 'Neon Genesis Evangelion' first released?", options: ["1995", "1996", "1997", "1994"], correctAnswer: "1995", category: "General", difficulty: "hard" },
  { id: "q15", question: "Who is the main voice actor for Luffy in the Japanese version of 'One Piece'?", options: ["Mayumi Tanaka", "Kazuki Yao", "Hiroaki Hirata", "Akemi Okamura"], correctAnswer: "Mayumi Tanaka", category: "Voice Actors", difficulty: "medium", animeTitle: "One Piece" },
  { id: "q16", question: "Which anime features a notebook that can kill anyone whose name is written in it?", options: ["Death Note", "Another", "Future Diary", "Bungo Stray Dogs"], correctAnswer: "Death Note", category: "Plot", difficulty: "easy", animeTitle: "Death Note" },
  { id: "q17", question: "In 'Dragon Ball Z', what technique does Goku learn on King Kai's planet?", options: ["Kaioken", "Spirit Bomb", "Instant Transmission", "Solar Flare"], correctAnswer: "Kaioken", category: "Characters", difficulty: "medium", animeTitle: "Dragon Ball Z" },
  { id: "q18", question: "What is the name of the school in 'My Hero Academia'?", options: ["U.A. High School", "Hope's Peak Academy", "Kunugigaoka Junior High", "Seirin High School"], correctAnswer: "U.A. High School", category: "General", difficulty: "easy", animeTitle: "My Hero Academia" },
  { id: "q19", question: "Which Studio Ghibli film features a moving castle?", options: ["Howl's Moving Castle", "Castle in the Sky", "Spirited Away", "Princess Mononoke"], correctAnswer: "Howl's Moving Castle", category: "General", difficulty: "easy" },
  { id: "q20", question: "In 'Chainsaw Man', what is Denji's pet devil's name?", options: ["Pochita", "Angel", "Power", "Aki"], correctAnswer: "Pochita", category: "Characters", difficulty: "easy", animeTitle: "Chainsaw Man" },
  { id: "q21", question: "What is the name of the organization that hunts titans in 'Attack on Titan'?", options: ["Survey Corps", "Military Police", "Garrison Regiment", "Training Corps"], correctAnswer: "Survey Corps", category: "Plot", difficulty: "easy", animeTitle: "Attack on Titan" },
  { id: "q22", question: "Which anime is known for the phrase 'I'll take a potato chip... and eat it!'?", options: ["Death Note", "Code Geass", "Monster", "Psycho-Pass"], correctAnswer: "Death Note", category: "General", difficulty: "medium", animeTitle: "Death Note" },
  { id: "q23", question: "Who voiced Edward Elric in the Japanese version of 'Fullmetal Alchemist'?", options: ["Rie Kugimiya", "Maaya Sakamoto", "Miyu Irino", "Romi Park"], correctAnswer: "Rie Kugimiya", category: "Voice Actors", difficulty: "hard", animeTitle: "Fullmetal Alchemist" },
  { id: "q24", question: "What is the name of the tournament in 'Dragon Ball'?", options: ["World Martial Arts Tournament", "Tenkaichi Budokai", "Cell Games", "Tournament of Power"], correctAnswer: "World Martial Arts Tournament", category: "General", difficulty: "easy", animeTitle: "Dragon Ball" },
  { id: "q25", question: "Which studio animated 'Cowboy Bebop'?", options: ["Sunrise", "Studio Bones", "Madhouse", "Toei Animation"], correctAnswer: "Sunrise", category: "Studio", difficulty: "medium", animeTitle: "Cowboy Bebop" },
  { id: "q26", question: "In 'Naruto', what is the name of Sasuke's clan?", options: ["Uchiha Clan", "Hyuga Clan", "Senju Clan", "Uzumaki Clan"], correctAnswer: "Uchiha Clan", category: "Characters", difficulty: "easy", animeTitle: "Naruto" },
  { id: "q27", question: "What is the name of the magical world in 'Re:Zero'?", options: ["Lugunica", "Elior", "Pleidies", "Vollachia"], correctAnswer: "Lugunica", category: "Plot", difficulty: "hard", animeTitle: "Re:Zero" },
  { id: "q28", question: "Which Makoto Shinkai film features body-swapping?", options: ["Your Name", "Weathering with You", "5 Centimeters per Second", "The Garden of Words"], correctAnswer: "Your Name", category: "Plot", difficulty: "easy", animeTitle: "Your Name" },
  { id: "q29", question: "In 'Demon Slayer', what is Tanjiro's main breathing technique?", options: ["Water Breathing", "Fire Breathing", "Wind Breathing", "Thunder Breathing"], correctAnswer: "Water Breathing", category: "Characters", difficulty: "easy", animeTitle: "Demon Slayer" },
  { id: "q30", question: "Who is the author of 'One Piece'?", options: ["Eiichiro Oda", "Masashi Kishimoto", "Tite Kubo", "Akira Toriyama"], correctAnswer: "Eiichiro Oda", category: "General", difficulty: "easy", animeTitle: "One Piece" },
  { id: "q31", question: "Which anime features a father-son relationship with a whale named Laboon?", options: ["One Piece", "Moby Dick", "Space Dandy", "Samurai Champloo"], correctAnswer: "One Piece", category: "Characters", difficulty: "medium", animeTitle: "One Piece" },
  { id: "q32", question: "What is the name of the academy in 'Assassination Classroom'?", options: ["Kunugigaoka Junior High", "U.A. High School", "Hope's Peak Academy", "Mahora Academy"], correctAnswer: "Kunugigaoka Junior High", category: "General", difficulty: "medium", animeTitle: "Assassination Classroom" },
  { id: "q33", question: "In 'Code Geass', what is Lelouch's Geass power?", options: ["Absolute obedience", "Mind reading", "Time travel", "Invisibility"], correctAnswer: "Absolute obedience", category: "Plot", difficulty: "medium", animeTitle: "Code Geass" },
  { id: "q34", question: "Which studio produced 'Violet Evergarden'?", options: ["Kyoto Animation", "KyoAni", "Ufotable", "MAPPA", "Studio Bones"], correctAnswer: "Kyoto Animation", category: "Studio", difficulty: "medium", animeTitle: "Violet Evergarden" },
  { id: "q35", question: "What is the name of the main character in 'A Silent Voice'?", options: ["Shoya Ishida", "Shoko Nishimiya", "Tomohiro Nagatsuka", "Naoka Ueno"], correctAnswer: "Shoya Ishida", category: "Characters", difficulty: "medium", animeTitle: "A Silent Voice" },
  { id: "q36", question: "Who sang the first opening of 'Tokyo Ghoul' (Unravel)?", options: ["TK from Ling Tosite Sigure", "LiSA", "Yoko Kanno", "Aimer"], correctAnswer: "TK from Ling Tosite Sigure", category: "Music", difficulty: "hard", animeTitle: "Tokyo Ghoul" },
  { id: "q37", question: "In 'Hunter x Hunter', what is Gon's signature technique?", options: ["Jajanken", "Nen Punch", "Rock Paper Scissors", "Gon Freecss Special"], correctAnswer: "Jajanken", category: "Characters", difficulty: "medium", animeTitle: "Hunter x Hunter" },
  { id: "q38", question: "Which anime is set in the world of alchemy?", options: ["Fullmetal Alchemist", "Fate/Stay Night", "The Ancient Magus' Bride", "Magi"], correctAnswer: "Fullmetal Alchemist", category: "General", difficulty: "easy", animeTitle: "Fullmetal Alchemist" },
  { id: "q39", question: "What is the name of the pirate king in 'One Piece'?", options: ["Gol D. Roger", "Monkey D. Dragon", "Shanks", "Whitebeard"], correctAnswer: "Gol D. Roger", category: "Characters", difficulty: "medium", animeTitle: "One Piece" },
  { id: "q40", question: "Which anime is known for the phrase 'People die if they are killed'?", options: ["Fate/Stay Night", "Fate/Zero", "Kara no Kyoukai", "Demon Slayer"], correctAnswer: "Fate/Stay Night", category: "General", difficulty: "hard" },
  { id: "q41", question: "In 'Jujutsu Kaisen', what is Sukuna's finger count?", options: ["20", "15", "10", "25"], correctAnswer: "20", category: "General", difficulty: "medium", animeTitle: "Jujutsu Kaisen" },
  { id: "q42", question: "Who directed 'Princess Mononoke'?", options: ["Hayao Miyazaki", "Isao Takahata", "Mamoru Hosoda", "Makoto Shinkai"], correctAnswer: "Hayao Miyazaki", category: "Studio", difficulty: "easy", animeTitle: "Princess Mononoke" },
  { id: "q43", question: "What is the name of the death scythe in 'Soul Eater'?", options: ["Soul Eater", "Death Scythe", "Demon Scythe", "Ragnarok"], correctAnswer: "Soul Eater", category: "General", difficulty: "medium", animeTitle: "Soul Eater" },
  { id: "q44", question: "Which studio animated 'Steins;Gate'?", options: ["White Fox", "Madhouse", "Production I.G", "feel."], correctAnswer: "White Fox", category: "Studio", difficulty: "hard", animeTitle: "Steins;Gate" },
  { id: "q45", question: "In 'Naruto', what is Rock Lee's main fighting style?", options: ["Taijutsu", "Ninjutsu", "Genjutsu", "Kenjutsu"], correctAnswer: "Taijutsu", category: "Characters", difficulty: "easy", animeTitle: "Naruto" },
  { id: "q46", question: "What is the name of the village in 'Attack on Titan' where Eren grew up?", options: ["Shiganshina District", "Trost District", "Wall Rose", "Wall Maria"], correctAnswer: "Shiganshina District", category: "Plot", difficulty: "medium", animeTitle: "Attack on Titan" },
  { id: "q47", question: "Which anime features a character named 'Spike Spiegel'?", options: ["Cowboy Bebop", "Trigun", "Space Dandy", "Outlaw Star"], correctAnswer: "Cowboy Bebop", category: "Characters", difficulty: "easy", animeTitle: "Cowboy Bebop" },
  { id: "q48", question: "Who composed the soundtrack for 'Spirited Away'?", options: ["Joe Hisaishi", "Yoko Kanno", "Hiroyuki Sawano", "Yuki Kajiura"], correctAnswer: "Joe Hisaishi", category: "Music", difficulty: "easy", animeTitle: "Spirited Away" },
  { id: "q49", question: "In 'One Punch Man', what is Saitama's hero rank at the start?", options: ["C-Class", "B-Class", "A-Class", "S-Class"], correctAnswer: "C-Class", category: "Characters", difficulty: "medium", animeTitle: "One Punch Man" },
  { id: "q50", question: "Which anime is about a boy who fights demons after his family is killed by Muzan Kibutsuji?", options: ["Demon Slayer", "Jujutsu Kaisen", "Chainsaw Man", "Blue Exorcist"], correctAnswer: "Demon Slayer", category: "Plot", difficulty: "easy", animeTitle: "Demon Slayer" },
  { id: "q51", question: "What is the name of the Royal Capital in 'Seven Deadly Sins'?", options: ["Liones", "Camelot", "Britannia", "Liones Kingdom"], correctAnswer: "Liones", category: "General", difficulty: "hard", animeTitle: "Seven Deadly Sins" },
  { id: "q52", question: "Who is the main villain in 'Dragon Ball Z' Frieza Saga?", options: ["Frieza", "Cell", "Majin Buu", "Vegeta"], correctAnswer: "Frieza", category: "Characters", difficulty: "easy", animeTitle: "Dragon Ball Z" },
  { id: "q53", question: "In 'Death Note', what is the name of the shinigami who drops the Death Note?", options: ["Ryuk", "Rem", "Sidoh", "Gelus"], correctAnswer: "Ryuk", category: "Characters", difficulty: "easy", animeTitle: "Death Note" },
  { id: "q54", question: "Which anime features a girl who can control rats and a boy with a giant knife?", options: ["Deadman Wonderland", "Future Diary", "Another", "Elfen Lied"], correctAnswer: "Deadman Wonderland", category: "General", difficulty: "hard" },
  { id: "q55", question: "What is the name of Lelouch's mecha in 'Code Geass'?", options: ["Lancelot", "Gawain", "Shinkirō", "Guren"], correctAnswer: "Shinkirō", category: "Characters", difficulty: "hard", animeTitle: "Code Geass" },
  { id: "q56", question: "In 'My Hero Academia', what is Deku's Quirk called?", options: ["One For All", "All For One", "Super Strength", "Power Transfer"], correctAnswer: "One For All", category: "Characters", difficulty: "easy", animeTitle: "My Hero Academia" },
  { id: "q57", question: "Which anime is about a high school where students fight using personas?", options: ["Persona 4: The Animation", "Persona 5: The Animation", "Blue Exorcist", "Danganronpa"], correctAnswer: "Persona 4: The Animation", category: "General", difficulty: "hard" },
  { id: "q58", question: "Who is the main composer for 'Naruto Shippuden'?", options: ["Yasuharu Takanashi", "Toshio Masuda", "Hiroyuki Sawano", "Yuki Kajiura"], correctAnswer: "Yasuharu Takanashi", category: "Music", difficulty: "hard", animeTitle: "Naruto Shippuden" },
  { id: "q59", question: "In 'Chainsaw Man', what devil makes a contract with Denji?", options: ["Pochita", "Makima", "Power", "Angel Devil"], correctAnswer: "Pochita", category: "Plot", difficulty: "easy", animeTitle: "Chainsaw Man" },
  { id: "q60", question: "What is the name of the school festival in 'Kaguya-sama: Love is War'?", options: ["Shuchiin Academy Festival", "Cultural Festival", "School Festival", "Star Festival"], correctAnswer: "Shuchiin Academy Festival", category: "General", difficulty: "medium", animeTitle: "Kaguya-sama" },
  { id: "q61", question: "Which Studio Ghibli film features a cat bus?", options: ["My Neighbor Totoro", "Kiki's Delivery Service", "Spirited Away", "Ponyo"], correctAnswer: "My Neighbor Totoro", category: "General", difficulty: "easy" },
  { id: "q62", question: "In 'Dragon Ball', what is the name of the dragon summoned by the Namekian Dragon Balls?", options: ["Porunga", "Shenron", "Super Shenron", "Eternal Dragon"], correctAnswer: "Porunga", category: "General", difficulty: "hard", animeTitle: "Dragon Ball" },
  { id: "q63", question: "Which anime features the phrase 'El Psy Kongroo'?", options: ["Steins;Gate", "Chaos;Head", "Robotics;Notes", "Occultic;Nine"], correctAnswer: "Steins;Gate", category: "General", difficulty: "medium", animeTitle: "Steins;Gate" },
  { id: "q64", question: "What is the name of the cat in 'Sailor Moon'?", options: ["Luna", "Artemis", "Diana", "Molly"], correctAnswer: "Luna", category: "Characters", difficulty: "easy", animeTitle: "Sailor Moon" },
  { id: "q65", question: "In 'Hunter x Hunter', what is Killua's family profession?", options: ["Assassins", "Hunters", "Doctors", "Merchants"], correctAnswer: "Assassins", category: "Characters", difficulty: "easy", animeTitle: "Hunter x Hunter" },
  { id: "q66", question: "Which anime features a boy who can see spirits and a fox demon?", options: ["Inuyasha", "Nurarihyon no Mago", "Blue Exorcist", "YuYu Hakusho"], correctAnswer: "Inuyasha", category: "General", difficulty: "medium", animeTitle: "Inuyasha" },
  { id: "q67", question: "Who is the voice actor for Goku?", options: ["Masako Nozawa", "Mayumi Tanaka", "Rie Kugimiya", "Kappei Yamaguchi"], correctAnswer: "Masako Nozawa", category: "Voice Actors", difficulty: "medium", animeTitle: "Dragon Ball" },
  { id: "q68", question: "In 'Demon Slayer', what is Nezuko's special ability?", options: ["Blood Demon Art", "Sun Breathing", "Water Breathing", "Flame Breathing"], correctAnswer: "Blood Demon Art", category: "Characters", difficulty: "medium", animeTitle: "Demon Slayer" },
  { id: "q69", question: "Which anime features a character who says 'I am the bone of my sword'?", options: ["Fate/Stay Night", "Fate/Zero", "Kara no Kyoukai", "Sword Art Online"], correctAnswer: "Fate/Stay Night", category: "General", difficulty: "medium" },
  { id: "q70", question: "What is the name of the giant robot in 'Gurren Lagann'?", options: ["Lagann", "Gurren", "Gunmen", "Simon's Core Drill"], correctAnswer: "Gurren", category: "Characters", difficulty: "hard", animeTitle: "Gurren Lagann" },
  { id: "q71", question: "Which anime was the first to air on Indian television on channels like Cartoon Network?", options: ["Dragon Ball Z", "Naruto", "Pokémon", "Shin Chan"], correctAnswer: "Dragon Ball Z", category: "General", difficulty: "medium" },
  { id: "q72", question: "What is the Japanese term for anime that is directly adapted from a manga?", options: ["Manga Adaptation", "Direct Adaptation", "Source Material", "Anime Original"], correctAnswer: "Manga Adaptation", category: "General", difficulty: "easy" },
  { id: "q73", question: "In 'Attack on Titan', what is the name of the highest-ranking military official?", options: ["Commander Erwin", "Commander Hange", "General Zackly", "Prime Minister Darius"], correctAnswer: "Commander Erwin", category: "Characters", difficulty: "medium", animeTitle: "Attack on Titan" },
  { id: "q74", question: "Which studio animated 'Fate/Zero'?", options: ["Ufotable", "Studio Deen", "Production I.G", "A-1 Pictures"], correctAnswer: "Ufotable", category: "Studio", difficulty: "medium", animeTitle: "Fate/Zero" },
  { id: "q75", question: "What is the name of the protagonist in 'Parasyte: The Maxim'?", options: ["Shinichi Izumi", "Migi", "Kana Kimishima", "Satomi Murano"], correctAnswer: "Shinichi Izumi", category: "Characters", difficulty: "medium", animeTitle: "Parasyte" },
  { id: "q76", question: "In 'Your Lie in April', what instrument does Kousei play?", options: ["Piano", "Violin", "Cello", "Guitar"], correctAnswer: "Piano", category: "Characters", difficulty: "medium", animeTitle: "Your Lie in April" },
  { id: "q77", question: "Which anime movie features a girl named Mitsuha and a boy named Taki?", options: ["Your Name", "Weathering with You", "5 Centimeters per Second", "The Garden of Words"], correctAnswer: "Your Name", category: "Characters", difficulty: "easy", animeTitle: "Your Name" },
  { id: "q78", question: "What is the name of the organization in 'Death Note' that tries to catch Kira?", options: ["Task Force", "SPK", "NPA", "FBI"], correctAnswer: "Task Force", category: "Plot", difficulty: "medium", animeTitle: "Death Note" },
  { id: "q79", question: "In 'One Piece', what is the name of the ship that the Straw Hats first use?", options: ["Going Merry", "Thousand Sunny", "Red Force", "Oro Jackson"], correctAnswer: "Going Merry", category: "Characters", difficulty: "easy", animeTitle: "One Piece" },
  { id: "q80", question: "Which studio animated 'Mob Psycho 100'?", options: ["Bones", "Madhouse", "MAPPA", "Studio Pierrot"], correctAnswer: "Bones", category: "Studio", difficulty: "medium", animeTitle: "Mob Psycho 100" },
  { id: "q81", question: "What is 'Shonen' referring to in anime?", options: ["Target demographic (young boys)", "Genre of fighting anime", "Type of animation style", "A specific studio"], correctAnswer: "Target demographic (young boys)", category: "General", difficulty: "easy" },
  { id: "q82", question: "In 'Naruto', who taught Naruto the Rasengan?", options: ["Jiraiya", "Kakashi", "Minato", "Iruka"], correctAnswer: "Jiraiya", category: "Characters", difficulty: "medium", animeTitle: "Naruto" },
  { id: "q83", question: "Which Indian actor voiced Goku in the Hindi dub of Dragon Ball Z?", options: ["Sukhwinder Singh", "Saurabh Agarwal", "Rajesh Khattar", "Shakti Singh"], correctAnswer: "Shakti Singh", category: "Voice Actors", difficulty: "hard", animeTitle: "Dragon Ball" },
  { id: "q84", question: "In 'Jujutsu Kaisen', what is Yuji Itadori's domain expansion?", options: ["Fukuma Mizushi", "Self-Embodiment of Perfection", "Malevolent Shrine", "Chimera Shadow Garden"], correctAnswer: "Fukuma Mizushi", category: "Characters", difficulty: "hard", animeTitle: "Jujutsu Kaisen" },
  { id: "q85", question: "What is the name of the virtual world in 'Sword Art Online'?", options: ["Aincrad", "ALfheim", "Underworld", "Gun Gale"], correctAnswer: "Aincrad", category: "Plot", difficulty: "medium", animeTitle: "Sword Art Online" },
  { id: "q86", question: "Which anime is known for the opening song 'Guren no Yumiya'?", options: ["Attack on Titan", "Tokyo Ghoul", "Death Note", "Naruto Shippuden"], correctAnswer: "Attack on Titan", category: "Music", difficulty: "easy", animeTitle: "Attack on Titan" },
  { id: "q87", question: "In 'Dragon Ball Super', what is the name of the Tournament of Power's sponsor?", options: ["Zen-Oh", "Whis", "Beerus", "Supreme Kai"], correctAnswer: "Zen-Oh", category: "Characters", difficulty: "medium", animeTitle: "Dragon Ball Super" },
  { id: "q88", question: "What is the name of the food that Sonny Boy eats in 'Sonny Boy'?", options: ["Fruit of Life", "Apple of Wisdom", "Coconut", "Mango"], correctAnswer: "Coconut", category: "General", difficulty: "hard" },
  { id: "q89", question: "In 'Pokémon', what is Ash's first Pokémon?", options: ["Pikachu", "Charmander", "Bulbasaur", "Squirtle"], correctAnswer: "Pikachu", category: "Characters", difficulty: "easy", animeTitle: "Pokémon" },
  { id: "q90", question: "Which anime features a character named 'Rei Ayanami'?", options: ["Neon Genesis Evangelion", "Serial Experiments Lain", "Gunbuster", "Gurren Lagann"], correctAnswer: "Neon Genesis Evangelion", category: "Characters", difficulty: "medium", animeTitle: "Neon Genesis Evangelion" },
  { id: "q91", question: "In 'Fullmetal Alchemist: Brotherhood', what is Father's ultimate goal?", options: ["Become God", "Destroy humanity", "Rule the world", "Absorb all alchemists"], correctAnswer: "Become God", category: "Plot", difficulty: "medium", animeTitle: "Fullmetal Alchemist: Brotherhood" },
  { id: "q92", question: "Which studio produced 'Weathering with You'?", options: ["CoMix Wave Films", "Studio Ghibli", "Kyoto Animation", "MAPPA"], correctAnswer: "CoMix Wave Films", category: "Studio", difficulty: "medium", animeTitle: "Weathering with You" },
  { id: "q93", question: "What is the name of the food that Shinobu Kocho loves in 'Demon Slayer'?", options: ["Dango", "Mochi", "Ramen", "Soba"], correctAnswer: "Dango", category: "Characters", difficulty: "hard", animeTitle: "Demon Slayer" },
  { id: "q94", question: "In 'Dragon Ball Z', what is Vegeta's signature attack?", options: ["Final Flash", "Galick Gun", "Big Bang Attack", "Final Explosion"], correctAnswer: "Final Flash", category: "Characters", difficulty: "medium", animeTitle: "Dragon Ball Z" },
  { id: "q95", question: "Which anime is about a boy who can summon Personas to fight Shadows?", options: ["Persona 4: The Animation", "JoJo's Bizarre Adventure", "Blue Exorcist", "Shaman King"], correctAnswer: "Persona 4: The Animation", category: "General", difficulty: "hard" },
  { id: "q96", question: "In 'Naruto', what is the name of the Nine-Tailed Fox?", options: ["Kurama", "Shukaku", "Matatabi", "Isobu"], correctAnswer: "Kurama", category: "Characters", difficulty: "medium", animeTitle: "Naruto" },
  { id: "q97", question: "What is the name of the power system in 'Hunter x Hunter'?", options: ["Nen", "Chakra", "Ki", "Haki"], correctAnswer: "Nen", category: "General", difficulty: "medium", animeTitle: "Hunter x Hunter" },
  { id: "q98", question: "Which anime features the phrase 'It's over 9000!'?", options: ["Dragon Ball Z", "Dragon Ball", "Dragon Ball Super", "Dragon Ball GT"], correctAnswer: "Dragon Ball Z", category: "General", difficulty: "easy", animeTitle: "Dragon Ball Z" },
  { id: "q99", question: "In 'Bleach', what is the name of Ichigo's Zanpakuto?", options: ["Zangetsu", "Hyōrinmaru", "Senbonzakura", "Ryūjin Jakka"], correctAnswer: "Zangetsu", category: "Characters", difficulty: "medium", animeTitle: "Bleach" },
  { id: "q100", question: "Who is the author of 'Attack on Titan'?", options: ["Hajime Isayama", "Kōhei Horikoshi", "Gege Akutami", "Tatsuki Fujimoto"], correctAnswer: "Hajime Isayama", category: "General", difficulty: "easy", animeTitle: "Attack on Titan" },
];

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 16807) % 2147483647;
    return (hash - 1) / 2147483646;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const ANIME_CHARACTERS_CACHE = new Map<number, { name: string; image?: string }[]>();
const CACHE_TTL_Q = 30 * 60 * 1000;

async function fetchCharactersBatch(animeIds: number[]): Promise<Map<number, { name: string; image?: string }[]>> {
  const query = `
    query ($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $ids) {
          id
          characters(perPage: 5, sort: ROLE) {
            edges {
              node { name { full } image { medium } }
              role
            }
          }
        }
      }
    }`;
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { ids: animeIds } }),
    });
    const data = await res.json();
    const map = new Map<number, { name: string; image?: string }[]>();
    for (const m of data?.Page?.media || []) {
      const chars = (m.characters?.edges || []).map((e: any) => ({ name: e.node.name.full, image: e.node.image?.medium }));
      if (chars.length > 0) map.set(m.id, chars);
    }
    return map;
  } catch { return new Map(); }
}

async function generateQuestionsFromAnime(count: number): Promise<QuizQuestion[]> {
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } studios(isMain: true) { nodes { id name } } episodes duration format source(version: 2) genres startDate { year } averageScore } } }`,
        variables: { p: count + 10 },
      }),
    });
    const data = await res.json();
    const mediaList: any[] = data?.Page?.media || [];
    if (mediaList.length < 3) return [];

    const charsMap = await fetchCharactersBatch(mediaList.map((m: any) => m.id));

    const questions: QuizQuestion[] = [];
    const rng = () => Math.random();

    for (const anime of mediaList) {
      if (questions.length >= count) break;
      const title = anime.title?.romaji || anime.title?.english || "Unknown";
      const qid = `dyn-${anime.id}`;

      const studioNodes = anime.studios?.nodes || [];
      const studio = studioNodes.find((s: any) => s.isAnimationStudio !== false)?.name || studioNodes[0]?.name;

      const characters = charsMap.get(anime.id) || [];
      const mainChar = characters[0]?.name;

      const wrongStudios = mediaList
        .filter((m: any) => { const nodes = m.studios?.nodes || []; return nodes[0]?.name && nodes[0]?.name !== studio; })
        .map((m: any) => { const nodes = m.studios?.nodes || []; return nodes.find((s: any) => s.isAnimationStudio !== false)?.name || nodes[0]?.name; })
        .filter(Boolean);
      const uniqueWrongStudios = [...new Set<string>(wrongStudios)].filter(Boolean);

      // Studio question
      if (studio && uniqueWrongStudios.length >= 3 && questions.length < count) {
        const wrong = shuffleArray(uniqueWrongStudios, rng).slice(0, 3);
        questions.push({
          id: `${qid}-studio`,
          question: `Which studio animated "${title}"?`,
          options: shuffleArray([studio, ...wrong], rng),
          correctAnswer: studio,
          category: "Studio",
          difficulty: "medium",
          animeTitle: title,
          animeImage: anime.coverImage?.large,
        });
      }

      // Episode count question
      if (anime.episodes && anime.episodes > 0 && questions.length < count) {
        const wrongEps = mediaList
          .filter((m: any) => m.episodes && m.episodes !== anime.episodes)
          .map((m: any) => String(m.episodes))
          .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

        const wrongEpsSample = shuffleArray(wrongEps, rng).slice(0, 3);
        if (wrongEpsSample.length === 3) {
          questions.push({
            id: `${qid}-episodes`,
            question: `How many episodes does "${title}" have?`,
            options: shuffleArray([String(anime.episodes), ...wrongEpsSample], rng),
            correctAnswer: String(anime.episodes),
            category: "General",
            difficulty: anime.episodes > 50 ? "hard" : anime.episodes > 24 ? "medium" : "easy",
            animeTitle: title,
            animeImage: anime.coverImage?.large,
          });
        }
      }

      // Year question
      if (anime.startDate?.year && questions.length < count) {
        const year = String(anime.startDate.year);
        const wrongYears = mediaList
          .filter((m: any) => m.startDate?.year && String(m.startDate.year) !== year)
          .map((m: any) => String(m.startDate.year))
          .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
        const wrongSample = shuffleArray(wrongYears, rng).slice(0, 3);
        if (wrongSample.length === 3) {
          questions.push({
            id: `${qid}-year`,
            question: `What year was "${title}" first released?`,
            options: shuffleArray([year, ...wrongSample], rng),
            correctAnswer: year,
            category: "General",
            difficulty: "easy",
            animeTitle: title,
            animeImage: anime.coverImage?.large,
          });
        }
      }

      // Character question  
      if (mainChar && characters.length > 1 && questions.length < count) {
        const wrongChars = characters.slice(1, 4).map((c) => c.name);
        if (wrongChars.length >= 3) {
          questions.push({
            id: `${qid}-char`,
            question: `Which character is the protagonist of "${title}"?`,
            options: shuffleArray([mainChar, ...wrongChars.slice(0, 3)], rng),
            correctAnswer: mainChar,
            category: "Characters",
            difficulty: "medium",
            animeTitle: title,
            animeImage: anime.coverImage?.large,
          });
        }
      }
    }

    return questions;
  } catch { return []; }
}

export async function generateDynamicQuiz(difficulty?: string, category?: string, count = 10): Promise<QuizQuestion[]> {
  const staticPool = [...QUESTIONS];
  let filteredStatic = staticPool;
  if (category && category !== "all") {
    filteredStatic = staticPool.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }
  if (difficulty && difficulty !== "all") {
    filteredStatic = staticPool.filter((q) => q.difficulty === difficulty);
  }
  if (filteredStatic.length === 0) filteredStatic = staticPool;

  const shuffled = shuffleArray(filteredStatic, () => Math.random());
  const staticCount = Math.min(Math.ceil(count * 0.4), shuffled.length);
  const staticSelected = shuffled.slice(0, staticCount);

  const dynamicCount = count - staticSelected.length;
  const dynamicQuestions = dynamicCount > 0 ? await generateQuestionsFromAnime(dynamicCount + 5) : [];

  const selectedDynamic = shuffleArray(dynamicQuestions, () => Math.random()).slice(0, dynamicCount);

  const combined = shuffleArray([...staticSelected, ...selectedDynamic], () => Math.random());

  return combined.map((q) => {
    const options = shuffleArray([...q.options], () => Math.random());
    return { ...q, options };
  });
}

export function generateQuiz(difficulty?: string, category?: string, count = 10): QuizQuestion[] {
  let pool = QUESTIONS;

  if (category && category !== "all") {
    pool = pool.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && difficulty !== "all") {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  if (pool.length === 0) pool = QUESTIONS;

  const shuffled = shuffleArray(pool, () => Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((q) => {
    const options = shuffleArray([...q.options], () => Math.random());
    return { ...q, options };
  });
}

export async function getDailyQuizDynamic(): Promise<QuizQuestion[]> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const rng = seededRandom(dateStr);

  const questions = await generateQuestionsFromAnime(8);
  const selected = shuffleArray(questions, rng).slice(0, 5);

  if (selected.length < 5) {
    const fallback = shuffleArray(QUESTIONS, rng).slice(0, 5 - selected.length);
    return [...selected, ...fallback].map((q) => {
      const options = shuffleArray([...q.options], rng);
      return { ...q, options };
    });
  }

  return selected.map((q) => {
    const options = shuffleArray([...q.options], rng);
    return { ...q, options };
  });
}

export function getDailyQuiz(): QuizQuestion[] {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const rng = seededRandom(dateStr);

  const shuffled = shuffleArray(QUESTIONS, rng);
  const selected = shuffled.slice(0, 5);

  return selected.map((q) => {
    const options = shuffleArray([...q.options], rng);
    return { ...q, options };
  });
}

export async function checkAnswer(questionId: string, answer: string): Promise<{ correct: boolean; correctAnswer: string; explanation?: string }> {
  let question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    try {
      const { findQuestion } = await import("./quiz-store");
      question = findQuestion?.(questionId);
    } catch {}
  }
  if (!question) return { correct: false, correctAnswer: "Unknown", explanation: "Question not found." };
  return {
    correct: answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase(),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  };
}
