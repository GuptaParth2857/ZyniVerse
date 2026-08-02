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

export async function getIndianVoiceActors(): Promise<VoiceActor[]> {
  const realMap = await enrichWithRealIds();

  const indianVAs: VoiceActor[] = [
    // ══════════════════════════════════════════════
    // HINDI DUB — CRUNCHYROLL / SONY YAY! / NETFLIX
    // ══════════════════════════════════════════════
    {
      id: 300001, name: "Rajesh Kava", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 20, animeTitle: "Naruto", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Android 17", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Usopp (East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denki Kaminari", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Born 18 March 1979. One of India's most prolific voice actors — voices Sasuke Uchiha (Naruto), Android 17 (DBZ), Harry Potter, Jon Snow (Game of Thrones), and Legolas (LOTR). Active since 2000.",
      birthDate: "March 18, 1979",
      birthplace: "Mumbai, India",
      agency: "Sound & Vision India",
    },
    {
      id: 300002, name: "Lohit Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denji", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Meguru Bachira", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 45114, animeTitle: "Re:ZERO", animeImage: "", characterName: "Natsuki Subaru", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Prominent Hindi anime dubbing artist. Known for voicing Gojo Satoru (Jujutsu Kaisen), Denji (Chainsaw Man), and Bachira (Blue Lock) in Hindi dubs on Crunchyroll.",
      agency: "Prime Focus Technologies",
    },
    {
      id: 300003, name: "Vidit Kumar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuji Itadori", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Brook", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Yahiko", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Chojuro", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Hindi voice actor known for Yuji Itadori (Jujutsu Kaisen Crunchyroll), Brook (One Piece), and multiple supporting roles in Naruto Shippuden Hindi dub.",
    },
    {
      id: 300004, name: "Sahil Kulkarni", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Megumi Fushiguro", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Arthur Boyle", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Rui", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Yushiro", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Hindi dubbing artist known for Megumi Fushiguro (JJK), Arthur Boyle (Fire Force), and Rui (Demon Slayer). Works with Crunchyroll India.",
    },
    {
      id: 300005, name: "Mohit Sinha", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Shinra Kusakabe", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 44922, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Ryoga Hibiki", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Kakashi Hatake (Naruto Shippuden), Shinra Kusakabe (Fire Force), and Ryoga Hibiki (Ranma 1/2) in Hindi dubs.",
    },
    {
      id: 300006, name: "Merlyn James", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Kobeni Higashiyama", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Konan", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Iris", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Momo Nishimiya", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 44922, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Ranma (Girl)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Versatile Hindi voice actress. Known for Kobeni (Chainsaw Man), Konan (Naruto), Iris (Fire Force), and Ranma's female form (Ranma 1/2).",
    },
    {
      id: 300007, name: "Sanket Mhatre", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Muzan Kibutsuji", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro (East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Muzan Kibutsuji (Demon Slayer Muse India) and Roronoa Zoro (One Piece East Blue Hindi dub).",
    },
    {
      id: 300008, name: "Pooja Punjabi", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Hibana", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Naruto Uzumaki in the Sony YAY! Hindi dub of Naruto Shippuden — one of the most iconic roles in Indian anime dubbing.",
    },
    {
      id: 300009, name: "Vaibhav Thakkar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy (Wano & East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "The Hindi voice of Monkey D. Luffy in One Piece on Cartoon Network India — both the Wano Arc (2024) and East Blue Saga (2025).",
    },
    {
      id: 300010, name: "Sparsh Korde", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tanjiro Kamado (Muse India S1)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Toji Fushiguro", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tanjiro Kamado in the Muse India Hindi dub of Demon Slayer Season 1, and Toji Fushiguro in Jujutsu Kaisen.",
    },
    {
      id: 300011, name: "Ayushi Prakash", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Maki Zenin / Mai Zenin", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Power", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kurotsuchi", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Hindi voice actress known for Power (Chainsaw Man), Maki & Mai Zenin (JJK), and multiple roles across Crunchyroll Hindi dubs.",
    },
    {
      id: 300012, name: "Suvela Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 44922, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Nabiki Tendo", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Mitsuri Kanroji", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nobara Kugisaki (JJK), Nabiki Tendo (Ranma 1/2), and Mitsuri Kanroji (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300013, name: "Krutarth Trivedi", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Suguru Geto", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Akitaru Obi", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 44922, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Tatewaki Kuno", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Suguru Geto (JJK), Akitaru Obi (Fire Force), and Tatewaki Kuno (Ranma 1/2) in Hindi dubs.",
    },
    {
      id: 300014, name: "Himanshu Rana", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Kento Nanami", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Aki Hayakawa", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Kento Nanami (JJK) and Aki Hayakawa (Chainsaw Man) in Crunchyroll Hindi dubs.",
    },
    {
      id: 300015, name: "Saudamini Anjaria", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Makima", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Inca Kasugatani", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Makima in the Hindi dub of Chainsaw Man. Also known for dubbing Spider-Man: Into the Spider-Verse.",
    },
    {
      id: 300016, name: "Archit Maurya", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Ryomen Sukuna", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Katana Man", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Ryomen Sukuna (JJK) and Katana Man (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300017, name: "Aadityaraj Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Nagato", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Sakonji Urokodaki", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Vulcan Joseph", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Jinpei Ego", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Versatile Hindi VA — voices Nagato (Naruto), Urokodaki (Demon Slayer), Vulcan (Fire Force), and Jingo Raichi (Blue Lock).",
    },
    {
      id: 300018, name: "Sachin Gole", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Pain", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Pain in the Hindi dub of Naruto Shippuden — one of the most memorable villain performances in Indian anime dubbing.",
    },
    {
      id: 300019, name: "Karan Trivedi", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Tobi / Obito Uchiha", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy (CN India)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tobi/Obito (Naruto Shippuden) and Luffy (One Piece CN India). Also known for voicing Harry Potter before Rajesh Kava.",
    },
    {
      id: 300020, name: "Anshul Saxena", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Neji Hyuga / Minato Namikaze", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Rensuke Kunigami", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Gol D. Roger", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Neji & Minato (Naruto), Kunigami (Blue Lock), and Gol D. Roger (One Piece) in Hindi dubs.",
    },
    {
      id: 300021, name: "Farhan Patel", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Itachi Uchiha", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Galgali", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Itachi Uchiha (Naruto) and Galgali (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300022, name: "Shaily Dubey", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sakura Haruno", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 44922, animeTitle: "Ranma 1/2", animeImage: "", characterName: "Kodachi Kuno", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Sakura Haruno (Naruto Shippuden) and Kodachi Kuno (Ranma 1/2) in Hindi dubs.",
    },
    {
      id: 300023, name: "Dipinti Bhobaskar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Hinata Hyuga", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Riko Amanai", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Hinata Hyuga (Naruto) and Riko Amanai (JJK) in Hindi dubs.",
    },
    {
      id: 300024, name: "Natasha Chungath", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Utahime Iori", characterImage: "", roleType: "guest", language: "Hindi" },
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
        { animeId: 56799, animeTitle: "A Couple of Cuckoos", animeImage: "", characterName: "Hiro Segawa (S2)", characterImage: "", roleType: "supporting", language: "Hindi" },
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
      id: 300031, name: "Dinu Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Giyu Tomioka (Crunchyroll)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 56799, animeTitle: "A Couple of Cuckoos", animeImage: "", characterName: "Nagi Umino (S1)", characterImage: "", roleType: "main", language: "Hindi" },
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
      id: 300034, name: "Akshar Joshi", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Noritoshi Kamo", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Takeo Kamado", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Noritoshi Kamo (JJK) and Takeo Kamado (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300035, name: "Harsh Joshi", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Junpei Yoshino", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Koby (East Blue)", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Murata", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Junpei (JJK), Koby (One Piece), and Murata (Demon Slayer) in Hindi dubs.",
    },
    {
      id: 300036, name: "Warren D'souza", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Kento Nanami / Mahito (Sony YAY!)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Hirokazu Arai", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nanami & Mahito (JJK Sony YAY!) and Hirokazu Arai (Chainsaw Man) in Hindi.",
    },
    {
      id: 300037, name: "Manikant", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Gaara", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Beam", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Toji Fushiguro (Sony YAY!)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Gaara (Naruto), Beam (Chainsaw Man), and Toji (JJK Sony YAY!) in Hindi dubs.",
    },
    {
      id: 300038, name: "Akshita Mishra", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Sasha Braus / Christa", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 56799, animeTitle: "A Couple of Cuckoos", animeImage: "", characterName: "Erika Amano (S2)", characterImage: "", roleType: "main", language: "Hindi" },
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
      id: 300042, name: "Ranpick Tiwari", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Yoichi Isagi (Crunchyroll)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Yoichi Isagi in the Crunchyroll Hindi dub of Blue Lock.",
    },
    {
      id: 300043, name: "Sanchit Wartak", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Jinpachi Ego", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Gyuki", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Shanks (East Blue)", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Jinpachi Ego (Blue Lock), Gyuki (Naruto), and Shanks (One Piece) in Hindi.",
    },
    {
      id: 300044, name: "Riyasengupta", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Reze / Akane Sawatari", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 45114, animeTitle: "Re:ZERO", animeImage: "", characterName: "Emilia", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Reze & Akane (Chainsaw Man) and Emilia (Re:ZERO) in Hindi dubs.",
    },
    {
      id: 300045, name: "Rushikesh Punse", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Tengen Uzui (Muse India)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Hyoma Chigiri", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tengen Uzui (Demon Slayer Muse) and Chigiri (Blue Lock) in Hindi dubs.",
    },
    {
      id: 300046, name: "Ankit Goswami", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Reo Mikage / Sae Itoshi", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sasori (Hiruko)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Reo & Sae (Blue Lock) and Sasori (Naruto) in Hindi dubs.",
    },

    // ══════════════════════════════════════════════
    // TAMIL DUB — CRUNCHYROLL / MUSE INDIA
    // ══════════════════════════════════════════════
    {
      id: 300047, name: "Rithick Elayaraja", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Shikamaru Nara", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Neji Hyuga", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Born 2002. Tamil voice actor known for Gojo Satoru (JJK Tamil), Shikamaru & Neji (Naruto Tamil). One of the youngest prominent anime dubbing artists in India.",
    },
    {
      id: 300048, name: "Roshan Nesapriyan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuji Itadori", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Yuji Itadori in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300049, name: "Arvind Rathinavel", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Megumi Fushiguro", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Megumi Fushiguro in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300050, name: "Akshya Prabu", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Nobara Kugisaki in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300051, name: "Praveen Kesavan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Ryomen Sukuna", characterImage: "", roleType: "main", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Ryomen Sukuna in the Crunchyroll Tamil dub of Jujutsu Kaisen.",
    },
    {
      id: 300052, name: "Deepa Venkat", image: "", languages: ["Tamil"],
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
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Denji", characterImage: "", roleType: "main", language: "Tamil" },
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
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "main", language: "Telugu" },
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
      bio: "Legendary Hindi voice actor from the Cartoon Network India era. The iconic Hindi voice of Ash Ketchum (Pokémon) and Vegeta (DBZ).",
      agency: "Sound & Vision India",
    },
    {
      id: 300058, name: "Saumya Daan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro (Toonami)", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Classic Cartoon Network India era voice actor. Hindi voice of Roronoa Zoro in the original One Piece Toonami dub.",
    },
    {
      id: 300059, name: "Sandeep Karnik", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Gol D. Roger / Higuma / Jango", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Classic CN India voice actor. Voiced Gol D. Roger, Higuma, and Jango in the original One Piece Toonami Hindi dub.",
    },
    {
      id: 300060, name: "Sonal Kaushal", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Nami (East Blue)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Maki Oze", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Nami (One Piece East Blue) and Maki Oze (Fire Force) in Hindi dubs.",
    },
    {
      id: 300061, name: "Anshul Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Enmu", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Jogo (Sony YAY!)", characterImage: "", roleType: "guest", language: "Hindi" },
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
      id: 300063, name: "Faheem Amin", image: "", languages: ["Hindi"],
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
      id: 300066, name: "Apala Bisht", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Shinobu Kocho (Muse India)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Rin Nohara / Tenten (S11+)", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Riko Amanai (Sony YAY!)", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Shinobu (Demon Slayer Muse), Rin & Tenten (Naruto), and Riko (JJK Sony YAY!) in Hindi.",
    },

    // ══════════════════════════════════════════════
    // MORE HINDI — SPY x FAMILY, SOLO LEVELING, MHA, DANDADAN, etc.
    // ══════════════════════════════════════════════
    {
      id: 300067, name: "Shilpi Pandey", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Yor Forger", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Yor Forger in the Crunchyroll Hindi dub of Spy x Family.",
    },
    {
      id: 300068, name: "Sheena Rattan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Damian Desmond", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Damian Desmond in the Crunchyroll Hindi dub of Spy x Family.",
    },
    {
      id: 300069, name: "Kasturi Ajay Joglekar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Becky Blackbell", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Becky Blackbell in the Crunchyroll Hindi dub of Spy x Family.",
    },
    {
      id: 300070, name: "Rajesh Shukla", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinwoo", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Sung Jinwoo in the Crunchyroll Hindi dub of Solo Leveling.",
    },
    {
      id: 300071, name: "Rana Daggubati", image: "", languages: ["Hindi", "Tamil", "Telugu"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Barca (Ice Elf)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Famous Indian actor (Baahubali). Voiced Barca in Solo Leveling across Hindi, Tamil & Telugu dubs.",
      birthplace: "Chennai, India",
    },
    {
      id: 300072, name: "Ali Fazal", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Song Chiyul", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Famous Indian actor (Mirzapur, Fateh). Voiced Song Chiyul in Solo Leveling Hindi dub.",
    },
    {
      id: 300073, name: "Mani Puhan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 120098, animeTitle: "Dandadan", animeImage: "", characterName: "Momo Ayase", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Angel Devil", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Momo Ayase (Dandadan) and Angel Devil (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300074, name: "Pratik Verma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 120098, animeTitle: "Dandadan", animeImage: "", characterName: "Okarun", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Shikamaru Nara (S15+)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Okarun (Dandadan) and Shikamaru Nara from Season 15+ (Naruto Shippuden) in Hindi.",
    },
    {
      id: 300075, name: "Renu Sharda", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 120098, animeTitle: "Dandadan", animeImage: "", characterName: "Turbo Granny", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Kiyo Terauchi", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Sharon", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Turbo Granny (Dandadan), Kiyo Terauchi (Demon Slayer), and Sharon (Spy x Family) in Hindi.",
    },
    {
      id: 300076, name: "Saanwari Yagnik", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 120098, animeTitle: "Dandadan", animeImage: "", characterName: "Seiko Ayase", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Seiko Ayase in the Muse India Hindi dub of Dandadan.",
    },
    {
      id: 300077, name: "Ghanshyam Shukla", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 5114, animeTitle: "One Punch Man", animeImage: "", characterName: "Saitama", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 31759, animeTitle: "Neon Genesis Evangelion", animeImage: "", characterName: "Gendoh Ikari", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Saitama (One Punch Man) and Gendoh Ikari (Evangelion) in Hindi dubs.",
    },
    {
      id: 300078, name: "Sahil Vinod Kulkarni", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 259011, animeTitle: "My Hero Academia", animeImage: "", characterName: "Katsuki Bakugo", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Katsuki Bakugo in the Cartoon Network India Hindi dub of My Hero Academia.",
    },
    {
      id: 300079, name: "Mohak Ninad", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 259011, animeTitle: "My Hero Academia", animeImage: "", characterName: "All Might", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices All Might in the Cartoon Network India Hindi dub of My Hero Academia.",
    },
    {
      id: 300080, name: "Damandeep Singh Baggan", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Jiraiya", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Jiraiya in the Hindi dub of Naruto Shippuden. Also the voice of Hanuman in Legend of Hanuman.",
    },
    {
      id: 300081, name: "Vishal Menon", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Orochimaru", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Takehisa Hinawa", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Orochimaru (Naruto Sony YAY!) and Hinawa (Fire Force) in Hindi.",
    },
    {
      id: 300082, name: "Dishi Duggal", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Tsunade Senju", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Tsunade Senju in the Sony YAY! Hindi dub of Naruto Shippuden.",
    },
    {
      id: 300083, name: "Vallabh Bhingarde", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Zabuza Momochi", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Zabuza Momochi in the Sony YAY! Hindi dub of Naruto Shippuden.",
    },
    {
      id: 300084, name: "Pawan Kalra", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kurama (Nine-Tails)", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Arlong", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Kurama (Nine-Tails) in Naruto and Arlong in One Piece Hindi dubs.",
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
      id: 300086, name: "Ankit Goswami", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 56799, animeTitle: "Dr. Stone", animeImage: "", characterName: "Senku Ishigami", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Hisoka / Adult Gon", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sasori (Hiruko)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Senku (Dr. Stone), Hisoka & Adult Gon (Hunter x Hunter), and Sasori (Naruto) in Hindi.",
    },
    {
      id: 300087, name: "Soneer Vadhera", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 56799, animeTitle: "Dr. Stone", animeImage: "", characterName: "Tsukasa Shishio", characterImage: "", roleType: "main", language: "Hindi" },
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
      id: 300090, name: "Shiney Prakash", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Haku / Guren", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki (Sony YAY!)", characterImage: "", roleType: "main", language: "Hindi" },
        { animeId: 38000, animeTitle: "Fire Force", animeImage: "", characterName: "Tamaki Kotatsu", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Haku & Guren (Naruto), Nobara (JJK Sony YAY!), and Tamaki (Fire Force) in Hindi.",
    },
    {
      id: 300091, name: "Harshvardhan Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kiba Inuzuka", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 53947, animeTitle: "Blue Lock", animeImage: "", characterName: "Seishiro Nagi", characterImage: "", roleType: "main", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Kiba (Naruto) and Seishiro Nagi (Blue Lock) in Hindi dubs.",
    },
    {
      id: 300092, name: "Rajesh Khattar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kakashi Hatake (CN India)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Veteran Hindi dubbing artist. Voiced Kakashi Hatake in the Cartoon Network India Hindi dub of Naruto.",
    },
    {
      id: 300093, name: "Shanoor Mirza", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Gaara (CN India)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Gaara in the Cartoon Network India Hindi dub of Naruto.",
    },
    {
      id: 300094, name: "Niranjan Panchal", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Masamichi Yaga", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Debt Collector", characterImage: "", roleType: "guest", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Masamichi Yaga (JJK) and Debt Collector (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300095, name: "Vinod Sharma", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Hagoromo Otsutsuki", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 40748, animeTitle: "Chainsaw Man", animeImage: "", characterName: "Kishibe", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Hagoromo (Naruto) and Kishibe (Chainsaw Man) in Hindi dubs.",
    },
    {
      id: 300096, name: "Himanshu Kapil", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Killer B / Tobirama Senju", characterImage: "", roleType: "supporting", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Kokichi Muta / Mechamaru", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voices Killer B & Tobirama (Naruto) and Mechamaru (JJK) in Hindi dubs.",
    },
    {
      id: 300097, name: "Krrish Kumar", image: "", languages: ["Hindi"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Aoba Yamashiro", characterImage: "", roleType: "guest", language: "Hindi" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Suguru Geto (Sony YAY!)", characterImage: "", roleType: "supporting", language: "Hindi" },
      ],
      isIndian: true,
      bio: "Voiced Aoba (Naruto) and Geto (JJK Sony YAY!) in Hindi dubs.",
    },

    // ══════════════════════════════════════════════
    // MORE TAMIL DUB VOICE ACTORS
    // ══════════════════════════════════════════════
    {
      id: 300098, name: "Sai Sujith", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Noritoshi Kamo", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Damian Desmond", characterImage: "", roleType: "supporting", language: "Tamil" },
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
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Anya Forger", characterImage: "", roleType: "main", language: "Tamil" },
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
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Aoi Todo", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Tengen (Demon Slayer) and Aoi Todo (JJK) in Tamil dubs.",
    },
    {
      id: 300104, name: "Dinu Vairapathi", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Doma", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Mahito", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Orochimaru", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Doma (Demon Slayer), Mahito (JJK), and Orochimaru (Naruto).",
    },
    {
      id: 300105, name: "Raghuvaran", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Obito Uchiha / Tobi", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Loid Forger", characterImage: "", roleType: "main", language: "Tamil" },
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
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Henry Henderson", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Android 16", characterImage: "", roleType: "supporting", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Kokushibo (Demon Slayer), Henderson (Spy x Family), and Android 16 (DBZ).",
    },
    {
      id: 300111, name: "Haripriya T", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 101922, animeTitle: "Demon Slayer", animeImage: "", characterName: "Daki / Ume", characterImage: "", roleType: "supporting", language: "Tamil" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuki Tsukumo", characterImage: "", roleType: "guest", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Daki (Demon Slayer) and Yuki Tsukumo (JJK) in Tamil dubs.",
    },
    {
      id: 300112, name: "Hari Krishnan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy", characterImage: "", roleType: "main", language: "Tamil" },
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Ui Ui", characterImage: "", roleType: "guest", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Monkey D. Luffy (One Piece) and Ui Ui (JJK) in Tamil dubs.",
    },
    {
      id: 300113, name: "Sai Krishna", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinwoo", characterImage: "", roleType: "main", language: "Tamil" },
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
        { animeId: 41025, animeTitle: "Spy x Family", animeImage: "", characterName: "Donovan Desmond", characterImage: "", roleType: "guest", language: "Tamil" },
      ],
      isIndian: true,
      bio: "Tamil voice of Hiruzen Sarutobi (Naruto) and Donovan Desmond (Spy x Family).",
    },
    {
      id: 300118, name: "Surya Veerarajan", image: "", languages: ["Tamil"],
      roles: [
        { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Suguru Geto", characterImage: "", roleType: "supporting", language: "Tamil" },
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
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinwoo", characterImage: "", roleType: "main", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Sung Jinwoo in the Crunchyroll Telugu dub of Solo Leveling.",
    },
    {
      id: 300125, name: "Edukoju Sangeetha", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Sung Jinah", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Sung Jinah in the Crunchyroll Telugu dub of Solo Leveling.",
    },
    {
      id: 300126, name: "Ayaz Hussain Khan Pattan", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Woo Jinchul", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Woo Jinchul in the Crunchyroll Telugu dub of Solo Leveling.",
    },
    {
      id: 300127, name: "Sivvala Srikanth", image: "", languages: ["Telugu"],
      roles: [
        { animeId: 113415, animeTitle: "Solo Leveling", animeImage: "", characterName: "Choi Jong-In", characterImage: "", roleType: "supporting", language: "Telugu" },
      ],
      isIndian: true,
      bio: "Telugu voice of Choi Jong-In in the Crunchyroll Telugu dub of Solo Leveling.",
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

  return indianVAs;
}
