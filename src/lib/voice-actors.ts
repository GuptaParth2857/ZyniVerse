import { getStaffBasic, getStaffMedia, bestTitle, searchStaff } from "./anilist";
import type { StaffFull } from "./anilist";
import { logError } from "@/lib/logger";

export interface VoiceActor {
  id: number;
  name: string;
  nativeName?: string;
  image: string;
  age?: number;
  birthDate?: string;
  birthplace?: string;
  bloodType?: string;
  height?: string;
  agency?: string;
  bio?: string;
  roles: VoiceActorRole[];
  isIndian?: boolean;
  languages?: string[];
}

export interface VoiceActorRole {
  animeId: number;
  animeTitle: string;
  animeImage: string;
  characterName: string;
  characterImage: string;
  roleType: "main" | "supporting" | "guest";
  language: string;
}

function stripHtml(str = ""): string {
  return str.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

function formatBirthday(dob: { year?: number; month?: number; day?: number } | undefined | null): string | undefined {
  if (!dob?.month && !dob?.day) return undefined;
  const d = new Date(2000, (dob.month || 1) - 1, dob.day || 1);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + (dob.year ? `, ${dob.year}` : "");
}

function roleTypeFromAnilist(role?: string): "main" | "supporting" | "guest" {
  const r = role?.toLowerCase() || "";
  if (r === "main" || r === "protagonist") return "main";
  if (r === "supporting") return "supporting";
  return "guest";
}

function mapStaffToVoiceActor(staff: StaffFull): VoiceActor {
  const mediaResult = staff.staffMedia;
  const allEdges = mediaResult?.edges || [];
  const seenRoles = new Set<string>();
  const roles: VoiceActorRole[] = [];

  for (const edge of allEdges) {
    const charName = edge.characterRole || edge.staffRole || "Unknown";
    const key = `${edge.node.id}-${charName}`;
    if (seenRoles.has(key)) continue;
    seenRoles.add(key);

    roles.push({
      animeId: edge.node.id,
      animeTitle: bestTitle(edge.node.title),
      animeImage: edge.node.coverImage?.large || "",
      characterName: charName,
      characterImage: "",
      roleType: roleTypeFromAnilist(edge.characterRole),
      language: "Japanese",
    });
  }

  return {
    id: staff.id,
    name: staff.name?.full || "Unknown",
    nativeName: staff.name?.native || undefined,
    image: staff.image?.large || staff.image?.medium || "",
    age: staff.age ? parseInt(staff.age) || undefined : undefined,
    birthDate: formatBirthday(staff.dateOfBirth),
    birthplace: staff.homeTown || undefined,
    bloodType: undefined,
    agency: staff.yearsActive || undefined,
    bio: staff.description ? stripHtml(staff.description) : undefined,
    roles,
  };
}

export async function getVoiceActor(id: number): Promise<VoiceActor> {
  if (id >= 300000) {
    const indian = await getIndianVoiceActors();
    const found = indian.find((a) => a.id === id);
    if (found) return found;
  }

  const [staff, mediaData] = await Promise.all([
    getStaffBasic(id),
    getStaffMedia(id),
  ]);

  const staffWithMedia: StaffFull = {
    ...staff,
    staffMedia: mediaData,
  };

  return mapStaffToVoiceActor(staffWithMedia);
}

export async function searchVoiceActors(query: string, page = 1, perPage = 20): Promise<{ actors: VoiceActor[]; total: number }> {
  const data = await searchStaff(query, page, perPage);

  const actors: VoiceActor[] = data.results.map((s) => ({
    id: s.id,
    name: s.name?.full || "Unknown",
    nativeName: s.name?.native || undefined,
    image: s.image?.large || s.image?.medium || "",
    roles: [],
  }));

  return { actors, total: data.total };
}

/* ─── Indian Voice Actor image enrichment via AniList ─── */

const ANILIST_STAFF_QUERY = `
  query ($s: String) {
    Page(page: 1, perPage: 5) {
      staff(search: $s, sort: SEARCH_MATCH) {
        id name { full native } image { large medium } primaryOccupations gender description(asHtml: false)
      }
    }
  }`;

let staffCache: Map<number, { realId: number; image: string; name: string }> | null = null;
let staffCacheTimestamp = 0;
const STAFF_CACHE_TTL = 24 * 60 * 60 * 1000;

interface AniListStaffSearchResult {
  id: number;
  name?: { full?: string; native?: string };
  image?: { large?: string; medium?: string };
}

async function searchStaffOnAnilist(name: string): Promise<AniListStaffSearchResult[]> {
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: ANILIST_STAFF_QUERY, variables: { s: name } }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { Page?: { staff?: AniListStaffSearchResult[] } };
    const staff = data?.Page?.staff || [];
    return staff.filter((s) => {
      const full = s.name?.full?.toLowerCase() || "";
      const native = s.name?.native?.toLowerCase() || "";
      const q = name.toLowerCase();
      return full.includes(q) || q.includes(full) || native.includes(q);
    });
  } catch { return []; }
}

async function enrichWithRealIds(): Promise<Map<number, { realId: number; image: string; name: string }>> {
  if (staffCache && Date.now() - staffCacheTimestamp < STAFF_CACHE_TTL) {
    return staffCache;
  }

  const knownNames = [
    { tempId: 300001, realName: "Rajesh Kava" },
    { tempId: 300002, realName: "Lohit Sharma" },
    { tempId: 300003, realName: "Vidit Kumar" },
    { tempId: 300004, realName: "Sahil Kulkarni" },
    { tempId: 300005, realName: "Mohit Sinha" },
    { tempId: 300006, realName: "Merlyn James" },
    { tempId: 300007, realName: "Sanket Mhatre" },
    { tempId: 300008, realName: "Pooja Punjabi" },
    { tempId: 300009, realName: "Vaibhav Thakkar" },
    { tempId: 300010, realName: "Sparsh Korde" },
    { tempId: 300011, realName: "Ayushi Prakash" },
    { tempId: 300012, realName: "Suvela Sharma" },
  ];

  const map = new Map<number, { realId: number; image: string; name: string }>();

  for (const { tempId, realName } of knownNames) {
    try {
      const results = await searchStaffOnAnilist(realName);
      if (results.length > 0) {
        const staff = results[0];
        map.set(tempId, {
          realId: staff.id,
          image: staff.image?.large || staff.image?.medium || "",
          name: staff.name?.full || realName,
        });
      }
    } catch (e) { logError(e); }
  }

  staffCache = map;
  staffCacheTimestamp = Date.now();
  return map;
}

/* ─── Anime cover resolution for Indian VA roles ─── */

const ANILIST_MEDIA_COVER_QUERY = `
  query ($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        id coverImage { large }
      }
    }
  }`;

interface AniListMediaCoverResult {
  id: number;
  coverImage?: { large?: string };
}

let mediaCoverCache: Map<number, string> | null = null;

async function resolveAnimeCovers(ids: number[]): Promise<Map<number, string>> {
  if (mediaCoverCache) return mediaCoverCache;

  const map = new Map<number, string>();
  const unique = [...new Set(ids.filter((id) => id > 0))];

  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: ANILIST_MEDIA_COVER_QUERY, variables: { ids: chunk } }),
        signal: AbortSignal.timeout(8000),
      });
      const data = (await res.json()) as { data?: { Page?: { media?: AniListMediaCoverResult[] } } };
      for (const m of data?.data?.Page?.media || []) {
        if (m?.id && m?.coverImage?.large) map.set(m.id, m.coverImage.large);
      }
    } catch { /* keep going */ }
  }

  mediaCoverCache = map;
  return map;
}

export async function getIndianVoiceActors(): Promise<VoiceActor[]> {
  const realMap = await enrichWithRealIds();

  const indianVAs: VoiceActor[] = [
    // ══════════════════════════════════════════════
    // HINDI DUB — CRUNCHYROLL / SONY YAY! / NETFLIX
    // ══════════════════════════════════════════════
    {
      id: 300001, name: "Rajesh Kava", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/1/12/Rajesh_Kava.png/revision/latest?cb=20240220041322", languages: ["Hindi"],
      roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Android 17", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Usopp (East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denki Kaminari", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 18 March 1979. One of India's most prolific voice actors — voices Sasuke Uchiha (Naruto), Android 17 (DBZ), Harry Potter, Jon Snow (Game of Thrones), and Legolas (LOTR). Active since 2000.",
      birthDate: "March 18, 1979",
      birthplace: "Mumbai, India",
      agency: "Sound & Vision India",
    },
    {
      id: 300002, name: "Lohit Sharma", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/9/98/Lohit_Sharma_ETV.jpg/revision/latest?cb=20250728204450", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denji", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Meguru Bachira", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21355, animeTitle: "Re:ZERO", animeImage: "", characterName: "Natsuki Subaru", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Prominent Hindi anime dubbing artist from Bikaner, Rajasthan. Known for voicing Gojo Satoru (Jujutsu Kaisen), Denji (Chainsaw Man), and Bachira (Blue Lock) in Hindi dubs on Crunchyroll. First Indian voice artist to win Best Hindi Voice Artist Performance at the Crunchyroll Anime Awards 2025.",
      agency: "Prime Focus Technologies",
    },
    {
      id: 300003, name: "Vidit Kumar", image: "https://animemirchi.com/wp-content/uploads/2025/06/Vidit-Kumar.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuji Itadori", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Brook", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Yahiko", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Chojuro", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Hindi voice actor known for Yuji Itadori (Jujutsu Kaisen Crunchyroll), Brook (One Piece), and multiple supporting roles in Naruto Shippuden Hindi dub.",
    },
    {
      id: 300004, name: "Sahil Kulkarni", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/8/8e/Sahil_Kulkarni.jpg/revision/latest/scale-to-width-down/600?cb=20250529143319", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Megumi Fushiguro", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Arthur Boyle", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Rui", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Yushiro", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "Katsuki Bakugo", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 223, animeTitle: "Dragon Ball", animeImage: "", characterName: "Yamcha", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Sahil Vinod Kulkarni is a Hindi dubbing artist known for Megumi Fushiguro (JJK), Arthur Boyle (Fire Force), Katsuki Bakugo (My Hero Academia), and Yamcha (Dragon Ball). Works with Crunchyroll India.",
    },
    {
      id: 300005, name: "Mohit Sinha", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/2/21/Mohit_Sinha.png/revision/latest?cb=20250901145029", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Shinra Kusakabe", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 210, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Ryoga Hibiki", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 9 March. Voices Kakashi Hatake (Naruto Shippuden), Shinra Kusakabe (Fire Force), and Ryoga Hibiki (Ranma 1/2) in Hindi dubs.",
      birthDate: "March 9",
    },
    {
      id: 300006, name: "Merlyn James", image: "https://animemirchi.com/wp-content/uploads/2025/06/Merlyn-James.webp", languages: ["Hindi"],
      roles: [
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Kobeni Higashiyama", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Konan", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Iris", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Momo Nishimiya", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 210, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Ranma (Girl)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Versatile Hindi voice actress. Known for Kobeni (Chainsaw Man), Konan (Naruto), Iris (Fire Force), and Ranma's female form (Ranma 1/2).",
    },
    {
      id: 300007, name: "Sanket Mhatre", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/3/37/Rapo-sanket-mhatre.jpg/revision/latest?cb=20230926231723", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Muzan Kibutsuji", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro (East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 27 July 1983 in Mumbai. Voices Muzan Kibutsuji (Demon Slayer Muse India) and Roronoa Zoro (One Piece East Blue Hindi dub).",
      birthDate: "July 27, 1983",
      birthplace: "Mumbai, India",
    },
    {
      id: 300008, name: "Pooja Punjabi", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/2/23/Pooja-punjabi.png/revision/latest?cb=20220224155939", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Hibana", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 19 January 1985 in Ulhasnagar. Indian voice-over artist and founder of Pot Belly Audio. Voices Naruto Uzumaki in the Sony YAY! Hindi dub of Naruto Shippuden — one of the most iconic roles in Indian anime dubbing. Also voiced Rapunzel (Tangled), Astrid (How to Train Your Dragon), and Shizuka (Doraemon movies).",
      birthDate: "January 19, 1985",
      birthplace: "Ulhasnagar, India",
    },
    {
      id: 300009, name: "Vaibhav Thakkar", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/c/c6/Vaibhav-thakkar-and-samay-thakkar.jpg/revision/latest?cb=20230603171725", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy (Wano & East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 8 May 1997. The Hindi voice of Monkey D. Luffy in One Piece on Cartoon Network India — both the Wano Arc (2024) and East Blue Saga (2025). Son of fellow voice actor Samay Raj Thakkar.",
      birthDate: "May 8, 1997",
    },
    {
      id: 300010, name: "Sparsh Korde", image: "https://animemirchi.com/wp-content/uploads/2025/06/Sparsh-Korde.webp", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tanjiro Kamado (Muse India S1)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Toji Fushiguro", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tanjiro Kamado in the Muse India Hindi dub of Demon Slayer Season 1, and Toji Fushiguro in Jujutsu Kaisen.",
    },
    {
      id: 300011, name: "Ayushi Prakash", image: "https://animemirchi.com/wp-content/uploads/2025/06/Ayushi-Prakash-1.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Maki Zenin / Mai Zenin", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Power", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kurotsuchi", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Hindi voice actress known for Power (Chainsaw Man), Maki & Mai Zenin (JJK), and multiple roles across Crunchyroll Hindi dubs.",
    },
    {
      id: 300012, name: "Suvela Sharma", image: "https://animemirchi.com/wp-content/uploads/2025/06/Suvela-Sharma.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 210, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Nabiki Tendo", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Mitsuri Kanroji", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nobara Kugisaki (JJK), Nabiki Tendo (Ranma 1/2), and Mitsuri Kanroji (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300013, name: "Krutarth Trivedi", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/1/13/Krutarth-trivedi.jpg/revision/latest?cb=20220225175839", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Suguru Geto", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Akitaru Obi", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 210, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Tatewaki Kuno", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Suguru Geto (JJK), Akitaru Obi (Fire Force), and Tatewaki Kuno (Ranma 1/2) in Hindi dubs.",
    },
    {
      id: 300014, name: "Himanshu Rana", image: "https://animemirchi.com/wp-content/uploads/2025/06/Himanshu-Rana.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Kento Nanami", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Aki Hayakawa", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Kento Nanami (JJK) and Aki Hayakawa (Chainsaw Man) in Crunchyroll Hindi dubs.",
    },
    {
      id: 300015, name: "Saudamini Anjaria", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Makima", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Inca Kasugatani", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Makima in the Hindi dub of Chainsaw Man. Also known for dubbing Spider-Man: Into the Spider-Verse.",
    },
    {
      id: 300016, name: "Archit Maurya", image: "https://animemirchi.com/wp-content/uploads/2025/06/Archit-Maurya.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Ryomen Sukuna", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Katana Man", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Ryomen Sukuna (JJK) and Katana Man (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300017, name: "Aadityaraj Sharma", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/9/90/Aditya-raj-sharma.jpg/revision/latest?cb=20220224182242", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Nagato", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Sakonji Urokodaki", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Vulcan Joseph", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Jinpei Ego", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Versatile Hindi VA — voices Nagato (Naruto), Urokodaki (Demon Slayer), Vulcan (Fire Force), and Jingo Raichi (Blue Lock).",
    },
    {
      id: 300018, name: "Sachin Gole", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/8/84/Sachin-gole-with-yash.jpg/revision/latest?cb=20230306174138", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Pain", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 17 August 1990. Voices Pain in the Hindi dub of Naruto Shippuden — one of the most memorable villain performances in Indian anime dubbing.",
      birthDate: "August 17, 1990",
    },
    {
      id: 300019, name: "Karan Trivedi", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/8/82/Karan_Trivedi.jpg/revision/latest?cb=20240105120927", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Tobi / Obito Uchiha", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy (CN India)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 17 January 1984. Voices Tobi/Obito (Naruto Shippuden) and Luffy (One Piece CN India). Also known for voicing Harry Potter before Rajesh Kava.",
      birthDate: "January 17, 1984",
    },
    {
      id: 300020, name: "Anshul Saxena", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/9/96/Anshul_Saxena_Instagram.jpeg/revision/latest?cb=20250823121926", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Neji Hyuga / Minato Namikaze", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Rensuke Kunigami", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Gol D. Roger", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Neji & Minato (Naruto), Kunigami (Blue Lock), and Gol D. Roger (One Piece) in Hindi dubs.",
    },
    {
      id: 300021, name: "Farhan Patel", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Itachi Uchiha", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Galgali", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Itachi Uchiha (Naruto) and Galgali (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300022, name: "Shaily Dubey", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/1/11/Shaily-dubey-rao.png/revision/latest?cb=20220224095837", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 210, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Kodachi Kuno", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Sakura Haruno (Naruto Shippuden) and Kodachi Kuno (Ranma 1/2) in Hindi dubs.",
    },
    {
      id: 300024, name: "Natasha Chungath", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/5/5e/Natasha-chuganth.jpg/revision/latest?cb=20240727125925", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Utahime Iori", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Nezuko Kamado (Muse Ep5+)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Konohamaru", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nezuko (Demon Slayer Muse), Utahime (JJK), and Konohamaru (Naruto) in Hindi dubs.",
    },
    {
      id: 300025, name: "Hitanshi Jha", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Nezuko Kamado (Crunchyroll)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Alphonse Elric", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nezuko (Demon Slayer Crunchyroll) and Alphonse Elric (FMA: Brotherhood) in Hindi dubs.",
    },
    {
      id: 300026, name: "Anubhav Rawat", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Yushiro", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Edward Elric", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Edward Elric (FMA: Brotherhood) and Yushiro (Demon Slayer Crunchyroll) in Hindi dubs.",
    },
    {
      id: 300027, name: "Abhineet Shukla", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Roy Mustang", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Obanai Iguro / Doma", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Roy Mustang (FMA: Brotherhood), Obanai & Doma (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300028, name: "Priyanka Bhandari", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Riza Hawkeye", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tanjiro Kamado (S3)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Riza Hawkeye (FMA: Brotherhood) and Tanjiro Kamado Season 3 (Demon Slayer Crunchyroll) in Hindi.",
    },
    {
      id: 300029, name: "Nandini Mandal", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Winry Rockbell", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 132052, animeTitle: "A Couple of Cuckoos", animeImage: "", characterName: "Hiro Segawa (S2)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Winry Rockbell (FMA: Brotherhood) and Hiro Segawa S2 (A Couple of Cuckoos) in Hindi.",
    },
    {
      id: 300030, name: "Nupur Latiyan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Shinobu Kocho", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Lust", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Shinobu Kocho (Demon Slayer) and Lust (FMA: Brotherhood) in Hindi dubs.",
    },
    {
      id: 300031, name: "Dinu Sharma", image: "https://animemirchi.com/wp-content/uploads/2025/06/Dinu-Sharma.webp", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Giyu Tomioka (Crunchyroll)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 132052, animeTitle: "A Couple of Cuckoos", animeImage: "", characterName: "Nagi Umino (S1)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Giyu Tomioka (Demon Slayer Crunchyroll) and Nagi Umino (A Couple of Cuckoos) in Hindi.",
    },
    {
      id: 300032, name: "Prateek Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Genya Shinazugawa / Gyomei Himejima", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Isaac McDougal", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Genya & Gyomei (Demon Slayer Crunchyroll) and Isaac McDougal (FMA: Brotherhood) in Hindi.",
    },
    {
      id: 300033, name: "Lokesh Indoria", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Muzan Kibutsuji / Sanemi Shinazugawa (Crunchyroll)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices both Muzan Kibutsuji and Sanemi Shinazugawa in the Crunchyroll Hindi dub of Demon Slayer.",
    },
    {
      id: 300034, name: "Akshar Joshi", image: "https://animemirchi.com/wp-content/uploads/2025/06/Akshar-Joshi.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Noritoshi Kamo", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Takeo Kamado", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Noritoshi Kamo (JJK) and Takeo Kamado (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300035, name: "Harsh Joshi", image: "https://animemirchi.com/wp-content/uploads/2025/06/Harsh-Joshi.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Junpei Yoshino", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Koby (East Blue)", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Murata", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Junpei (JJK), Koby (One Piece), and Murata (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300036, name: "Warren D'souza", image: "https://animemirchi.com/wp-content/uploads/2025/06/Warren-Dsouza.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Kento Nanami / Mahito (Sony YAY!)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Hirokazu Arai", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nanami & Mahito (JJK Sony YAY!) and Hirokazu Arai (Chainsaw Man) in Hindi.",
    },
    {
      id: 300037, name: "Manikant Sarbhoy", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/1/17/Manikant_Sarbhoy.webp/revision/latest?cb=20250226231328", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Gaara / Shikamaru Nara", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Beam", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Toji Fushiguro (Sony YAY!)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Gaara and Shikamaru Nara (Naruto Sony YAY!), Beam (Chainsaw Man), and Toji (JJK Sony YAY!) in Hindi dubs.",
    },
    {
      id: 300038, name: "Akshita Mishra", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Sasha Braus / Christa", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 132052, animeTitle: "A Couple of Cuckoos", animeImage: "", characterName: "Erika Amano (S2)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Nominated for Best Voice Actor (Hindi) at Crunchyroll Global Awards. Voices Sasha & Christa (AoT) and Erika (Cuckoos S2).",
    },
    {
      id: 300039, name: "Ish Thakkar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Giyu Tomioka (Muse India)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro (Wano Arc)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Giyu Tomioka (Demon Slayer Muse) and Roronoa Zoro (One Piece Wano) in Hindi.",
    },
    {
      id: 300040, name: "Vaibhav Srivastava", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tengen Uzui (Crunchyroll)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tengen Uzui (Sound Hashira) in the Crunchyroll Hindi dub of Demon Slayer.",
    },
    {
      id: 300041, name: "Shrishti Sargam", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Mitsuri Kanroji (Crunchyroll)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Mitsuri Kanroji (Love Hashira) in the Crunchyroll Hindi dub of Demon Slayer.",
    },
    {
      id: 300043, name: "Sanchit Wartak", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/8/81/Sanchit-wartak.jpg/revision/latest?cb=20220910134446", languages: ["Hindi"],
      roles: [
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Jinpachi Ego", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Gyuki", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Shanks (East Blue)", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Jinpachi Ego (Blue Lock), Gyuki (Naruto), and Shanks (One Piece) in Hindi.",
    },
    {
      id: 300045, name: "Rushikesh Punse", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tengen Uzui (Muse India)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Hyoma Chigiri", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tengen Uzui (Demon Slayer Muse) and Chigiri (Blue Lock) in Hindi dubs.",
    },
    {
      id: 300046, name: "Ankit Goswami", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 105333, animeTitle: "Dr. Stone", animeImage: "", characterName: "Senku Ishigami", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Hisoka / Adult Gon", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Reo Mikage / Sae Itoshi", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sasori (Hiruko)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Senku (Dr. Stone), Hisoka & Adult Gon (Hunter x Hunter), Reo & Sae (Blue Lock), and Sasori (Naruto) in Hindi dubs.",
    },

    // ══════════════════════════════════════════════
    // TAMIL DUB — CRUNCHYROLL / MUSE INDIA
    // ══════════════════════════════════════════════
    {
      id: 300047, name: "Rithick Elayaraja", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/3/30/RITHIK_E.jpg/revision/latest/scale-to-width-down/555?cb=20260319062844", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Shikamaru Nara", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Neji Hyuga", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Born 30 April 2002. Tamil voice actor known for Gojo Satoru (JJK Tamil), Shikamaru & Neji (Naruto Tamil), and Akaza (Demon Slayer). One of the youngest prominent anime dubbing artists in India.",
      birthDate: "April 30, 2002",
    },
    {
      id: 300048, name: "Roshan Nesapriyan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuji Itadori", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Yuji Itadori in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300049, name: "Arvind Rathinavel", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Megumi Fushiguro", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Megumi Fushiguro in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300050, name: "Akshya Prabu", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Nobara Kugisaki in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300051, name: "Praveen Kesavan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Ryomen Sukuna", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Ryomen Sukuna in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300052, name: "Deepa Venkat", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/7/7c/Deepa_Venkat.jpg/revision/latest?cb=20240823134524", languages: ["Tamil"],
      roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Historia Reiss", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Legendary Tamil dubbing artist. Kalaimamani award winner. Voices Sakura (Naruto) and has dubbed for Nayanthara, Jyothika, Aishwarya Rai in 200+ Tamil films.",
      birthplace: "Chennai, India",
      agency: "Sound & Vision Studios",
    },
    {
      id: 300053, name: "Saravana Sathish", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tanjiro Kamado", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denji", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Tanjiro (Demon Slayer) and Denji (Chainsaw Man) in Tamil dubs.",
    },

    // ══════════════════════════════════════════════
    // TELUGU DUB — CRUNCHYROLL / MUSE INDIA
    // ══════════════════════════════════════════════
    {
      id: 300054, name: "RJ Chaitanyaa Ketha", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Multiple Characters (Season 2)", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice actor and former radio jockey at Sun TV. Voiced multiple characters in Attack on Titan Season 2 Telugu dub.",
      birthplace: "Hyderabad, India",
    },
    {
      id: 300055, name: "Rakesh Rachakonda", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Eren Jaeger", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "15+ years experience in Telugu voice acting and dubbing. Voices Gojo (JJK) and Eren (AoT) in Telugu dubs.",
      birthplace: "Hyderabad, India",
    },
    {
      id: 300056, name: "Sai Abhijith S", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Edward Elric", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Edward Elric in the Fullmetal Alchemist: Brotherhood Telugu dub on Crunchyroll.",
    },

    // ══════════════════════════════════════════════
    // CLASSIC CN / TOONAMI HINDI DUB
    // ══════════════════════════════════════════════
    {
      id: 300057, name: "Prasad Barve", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Ash Ketchum", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Piiman", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 10 April 1981. Legendary Hindi voice actor from the Cartoon Network India era. The iconic Hindi voice of Ash Ketchum (Pokémon) and Vegeta (DBZ).",
      birthDate: "April 10, 1981",
      agency: "Sound & Vision India",
    },
    {
      id: 300058, name: "Saumya Daan", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/7/7c/Saumya_Daan_at_the_Ganesh_Chaturthi_festival.jpg/revision/latest?cb=20231206231350", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro (Toonami)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 2 March 1982 in Mumbai. Classic Cartoon Network India era voice actor. Hindi voice of Roronoa Zoro in the original One Piece Toonami dub.",
      birthDate: "March 2, 1982",
      birthplace: "Mumbai, India",
    },
    {
      id: 300059, name: "Sandeep Karnik", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/9/98/Sandeep-karnik.jpg/revision/latest?cb=20220306113623", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Gol D. Roger / Higuma / Jango", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Classic CN India voice actor. Voiced Gol D. Roger, Higuma, and Jango in the original One Piece Toonami Hindi dub. Passed away on 8 April 2021.",
    },
    {
      id: 300060, name: "Sonal Kaushal", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/2/2f/Sonal-kaushal.jpg/revision/latest?cb=20220723060300", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Nami (East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Maki Oze", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nami (One Piece East Blue) and Maki Oze (Fire Force) in Hindi dubs.",
    },
    {
      id: 300061, name: "Anshul Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Enmu", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Jogo (Sony YAY!)", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Enmu (Demon Slayer) and Jogo (JJK Sony YAY!) in Hindi dubs.",
    },
    {
      id: 300062, name: "Manisha Kandu", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Nezuko Kamado (Muse Ep1-4)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Originally voiced Nezuko Kamado in Episodes 1-4 of the Muse India Hindi dub of Demon Slayer.",
    },
    {
      id: 300063, name: "Faheem Amin", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/c/cf/Faheem_Amin.jpg/revision/latest?cb=20221002052122", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Inosuke Hashibira (Muse India)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Inosuke Hashibira in the Muse India Hindi dub of Demon Slayer Season 1.",
    },
    {
      id: 300064, name: "Akshat Dixit", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Zenitsu Agatsuma (Muse India)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Zenitsu Agatsuma in the Muse India Hindi dub of Demon Slayer Season 1.",
    },
    {
      id: 300065, name: "Siddharth Awasthi", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Kyojuro Rengoku / Hotaru Haganezuka", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Rengoku and Hotaru in the Muse India Hindi dub of Demon Slayer.",
    },
    {
      id: 300066, name: "Apala Bisht", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/4/48/Apala_Bisht.png/revision/latest?cb=20241030132449", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Shinobu Kocho (Muse India)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Rin Nohara / Tenten (S11+)", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Riko Amanai (Sony YAY!)", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Shinobu (Demon Slayer Muse), Rin & Tenten (Naruto), and Riko (JJK Sony YAY!) in Hindi.",
    },

    // ══════════════════════════════════════════════
    // MORE HINDI — SPY x FAMILY, SOLO LEVELING, MHA, DANDADAN, etc.
    // ══════════════════════════════════════════════
    {
      id: 300067, name: "Shilpi Pandey", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/e/ee/Shilpie-pandey.jpg/revision/latest?cb=20230817171624", languages: ["Hindi"],
      roles: [
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Yor Forger", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Yor Forger in the Crunchyroll Hindi dub of Spy x Family.",
    },
    {
      id: 300068, name: "Sheena Rattan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Damian Desmond", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Damian Desmond in the Crunchyroll Hindi dub of Spy x Family.",
    },
    {
      id: 300069, name: "Kasturi Ajay Joglekar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Becky Blackbell", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Becky Blackbell in the Crunchyroll Hindi dub of Spy x Family.",
    },
    {
      id: 300070, name: "Rajesh Shukla", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/1/1b/Rajesh_Shukla.jpg/revision/latest/scale-to-width-down/600?cb=20230731201456", languages: ["Hindi"],
      roles: [
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinwoo", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 49431, animeTitle: "Dragon Ball Super: Super Hero", animeImage: "", characterName: "Gamma 2", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 527, animeTitle: "Pokémon: Mewtwo Strikes Back—Evolution", animeImage: "", characterName: "James", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 23 January 1988. Hindi voice actor known for Sung Jinwoo (Solo Leveling), Gamma 2 (Dragon Ball Super: Super Hero), and James (Pokémon). Also the current Hindi voice of Mickey Mouse.",
      birthDate: "January 23, 1988",
    },
    {
      id: 300073, name: "Mani Puhan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 171018, animeTitle: "Dandadan", animeImage: "", characterName: "Momo Ayase", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Angel Devil", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Momo Ayase (Dandadan) and Angel Devil (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300074, name: "Pratik Verma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 171018, animeTitle: "Dandadan", animeImage: "", characterName: "Okarun", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Shikamaru Nara (S15+)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Okarun (Dandadan) and Shikamaru Nara from Season 15+ (Naruto Shippuden) in Hindi.",
    },
    {
      id: 300075, name: "Renu Sharda", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/3/33/Renu_Sharda.jpg/revision/latest/scale-to-width-down/600?cb=20260729161556", languages: ["Hindi"],
      roles: [
        { animeId: 171018, animeTitle: "Dandadan", animeImage: "", characterName: "Turbo Granny", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Kiyo Terauchi", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Sharon", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Turbo Granny (Dandadan), Kiyo Terauchi (Demon Slayer), and Sharon (Spy x Family) in Hindi.",
    },
    {
      id: 300076, name: "Saanwari Yagnik", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 171018, animeTitle: "Dandadan", animeImage: "", characterName: "Seiko Ayase", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Seiko Ayase in the Muse India Hindi dub of Dandadan.",
    },
    {
      id: 300077, name: "Ghanshyam Shukla", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 21087, animeTitle: "One Punch Man", animeImage: "", characterName: "Saitama", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 30, animeTitle: "Neon Genesis Evangelion", animeImage: "", characterName: "Gendoh Ikari", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Saitama (One Punch Man) and Gendoh Ikari (Evangelion) in Hindi dubs.",
    },
    {
      id: 300079, name: "Mohak Ninad", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/0/0b/Mohan_Ninad_Kale_Maharashtra_Times.jpg/revision/latest?cb=20251231065638", languages: ["Hindi"],
      roles: [
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "All Might", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices All Might in the Cartoon Network India Hindi dub of My Hero Academia.",
    },
    {
      id: 300080, name: "Damandeep Singh Baggan", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/0/03/Damandeep-baggan.jpg/revision/latest?cb=20220813200118", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Jiraiya", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 8 June 1977 in Patiala, Punjab. Voices Jiraiya in the Hindi dub of Naruto Shippuden. Also the voice of Hanuman in Legend of Hanuman.",
      birthDate: "June 8, 1977",
      birthplace: "Patiala, Punjab, India",
    },
    {
      id: 300081, name: "Vishal Menon", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/9/9e/Vishal_Menon.jpg/revision/latest/scale-to-width-down/600?cb=20240402130705", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Orochimaru", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Takehisa Hinawa", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Orochimaru (Naruto Sony YAY!) and Hinawa (Fire Force) in Hindi.",
    },
    {
      id: 300082, name: "Dishi Duggal", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/3/34/Dishi_Duggal.webp/revision/latest?cb=20231122175659", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Tsunade Senju", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tsunade Senju in the Sony YAY! Hindi dub of Naruto Shippuden.",
    },
    {
      id: 300083, name: "Vallabh Bhingarde", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/e/e7/Vallabh-bhingarde.jpg/revision/latest?cb=20220225181130", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Zabuza Momochi", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 10 December 1981. Voices Zabuza Momochi in the Sony YAY! Hindi dub of Naruto Shippuden.",
      birthDate: "December 10, 1981",
    },
    {
      id: 300084, name: "Pawan Kalra", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/5/58/Pawankalra.jpg/revision/latest/scale-to-width-down/600?cb=20250729165241", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kurama (Nine-Tails)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Arlong", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 223, animeTitle: "Dragon Ball", animeImage: "", characterName: "Narrator", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 1 November 1972. Hindi voice actor and narrator — voices Kurama (Naruto), Arlong (One Piece), and the narrator of Dragon Ball. Also known for documentary and foreign-dub voice work.",
      birthDate: "November 1, 1972",
    },
    {
      id: 300085, name: "Ketan Kava", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Sanemi Shinazugawa (Muse)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kabuto Yakushi", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Kastro", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Sanemi (Demon Slayer), Kabuto (Naruto), and Kastro (Hunter x Hunter) in Hindi. Born Sep 18, 1995.",
      birthDate: "September 18, 1995",
    },
    {
      id: 300087, name: "Soneer Vadhera", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 105333, animeTitle: "Dr. Stone", animeImage: "", characterName: "Tsukasa Shishio", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Leol / Razor / Owl", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tsukasa (Dr. Stone) and Leol/Razor/Owl (Hunter x Hunter) in Hindi dubs.",
    },
    {
      id: 300088, name: "Rahul Arya", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Inosuke Hashibira (Crunchyroll)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Gyokko", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Inosuke (Crunchyroll DS) and Gyokko in the Crunchyroll Hindi dub of Demon Slayer.",
    },
    {
      id: 300089, name: "Aakash Ahuja", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tanjiro Kamado (Crunchyroll S2 & S4)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tanjiro Kamado in Seasons 2 & 4 of the Crunchyroll Hindi dub of Demon Slayer.",
    },
    {
      id: 300090, name: "Shiney Prakash", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/d/d5/Shiney-prakash.jpg/revision/latest?cb=20220823045213", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Haku / Guren", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki (Sony YAY!)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 105310, animeTitle: "Fire Force", animeImage: "", characterName: "Tamaki Kotatsu", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Haku & Guren (Naruto), Nobara (JJK Sony YAY!), and Tamaki (Fire Force) in Hindi.",
    },
    {
      id: 300091, name: "Harshvardhan Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kiba Inuzuka", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Seishiro Nagi", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Kiba (Naruto) and Seishiro Nagi (Blue Lock) in Hindi dubs.",
    },
    {
      id: 300092, name: "Rajesh Khattar", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/7/7a/Rajesh-Khattar.jpg/revision/latest?cb=20220224181157", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kakashi Hatake (CN India)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 24 September 1966 in Delhi. Veteran Hindi dubbing artist. Voiced Kakashi Hatake in the Cartoon Network India Hindi dub of Naruto.",
      birthDate: "September 24, 1966",
      birthplace: "Delhi, India",
    },
    {
      id: 300093, name: "Shanoor Mirza", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/2/23/Shanoor_Mirza.png/revision/latest/scale-to-width-down/600?cb=20231104032330", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Gaara (CN India)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Gaara in the Cartoon Network India Hindi dub of Naruto.",
    },
    {
      id: 300094, name: "Niranjan Panchal", image: "https://animemirchi.com/wp-content/uploads/2025/06/Niranjan-Panchal.webp", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Masamichi Yaga", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Debt Collector", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Masamichi Yaga (JJK) and Debt Collector (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300095, name: "Vinod Sharma", image: "https://static.wikia.nocookie.net/hindi-dubbing/images/d/dc/Vinod-sharma.png/revision/latest?cb=20220305132234", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Hagoromo Otsutsuki", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 127230, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Kishibe", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Hagoromo (Naruto) and Kishibe (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300096, name: "Himanshu Kapil", image: "https://animemirchi.com/wp-content/uploads/2025/06/Himanshu-Kapil.webp", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Killer B / Tobirama Senju", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Kokichi Muta / Mechamaru", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Killer B & Tobirama (Naruto) and Mechamaru (JJK) in Hindi dubs.",
    },
    {
      id: 300097, name: "Krrish Kumar", image: "https://animemirchi.com/wp-content/uploads/2025/06/Krrish-Kumar.webp", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Aoba Yamashiro", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Suguru Geto (Sony YAY!)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Aoba (Naruto) and Geto (JJK Sony YAY!) in Hindi dubs.",
    },

    // ══════════════════════════════════════════════
    // MORE TAMIL DUB VOICE ACTORS
    // ══════════════════════════════════════════════
    {
      id: 300098, name: "Sai Sujith", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/f/fc/Sai_Sujith.png/revision/latest/scale-to-width-down/531?cb=20250812195730", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Noritoshi Kamo", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Damian Desmond", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Naruto Uzumaki, Noritoshi Kamo (JJK), and Damian (Spy x Family).",
    },
    {
      id: 300099, name: "Balakrishnan S", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Zenitsu Agatsuma", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kiba Inuzuka / Rock Lee", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Zenitsu (Demon Slayer), Kiba & Rock Lee (Naruto) in Tamil dubs.",
    },
    {
      id: 300100, name: "Govardhini Prakash", image: "", languages: ["Tamil", "Telugu"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Hinata Hyuga", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Anya Forger", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Winry Rockbell", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Cross-language VA. Voices Hinata (Naruto), Anya (Spy x Family) in Tamil; Winry (FMA:B) in Telugu.",
    },
    {
      id: 300101, name: "Ganesh Perumal", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Gyomei Himejima", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Gyomei (Demon Slayer) and Kakashi (Naruto) in Tamil dubs.",
    },
    {
      id: 300102, name: "Lokesh Gunasekaran", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Kyojuro Rengoku", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Kyojuro Rengoku (Flame Hashira) in the Crunchyroll Tamil dub of Demon Slayer.",
    },
    {
      id: 300103, name: "Hemath Kumar", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tengen Uzui", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Aoi Todo", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Tengen (Demon Slayer) and Aoi Todo (JJK) in Tamil dubs.",
    },
    {
      id: 300104, name: "Dinu Vairapathi", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Doma", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Mahito", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Orochimaru", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Doma (Demon Slayer), Mahito (JJK), and Orochimaru (Naruto).",
    },
    {
      id: 300105, name: "Raghuvaran", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Obito Uchiha / Tobi", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Loid Forger", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Obito (Naruto), Loid (Spy x Family), and Vegeta (DBZ) across multiple Tamil dubs.",
    },
    {
      id: 300106, name: "Lakshana", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Sakura Haruno in the Tamil dub of Naruto Shippuden.",
    },
    {
      id: 300107, name: "Akshai", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Sasuke Uchiha in the Tamil dub of Naruto Shippuden.",
    },
    {
      id: 300108, name: "Bhuvaneswari V N", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Nezuko Kamado", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Nezuko Kamado in the Crunchyroll Tamil dub of Demon Slayer.",
    },
    {
      id: 300109, name: "Krishna Kumar", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Muzan Kibutsuji", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Muzan Kibutsuji in the Crunchyroll Tamil dub of Demon Slayer.",
    },
    {
      id: 300110, name: "Ramu Thiruvengadam", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Kokushibo", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Henry Henderson", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Android 16", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Kokushibo (Demon Slayer), Henderson (Spy x Family), and Android 16 (DBZ).",
    },
    {
      id: 300111, name: "Haripriya T", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/8/80/Haripriya.jpg/revision/latest/scale-to-width-down/480?cb=20230730071716", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Daki / Ume", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuki Tsukumo", characterImage: "", roleType: "guest", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Daki (Demon Slayer) and Yuki Tsukumo (JJK) in Tamil dubs.",
    },
    {
      id: 300112, name: "Hari Krishnan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Ui Ui", characterImage: "", roleType: "guest", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Monkey D. Luffy (One Piece) and Ui Ui (JJK) in Tamil dubs.",
    },
    {
      id: 300113, name: "Sai Krishna", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinwoo", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kabuto Yakushi", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Sung Jinwoo (Solo Leveling) and Kabuto (Naruto) in Tamil dubs.",
    },
    {
      id: 300114, name: "Gokul Gopalraj Nagaraj", image: "", languages: ["Tamil", "Telugu"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Minato Namikaze", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil & Telugu voice of Roronoa Zoro (One Piece) and Minato (Naruto).",
    },
    {
      id: 300115, name: "Shresh K Sridhar", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Madara Uchiha", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Madara Uchiha in the Tamil dub of Naruto Shippuden.",
    },
    {
      id: 300116, name: "Rahul Dev", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Pain / Nagato", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Pain/Nagato in the Tamil dub of Naruto Shippuden.",
    },
    {
      id: 300117, name: "Duraisamy", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Hiruzen Sarutobi", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 140960, animeTitle: "Spy x Family", animeImage: "", characterName: "Donovan Desmond", characterImage: "", roleType: "guest", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Hiruzen Sarutobi (Naruto) and Donovan Desmond (Spy x Family).",
    },
    {
      id: 300118, name: "Surya Veerarajan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Suguru Geto", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Suguru Geto in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },

    // ══════════════════════════════════════════════
    // MORE TELUGU DUB VOICE ACTORS
    // ══════════════════════════════════════════════
    {
      id: 300119, name: "Nikkilesh P", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Alphonse Elric", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Alphonse Elric in the Crunchyroll Telugu dub of FMA: Brotherhood.",
    },
    {
      id: 300120, name: "Naresh B", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Roy Mustang", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Roy Mustang in the Crunchyroll Telugu dub of FMA: Brotherhood.",
    },
    {
      id: 300121, name: "Visweswara Rao", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Alex Louis Armstrong", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Alex Louis Armstrong in the Crunchyroll Telugu dub of FMA: Brotherhood.",
    },
    {
      id: 300122, name: "Venkatesh P", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "King Bradley", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of King Bradley in the Crunchyroll Telugu dub of FMA: Brotherhood.",
    },
    {
      id: 300123, name: "Tejaswi K", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 5114, animeTitle: "Fullmetal Alchemist: Brotherhood", animeImage: "", characterName: "Riza Hawkeye", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Riza Hawkeye in the Crunchyroll Telugu dub of FMA: Brotherhood.",
    },
    {
      id: 300124, name: "Mojjada Karthikeyan", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinwoo", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Sung Jinwoo in the Crunchyroll Telugu dub of Solo Leveling.",
    },
    {
      id: 300125, name: "Edukoju Sangeetha", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinah", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Sung Jinah in the Crunchyroll Telugu dub of Solo Leveling.",
    },
    {
      id: 300126, name: "Ayaz Hussain Khan Pattan", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Woo Jinchul", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Woo Jinchul in the Crunchyroll Telugu dub of Solo Leveling.",
    },
    {
      id: 300127, name: "Sivvala Srikanth", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 151807, animeTitle: "Solo Leveling", animeImage: "", characterName: "Choi Jong-In", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Choi Jong-In in the Crunchyroll Telugu dub of Solo Leveling.",
    },

    // ══════════════════════════════════════════════
    // ADDED FROM DUBDB FANDOM — INDIAN ANIME DUBBING
    // ══════════════════════════════════════════════
    {
      id: 300128, name: "Ankur Javeri", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/5/54/Ankur_Javeri.png/revision/latest/scale-to-width-down/600?cb=20240831180933", languages: ["Hindi"],
      roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Son Goku", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 49431, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Son Goku", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 11 June 1971. Legendary Hindi voice of Son Goku across almost every Dragon Ball broadcast in India. Actor, voice actor and narrator fluent in English and Hindi.",
      birthDate: "June 11, 1971",
    },
    {
      id: 300129, name: "Koustuv Ghosh", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/1/16/Koustav_Ghosh.png/revision/latest?cb=20230819231759", languages: ["Hindi"],
      roles: [
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Gohan", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 26 November 1996. Indian playback singer, model, musician, actor and voice actor who speaks English and Hindi. Known as the Hindi voice of Gohan in Dragon Ball Z.",
      birthDate: "November 26, 1996",
    },
    {
      id: 300130, name: "Mayur Vyas", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/d/d1/Mayur_Vyas.webp/revision/latest?cb=20231122182509", languages: ["Hindi"],
      roles: [
        { animeId: 49431, animeTitle: "Dragon Ball Super: Super Hero", animeImage: "", characterName: "Krillin", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Indian actor and voice actor known as the Hindi voice of Krillin in Dragon Ball Super: Super Hero.",
    },
    {
      id: 300131, name: "Neshma Chemburkar", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/7/78/Neshma_Chemburkar.png/revision/latest/scale-to-width-down/400?cb=20251227182903", languages: ["Hindi"],
      roles: [
        { animeId: 223, animeTitle: "Dragon Ball", animeImage: "", characterName: "Chichi", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 49431, animeTitle: "Dragon Ball Super: Super Hero", animeImage: "", characterName: "Pan", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Indian voice actress known as the Hindi voice of Chichi (Dragon Ball) and Pan (Dragon Ball Super).",
    },
    {
      id: 300132, name: "Sabina Malik", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/7/7d/Sabina_Malik.png/revision/latest?cb=20250821181320", languages: ["Hindi"],
      roles: [
        { animeId: 400, animeTitle: "Detective Conan", animeImage: "", characterName: "Mitsuhiko Tsuburaya", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 29, animeTitle: "Princess Mononoke", animeImage: "", characterName: "Hii-sama", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Indian voice actress credited as Sabina Mausam, fluent in Hindi and Gujarati. Known as the Hindi voice of Mitsuhiko (Detective Conan) and as a voice in Princess Mononoke.",
    },
    {
      id: 300133, name: "Aru Aravind", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/e/eb/Aru_Aravind.jpg/revision/latest/scale-to-width-down/476?cb=20250907081418", languages: ["Kannada"],
      roles: [
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Raichi Jingo", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Statoz", characterImage: "", roleType: "guest", language: "Kannada" },
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "Mirio Togata", characterImage: "", roleType: "supporting", language: "Kannada" },
      ],
      isIndian: true,
      bio: "Indian voice actor who specializes in Kannada dubbing — Blue Lock, Hunter x Hunter, and My Hero Academia in Kannada.",
    },
    {
      id: 300134, name: "Arun Alexander", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/6/69/Arun_Alexander.jpg/revision/latest?cb=20260516024814", languages: ["Tamil"],
      roles: [
        { animeId: 966, animeTitle: "Crayon Shin-chan", animeImage: "", characterName: "Hiroshi Nohara", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Born 14 October 1973. Indian actor and voice actor fluent in Tamil and Telugu, best known as the Tamil voice of Hiroshi Nohara (Shin-chan). Passed away in 2020.",
      birthDate: "October 14, 1973",
    },

    // ══════════════════════════════════════════════
    // MORE DUBDB FANDOM — INDIAN DUBBING ARTISTS
    // (film/TV dubbing focus; no listed anime roles)
    // ══════════════════════════════════════════════
    {
      id: 300135, name: "Angaiha", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/4/4b/Angaiha.png/revision/latest/scale-to-width-down/600?cb=20221123053326", languages: ["Mizo"],
      roles: [
        { animeId: 0, animeTitle: "Frozen", animeImage: "", characterName: "Kristoff", characterImage: "", roleType: "main", language: "Mizo" },
        { animeId: 0, animeTitle: "Frozen II", animeImage: "", characterName: "Kristoff", characterImage: "", roleType: "main", language: "Mizo" },
        { animeId: 0, animeTitle: "Ice Age", animeImage: "", characterName: "Diego", characterImage: "", roleType: "main", language: "Mizo" },
        { animeId: 0, animeTitle: "Kung Fu Panda 3", animeImage: "", characterName: "Li Shan", characterImage: "", roleType: "supporting", language: "Mizo" },
        { animeId: 0, animeTitle: "Ben 10: Ultimate Alien", animeImage: "", characterName: "Ben Tennyson", characterImage: "", roleType: "main", language: "Mizo" },
        { animeId: 0, animeTitle: "Captain Underpants: The First Epic Movie", animeImage: "", characterName: "Benjamin Krupp", characterImage: "", roleType: "main", language: "Mizo" },
        { animeId: 0, animeTitle: "Ferdinand", animeImage: "", characterName: "Hans", characterImage: "", roleType: "supporting", language: "Mizo" },
      ],
      isIndian: true,
      bio: "Indian voice actor, singer, composer and recording engineer, best known for Mizo dubs produced by Zonet Nihawi.",
    },
    {
      id: 300136, name: "Megha Jakati", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/d/d0/Megha_Jakati.jpg/revision/latest/scale-to-width-down/600?cb=20230730063504", languages: ["Kannada"],
      roles: [
        { animeId: 501, animeTitle: "Doraemon", animeImage: "", characterName: "Doraemon", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 966, animeTitle: "Crayon Shin-chan", animeImage: "", characterName: "Shin Chan Nohara", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "Ochaco Uraraka", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 1199, animeTitle: "Ninja Boy Rantaro", animeImage: "", characterName: "Shinbe", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 20075, animeTitle: "Obocchama-kun", animeImage: "", characterName: "Chama", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Finding Nemo", animeImage: "", characterName: "Deb", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Kung Fu Panda 4", animeImage: "", characterName: "Zhen", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Maya the Bee Movie", animeImage: "", characterName: "Buzzlina", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "The Lion King (2019)", animeImage: "", characterName: "Nala", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "The Mitchells vs. the Machines", animeImage: "", characterName: "Katie Mitchell", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Zootopia", animeImage: "", characterName: "Judy Hopps", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Winx Club", animeImage: "", characterName: "Flora", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Heidi (2015)", animeImage: "", characterName: "Heidi", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Rubble & Crew", animeImage: "", characterName: "Rubble", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Transformers Prime", animeImage: "", characterName: "Miko", characterImage: "", roleType: "supporting", language: "Kannada" },
      ],
      isIndian: true,
      bio: "Born 20 July 1990. Indian actress and voice actress who specializes in Kannada dubbing.",
      birthDate: "July 20, 1990",
    },
    {
      id: 300137, name: "Arnav Vishnu", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/f/f8/Arnav_Vishnu.jpg/revision/latest/scale-to-width-down/479?cb=20230629230531", languages: ["Malayalam"],
      roles: [
        { animeId: 6033, animeTitle: "Dragon Ball Z Kai", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Spider-Man: Across the Spider-Verse", animeImage: "", characterName: "Hobie Brown / Spider-Punk", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "The Amazing Spider-Man", animeImage: "", characterName: "Peter Parker / Spider-Man", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Ben 10", animeImage: "", characterName: "Ben Tennyson", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "SpongeBob SquarePants", animeImage: "", characterName: "SpongeBob SquarePants", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Lightyear", animeImage: "", characterName: "Sox", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Vikrant Rona", animeImage: "", characterName: "Mohanchandra 'Munna' Ballal", characterImage: "", roleType: "supporting", language: "Malayalam" },
      ],
      isIndian: true,
      bio: "Born 18 December 1994. Indian actor and voice actor who specializes in Malayalam dubbing.",
      birthDate: "December 18, 1994",
    },
    {
      id: 300138, name: "Riya Duggal", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/8/8a/Riya_Duggal.jpg/revision/latest/scale-to-width-down/600?cb=20230730114528", languages: ["Hindi"],
      roles: [
        { animeId: 0, animeTitle: "Encanto", animeImage: "", characterName: "Mirabel Madrigal (singing)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "KPop Demon Hunters", animeImage: "", characterName: "Rumi (singing)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Moana 2", animeImage: "", characterName: "Chorus (singing)", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Indian singer, playback singer, songwriter and voice actress; co-artist of the pop band Simetri.",
    },
    {
      id: 300139, name: "Amar Babaria", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/0/0f/Amar_Babaria.jpg/revision/latest?cb=20231031015138", languages: ["Hindi"],
      roles: [
        { animeId: 0, animeTitle: "Shrek", animeImage: "", characterName: "Donkey", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Shrek 2", animeImage: "", characterName: "Donkey", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Shrek the Third", animeImage: "", characterName: "Donkey", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Kung Fu Panda", animeImage: "", characterName: "Monkey", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Kung Fu Panda 2", animeImage: "", characterName: "Monkey", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Open Season", animeImage: "", characterName: "Elliot", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Rise of the Guardians", animeImage: "", characterName: "E. Aster Bunnymund", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Epic", animeImage: "", characterName: "Mandrake", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Lion King II: Simba's Pride", animeImage: "", characterName: "Adult Simba", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Hanuman", animeImage: "", characterName: "Angada", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Lord of the Rings: The Fellowship of the Ring", animeImage: "", characterName: "Frodo Baggins", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Men in Black 3", animeImage: "", characterName: "Agent J", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "I, Robot", animeImage: "", characterName: "Det. Del Spooner", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "The Incredible Hulk", animeImage: "", characterName: "Emil Blonsky / Abomination", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Dark Knight", animeImage: "", characterName: "Lau", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Batman Begins", animeImage: "", characterName: "Jonathan Crane / Scarecrow", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "John Wick", animeImage: "", characterName: "Aurelio", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 10 May 1975. Indian actor, director, writer, theater artist and voice actor.",
      birthDate: "May 10, 1975",
    },
    {
      id: 300140, name: "Uday Sabnis", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/9/9c/Uday_Sabnis.webp/revision/latest?cb=20231102003853", languages: ["Hindi", "Marathi"],
      roles: [
        { animeId: 0, animeTitle: "Harry Potter and the Philosopher's Stone", animeImage: "", characterName: "Vernon Dursley", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Harry Potter and the Deathly Hallows – Part 1", animeImage: "", characterName: "Vernon Dursley", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Batman Begins", animeImage: "", characterName: "Lucius Fox", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Dark Knight Rises", animeImage: "", characterName: "Lucius Fox", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Mission: Impossible – Fallout", animeImage: "", characterName: "Luther Stickell", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Hellboy", animeImage: "", characterName: "Hellboy", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Iron Man 3", animeImage: "", characterName: "Trevor Slattery", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Thor: Ragnarok", animeImage: "", characterName: "Surtur", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Open Season", animeImage: "", characterName: "Boog", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "How to Train Your Dragon", animeImage: "", characterName: "Gobber the Belch", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Kung Fu Panda 3", animeImage: "", characterName: "Kai", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Angry Birds Movie", animeImage: "", characterName: "Leonard / King Mudbeard", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Puss in Boots: The Last Wish", animeImage: "", characterName: "Puss in Boots", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "The Super Mario Bros. Movie", animeImage: "", characterName: "Bowser", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Brave", animeImage: "", characterName: "King Fergus", characterImage: "", roleType: "supporting", language: "Marathi" },
      ],
      isIndian: true,
      bio: "Born 7 June 1959. Indian actor and voice actor who has worked in English, Hindi and Marathi, dubbing foreign films and series.",
      birthDate: "June 7, 1959",
    },
    {
      id: 300141, name: "Vinod Kulkarni", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/0/0e/Vinod_Kulkarni.jpg/revision/latest?cb=20231104040823", languages: ["Hindi", "Marathi"],
      roles: [
        { animeId: 0, animeTitle: "Stuart Little", animeImage: "", characterName: "Snowbell", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Daredevil", animeImage: "", characterName: "Matt Murdock / Daredevil", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Harry Potter and the Chamber of Secrets", animeImage: "", characterName: "Dobby", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Chronicles of Narnia: Prince Caspian", animeImage: "", characterName: "Trufflehunter", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Inception", animeImage: "", characterName: "Professor Stephen Miles", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Last Samurai", animeImage: "", characterName: "Simon Graham", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Batman (1989)", animeImage: "", characterName: "Jack Napier / The Joker", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Batman Forever", animeImage: "", characterName: "Edward Nygma / The Riddler", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Space Jam", animeImage: "", characterName: "Sylvester", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Mask of Zorro", animeImage: "", characterName: "Diego De La Vega", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Goosebumps", animeImage: "", characterName: "Slappy the Dummy", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Avengers: Infinity War", animeImage: "", characterName: "Ebony Maw", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Captain America: The First Avenger", animeImage: "", characterName: "Abraham Erskine", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 29 August 1967. Indian actor, director, voice actor and voice coordinator; father of voice actor Sahil Kulkarni.",
      birthDate: "August 29, 1967",
    },
    {
      id: 300142, name: "Rajesh Jolly", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/d/d0/Rajesh_Jolly.jpg/revision/latest?cb=20231112011644", languages: ["Hindi"],
      roles: [
        { animeId: 0, animeTitle: "The Matrix", animeImage: "", characterName: "Morpheus", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "The Matrix Reloaded", animeImage: "", characterName: "Morpheus", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Braveheart", animeImage: "", characterName: "William Wallace", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Hellboy", animeImage: "", characterName: "Hellboy", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "The Chronicles of Narnia: The Lion, The Witch and The Wardrobe", animeImage: "", characterName: "Aslan", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Pirates of the Caribbean: Dead Man's Chest", animeImage: "", characterName: "Captain Barbossa", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Iron Man", animeImage: "", characterName: "James Rhodes", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Mission: Impossible", animeImage: "", characterName: "Luther Stickell", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Spider-Man 2", animeImage: "", characterName: "J. Jonah Jameson", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "X2", animeImage: "", characterName: "Colonel William Stryker", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Kung Fu Panda", animeImage: "", characterName: "Commander Vachir", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "How to Train Your Dragon 2", animeImage: "", characterName: "Stoick the Vast", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Rio 2", animeImage: "", characterName: "Eduardo", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Wild", animeImage: "", characterName: "Samson's Father", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Saaho", animeImage: "", characterName: "Ibrahim", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Indian actor and voice actor.",
    },
    {
      id: 300143, name: "Guru Tejas", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/2/24/Guru_Tejas.jpg/revision/latest/scale-to-width-down/599?cb=20250720060517", languages: ["Kannada"],
      roles: [
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Isagi", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Frieza", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Kung Fu Panda 4", animeImage: "", characterName: "Po", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "The Lion King (2019)", animeImage: "", characterName: "Timon", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Spider-Man: Across the Spider-Verse", animeImage: "", characterName: "Pavitr Prabhakar / Spider-Man India", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Invincible", animeImage: "", characterName: "Mark Grayson / Invincible", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Merry Little Batman", animeImage: "", characterName: "Terry", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "50/50 Heroes", animeImage: "", characterName: "Mo", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Pakdam Pakdai", animeImage: "", characterName: "Doggy Don", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "PAW Patrol", animeImage: "", characterName: "Ryder", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "SpongeBob SquarePants", animeImage: "", characterName: "SpongeBob SquarePants", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Shiva", animeImage: "", characterName: "Shiva", characterImage: "", roleType: "main", language: "Kannada" },
      ],
      isIndian: true,
      bio: "Indian actor and voice actor who specializes in Kannada dubbing.",
    },
    {
      id: 300144, name: "Shridhar D", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/1/1c/Shridhar_D.jpg/revision/latest/scale-to-width-down/600?cb=20250918153748", languages: ["Kannada"],
      roles: [
        { animeId: 137822, animeTitle: "Blue Lock", animeImage: "", characterName: "Ego Jinpachi", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Whis", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 21459, animeTitle: "My Hero Academia", animeImage: "", characterName: "Todoraki", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Jhon", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 966, animeTitle: "Crayon Shin-chan: Crash! Graffiti Kingdom", animeImage: "", characterName: "Minister of Rakuga Kingdom", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 966, animeTitle: "Shin Chan", animeImage: "", characterName: "Kuroiso", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Kung Fu Panda 4", animeImage: "", characterName: "Master Shifu", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Merry Little Batman", animeImage: "", characterName: "Penguin", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Pushpa 2: The Rule", animeImage: "", characterName: "Kupparaju", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "The Boys", animeImage: "", characterName: "Marvin T", characterImage: "", roleType: "supporting", language: "Kannada" },
      ],
      isIndian: true,
      bio: "Indian actor and voice actor who specializes in Kannada dubbing.",
    },
    {
      id: 300145, name: "Mousumi Nayak", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/f/ff/Mousumi_Nayak.png/revision/latest/scale-to-width-down/575?cb=20251013235819", languages: ["Odia"],
      roles: [
        { animeId: 235, animeTitle: "Detective Conan", animeImage: "", characterName: "Ran Mouri", characterImage: "", roleType: "main", language: "Odia" },
        { animeId: 0, animeTitle: "Spider-Man: Into the Spider-Verse", animeImage: "", characterName: "Rio Morales", characterImage: "", roleType: "supporting", language: "Odia" },
        { animeId: 0, animeTitle: "The Angry Birds Movie", animeImage: "", characterName: "Stella", characterImage: "", roleType: "supporting", language: "Odia" },
        { animeId: 0, animeTitle: "The Smurfs (2011)", animeImage: "", characterName: "Smurfette", characterImage: "", roleType: "main", language: "Odia" },
        { animeId: 0, animeTitle: "Avatar: The Last Airbender", animeImage: "", characterName: "Katara", characterImage: "", roleType: "main", language: "Odia" },
        { animeId: 0, animeTitle: "Dora the Explorer", animeImage: "", characterName: "Dora", characterImage: "", roleType: "main", language: "Odia" },
        { animeId: 0, animeTitle: "SpongeBob SquarePants", animeImage: "", characterName: "Sandy Cheeks", characterImage: "", roleType: "supporting", language: "Odia" },
        { animeId: 0, animeTitle: "The Legend of Korra", animeImage: "", characterName: "Asami Sato", characterImage: "", roleType: "supporting", language: "Odia" },
        { animeId: 0, animeTitle: "The Smurfs (1981)", animeImage: "", characterName: "Smurfette", characterImage: "", roleType: "main", language: "Odia" },
        { animeId: 0, animeTitle: "Winx Club", animeImage: "", characterName: "Roxy", characterImage: "", roleType: "supporting", language: "Odia" },
      ],
      isIndian: true,
      bio: "Indian voice actress who specializes in Odia dubbing.",
    },
    {
      id: 300146, name: "Joseena Josh", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/b/b2/JoseenaJosh.png/revision/latest/scale-to-width-down/480?cb=20251108051245", languages: ["Malayalam"],
      roles: [
        { animeId: 0, animeTitle: "Winx Club", animeImage: "", characterName: "Icy", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Winx Club 3D - Magical Adventure", animeImage: "", characterName: "Icy", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Winx Club: The Mystery of the Abyss", animeImage: "", characterName: "Icy", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Winx Club: The Secret of the Lost Kingdom", animeImage: "", characterName: "Vanessa", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Danger Mouse (2015)", animeImage: "", characterName: "Penfold", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Heidi (2015)", animeImage: "", characterName: "Frieda", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Gen V", animeImage: "", characterName: "Marie Moreau", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Invincible", animeImage: "", characterName: "Samantha Eve Wilkins / Atom Eve", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Off Campus", animeImage: "", characterName: "Allie Hayes", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Sausage Party: Foodtopia", animeImage: "", characterName: "Brenda", characterImage: "", roleType: "supporting", language: "Malayalam" },
      ],
      isIndian: true,
      bio: "Born 17 October 2000. Indian voice actress who specializes in Malayalam dubbing.",
      birthDate: "October 17, 2000",
    },
    {
      id: 300147, name: "Azam Sheriff", image: "", languages: ["Tamil", "Telugu"],
      roles: [
        { animeId: 0, animeTitle: "Batman Begins", animeImage: "", characterName: "Bruce Wayne / Batman", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "The Avengers", animeImage: "", characterName: "Bruce Banner / Hulk", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "Venom", animeImage: "", characterName: "Carlton Drake / Riot", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Rango", animeImage: "", characterName: "Rango", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "Ratatouille", animeImage: "", characterName: "Emile", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Cars", animeImage: "", characterName: "Harv", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Sherlock Holmes", animeImage: "", characterName: "Dr. John Watson", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Star Wars: Episode I - The Phantom Menace", animeImage: "", characterName: "Obi-Wan Kenobi", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Star Wars Rebels", animeImage: "", characterName: "Obi-Wan Kenobi", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Django Unchained", animeImage: "", characterName: "Calvin J. Candie", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "KGF: Chapter 1", animeImage: "", characterName: "Rocky", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 0, animeTitle: "Alita: Battle Angel", animeImage: "", characterName: "Vector", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "The Electric State", animeImage: "", characterName: "Keats", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "Ben 10: Omniverse", animeImage: "", characterName: "Rook Blonko", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Black Panther: Wakanda Forever", animeImage: "", characterName: "N'Jadaka", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "The Boys", animeImage: "", characterName: "Translucent", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Captain America: The First Avenger", animeImage: "", characterName: "Howard Stark", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Chicken Run: Dawn of the Nugget", animeImage: "", characterName: "Rocky", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "Dumbo", animeImage: "", characterName: "Holt Farrier", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "Leo", animeImage: "", characterName: "Squirtle", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Plankton: The Movie", animeImage: "", characterName: "Plankton", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Sing Thriller", animeImage: "", characterName: "Buster Moon", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 0, animeTitle: "The SpongeBob Movie: Sponge on the Run", animeImage: "", characterName: "Narrator", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 0, animeTitle: "Jentry Chau vs. The Underworld", animeImage: "", characterName: "Peng Chau", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Indian actor and voice actor fluent in Tamil and Telugu.",
    },
    {
      id: 300148, name: "Swetha Prasad", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/6/6f/Swetha_Prasad.jpg/revision/latest/scale-to-width-down/600?cb=20250313002225", languages: ["Malayalam"],
      roles: [
        { animeId: 235, animeTitle: "Detective Conan", animeImage: "", characterName: "Ran Mouri", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 966, animeTitle: "Shin Chan", animeImage: "", characterName: "Nene Sakurada", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "Erin Brockovich", animeImage: "", characterName: "Erin Brockovich", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Lightyear", animeImage: "", characterName: "I.V.A.N.", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "The Clockwork Girl", animeImage: "", characterName: "Tesla", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Hawa Hawai Family", animeImage: "", characterName: "Rieko", characterImage: "", roleType: "supporting", language: "Malayalam" },
        { animeId: 0, animeTitle: "PAW Patrol", animeImage: "", characterName: "Marshall", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "Winx Club", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Malayalam" },
        { animeId: 0, animeTitle: "50/50 Heroes", animeImage: "", characterName: "Sam", characterImage: "", roleType: "supporting", language: "Malayalam" },
      ],
      isIndian: true,
      bio: "Indian actress and voice actress who specializes in Malayalam dubbing.",
    },
    {
      id: 300149, name: "Archana Maaya", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/0/03/Archana_Maaya.jpg/revision/latest/scale-to-width-down/600?cb=20250313003149", languages: ["Kannada"],
      roles: [
        { animeId: 21175, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Goten", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Winx Club", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Winx Club: The Secret of the Lost Kingdom", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Winx Club: Magical Adventure", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Winx Club: The Mystery of the Abyss", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Maya the Bee Movie", animeImage: "", characterName: "Maya", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Red, White & Royal Blue", animeImage: "", characterName: "Ellen Claremont", characterImage: "", roleType: "supporting", language: "Kannada" },
      ],
      isIndian: true,
      bio: "Indian actress and voice actress who specializes in Kannada dubbing.",
    },
    {
      id: 300150, name: "Samishetti Kiran Sindhu", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/0/0a/Samishetti_Kiran_Sindhu.jpg/revision/latest/scale-to-width-down/480?cb=20250505232250", languages: ["Telugu"],
      roles: [
        { animeId: 162147, animeTitle: "Pokémon Concierge", animeImage: "", characterName: "Haru", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 0, animeTitle: "The Clockwork Girl", animeImage: "", characterName: "Tesla", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 0, animeTitle: "Spider-Man: Across the Spider-Verse", animeImage: "", characterName: "Margo", characterImage: "", roleType: "supporting", language: "Telugu" },
        { animeId: 0, animeTitle: "Winx Club", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 0, animeTitle: "Winx Club: The Secret of the Lost Kingdom", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 0, animeTitle: "Winx Club: The Mystery of the Abyss", animeImage: "", characterName: "Bloom", characterImage: "", roleType: "main", language: "Telugu" },
        { animeId: 0, animeTitle: "Miraculous: Ladybug & Cat Noir, The Movie", animeImage: "", characterName: "Sabrina", characterImage: "", roleType: "supporting", language: "Telugu" },
        { animeId: 0, animeTitle: "Kitty Is Not a Cat", animeImage: "", characterName: "Timmy Tom", characterImage: "", roleType: "supporting", language: "Telugu" },
        { animeId: 0, animeTitle: "Wednesday", animeImage: "", characterName: "Wednesday", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Indian actress and voice actress who specializes in Telugu dubbing.",
    },
    {
      id: 300151, name: "Eliza Lewis", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/9/9e/Eliza_Lewis_-_Hindi_Dubbing_Director.jpg/revision/latest/scale-to-width-down/600?cb=20250519153406", languages: ["Hindi"],
      roles: [
        { animeId: 0, animeTitle: "The Lion King (1994)", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Finding Nemo", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Frozen II", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Inside Out 2", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Superman (2025)", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "World War Z", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Inception", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Moana 2", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Cars", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "The Incredibles", animeImage: "", characterName: "Hindi Dubbing Director", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 15 March. Indian dubbing director and producer; founder and head of the Mainframe Software Communications dubbing studio in Mumbai since 2000.",
      birthDate: "March 15",
    },
    {
      id: 300152, name: "Asif Ali Beg", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/2/21/Asif_Ali_Beg.jpg/revision/latest?cb=20241220130714", languages: ["Hindi"],
      roles: [
        { animeId: 0, animeTitle: "The Incredibles", animeImage: "", characterName: "Edna Mode", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Frozen", animeImage: "", characterName: "Olaf", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Ice Age: Dawn of the Dinosaurs", animeImage: "", characterName: "Sid", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Ice Age: Continental Drift", animeImage: "", characterName: "Sid", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Ice Age: Collision Course", animeImage: "", characterName: "Sid", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Lilo & Stitch", animeImage: "", characterName: "Pleakley", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Who Framed Roger Rabbit", animeImage: "", characterName: "Roger Rabbit", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "The Smurfs", animeImage: "", characterName: "Brainy Smurf", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Muppets", animeImage: "", characterName: "Miss Piggy", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "Madagascar 3: Europe's Most Wanted", animeImage: "", characterName: "Stefano", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 0, animeTitle: "The Many Adventures of Winnie the Pooh", animeImage: "", characterName: "Winnie the Pooh", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 0, animeTitle: "Exodus: Gods and Kings", animeImage: "", characterName: "Viceroy Hegep", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 15 February 1964. Indian voice actor, singer, theater performer and lyricist active since 1982. Won an AVA award for voicing Edna in the Hindi dub of The Incredibles.",
      birthDate: "February 15, 1964",
    },
    {
      id: 300153, name: "Lohith", image: "https://static.wikia.nocookie.net/international-entertainment-project/images/0/04/Lohith.jpg/revision/latest/scale-to-width-down/600?cb=20250907122623", languages: ["Kannada"],
      roles: [
        { animeId: 966, animeTitle: "Shin Chan", animeImage: "", characterName: "Principal", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 966, animeTitle: "New Dimension! Crayon Shinchan the Movie: Battle of Supernatural Powers ~Flying Sushi~", animeImage: "", characterName: "Professor", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 108852, animeTitle: "Bakugan: Battle Planet", animeImage: "", characterName: "Drago", characterImage: "", roleType: "main", language: "Kannada" },
        { animeId: 0, animeTitle: "Chhota Bheem", animeImage: "", characterName: "Kalia", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Hawa Hawai Family", animeImage: "", characterName: "Narrator", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "Rubble & Crew", animeImage: "", characterName: "Grandpa Gravel", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "SpongeBob SquarePants", animeImage: "", characterName: "Squidward", characterImage: "", roleType: "supporting", language: "Kannada" },
        { animeId: 0, animeTitle: "We Bare Bears", animeImage: "", characterName: "Grizzly", characterImage: "", roleType: "main", language: "Kannada" },
      ],
      isIndian: true,
      bio: "Indian voice actor who specializes in Kannada dubbing.",
    },
  ];

  for (const va of indianVAs) {
    const real = realMap.get(va.id);
    if (real) {
      va.id = real.realId;
      va.image = real.image || va.image;
      va.bio = (va.bio || "").replace("Community-sourced", "AniList-verified");
    }
    // Generate avatar if no image from AniList
    if (!va.image) {
      const hue = va.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
      va.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(va.name)}&background=${hue},60,20&color=fff&size=256&font-size=0.42&bold=true&rounded=true&format=svg`;
    }
  }

  const coverMap = await resolveAnimeCovers(indianVAs.flatMap((va) => va.roles.map((r) => r.animeId)));
  for (const va of indianVAs) {
    for (const role of va.roles) {
      if (!role.animeImage && coverMap.has(role.animeId)) {
        role.animeImage = coverMap.get(role.animeId) || "";
      }
    }
  }

  return indianVAs;
}
