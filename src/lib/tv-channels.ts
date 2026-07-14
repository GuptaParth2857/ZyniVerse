export interface TvChannel {
  id: string;
  name: string;
  shortName: string;
  color: string;
  region: string;
  website: string;
  dthNumbers?: string;
  type: "tv" | "youtube";
  subscriberCount?: string;
  logoUrl?: string;
}

export interface TimeSlot {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export interface ChannelSchedule {
  channelId: string;
  schedules: DaySchedule[];
}

export interface TvAnimeEntry {
  id: string;
  title: string;
  englishTitle?: string;
  malId?: number;
  episodes?: number;
  status?: string;
  genres?: string[];
  channel?: string;
  airTime?: string;
  image?: string;
}

export const TV_ANIME_SCHEDULE: TvAnimeEntry[] = [];

export const SHOW_POSTER_URLS: Record<string, string> = {
  "A Gatherer's Adventure in Isekai": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx187663-VVdpMlkhwMSh.jpg",
  "Atashinchi": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b3006-XANMoAUZPtcn.jpg",
  "Attack on Titan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg",
  "Attack on Titan (Hindi)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg",
  "Attack on Titan (Tamil)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg",
  "Attack on Titan (Telugu)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg",
  "Banana Fish": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx100388-hjkg1AnlJR5z.jpg",
  "Black Clover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx97940-fyh8o7gNbha0.png",
  "Akane-Banashi": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx196935-RnLWBsEvNp8M.jpg",
  "Chainsmoker Cat": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx207141-h5q5KJPd6vaX.jpg",
  "Bleach": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx269-d2GmRkJbMopq.png",
  "Bleach: TYBW": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx116674-p3zK4PUX2Aag.jpg",
  "Blue Lock": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx137822-U8naszP96vzC.png",
  "Chainsaw Man": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx127230-DdP4vAdssLoz.png",
  "Classroom of the Elite (Hindi)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx98659-WNyPLIZDpGGY.jpg",
  "Classroom of the Elite (Tamil)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx98659-WNyPLIZDpGGY.jpg",
  "Classroom of the Elite (Telugu)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx98659-WNyPLIZDpGGY.jpg",
  "Classroom of the Elite S4": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx98659-WNyPLIZDpGGY.jpg",
  "Cowboy Bebop": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-GCsPm7waJ4kS.png",
  "Cyberpunk: Edgerunners": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx120377-ayZPoxiWt4Li.jpg",
  "Dandadan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx171018-60q1B6GK2Ghb.jpg",
  "Death Note": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1535-kUgkcrfOrkUM.jpg",
  "Demon Slayer": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21612-d5zrx9CWkxNl.png",
  "Demon Slayer: Kimetsu no Yaiba": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21612-d5zrx9CWkxNl.png",
  "Devilman Crybaby": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx98460-bLtH2c3jd6sV.png",
  "Dororo": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101347-TGaDwEYqLfm1.jpg",
  "Darwin Incident": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177679-BgsgE0fQk3qN.jpg",
  "Dragon Ball Daima": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx170083-GTwRrhTApcLR.png",
  "Dragon Ball Z": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png",
  "Dragon Ball": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png",
  "Dragon Ball Super": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21175-EH06qlfF8TnB.jpg",
  "Fullmetal Alchemist": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx121-zjmixZ428Mwv.png",
  "Fullmetal Alchemist: Brotherhood": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx5114-nSWCgQlmOMtj.jpg",
  "Grand Blue": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx100922-uxEhaCsqMMp3.png",
  "Haikyuu!!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20464-ooZUyBe4ptp9.png",
  "Hunter x Hunter": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx136-gj0bbCpDNrKG.jpg",
  "Inuyasha": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx249-jVBkyLnBvnRE.png",
  "Jujutsu Kaisen": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-LHBAeoZDIsnF.jpg",
  "Jujutsu Kaisen (Hindi)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-LHBAeoZDIsnF.jpg",
  "Kabaneri of the Iron Fortress": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21196-2PfPfIDrxKki.jpg",
  "Made in Abyss": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx97986-TQ7dCgbS3y5s.jpg",
  "My Hero Academia": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21459-nYh85uj2Fuwr.jpg",
  "Naruto": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20-dE6UHbFFg1A5.jpg",
  "Naruto Shippuden": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1735-kGfVm0YqCPcu.png",
  "Naruto: Shippuden": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1735-kGfVm0YqCPcu.png",
  "Neon Genesis Evangelion": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx30-AI1zr74Dh4ye.jpg",
  "Nippon Sangoku": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx206914-SHKX08LarRzB.jpg",
  "One Piece": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg",
  "One Punch Man": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21087-B5DHjqZ3kW4b.jpg",
  "Pluto": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx99088-LTJskMD1wbbQ.png",
  "Pokemon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b527-t6dBVJ5OVcXK.png",
  "Pokémon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b527-t6dBVJ5OVcXK.png",
  "Pokemon The Series: XYZ": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b527-t6dBVJ5OVcXK.png",
  "Pokemon: Arceus Movie": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b527-t6dBVJ5OVcXK.png",
  "Psycho-Pass": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx13601-i42VFuHpqEOJ.jpg",
  "Re:Creators": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx97980-9NQwPW0igSMk.jpg",
  "Re:ZERO S4": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21355-wRVUrGxpvIQQ.jpg",
  "Remake Our Life!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx114065-YPPyW7ZSxfYU.jpg",
  "Rurouni Kenshin": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx45-DEFgZRCxiGmF.png",
  "Sakamoto Days": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177709-e5Qx6RlsBgD5.png",
  "Scott Pilgrim Takes Off": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx170206-ZP4qAzx2I2oR.jpg",
  "Shin Chan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b966-QUCdKAk4ls9J.jpg",
  "Shin-chan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b966-QUCdKAk4ls9J.jpg",
  "Sinchan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b966-QUCdKAk4ls9J.jpg",
  "Shin Chan & The Legends of Ninja Mononoke Movie": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b966-QUCdKAk4ls9J.jpg",
  "Shin Chan & The Mystery of Tenkasu Academy Movie": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b966-QUCdKAk4ls9J.jpg",
  "Shinchan In Very Very Tasty Tasty Movie": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b966-QUCdKAk4ls9J.jpg",
  "Slam Dunk": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx170-cmD8A0vZsp6g.jpg",
  "Solo Leveling": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx151807-it355ZgzquUd.png",
  "Solo Leveling (Hindi)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx151807-it355ZgzquUd.png",
  "Sparks of Tomorrow (KyoAni)": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx103303-IF43hFJPPv2Y.png",
  "Mushoku Tensei: Jobless Reincarnation S3": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx178789-hNXjKFzUq7mk.jpg",
  "Mushoku Tensei: Jobless Reincarnation": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx178789-hNXjKFzUq7mk.jpg",
  "Spy x Family": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx140960-Kb6R5nYQfjmP.jpg",
  "Steins;Gate": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx9253-tIUXF2gfU8Sg.jpg",
  "Sword Art Online": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx11757-SxYDUzdr9rh2.jpg",
  "That Time I Got Reincarnated as a Slime": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101280-tDxCVJm714nt.jpg",
  "The Apothecary Diaries": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx161645-QLbzHXiYRgV2.jpg",
  "The God of High School": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx116006-Wt8JSA1ZQxlM.png",
  "Tokyo Revengers": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx120120-cWDmnmeEntSe.jpg",
  "Vinland Saga": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101348-2fhDFPCuMNiz.jpg",
  "Wind Breaker": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx163270-wboZJp0ybwVK.jpg",
  "You and I Are Polar Opposites": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx184951-s8Lg2muPBhdX.jpg",
  "Goodbye, Lara": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177637-8onaQWqKW1C3.jpg",
  "Yu Yu Hakusho": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx392-z90299zIvYmx.png",
  "Beyblade Burst": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21236-8B4fORbuUp6v.jpg",
  "Doraemon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/501.jpg",
  "Chhota Bheem": "https://upload.wikimedia.org/wikipedia/en/f/f9/Chhota_Bheem.jpg",
  "Chhota Bheem aur Krishna: Mayanagari Movie": "https://upload.wikimedia.org/wikipedia/en/f/f9/Chhota_Bheem.jpg",
  "Chhota Bheem Aur Krishna: Patliputra Movie": "https://upload.wikimedia.org/wikipedia/en/f/f9/Chhota_Bheem.jpg",
  "Motu Patlu": "https://upload.wikimedia.org/wikipedia/en/3/3b/Motu_Patlu.Jpg",
  "Motu Patlu Movie": "https://upload.wikimedia.org/wikipedia/en/3/3b/Motu_Patlu.Jpg",
  "Taarak Mehta Ka Ooltah Chashmah": "https://upload.wikimedia.org/wikipedia/en/e/e2/Taarak_Mehta_Ka_Ooltah_Chashmah.jpg",
  "CID": "https://upload.wikimedia.org/wikipedia/en/b/b5/CID_%28Indian_TV_series%29.png",
  "Bandbudh Aur Budbak": "https://upload.wikimedia.org/wikipedia/en/0/08/Bandbudh_Aur_Budbak_logo.jpg",
  "Lamput": "https://upload.wikimedia.org/wikipedia/commons/d/da/Lamput.png",
  "Kiteretsu": "https://upload.wikimedia.org/wikipedia/en/d/d2/KiteretsuDaihyakka-vol1.jpg",
  "Chikoo Aur Bunty": "https://upload.wikimedia.org/wikipedia/en/5/57/Chikoo_Aur_Bunty_poster.jpeg",
  "Little Singham": "https://upload.wikimedia.org/wikipedia/en/2/23/Cop_Universe_logo.jpg",
  "Baby Little Singham": "https://upload.wikimedia.org/wikipedia/en/2/23/Cop_Universe_logo.jpg",
  "Bhootnath Returns": "",
  "Bahubali Friends": "",
  "Fukrey Boyzzz": "",
  "Gattu Aur Battu": "",
  "Haddi Mera Buddy": "",
  "Honey Bunny Ka Jholmaal": "",
  "Inspector Chingum": "",
  "Jay Jagannath": "",
  "Kian And Kiki": "",
  "Kris Roll No 21": "",
  "Maca & Roni": "",
  "Omi No.1": "",
  "Sampat Champat": "",
  "Selfie With Bajrangi": "",
  "Sher Aur Savasher": "",
  "Titoo": "",
  "Bittu Bahanebaaz": "",
  "Daaduji": "",
  "Smaashhing Simmba": "",
  "Chuck Chicken": "",
  "Big Hero 6 The Series": "",
  "Gravity Falls": "",
  "Grizzy and the Lemmings": "",
  "Looney Tunes": "",
  "Marvel's Spider-Man": "",
  "Mr. Bean: The Animated Series": "",
  "Pac-Man and the Ghostly Adventures": "",
  "Scooby-Doo, Where Are You!": "",
  "Star Wars Rebels": "",
  "Teen Titans GO!": "",
  "Teen Titans Go! Special": "",
  "The Flintstones": "",
  "Tom and Jerry": "",
  "We Bare Bears": "",
  "Castlevania": "",
  "Power Rangers Dino Fury": "",
  "The 100 Girlfriends Who Really Really Really Really REALLY Love You": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx162694-QFBei5pbjSh8.png",
  "The World's Strongest Rearguard": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx198409-EiWJXfYnvfu4.png",
  "ONE PIECE HEROINES": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx197178-Ui8PY9HQbNgu.jpg",
  "The Elusive Samurai": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx162896-hSMTVceb50GY.jpg",
  "BLACK TORCH": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx187538-fXVXKYUA3VV6.jpg",
  "Skeleton Knight in Another World": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx132474-J2ECHSPkfb9g.jpg",
  "KAIJU GIRL CARAMELISE": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx204466-vXMvIs4VOoQd.png",
  "Smoking Behind the Supermarket with You": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx196187-0dgFi2CPp3xn.jpg",
  "LIAR GAME": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx197754-Q5KqcUhIdypp.png",
  "The Oblivious Saint Can't Contain Her Power": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx196219-imvC0rbk4VzH.jpg",
  "Clevatess": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx178869-qiEz0gQD8H5N.png",
  "Saga of Tanya the Evil": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21613-qT3NiwYP5dYc.png",
  "Tomb Raider King": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx184356-SlFIstXUXJYP.png",
  "Trapped in a Dating Sim": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx142074-pHe4bX791PJh.jpg",
  "Welcome to Demon School! Iruma-kun": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx107693-A9bSSFAMxA6j.jpg",
  "Daemons of the Shadow Realm": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx195600-moI0UFArtOme.jpg",
  "Ascendance of a Bookworm": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx108268-Dtt82uOi3vq5.jpg",
  "Love Unseen Beneath the Clear Night Sky": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx202269-7KNj8s2fSsJJ.jpg",
  "The Insipid Prince's Furtive Grab for the Throne": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx169582-quL8VMg45fcu.png",
  "A Livid Lady's Guide to Getting Even": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx199408-ocRWG4pRWl8f.png",
  "Draw This, Then Die!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx188525-uWhw4rQcqOyF.jpg",
  "BanG Dream! YUME INFINITA": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx198376-sc5qcFv0RSH9.jpg",
  "Iron Wok Jan!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx204060-bKhovD8jAlW8.jpg",
  "Case Closed": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx235-MyYT7K3chBdO.jpg",
  "The Classroom of a Black Cat and a Witch": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx196974-mZk1uyrx0XNx.png",
  "Let's Go KAIKIGUMI": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx200230-YuzdgbXSgi38.png",
  "Though I Am an Inept Villainess": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx188139-1qIJfWxym8FX.jpg",
  "From Overshadowed to Overpowered": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx208044-Pm2UhvApQFUh.jpg",
  "Bungo Stray Dogs WAN!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx120150-hxvcRrYzgP2F.png",
  "Crowned in a Hundred Days": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx213484-FIyYH43ASHgB.png",
  "MEBIUS DUST": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx108992-skuOsfmLmMd2.jpg",
  "Yoroi-Shinden Samurai Troopers": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx194318-V3STmm4wutVQ.jpg",
  "Victoria of Many Faces": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx198709-3PFLvU6eqPvf.jpg",
  "Hana-Kimi Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx209669-7GlPe2ra5f1i.jpg",
  "The Villager of Level 999": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx197715-KLFLxU24U1uL.png",
  "Sorry About My Little Brothers": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx203490-YQXiymUiDQNA.jpg",
  "I Became a Legend After My 10 Year-Long Last Stand": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx199748-PAFk9pGSUmFL.png",
  "The Frontier Lord Begins with Zero Subjects": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx196218-UsdTTCrwpDIN.jpg",
  "The Duke's Son Claims He Won't Love Me Yet": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx208225-HJbCC0Z4xRp3.jpg",
  "Rich Girl Caretaker": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx201514-BHAeWhSbcBrT.png",
  "Recommendations from Iwamoto-Senpai": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx206249-1AUSry416wGz.png",
  "The Ogre's Bride": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b194219-56EhyK775lga.jpg",
  "Hanaori-san Still Wants to Fight": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx199066-YXDVsguvFZMm.jpg",
  "DIGIMON BEATBREAK": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx188388-aXx9fsnvezBf.jpg",
  "Star Detective Precure!": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx202957-fxZGgJTvwXzP.jpg",
  "Anime AzurLane: Slow Ahead! Season 2": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx169080-el4sMLlqMxeI.png",
  "RILAKKUMA": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b183231-z7SgjmXZBcoX.png",
  "The Drops of God": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx202508-dk6LEyevJYUY.jpg",
};

export function getShowPoster(showName: string): string | undefined {
  if (SHOW_POSTER_URLS[showName]) return SHOW_POSTER_URLS[showName] || undefined;
  const lower = showName.toLowerCase().replace(/[:\-!]/g, "").replace(/\s+/g, " ").trim();
  for (const [key, val] of Object.entries(SHOW_POSTER_URLS)) {
    if (!val) continue;
    const kLower = key.toLowerCase().replace(/[:\-!]/g, "").replace(/\s+/g, " ").trim();
    if (kLower === lower) return val;
  }
  for (const [key, val] of Object.entries(SHOW_POSTER_URLS)) {
    if (!val) continue;
    const kLower = key.toLowerCase().replace(/[:\-!]/g, "").replace(/\s+/g, " ").trim();
    if (lower.includes(kLower) || kLower.includes(lower)) return val;
  }
  return undefined;
}

export const TV_CHANNELS: Record<string, TvChannel> = {
  animax: {
    id: "animax",
    name: "Animax (Digital Only)",
    shortName: "AX",
    color: "#FF6F00",
    region: "India",
    website: "https://www.sonyliv.com",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Animax_logo.svg/250px-Animax_logo.svg.png",
  },
  cn: {
    id: "cn",
    name: "Cartoon Network",
    shortName: "CN",
    color: "#4CAF50",
    region: "India",
    website: "https://www.cartoonnetwork.in",
    dthNumbers: "Tata Play 667, Airtel 666",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/250px-Cartoon_Network_2010_logo.svg.png",
  },
  sony_yay: {
    id: "sony_yay",
    name: "SONY YAY!",
    shortName: "YAY",
    color: "#FF4081",
    region: "India",
    website: "https://www.sonyyay.com",
    dthNumbers: "Tata Play 663, Airtel 665",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/SONY_YAY_2022_Logo.png/250px-SONY_YAY_2022_Logo.png",
  },
  hungama: {
    id: "hungama",
    name: "Hungama",
    shortName: "HG",
    color: "#FF6F00",
    region: "India",
    website: "https://www.hungama.com",
    dthNumbers: "Tata Play 655, Airtel 453",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hungama_TV.svg/250px-Hungama_TV.svg.png",
  },
  super_hungama: {
    id: "super_hungama",
    name: "Super Hungama",
    shortName: "SH",
    color: "#FF9800",
    region: "India",
    website: "https://www.hungama.com",
    dthNumbers: "Tata Play 656",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hungama_TV.svg/250px-Hungama_TV.svg.png",
  },
  pogo: {
    id: "pogo",
    name: "Pogo",
    shortName: "PO",
    color: "#2196F3",
    region: "India",
    website: "https://www.pogotv.in",
    dthNumbers: "Tata Play 660, Airtel 664",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/POGO-logo.svg/250px-POGO-logo.svg.png",
  },
  nick: {
    id: "nick",
    name: "Nickelodeon",
    shortName: "NK",
    color: "#FF5722",
    region: "India",
    website: "https://www.nickindia.com",
    dthNumbers: "Tata Play 662, Airtel 661",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Nickelodeon_2023_logo_%28outline%29.svg/250px-Nickelodeon_2023_logo_%28outline%29.svg.png",
  },
  discovery_kids: {
    id: "discovery_kids",
    name: "Discovery Kids",
    shortName: "DK",
    color: "#00BCD4",
    region: "India",
    website: "https://www.discoverykids.in",
    dthNumbers: "Tata Play 664",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Discovery_Kids_2021_2D_sin_wordmark.svg/250px-Discovery_Kids_2021_2D_sin_wordmark.svg.png",
  },
  sony_liv: {
    id: "sony_liv",
    name: "Sony LIV",
    shortName: "SLV",
    color: "#6C28D2",
    region: "India",
    website: "https://www.sonyliv.com",
    type: "youtube",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f7/SonyLIV_2020.png",
  },
  jio_hotstar: {
    id: "jio_hotstar",
    name: "JioHotstar",
    shortName: "JHS",
    color: "#005FA8",
    region: "India",
    website: "https://www.hotstar.com",
    type: "youtube",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/JioHotstar_logo.svg/250px-JioHotstar_logo.svg.png",
  },
  disney_xd: {
    id: "disney_xd",
    name: "Disney XD",
    shortName: "DXD",
    color: "#006BFF",
    region: "India",
    website: "https://www.hotstar.com",
    dthNumbers: "Tata Play 654, Airtel 662",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2015_Disney_XD_logo.svg/250px-2015_Disney_XD_logo.svg.png",
  },
  boomerang: {
    id: "boomerang",
    name: "Boomerang",
    shortName: "BMG",
    color: "#8B5CF6",
    region: "India",
    website: "https://www.boomerang.com",
    dthNumbers: "Tata Play 657, Airtel 667",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Boomerang_2014_logo.svg/250px-Boomerang_2014_logo.svg.png",
  },
  toonami: {
    id: "toonami",
    name: "Toonami (Defunct)",
    shortName: "TNM",
    color: "#9C27B0",
    region: "India",
    website: "https://www.adultswim.com/toonami",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Toonami_logo.svg/250px-Toonami_logo.svg.png",
  },
  muse_asia: {
    id: "muse_asia",
    name: "Muse Asia",
    shortName: "MA",
    color: "#FF0000",
    region: "Asia",
    website: "https://www.youtube.com/@MuseAsia",
    type: "youtube",
    subscriberCount: "8.67M",
    logoUrl: "https://yt3.googleusercontent.com/g0wRRtSUd80WQcCUib0DWVK8CgUcjn_djL9Pg1sC875q9Hjf4CqTK3dvaLW3GBaAPtAXIUa6=s900-c-k-c0x00ffffff-no-rj",
  },
  muse_india: {
    id: "muse_india",
    name: "Muse India",
    shortName: "MI",
    color: "#E91E63",
    region: "India",
    website: "https://www.youtube.com/@MuseIndia",
    type: "youtube",
    subscriberCount: "1.2M",
    logoUrl: "https://yt3.googleusercontent.com/EhiAEsA972_jooWrHY8oLLDS1C9L84-YVNyKclXsNSKB2tYnUqqqi_O10JkcPd64EnaburVG=s900-c-k-c0x00ffffff-no-rj",
  },
  anime_log: {
    id: "anime_log",
    name: "AnimeLog",
    shortName: "AL",
    color: "#3F51B5",
    region: "India",
    website: "https://www.youtube.com/@AnimeLog",
    type: "youtube",
    subscriberCount: "500K",
    logoUrl: "https://yt3.googleusercontent.com/I9RVaPzYoqj5C5E5vi37iztgXIJ0qPXRh8v1JeGrYMblRDeqiMO2Gripfevt3o40F_v2FwbSfEY=s900-c-k-c0x00ffffff-no-rj",
  },
  crunchyroll: {
    id: "crunchyroll",
    name: "Crunchyroll",
    shortName: "CR",
    color: "#F47521",
    region: "India",
    website: "https://www.crunchyroll.com",
    type: "youtube",
    subscriberCount: "15M+",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Crunchyroll_logo_2024.png/250px-Crunchyroll_logo_2024.png",
  },
  netflix_anime: {
    id: "netflix_anime",
    name: "Netflix Anime",
    shortName: "NX",
    color: "#E50914",
    region: "India",
    website: "https://www.netflix.com",
    type: "youtube",
    subscriberCount: "280M+ subs",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/250px-Netflix_2015_logo.svg.png",
  },
  prime_video: {
    id: "prime_video",
    name: "Prime Video Anime",
    shortName: "PV",
    color: "#00A8E1",
    region: "India",
    website: "https://www.primevideo.com",
    type: "youtube",
    subscriberCount: "200M+ subs",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Amazon_Prime_Video_example_screenshot.png/250px-Amazon_Prime_Video_example_screenshot.png",
  },
};

const ANIMAX_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Black Clover", start: "00:00", end: "00:30", duration: 30 },
    { show: "Remake Our Life!", start: "00:30", end: "01:00", duration: 30 },
    { show: "Black Clover", start: "01:00", end: "01:30", duration: 30 },
    { show: "Remake Our Life!", start: "01:30", end: "02:00", duration: 30 },
    { show: "Black Clover", start: "02:00", end: "02:30", duration: 30 },
    { show: "Remake Our Life!", start: "02:30", end: "03:00", duration: 30 },
    { show: "Black Clover", start: "03:00", end: "03:30", duration: 30 },
    { show: "Remake Our Life!", start: "03:30", end: "04:00", duration: 30 },
    { show: "Black Clover", start: "04:00", end: "04:30", duration: 30 },
    { show: "Remake Our Life!", start: "04:30", end: "05:00", duration: 30 },
    { show: "Black Clover", start: "05:00", end: "05:30", duration: 30 },
    { show: "Remake Our Life!", start: "05:30", end: "06:00", duration: 30 },
    { show: "Black Clover", start: "06:00", end: "06:30", duration: 30 },
    { show: "Remake Our Life!", start: "06:30", end: "07:00", duration: 30 },
    { show: "Black Clover", start: "07:00", end: "07:30", duration: 30 },
    { show: "Remake Our Life!", start: "07:30", end: "08:00", duration: 30 },
    { show: "Black Clover", start: "08:00", end: "08:30", duration: 30 },
    { show: "Remake Our Life!", start: "08:30", end: "09:00", duration: 30 },
    { show: "Black Clover", start: "09:00", end: "09:30", duration: 30 },
    { show: "Remake Our Life!", start: "09:30", end: "10:00", duration: 30 },
    { show: "Black Clover", start: "10:00", end: "10:30", duration: 30 },
    { show: "Remake Our Life!", start: "10:30", end: "11:00", duration: 30 },
    { show: "Black Clover", start: "11:00", end: "11:30", duration: 30 },
    { show: "Remake Our Life!", start: "11:30", end: "12:00", duration: 30 },
    { show: "Black Clover", start: "12:00", end: "12:30", duration: 30 },
    { show: "Remake Our Life!", start: "12:30", end: "13:00", duration: 30 },
    { show: "Black Clover", start: "13:00", end: "13:30", duration: 30 },
    { show: "Remake Our Life!", start: "13:30", end: "14:00", duration: 30 },
    { show: "Black Clover", start: "14:00", end: "14:30", duration: 30 },
    { show: "Remake Our Life!", start: "14:30", end: "15:00", duration: 30 },
    { show: "Black Clover", start: "15:00", end: "15:30", duration: 30 },
    { show: "Remake Our Life!", start: "15:30", end: "16:00", duration: 30 },
    { show: "Black Clover", start: "16:00", end: "16:30", duration: 30 },
    { show: "Remake Our Life!", start: "16:30", end: "17:00", duration: 30 },
    { show: "Black Clover", start: "17:00", end: "17:30", duration: 30 },
    { show: "Remake Our Life!", start: "17:30", end: "18:00", duration: 30 },
    { show: "Black Clover", start: "18:00", end: "18:30", duration: 30 },
    { show: "Remake Our Life!", start: "18:30", end: "19:00", duration: 30 },
    { show: "Black Clover", start: "19:00", end: "19:30", duration: 30 },
    { show: "Remake Our Life!", start: "19:30", end: "20:00", duration: 30 },
    { show: "Black Clover", start: "20:00", end: "20:30", duration: 30 },
    { show: "Remake Our Life!", start: "20:30", end: "21:00", duration: 30 },
    { show: "Black Clover", start: "21:00", end: "21:30", duration: 30 },
    { show: "Remake Our Life!", start: "21:30", end: "22:00", duration: 30 },
    { show: "Black Clover", start: "22:00", end: "22:30", duration: 30 },
    { show: "Remake Our Life!", start: "22:30", end: "23:00", duration: 30 },
    { show: "Black Clover", start: "23:00", end: "23:30", duration: 30 },
    { show: "Remake Our Life!", start: "23:30", end: "00:00", duration: 30 },
  ],
};

const CN_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Kiteretsu", start: "04:00", end: "05:00", duration: 60, description: "Kiteretsu and his robot Korosuke" },
    { show: "We Bare Bears", start: "05:00", end: "06:00", duration: 60, description: "Three bear brothers try to integrate with human society" },
    { show: "Lamput", start: "07:00", end: "09:00", duration: 120, description: "Lamput escapes from the fat and skinny scientists" },
    { show: "Maca & Roni", start: "09:30", end: "12:00", duration: 150, description: "Maca and Roni get into funny situations" },
    { show: "Omi No.1", start: "12:00", end: "14:00", duration: 120, description: "Omi, a rich nine-year-old heir, encounters hilarious situations" },
    { show: "Kian and Kiki", start: "14:10", end: "14:30", duration: 20, description: "NEW - Magical adventures of Kian and Kiki" },
    { show: "Teen Titans GO!", start: "14:30", end: "21:30", duration: 420, description: "Quirky young heroes balance crime-fighting with everyday antics" },
    { show: "Teen Titans Go! Special", start: "21:30", end: "22:30", duration: 60, description: "Special compilation of Teen Titans Go!" },
    { show: "Teen Titans GO!", start: "22:30", end: "23:30", duration: 60, description: "Quirky young heroes balance crime-fighting with everyday antics" },
  ],
};

const SONY_YAY_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Shin Chan", start: "00:00", end: "00:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "00:12", end: "00:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "00:24", end: "00:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "00:36", end: "00:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Honey Bunny Ka Jholmaal", start: "00:48", end: "05:33", duration: 285, description: "Twin cats Honey and Bunny go on adventures" },
    { show: "Shin Chan", start: "06:00", end: "06:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "06:12", end: "06:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "06:24", end: "06:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "06:36", end: "06:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "07:00", end: "07:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "07:12", end: "07:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "07:24", end: "07:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "07:36", end: "07:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "08:00", end: "08:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "08:12", end: "08:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "08:24", end: "08:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "08:36", end: "08:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "09:00", end: "09:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "09:12", end: "09:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "09:24", end: "09:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "09:36", end: "09:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "10:00", end: "10:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "10:12", end: "10:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "10:24", end: "10:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "10:36", end: "10:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "11:00", end: "11:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "11:12", end: "11:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "11:24", end: "11:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "11:36", end: "11:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "12:00", end: "12:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "12:12", end: "12:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "12:24", end: "12:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "12:36", end: "12:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "13:00", end: "13:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "13:12", end: "13:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "13:24", end: "13:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "13:36", end: "13:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "14:00", end: "14:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "14:12", end: "14:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "14:24", end: "14:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "14:36", end: "14:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "15:00", end: "15:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "15:12", end: "15:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "15:24", end: "15:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "15:36", end: "15:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "16:00", end: "16:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "16:12", end: "16:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "16:24", end: "16:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "16:36", end: "16:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "17:00", end: "17:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "17:12", end: "17:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "17:24", end: "17:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "17:36", end: "17:48", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Naruto: Shippuden", start: "21:00", end: "21:30", duration: 30, description: "New episode - prime time anime block" },
    { show: "Naruto: Shippuden", start: "21:30", end: "22:00", duration: 30, description: "New episode - prime time anime block" },
    { show: "Jujutsu Kaisen", start: "22:00", end: "22:30", duration: 30, description: "Late night anime block" },
    { show: "Jujutsu Kaisen", start: "22:30", end: "23:00", duration: 30, description: "Late night anime block" },
    { show: "Shin Chan", start: "23:00", end: "23:12", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "23:12", end: "23:24", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "23:24", end: "23:36", duration: 12, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "23:36", end: "23:48", duration: 12, description: "Shin-chan's daily misadventures" },
  ],
};

const HUNGAMA_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Shin Chan", start: "00:00", end: "00:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Atashinchi", start: "00:30", end: "01:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "01:00", end: "01:30", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "01:30", end: "02:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "02:00", end: "02:30", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "02:30", end: "03:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "03:00", end: "03:30", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "03:30", end: "04:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "04:00", end: "04:30", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "04:30", end: "05:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "05:00", end: "05:30", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "05:30", end: "06:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "06:00", end: "06:30", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Atashinchi", start: "06:30", end: "07:00", duration: 30, description: "Mikan, Yuzuhiko and their parents navigate daily life" },
    { show: "Selfie With Bajrangi", start: "07:00", end: "08:00", duration: 60, description: "Ankush's life changes after meeting Bajrangi" },
    { show: "Shin Chan", start: "08:00", end: "08:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "08:30", end: "09:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "09:00", end: "09:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "09:30", end: "10:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "10:00", end: "10:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "10:30", end: "11:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "11:00", end: "11:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "11:30", end: "12:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "12:00", end: "12:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "12:30", end: "13:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "13:00", end: "13:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "13:30", end: "14:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "14:00", end: "14:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "14:30", end: "15:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "15:00", end: "15:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "15:30", end: "16:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "16:00", end: "16:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "16:30", end: "17:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "17:00", end: "17:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "17:30", end: "18:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "18:00", end: "18:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "18:30", end: "19:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "19:00", end: "19:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "19:30", end: "20:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "20:00", end: "20:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "20:30", end: "21:00", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Pokemon", start: "21:00", end: "21:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "21:30", end: "22:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "22:00", end: "22:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "22:30", end: "23:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Shin Chan", start: "23:00", end: "23:30", duration: 30, description: "Shin-chan's daily misadventures" },
    { show: "Shin Chan", start: "23:30", end: "00:00", duration: 30, description: "Shin-chan's daily misadventures" },
  ],
};

const SUPER_HUNGAMA_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Pokemon", start: "00:00", end: "00:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "00:30", end: "01:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "01:00", end: "01:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "01:30", end: "02:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "02:00", end: "02:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "02:30", end: "03:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "03:00", end: "03:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "03:30", end: "04:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "04:00", end: "04:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "04:30", end: "05:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "05:00", end: "05:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "05:30", end: "06:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "06:00", end: "06:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "06:30", end: "07:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Chuck Chicken", start: "07:00", end: "07:30", duration: 30, description: "Chuck and his friends fight crime" },
    { show: "Chuck Chicken", start: "07:30", end: "08:00", duration: 30, description: "Chuck and his friends fight crime" },
    { show: "Pokemon", start: "08:00", end: "08:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "08:30", end: "09:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "09:00", end: "09:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "09:30", end: "10:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "10:00", end: "10:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "10:30", end: "11:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon The Series: XYZ", start: "11:00", end: "11:30", duration: 30, description: "Ash continues his Pokemon journey in Kalos" },
    { show: "Pokemon The Series: XYZ", start: "11:30", end: "12:00", duration: 30, description: "Ash continues his Pokemon journey in Kalos" },
    { show: "Pokemon The Series: XYZ", start: "12:00", end: "12:30", duration: 30, description: "Ash continues his Pokemon journey in Kalos" },
    { show: "Pokemon The Series: XYZ", start: "12:30", end: "13:00", duration: 30, description: "Ash continues his Pokemon journey in Kalos" },
    { show: "Pokemon The Series: XYZ", start: "13:00", end: "13:30", duration: 30, description: "Ash continues his Pokemon journey in Kalos" },
    { show: "Pokemon The Series: XYZ", start: "13:30", end: "14:00", duration: 30, description: "Ash continues his Pokemon journey in Kalos" },
    { show: "Pokemon: Arceus Movie", start: "14:00", end: "15:30", duration: 90, description: "Movie: Arceus arrives to wreak vengeance on humanity" },
    { show: "Pokemon", start: "15:30", end: "16:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "16:00", end: "16:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "16:30", end: "17:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "17:00", end: "17:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "17:30", end: "18:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Inspector Chingum", start: "18:00", end: "18:30", duration: 30, description: "Inspector Chingum fights crime with humor" },
    { show: "Inspector Chingum", start: "18:30", end: "19:00", duration: 30, description: "Inspector Chingum fights crime with humor" },
    { show: "Pokemon", start: "19:00", end: "19:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "19:30", end: "20:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "20:00", end: "20:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "20:30", end: "21:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "21:00", end: "21:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "21:30", end: "22:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "22:00", end: "22:30", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Pokemon", start: "22:30", end: "23:00", duration: 30, description: "A Pokemon master embarks on an adventurous journey" },
    { show: "Chuck Chicken", start: "23:00", end: "23:30", duration: 30, description: "Chuck and his friends fight crime" },
    { show: "Chuck Chicken", start: "23:30", end: "00:00", duration: 30, description: "Chuck and his friends fight crime" },
  ],
};

const POGO_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Smaashhing Simmba", start: "00:00", end: "00:30", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "00:30", end: "01:00", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "01:00", end: "01:30", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "01:30", end: "02:00", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "02:00", end: "02:30", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "02:30", end: "03:00", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "03:00", end: "03:30", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "03:30", end: "04:00", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "04:00", end: "04:30", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Smaashhing Simmba", start: "04:30", end: "05:00", duration: 30, description: "Simmba goes on smashing adventures" },
    { show: "Chhota Bheem", start: "05:00", end: "05:30", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "05:30", end: "06:00", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "06:00", end: "06:30", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "06:30", end: "07:00", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "07:00", end: "07:30", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "07:30", end: "08:00", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "08:00", end: "08:30", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "08:30", end: "09:00", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "09:00", end: "09:30", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Jay Jagannath", start: "09:30", end: "10:15", duration: 45, description: "Mythological stories of Lord Jagannath" },
    { show: "Jay Jagannath", start: "10:15", end: "11:00", duration: 45, description: "Mythological stories of Lord Jagannath" },
    { show: "Chhota Bheem Aur Krishna: Patliputra Movie", start: "11:00", end: "12:15", duration: 75, description: "Movie: Bheem and Krishna travel to Patliputra" },
    { show: "Chhota Bheem aur Krishna: Mayanagari Movie", start: "12:15", end: "13:30", duration: 75, description: "Movie: Bheem and Krishna explore Mayanagari" },
    { show: "Sher Aur Savasher", start: "13:30", end: "14:10", duration: 40, description: "Sher and Savasher go on wild adventures" },
    { show: "Sher Aur Savasher", start: "14:10", end: "14:50", duration: 40, description: "Sher and Savasher go on wild adventures" },
    { show: "Sher Aur Savasher", start: "14:50", end: "15:30", duration: 40, description: "Sher and Savasher go on wild adventures" },
    { show: "Grizzy and the Lemmings", start: "15:30", end: "16:00", duration: 30, description: "Grizzy tries to enjoy life but the Lemmings interfere" },
    { show: "Grizzy and the Lemmings", start: "16:00", end: "16:30", duration: 30, description: "Grizzy tries to enjoy life but the Lemmings interfere" },
    { show: "Grizzy and the Lemmings", start: "16:30", end: "17:00", duration: 30, description: "Grizzy tries to enjoy life but the Lemmings interfere" },
    { show: "Grizzy and the Lemmings", start: "17:00", end: "17:30", duration: 30, description: "Grizzy tries to enjoy life but the Lemmings interfere" },
    { show: "Grizzy and the Lemmings", start: "17:30", end: "18:00", duration: 30, description: "Grizzy tries to enjoy life but the Lemmings interfere" },
    { show: "Grizzy and the Lemmings", start: "18:00", end: "18:30", duration: 30, description: "Grizzy tries to enjoy life but the Lemmings interfere" },
    { show: "Sampat Champat", start: "18:30", end: "19:00", duration: 30, description: "Sampat and Champat get into funny escapades" },
    { show: "Bahubali Friends", start: "19:00", end: "20:10", duration: 70, description: "Movie: Bahubali and friends go on an adventure" },
    { show: "Bahubali Friends", start: "20:10", end: "21:20", duration: 70, description: "Movie: Bahubali and friends go on an adventure" },
    { show: "Bahubali Friends", start: "21:20", end: "22:30", duration: 70, description: "Movie: Bahubali and friends go on an adventure" },
    { show: "Chhota Bheem", start: "22:30", end: "23:00", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "23:00", end: "23:30", duration: 30, description: "Bheem and friends protect Dholakpur" },
    { show: "Chhota Bheem", start: "23:30", end: "00:00", duration: 30, description: "Bheem and friends protect Dholakpur" },
  ],
};

const NICK_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Gattu Aur Battu", start: "01:00", end: "01:30", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "01:30", end: "02:00", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "02:00", end: "02:30", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "02:30", end: "03:00", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "03:00", end: "03:30", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "03:30", end: "04:00", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "04:00", end: "04:30", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "04:30", end: "05:00", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "05:00", end: "05:30", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "05:30", end: "06:00", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Daaduji", start: "07:00", end: "07:15", duration: 15, description: "Daaduji's funny misadventures with family" },
    { show: "Motu Patlu", start: "07:15", end: "07:45", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "07:45", end: "08:15", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "08:15", end: "08:45", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "08:45", end: "09:15", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "09:15", end: "09:45", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "09:45", end: "10:00", duration: 15, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Chikoo Aur Bunty", start: "10:00", end: "10:30", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "10:30", end: "11:00", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "11:00", end: "11:30", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "11:30", end: "12:00", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Bittu Bahanebaaz", start: "12:00", end: "12:30", duration: 30, description: "Bittu always comes up with excuses" },
    { show: "Bittu Bahanebaaz", start: "12:30", end: "13:00", duration: 30, description: "Bittu always comes up with excuses" },
    { show: "Motu Patlu", start: "13:00", end: "13:30", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu Movie", start: "13:30", end: "15:00", duration: 90, description: "Movie: Motu and Patlu's biggest adventure" },
    { show: "Motu Patlu", start: "15:00", end: "15:30", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "15:30", end: "16:00", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Chikoo Aur Bunty", start: "16:00", end: "16:30", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "16:30", end: "17:00", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "17:00", end: "17:30", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "17:30", end: "18:00", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "18:00", end: "18:30", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "18:30", end: "19:00", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Chikoo Aur Bunty", start: "19:00", end: "19:30", duration: 30, description: "Chikoo and Bunty get into mischief" },
    { show: "Motu Patlu", start: "19:30", end: "20:00", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "20:00", end: "20:30", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "20:30", end: "21:00", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "21:00", end: "21:30", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "21:30", end: "22:00", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "22:00", end: "22:30", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Motu Patlu", start: "22:30", end: "23:00", duration: 30, description: "Motu and Patlu try to save Furfuri Nagar" },
    { show: "Gattu Aur Battu", start: "23:00", end: "23:30", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "23:30", end: "00:00", duration: 30, description: "Gattu and Battu go on fun adventures" },
    { show: "Gattu Aur Battu", start: "00:00", end: "01:00", duration: 60, description: "Gattu and Battu go on fun adventures" },
  ],
};

const DISCOVERY_KIDS_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Little Singham", start: "00:06", end: "00:18", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Baby Little Singham", start: "00:18", end: "00:30", duration: 12, description: "Baby Singham goes on adorable adventures" },
    { show: "Smaashhing Simmba", start: "00:30", end: "00:42", duration: 12, description: "Simmba goes on smashing adventures" },
    { show: "Titoo", start: "00:42", end: "00:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Kris Roll No 21", start: "00:54", end: "01:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Little Singham", start: "01:06", end: "01:18", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Baby Little Singham", start: "01:18", end: "01:30", duration: 12, description: "Baby Singham goes on adorable adventures" },
    { show: "Smaashhing Simmba", start: "01:30", end: "01:42", duration: 12, description: "Simmba goes on smashing adventures" },
    { show: "Titoo", start: "01:42", end: "01:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Kris Roll No 21", start: "01:54", end: "02:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Little Singham", start: "02:06", end: "02:18", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Baby Little Singham", start: "02:18", end: "02:30", duration: 12, description: "Baby Singham goes on adorable adventures" },
    { show: "Smaashhing Simmba", start: "02:30", end: "02:42", duration: 12, description: "Simmba goes on smashing adventures" },
    { show: "Titoo", start: "02:42", end: "02:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Kris Roll No 21", start: "02:54", end: "03:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Little Singham", start: "03:06", end: "03:18", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Baby Little Singham", start: "03:18", end: "03:30", duration: 12, description: "Baby Singham goes on adorable adventures" },
    { show: "Smaashhing Simmba", start: "03:30", end: "03:42", duration: 12, description: "Simmba goes on smashing adventures" },
    { show: "Titoo", start: "03:42", end: "03:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Kris Roll No 21", start: "03:54", end: "04:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Little Singham", start: "04:06", end: "04:18", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Baby Little Singham", start: "04:18", end: "04:30", duration: 12, description: "Baby Singham goes on adorable adventures" },
    { show: "Smaashhing Simmba", start: "04:30", end: "04:42", duration: 12, description: "Simmba goes on smashing adventures" },
    { show: "Titoo", start: "04:42", end: "04:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Kris Roll No 21", start: "04:54", end: "05:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Little Singham", start: "05:06", end: "05:18", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Baby Little Singham", start: "05:18", end: "05:30", duration: 12, description: "Baby Singham goes on adorable adventures" },
    { show: "Smaashhing Simmba", start: "05:30", end: "05:42", duration: 12, description: "Simmba goes on smashing adventures" },
    { show: "Titoo", start: "05:42", end: "05:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Kris Roll No 21", start: "05:54", end: "06:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "06:06", end: "06:18", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "06:18", end: "06:30", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "06:30", end: "06:42", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "06:42", end: "06:54", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "06:54", end: "07:06", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "07:06", end: "07:18", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "07:18", end: "07:30", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "07:30", end: "07:42", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Kris Roll No 21", start: "07:42", end: "07:54", duration: 12, description: "Kris and Chum Chum's classroom adventures" },
    { show: "Titoo", start: "07:54", end: "08:06", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "08:06", end: "08:18", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "08:18", end: "08:30", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "08:30", end: "08:42", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "08:42", end: "08:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "08:54", end: "09:06", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "09:06", end: "09:18", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "09:18", end: "09:30", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "09:30", end: "09:42", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "09:42", end: "09:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "09:54", end: "10:06", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "10:06", end: "10:18", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "10:18", end: "10:30", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "10:30", end: "10:42", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "10:42", end: "10:54", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "10:54", end: "11:06", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "11:06", end: "11:18", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "11:18", end: "11:28", duration: 10, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Bandbudh Aur Budbak", start: "11:28", end: "11:40", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "11:40", end: "11:52", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "11:52", end: "12:04", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "12:04", end: "12:16", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "12:16", end: "12:28", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "12:28", end: "12:40", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "12:40", end: "12:52", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "12:52", end: "13:00", duration: 8, description: "Two naughty friends and their funny antics" },
    { show: "Titoo", start: "13:00", end: "13:12", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "13:12", end: "13:24", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "13:24", end: "13:36", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "13:36", end: "13:48", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "13:48", end: "14:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "14:00", end: "14:12", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "14:12", end: "14:24", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "14:24", end: "14:36", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "14:36", end: "14:48", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "14:48", end: "15:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "15:00", end: "15:12", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "15:12", end: "15:24", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "15:24", end: "15:36", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "15:36", end: "15:48", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "15:48", end: "16:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "16:00", end: "16:12", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "16:12", end: "16:21", duration: 9, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Bandbudh Aur Budbak", start: "16:21", end: "16:33", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "16:33", end: "16:45", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "16:45", end: "16:57", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "16:57", end: "17:09", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "17:09", end: "17:21", duration: 12, description: "Two naughty friends and their funny antics" },
    { show: "Bandbudh Aur Budbak", start: "17:21", end: "17:30", duration: 9, description: "Two naughty friends and their funny antics" },
    { show: "Fukrey Boyzzz", start: "17:30", end: "17:42", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Kian And Kiki", start: "17:42", end: "17:54", duration: 12, description: "Magical adventures of Kian and Kiki" },
    { show: "Fukrey Boyzzz", start: "17:54", end: "18:06", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Kian And Kiki", start: "18:06", end: "18:18", duration: 12, description: "Magical adventures of Kian and Kiki" },
    { show: "Fukrey Boyzzz", start: "18:18", end: "18:30", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Kian And Kiki", start: "18:30", end: "18:36", duration: 6, description: "Magical adventures of Kian and Kiki" },
    { show: "Titoo", start: "18:36", end: "18:48", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "18:48", end: "19:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "19:00", end: "19:12", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "19:12", end: "19:24", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Titoo", start: "19:24", end: "19:36", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "19:36", end: "19:48", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Titoo", start: "19:48", end: "20:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "20:00", end: "20:12", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Titoo", start: "20:12", end: "20:24", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Little Singham", start: "20:24", end: "20:36", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Little Singham", start: "20:36", end: "20:48", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Titoo", start: "20:48", end: "21:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Titoo", start: "21:00", end: "21:12", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "21:12", end: "21:24", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Titoo", start: "21:24", end: "21:36", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "21:36", end: "21:48", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Little Singham", start: "21:48", end: "22:00", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Little Singham", start: "22:00", end: "22:12", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Titoo", start: "22:12", end: "22:24", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "22:24", end: "22:36", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Little Singham", start: "22:36", end: "22:48", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Titoo", start: "22:48", end: "23:00", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "23:00", end: "23:12", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Little Singham", start: "23:12", end: "23:24", duration: 12, description: "Young police officer Little Singham fights crime" },
    { show: "Titoo", start: "23:24", end: "23:36", duration: 12, description: "Titoo's hilarious schemes with Guruji" },
    { show: "Fukrey Boyzzz", start: "23:36", end: "23:48", duration: 12, description: "Fukrey friends go on hilarious misadventures" },
    { show: "Little Singham", start: "23:48", end: "23:54", duration: 6, description: "Young police officer Little Singham fights crime" },
  ],
};

const MUSE_ASIA_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [
    { show: "KAIJU GIRL CARAMELISE", start: "19:00", end: "19:30", duration: 30, description: "New episode - Thursdays" },
    { show: "The Exiled Heavy Knight", start: "19:30", end: "20:00", duration: 30, description: "New episode - Thursdays" },
    { show: "BanG Dream! YUME INFINITA", start: "20:00", end: "20:30", duration: 30, description: "New episode - Thursdays" },
  ],
  Friday: [
    { show: "Draw This, Then Die!", start: "19:00", end: "19:30", duration: 30, description: "New episode - Fridays" },
    { show: "The Elusive Samurai S2", start: "19:30", end: "20:00", duration: 30, description: "Premiere - Friday Jul 17" },
  ],
  Saturday: [
    { show: "BLACK TORCH", start: "19:00", end: "19:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Skeleton Knight in Another World S2", start: "19:30", end: "20:00", duration: 30, description: "New episode - Saturdays" },
    { show: "GROW UP SHOW -Sunflower Circus-", start: "20:00", end: "20:30", duration: 30, description: "New episode - Saturdays" },
  ],
  Sunday: [
    { show: "Mushoku Tensei: Jobless Reincarnation S3", start: "10:00", end: "10:30", duration: 30, description: "New episode - Sundays" },
    { show: "The 100 Girlfriends S3", start: "10:30", end: "11:00", duration: 30, description: "New episode - Sundays" },
    { show: "The World's Strongest Rearguard", start: "11:00", end: "11:30", duration: 30, description: "New episode - Sundays" },
    { show: "The World Is Dancing", start: "21:30", end: "22:00", duration: 30, description: "New episode - Sundays 9:30PM GMT+8" },
  ],
};

const MUSE_INDIA_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [
    { show: "KAIJU GIRL CARAMELISE (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Thursdays" },
    { show: "The Exiled Heavy Knight (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "New episode - Thursdays" },
    { show: "BanG Dream! YUME INFINITA (Hindi Sub)", start: "21:30", end: "22:00", duration: 30, description: "New episode - Thursdays" },
  ],
  Friday: [
    { show: "Draw This, Then Die! (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Fridays" },
    { show: "The Elusive Samurai S2 (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "Premiere - Friday Jul 17" },
  ],
  Saturday: [
    { show: "BLACK TORCH (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Skeleton Knight in Another World S2 (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "New episode - Saturdays" },
    { show: "GROW UP SHOW (Hindi Sub)", start: "21:30", end: "22:00", duration: 30, description: "New episode - Saturdays" },
  ],
  Sunday: [
    { show: "Mushoku Tensei S3 (Hindi Sub)", start: "20:00", end: "20:30", duration: 30, description: "New episode - Sundays" },
    { show: "The 100 Girlfriends S3 (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Sundays" },
    { show: "The World's Strongest Rearguard (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "New episode - Sundays" },
  ],
};

const ANIMELOG_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Naruto", start: "10:00", end: "10:30", duration: 30, description: "Classic Series - Library" },
    { show: "Dragon Ball Z", start: "11:00", end: "11:30", duration: 30, description: "Classic Series - Library" },
    { show: "One Piece", start: "12:00", end: "12:30", duration: 30, description: "Classic Series - Library" },
    { show: "Death Note", start: "13:00", end: "13:30", duration: 30, description: "Classic Series - Library" },
    { show: "Fullmetal Alchemist", start: "14:00", end: "14:30", duration: 30, description: "Classic Series - Library" },
    { show: "Inuyasha", start: "15:00", end: "15:30", duration: 30, description: "Classic Series - Library" },
    { show: "Yu Yu Hakusho", start: "16:00", end: "16:30", duration: 30, description: "Classic Series - Library" },
    { show: "Cowboy Bebop", start: "17:00", end: "17:30", duration: 30, description: "Classic Series - Library" },
  ],
};

const SONY_LIV_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Liar Game Cour 2 (Hindi Dub)", start: "18:00", end: "18:30", duration: 30, description: "New dubbed episode - Mondays 6PM IST (Sony LIV Crunchyroll add-on)" },
    { show: "Grand Blue Dreaming S3 (Hindi Dub)", start: "18:30", end: "19:00", duration: 30, description: "New dubbed episode - Mondays (Sony LIV Crunchyroll add-on)" },
  ],
};

const DISNEY_XD_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Marvel's Spider-Man", start: "06:00", end: "06:30", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Big Hero 6 The Series", start: "06:30", end: "07:00", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Star Wars Rebels", start: "07:00", end: "07:30", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Gravity Falls", start: "07:30", end: "08:00", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Pac-Man and the Ghostly Adventures", start: "08:00", end: "08:30", duration: 30, description: "Pac-Man fights ghosts in Pac-World" },
    { show: "Marvel's Spider-Man", start: "08:30", end: "09:00", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Big Hero 6 The Series", start: "09:00", end: "09:30", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Star Wars Rebels", start: "09:30", end: "10:00", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Gravity Falls", start: "10:00", end: "10:30", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Pac-Man and the Ghostly Adventures", start: "10:30", end: "11:00", duration: 30, description: "Pac-Man fights ghosts in Pac-World" },
    { show: "Marvel's Spider-Man", start: "11:00", end: "11:30", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Big Hero 6 The Series", start: "11:30", end: "12:00", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Star Wars Rebels", start: "12:00", end: "12:30", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Gravity Falls", start: "12:30", end: "13:00", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Pac-Man and the Ghostly Adventures", start: "13:00", end: "13:30", duration: 30, description: "Pac-Man fights ghosts in Pac-World" },
    { show: "Marvel's Spider-Man", start: "13:30", end: "14:00", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Big Hero 6 The Series", start: "14:00", end: "14:30", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Star Wars Rebels", start: "14:30", end: "15:00", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Gravity Falls", start: "15:00", end: "15:30", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Pac-Man and the Ghostly Adventures", start: "15:30", end: "16:00", duration: 30, description: "Pac-Man fights ghosts in Pac-World" },
    { show: "Marvel's Spider-Man", start: "16:00", end: "16:30", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Big Hero 6 The Series", start: "16:30", end: "17:00", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Star Wars Rebels", start: "17:00", end: "17:30", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Gravity Falls", start: "17:30", end: "18:00", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Pac-Man and the Ghostly Adventures", start: "18:00", end: "18:30", duration: 30, description: "Pac-Man fights ghosts in Pac-World" },
    { show: "Marvel's Spider-Man", start: "18:30", end: "19:00", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Big Hero 6 The Series", start: "19:00", end: "19:30", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Star Wars Rebels", start: "19:30", end: "20:00", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Gravity Falls", start: "20:00", end: "20:30", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Pac-Man and the Ghostly Adventures", start: "20:30", end: "21:00", duration: 30, description: "Pac-Man fights ghosts in Pac-World" },
    { show: "Marvel's Spider-Man", start: "21:00", end: "21:30", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
    { show: "Gravity Falls", start: "21:30", end: "22:00", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Star Wars Rebels", start: "22:00", end: "22:30", duration: 30, description: "Ezra and the Ghost crew fight the Empire" },
    { show: "Big Hero 6 The Series", start: "22:30", end: "23:00", duration: 30, description: "Hiro and Baymax protect San Fransokyo" },
    { show: "Gravity Falls", start: "23:00", end: "23:30", duration: 30, description: "Dipper and Mabel explore Gravity Falls mysteries" },
    { show: "Marvel's Spider-Man", start: "23:30", end: "00:00", duration: 30, description: "Peter Parker balances school and being Spider-Man" },
  ],
};

const BOOMERANG_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Tom and Jerry", start: "06:00", end: "06:30", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "06:30", end: "07:00", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "07:00", end: "07:30", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "07:30", end: "08:00", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "08:00", end: "08:30", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "08:30", end: "09:00", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "09:00", end: "09:30", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "09:30", end: "10:00", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "10:00", end: "10:30", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "10:30", end: "11:00", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "11:00", end: "11:30", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "11:30", end: "12:00", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "12:00", end: "12:30", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "12:30", end: "13:00", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "13:00", end: "13:30", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "13:30", end: "14:00", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "14:00", end: "14:30", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "14:30", end: "15:00", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "15:00", end: "15:30", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "15:30", end: "16:00", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "16:00", end: "16:30", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "16:30", end: "17:00", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "17:00", end: "17:30", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "17:30", end: "18:00", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "18:00", end: "18:30", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "18:30", end: "19:00", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "19:00", end: "19:30", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "19:30", end: "20:00", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "20:00", end: "20:30", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "20:30", end: "21:00", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "21:00", end: "21:30", duration: 30, description: "Classic cat and mouse chase adventures" },
    { show: "Looney Tunes", start: "21:30", end: "22:00", duration: 30, description: "Bugs Bunny, Daffy Duck and friends" },
    { show: "Scooby-Doo, Where Are You!", start: "22:00", end: "22:30", duration: 30, description: "Mystery Inc. solves spooky mysteries" },
    { show: "Mr. Bean: The Animated Series", start: "22:30", end: "23:00", duration: 30, description: "Mr. Bean's animated misadventures" },
    { show: "The Flintstones", start: "23:00", end: "23:30", duration: 30, description: "Life in the prehistoric town of Bedrock" },
    { show: "Tom and Jerry", start: "23:30", end: "00:00", duration: 30, description: "Classic cat and mouse chase adventures" },
  ],
};

const TOONAMI_DAILY: DaySchedule = {
  day: "Monday",
  slots: [
    { show: "Dragon Ball Z", start: "06:00", end: "06:30", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "06:30", end: "07:00", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "07:00", end: "07:30", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "07:30", end: "08:00", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "08:00", end: "08:30", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "08:30", end: "09:00", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "09:00", end: "09:30", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "09:30", end: "10:00", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "10:00", end: "10:30", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "10:30", end: "11:00", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "11:00", end: "11:30", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "11:30", end: "12:00", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "12:00", end: "12:30", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "12:30", end: "13:00", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "13:00", end: "13:30", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "13:30", end: "14:00", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "14:00", end: "14:30", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "14:30", end: "15:00", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "15:00", end: "15:30", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "15:30", end: "16:00", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "16:00", end: "16:30", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "16:30", end: "17:00", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "17:00", end: "17:30", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "17:30", end: "18:00", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "18:00", end: "18:30", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "18:30", end: "19:00", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "19:00", end: "19:30", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "19:30", end: "20:00", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "20:00", end: "20:30", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "20:30", end: "21:00", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "21:00", end: "21:30", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
    { show: "Naruto", start: "21:30", end: "22:00", duration: 30, description: "Naruto's journey to become Hokage" },
    { show: "One Piece", start: "22:00", end: "22:30", duration: 30, description: "Luffy and his pirates search for the One Piece" },
    { show: "Bleach", start: "22:30", end: "23:00", duration: 30, description: "Ichigo gains Soul Reaper powers" },
    { show: "Attack on Titan", start: "23:00", end: "23:30", duration: 30, description: "Humanity fights for survival against Titans" },
    { show: "Dragon Ball Z", start: "23:30", end: "00:00", duration: 30, description: "Goku and friends defend Earth from powerful foes" },
  ],
};

const CRUNCHYROLL_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [
    { show: "Love Unseen Beneath the Clear Night Sky", start: "16:00", end: "16:30", duration: 30, description: "New episode - Mondays" },
    { show: "The Insipid Prince's Furtive Grab for The Throne", start: "16:30", end: "17:00", duration: 30, description: "New episode - Mondays" },
    { show: "Grand Blue Dreaming S3", start: "17:00", end: "17:30", duration: 30, description: "New episode - Mondays" },
    { show: "LIAR GAME", start: "17:30", end: "18:00", duration: 30, description: "New episode - Mondays" },
    { show: "A Livid Lady's Guide to Getting Even", start: "18:00", end: "18:30", duration: 30, description: "New episode - Mondays" },
  ],
  Tuesday: [
    { show: "The Oblivious Saint Can't Contain Her Power", start: "17:00", end: "17:30", duration: 30, description: "New episode - Tuesdays" },
    { show: "Yoroi-Shinden Samurai Troopers Part 2", start: "17:30", end: "18:00", duration: 30, description: "New episode - Tuesdays" },
    { show: "Victoria of Many Faces", start: "18:00", end: "18:30", duration: 30, description: "New episode - Tuesdays" },
    { show: "I Want to Love You Till Your Dying Day", start: "18:30", end: "19:00", duration: 30, description: "New episode - Tuesdays" },
    { show: "Young Ladies Don't Play Fighting Games", start: "19:00", end: "19:30", duration: 30, description: "New episode - Tuesdays" },
    { show: "Red River", start: "19:30", end: "20:00", duration: 30, description: "New episode - Tuesdays" },
  ],
  Wednesday: [
    { show: "Heroine? Saint? No, I'm an All-Works Maid!", start: "16:00", end: "16:30", duration: 30, description: "New episode - Wednesdays" },
    { show: "Hana-Kimi Season 2", start: "16:30", end: "17:00", duration: 30, description: "New episode - Wednesdays" },
    { show: "The Villager of Level 999", start: "17:00", end: "17:30", duration: 30, description: "New episode - Wednesdays" },
    { show: "Clevatess S2", start: "17:30", end: "18:00", duration: 30, description: "New episode - Wednesdays" },
    { show: "Tomb Raider King", start: "18:00", end: "18:30", duration: 30, description: "New episode - Wednesdays" },
    { show: "Saga of Tanya the Evil II", start: "18:30", end: "19:00", duration: 30, description: "New episode - Wednesdays" },
    { show: "Trapped in a Dating Sim S2", start: "19:00", end: "19:30", duration: 30, description: "New episode - Wednesdays" },
  ],
  Thursday: [
    { show: "From Overshadowed to Overpowered", start: "17:00", end: "17:30", duration: 30, description: "New episode - Thursdays" },
    { show: "Dara-san of Reiwa", start: "17:30", end: "18:00", duration: 30, description: "New episode - Thursdays" },
    { show: "KAIJU GIRL CARAMELISE", start: "18:00", end: "18:30", duration: 30, description: "New episode - Thursdays" },
    { show: "Bungo Stray Dogs WAN! 2", start: "18:30", end: "19:00", duration: 30, description: "New episode - Thursdays" },
    { show: "The Exiled Heavy Knight", start: "19:00", end: "19:30", duration: 30, description: "New episode - Thursdays" },
    { show: "BanG Dream! YUME INFINITA", start: "19:30", end: "20:00", duration: 30, description: "New episode - Thursdays" },
    { show: "Crowned in a Hundred Days", start: "20:00", end: "20:30", duration: 30, description: "New episode - Thursdays" },
    { show: "Smoking Behind the Supermarket with You", start: "20:30", end: "21:00", duration: 30, description: "New episode - Thursdays" },
    { show: "MEBIUS DUST", start: "21:00", end: "21:30", duration: 30, description: "New episode - Thursdays" },
  ],
  Friday: [
    { show: "Sorry About My Little Brothers", start: "16:00", end: "16:30", duration: 30, description: "New episode - Fridays" },
    { show: "I Became a Legend After My 10 Year-Long Last Stand", start: "16:30", end: "17:00", duration: 30, description: "New episode - Fridays" },
    { show: "Draw This, Then Die!", start: "17:00", end: "17:30", duration: 30, description: "New episode - Fridays" },
    { show: "The Frontier Lord Begins with Zero Subjects", start: "17:30", end: "18:00", duration: 30, description: "New episode - Fridays" },
    { show: "The Elusive Samurai S2", start: "18:00", end: "18:30", duration: 30, description: "Premiere - Friday Jul 17" },
    { show: "That Time I Got Reincarnated as a Slime S4", start: "18:30", end: "19:00", duration: 30, description: "New episode - Fridays" },
    { show: "RILAKKUMA", start: "19:00", end: "19:30", duration: 30, description: "New episode - Fridays" },
    { show: "The Drops of God", start: "19:30", end: "20:00", duration: 30, description: "New episode - Fridays" },
  ],
  Saturday: [
    { show: "BLACK TORCH", start: "13:00", end: "13:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Skeleton Knight in Another World S2", start: "13:30", end: "14:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Jaadugar: A Witch in Mongolia", start: "16:00", end: "16:30", duration: 30, description: "New episode - Saturdays" },
    { show: "The Cat and the Dragon", start: "16:30", end: "17:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Magical Girl Lyrical Nanoha EXCEEDS", start: "17:00", end: "17:30", duration: 30, description: "New episode - Saturdays" },
    { show: "The Ogre's Bride", start: "17:30", end: "18:00", duration: 30, description: "New episode - Saturdays" },
    { show: "GROW UP SHOW -Sunflower Circus-", start: "18:00", end: "18:30", duration: 30, description: "New episode - Saturdays" },
    { show: "The Duke's Son Claims He Won't Love Me Yet", start: "18:30", end: "19:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Rich Girl Caretaker", start: "19:00", end: "19:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Recommendations from Iwamoto-Senpai", start: "19:30", end: "20:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Hanaori-san Still Wants to Fight", start: "20:00", end: "20:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Ascendance of a Bookworm", start: "20:30", end: "21:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Daemons of the Shadow Realm", start: "21:00", end: "21:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Digimon Beatbreak", start: "21:30", end: "22:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Star Detective Precure!", start: "22:00", end: "22:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Welcome to Demon School! Iruma-kun S4", start: "22:30", end: "23:00", duration: 30, description: "New episode - Saturdays" },
  ],
  Sunday: [
    { show: "Mushoku Tensei: Jobless Reincarnation S3", start: "16:00", end: "16:30", duration: 30, description: "New episode - Sundays" },
    { show: "You and I Are Polar Opposites S2", start: "16:30", end: "17:00", duration: 30, description: "New episode - Sundays" },
    { show: "Goodbye, Lara", start: "17:00", end: "17:30", duration: 30, description: "New episode - Sundays" },
    { show: "Anime AzurLane: Slow Ahead! Season 2", start: "17:30", end: "18:00", duration: 30, description: "New episode - Sundays" },
    { show: "The World's Strongest Rearguard", start: "18:00", end: "18:30", duration: 30, description: "New episode - Sundays" },
    { show: "One Piece HEROINES", start: "18:30", end: "19:00", duration: 30, description: "New episode - Sundays" },
    { show: "Let's Go KAIKIGUMI", start: "19:00", end: "19:30", duration: 30, description: "New episode - Sundays" },
    { show: "Iron Wok Jan!", start: "19:30", end: "20:00", duration: 30, description: "New episode - Sundays" },
    { show: "The 100 Girlfriends S3", start: "20:00", end: "20:30", duration: 30, description: "New episode - Sundays" },
    { show: "Though I Am an Inept Villainess", start: "20:30", end: "21:00", duration: 30, description: "New episode - Sundays" },
    { show: "ONE PIECE", start: "21:00", end: "21:30", duration: 30, description: "New episode - Sundays" },
    { show: "The Classroom of a Black Cat and a Witch", start: "21:30", end: "22:00", duration: 30, description: "New episode - Sundays" },
    { show: "Case Closed", start: "22:00", end: "22:30", duration: 30, description: "New episode - Sundays" },
  ],
};

const NETFLIX_ANIME_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [
    { show: "Thunder 3", start: "18:00", end: "18:30", duration: 30, description: "New episode - Wednesdays (Netflix)" },
  ],
  Thursday: [
    { show: "Chainsmoker Cat", start: "18:00", end: "18:30", duration: 30, description: "New episode - Thursdays (Netflix)" },
  ],
  Friday: [],
  Saturday: [
    { show: "Daemons of the Shadow Realm", start: "18:00", end: "18:30", duration: 30, description: "New episode - Saturdays (Netflix, from Jul 4)" },
  ],
  Sunday: [
    { show: "Sparks of Tomorrow (KyoAni)", start: "18:00", end: "18:30", duration: 30, description: "New episode - Sundays (Netflix Original)" },
    { show: "Akane-Banashi", start: "18:30", end: "19:00", duration: 30, description: "New episode - Sundays (Netflix simulcast)" },
  ],
};

const PRIME_VIDEO_ANIME_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [
    { show: "The Ghost in the Shell (Science SARU)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Mondays 8:30PM IST (Prime Video exclusive)" },
  ],
  Tuesday: [],
  Wednesday: [
    { show: "From Old Country Bumpkin to Master Swordsman S2", start: "18:00", end: "18:30", duration: 30, description: "New episode - Wednesdays (Prime Video)" },
  ],
  Thursday: [],
  Friday: [],
  Saturday: [
    { show: "Magilumiere Magical Girls Inc. S2", start: "19:00", end: "19:30", duration: 30, description: "New episode - Saturdays (Prime Video)" },
  ],
  Sunday: [],
};

const JIO_HOTSTAR_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function cloneScheduleForDay(day: string, template: DaySchedule): DaySchedule {
  return { day, slots: [...template.slots] };
}

export const CHANNEL_SCHEDULES: ChannelSchedule[] = [
  {
    channelId: "animax",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...ANIMAX_DAILY, day: d })),
  },
  {
    channelId: "cn",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...CN_DAILY, day: d })),
  },
  {
    channelId: "sony_yay",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...SONY_YAY_DAILY, day: d })),
  },
  {
    channelId: "hungama",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...HUNGAMA_DAILY, day: d })),
  },
  {
    channelId: "super_hungama",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...SUPER_HUNGAMA_DAILY, day: d })),
  },
  {
    channelId: "pogo",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...POGO_DAILY, day: d })),
  },
  {
    channelId: "nick",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...NICK_DAILY, day: d })),
  },
  {
    channelId: "discovery_kids",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...DISCOVERY_KIDS_DAILY, day: d })),
  },
  {
    channelId: "muse_asia",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: MUSE_ASIA_WEEKLY[d] || [] })),
  },
  {
    channelId: "muse_india",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: MUSE_INDIA_WEEKLY[d] || [] })),
  },
  {
    channelId: "anime_log",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...ANIMELOG_DAILY, day: d })),
  },
  {
    channelId: "sony_liv",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...SONY_LIV_DAILY, day: d })),
  },
  {
    channelId: "disney_xd",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...DISNEY_XD_DAILY, day: d })),
  },
  {
    channelId: "boomerang",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...BOOMERANG_DAILY, day: d })),
  },
  {
    channelId: "toonami",
    schedules: ALL_DAYS.map((d) => cloneScheduleForDay(d, { ...TOONAMI_DAILY, day: d })),
  },
  {
    channelId: "crunchyroll",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: CRUNCHYROLL_WEEKLY[d] || [] })),
  },
  {
    channelId: "netflix_anime",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: NETFLIX_ANIME_WEEKLY[d] || [] })),
  },
  {
    channelId: "prime_video",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: PRIME_VIDEO_ANIME_WEEKLY[d] || [] })),
  },
  {
    channelId: "jio_hotstar",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: JIO_HOTSTAR_WEEKLY[d] || [] })),
  },
];

export function getScheduleForChannel(channelId: string, day?: string): DaySchedule | undefined {
  const channelSchedule = CHANNEL_SCHEDULES.find((cs) => cs.channelId === channelId);
  if (!channelSchedule) return undefined;
  const dayName = day || getDayName();
  return channelSchedule.schedules.find((s) => s.day === dayName);
}

export function getTodaySchedule(): { channel: TvChannel; slots: TimeSlot[] }[] {
  const today = getDayName();
  return CHANNEL_SCHEDULES.map((cs) => {
    const channel = TV_CHANNELS[cs.channelId];
    const schedule = cs.schedules.find((s) => s.day === today);
    return { channel, slots: schedule?.slots || [] };
  }).filter((item) => item.slots.length > 0);
}

export function getNowPlaying(): { channel: TvChannel; slot: TimeSlot }[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getDayName();

  return CHANNEL_SCHEDULES.map((cs) => {
    const channel = TV_CHANNELS[cs.channelId];
    if (!channel) return null;

    const isStreaming = channel.type === "youtube";
    if (isStreaming) return null;

    const schedule = cs.schedules.find((s) => s.day === today);
    if (!schedule) return null;

    const currentSlot = schedule.slots.find((slot) => {
      const [startH, startM] = slot.start.split(":").map(Number);
      const [endH, endM] = slot.end.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      if (endMinutes === 0 && startMinutes > 0) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });

    if (!currentSlot) return null;
    return { channel, slot: currentSlot };
  }).filter((item): item is { channel: TvChannel; slot: TimeSlot } => item !== null);
}

export function getDayName(date?: Date): string {
  const d = date || new Date();
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

export function getNext7Days(): string[] {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date().getDay();
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    result.push(days[(today + i) % 7]);
  }
  return result;
}

export function findAnimeSchedule(title: string): { channelId: string; slots: TimeSlot[] }[] {
  if (!title) return [];
  const normalized = title.toLowerCase().trim();
  const results: { channelId: string; slots: TimeSlot[] }[] = [];

  for (const cs of CHANNEL_SCHEDULES) {
    const channel = TV_CHANNELS[cs.channelId];
    if (channel?.type === "youtube") continue;
    const todaySchedule = cs.schedules.find((s) => s.day === getDayName());
    if (!todaySchedule) continue;

    const matchingSlots = todaySchedule.slots.filter((slot) => {
      const slotLower = slot.show.toLowerCase();
      return slotLower.includes(normalized) || normalized.includes(slotLower);
    });

    if (matchingSlots.length > 0) {
      results.push({ channelId: cs.channelId, slots: matchingSlots });
    }
  }

  return results;
}
