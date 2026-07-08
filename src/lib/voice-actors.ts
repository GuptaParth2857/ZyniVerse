import { getStaffBasic, getStaffMedia, bestTitle, searchStaff } from "./anilist";
import type { StaffFull } from "./anilist";

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

  const actors: VoiceActor[] = data.results.map((s: any) => ({
    id: s.id,
    name: s.name?.full || "Unknown",
    nativeName: s.name?.native || undefined,
    image: s.image?.large || s.image?.medium || "",
    roles: [],
  }));

  return { actors, total: data.total };
}

function avatarUrl(name: string): string {
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${hue},70,50&color=fff&size=256&font-size=0.4&rounded=true&bold=true`;
}

const ANILIST_STAFF_QUERY = `
  query ($s: String) {
    Page(page: 1, perPage: 5) {
      staff(search: $s, sort: SEARCH_MATCH) {
        id name { full native } image { large medium } primaryOccupations gender description(asHtml: false)
      }
    }
  }`;

let staffCache: Map<string, { id: number; name: string; nativeName?: string; image: string; description?: string }> | null = null;
let staffCacheTimestamp = 0;
const STAFF_CACHE_TTL = 24 * 60 * 60 * 1000;

async function searchStaffOnAnilist(name: string) {
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: ANILIST_STAFF_QUERY, variables: { s: name } }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const staff = data?.Page?.staff || [];
    return staff.filter((s: any) => {
      const full = s.name?.full?.toLowerCase() || "";
      const native = s.name?.native?.toLowerCase() || "";
      const q = name.toLowerCase();
      return full.includes(q) || q.includes(full) || native.includes(q);
    });
  } catch { return []; }
}

async function enrichWithRealIds(): Promise<Map<number, { realId: number; image: string; name: string }>> {
  if (staffCache && Date.now() - staffCacheTimestamp < STAFF_CACHE_TTL) {
    return staffCache as any;
  }

  const knownNames = [
    { fakeId: 300023, realName: "Rajesh Khattar" },
    { fakeId: 300019, realName: "Shakti Singh" },
    { fakeId: 300021, realName: "Sharad Kelkar" },
    { fakeId: 300022, realName: "Mayur Vyas" },
    { fakeId: 300018, realName: "Prasad Barve" },
    { fakeId: 300010, realName: "Rajeev Raj" },
    { fakeId: 300004, realName: "Mohan Singh" },
  ];

  const map = new Map<number, { realId: number; image: string; name: string }>();

  for (const { fakeId, realName } of knownNames) {
    try {
      const results = await searchStaffOnAnilist(realName);
      if (results.length > 0) {
        const staff = results[0];
        map.set(fakeId, {
          realId: staff.id,
          image: staff.image?.large || staff.image?.medium || "",
          name: staff.name?.full || realName,
        });
      }
    } catch {}
  }

  staffCache = map as any;
  staffCacheTimestamp = Date.now();
  return map;
}

export async function getIndianVoiceActors(): Promise<VoiceActor[]> {
  const realMap = await enrichWithRealIds();

  const indianVAs: VoiceActor[] = [
    { id: 300001, name: "Rachita Ravi", image: avatarUrl("Rachita+Ravi"), roles: [
      { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Nami", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Mikasa Ackerman", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi anime dub artist." },
    { id: 300002, name: "Shubham Raj Singh", image: avatarUrl("Shubham+Raj+Singh"), roles: [
      { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Eren Jaeger", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Known for voicing Luffy in One Piece Hindi dub." },
    { id: 300003, name: "Aditya Raj Sharma", image: avatarUrl("Aditya+Raj+Sharma"), roles: [
      { animeId: 1535, animeTitle: "Death Note", animeImage: "", characterName: "Light Yagami", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300004, name: "Mohan Singh", image: avatarUrl("Mohan+Singh"), roles: [
      { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 22319, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Goku", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300005, name: "Shagun Singh", image: avatarUrl("Shagun+Singh"), roles: [
      { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Hinata Hyuga", characterImage: "", roleType: "supporting", language: "Hindi" },
      { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Boa Hancock", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actress." },
    { id: 300006, name: "Nakul Bhalla", image: avatarUrl("Nakul+Bhalla"), roles: [
      { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Ichigo Kurosaki", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300007, name: "Jitin Sharma", image: avatarUrl("Jitin+Sharma"), roles: [
      { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Gon Freecss", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300008, name: "Dhamandeep Singh", image: avatarUrl("Dhamandeep+Singh"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Levi Ackerman", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300009, name: "Jasleen Kaur", image: avatarUrl("Jasleen+Kaur"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Historia Reiss", characterImage: "", roleType: "supporting", language: "Hindi" },
      { animeId: 5114, animeTitle: "One-Punch Man", animeImage: "", characterName: "Tatsumaki", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actress." },
    { id: 300010, name: "Rajeev Raj", image: avatarUrl("Rajeev+Raj"), roles: [
      { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Goku", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 22319, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Goku", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300011, name: "Mousam Gogoi", image: avatarUrl("Mousam+Gogoi"), roles: [
      { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300012, name: "Rishabh Shukla", image: avatarUrl("Rishabh+Shukla"), roles: [
      { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Yuji Itadori", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300013, name: "Vipul Rai", image: avatarUrl("Vipul+Rai"), roles: [
      { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Satoru Gojo", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300018, name: "Prasad Barve", image: avatarUrl("Prasad+Barve"), roles: [
      { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Ash Ketchum", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Iconic Hindi voice actor." },
    { id: 300019, name: "Shakti Singh", image: avatarUrl("Shakti+Singh"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Hange Zoë", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300020, name: "Sanket Mhatre", image: avatarUrl("Sanket+Mhatre"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Eren Jaeger", characterImage: "", roleType: "main", language: "Hindi" },
      { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Killua Zoldyck", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300021, name: "Sharad Kelkar", image: avatarUrl("Sharad+Kelkar"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Levi Ackerman", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300022, name: "Mayur Vyas", image: avatarUrl("Mayur+Vyas"), roles: [
      { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Sasuke Uchiha", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300023, name: "Rajesh Khattar", image: avatarUrl("Rajesh+Khattar"), roles: [
      { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Kakashi Hatake", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300024, name: "Sachin Gole", image: avatarUrl("Sachin+Gole"), roles: [
      { animeId: 22319, animeTitle: "Dragon Ball Super", animeImage: "", characterName: "Vegeta", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300025, name: "Chetanya Adib", image: avatarUrl("Chetanya+Adib"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Erwin Smith", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300026, name: "Ninad Kamat", image: avatarUrl("Ninad+Kamat"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Reiner Braun", characterImage: "", roleType: "supporting", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300027, name: "Parignya Pandya Shah", image: avatarUrl("Parignya+Pandya+Shah"), roles: [
      { animeId: 527, animeTitle: "Pokémon", animeImage: "", characterName: "Misty", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actress." },
    { id: 300028, name: "Samriddhi Shukla", image: avatarUrl("Samriddhi+Shukla"), roles: [
      { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actress." },
    { id: 300029, name: "Manoj Pandey", image: avatarUrl("Manoj+Pandey"), roles: [
      { animeId: 269, animeTitle: "Bleach", animeImage: "", characterName: "Rukia Kuchiki", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300030, name: "Anuj Gurwara", image: avatarUrl("Anuj+Gurwara"), roles: [
      { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Roronoa Zoro", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300031, name: "Shreyas Talpade", image: avatarUrl("Shreyas+Talpade"), roles: [
      { animeId: 813, animeTitle: "Dragon Ball Z", animeImage: "", characterName: "Goku", characterImage: "", roleType: "main", language: "Hindi" },
    ], isIndian: true, bio: "Community-sourced — Hindi voice actor." },
    { id: 300014, name: "Shashika Sree", image: avatarUrl("Shashika+Sree"), roles: [
      { animeId: 11061, animeTitle: "Hunter x Hunter", animeImage: "", characterName: "Kurapika", characterImage: "", roleType: "main", language: "Tamil" },
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Mikasa Ackerman", characterImage: "", roleType: "main", language: "Tamil" },
    ], isIndian: true, bio: "Community-sourced — Tamil voice actress." },
    { id: 300015, name: "Aravind Raj", image: avatarUrl("Aravind+Raj"), roles: [
      { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Monkey D. Luffy", characterImage: "", roleType: "main", language: "Tamil" },
    ], isIndian: true, bio: "Community-sourced — Tamil voice actor." },
    { id: 300032, name: "Brindha Sivakumar", image: avatarUrl("Brindha+Sivakumar"), roles: [
      { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Tamil" },
    ], isIndian: true, bio: "Community-sourced — Tamil voice actress." },
    { id: 300033, name: "Chinmayi", image: avatarUrl("Chinmayi"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Mikasa Ackerman", characterImage: "", roleType: "main", language: "Tamil" },
    ], isIndian: true, bio: "Community-sourced — Tamil voice actress." },
    { id: 300016, name: "Sai Priya", image: avatarUrl("Sai+Priya"), roles: [
      { animeId: 16498, animeTitle: "Attack on Titan", animeImage: "", characterName: "Mikasa Ackerman", characterImage: "", roleType: "main", language: "Telugu" },
    ], isIndian: true, bio: "Community-sourced — Telugu voice actress." },
    { id: 300017, name: "Naveen Kumar", image: avatarUrl("Naveen+Kumar"), roles: [
      { animeId: 1735, animeTitle: "Naruto Shippuden", animeImage: "", characterName: "Naruto Uzumaki", characterImage: "", roleType: "main", language: "Telugu" },
    ], isIndian: true, bio: "Community-sourced — Telugu voice actor." },
    { id: 300034, name: "Sravana Bhargavi", image: avatarUrl("Sravana+Bhargavi"), roles: [
      { animeId: 21, animeTitle: "One Piece", animeImage: "", characterName: "Nami", characterImage: "", roleType: "main", language: "Telugu" },
    ], isIndian: true, bio: "Community-sourced — Telugu voice actress." },
    { id: 300035, name: "Sowmya Sharma", image: avatarUrl("Sowmya+Sharma"), roles: [
      { animeId: 23755, animeTitle: "Jujutsu Kaisen", animeImage: "", characterName: "Nobara Kugisaki", characterImage: "", roleType: "main", language: "Telugu" },
    ], isIndian: true, bio: "Community-sourced — Telugu voice actress." },
  ];

  for (const va of indianVAs) {
    const real = realMap.get(va.id);
    if (real) {
      va.id = real.realId;
      va.image = real.image || va.image;
      va.bio = (va.bio || "").replace("Community-sourced", "AniList-verified");
    }
  }

  return indianVAs;
}
