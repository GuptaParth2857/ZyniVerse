/**
 * Theaters & Booking — curated multiplex data for Indian anime theatrical releases.
 * BookMyShow/PVR INOX/District ko direct booking deep-links milte hain.
 * Screen counts aur seat classes web-verified hain (Aug 2026); seat maps representative hain
 * (real-time availability ke liye booking platform kholo).
 */

export interface Theater {
  id: string;
  name: string;
  chain: string;
  area: string;
  screens: number;
  /** Verified seat tiers / format names — rendered on the seat map */
  classes: SeatClassId[];
  /** URL for the theater / chain booking page */
  bookUrl: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  /** BookMyShow city slug (in.bookmyshow.com/{slug}) */
  bmsSlug: string;
  theaters: Theater[];
}

/**
 * Real Indian seat tiers + auditorium formats (verified Aug 2026).
 * `rows`/`cols` control the representative seat grid; formats render a single row.
 */
export const SEAT_CLASSES = {
  RECLINER: { id: "RECLINER", label: "Recliner", color: "#ff2d78", rows: 2, cols: 10 },
  DIRECTORSCUT: { id: "DIRECTORSCUT", label: "Director's Cut", color: "#7c5cff", rows: 1, cols: 10 },
  INSIGNIA: { id: "INSIGNIA", label: "Insignia", color: "#d8b4fe", rows: 2, cols: 14 },
  LUXE: { id: "LUXE", label: "Luxe", color: "#ffb347", rows: 2, cols: 12 },
  PXL: { id: "PXL", label: "PXL", color: "#00d4ff", rows: 2, cols: 14 },
  IMAX: { id: "IMAX", label: "IMAX", color: "#ff4655", rows: 1, cols: 12 },
  "4DX": { id: "4DX", label: "4DX", color: "#22d3ee", rows: 1, cols: 12 },
  GOLDCLASS: { id: "GOLDCLASS", label: "Gold Class", color: "#eab308", rows: 2, cols: 12 },
  VIP: { id: "VIP", label: "VIP", color: "#ff9ecf", rows: 2, cols: 12 },
  EXECUTIVE: { id: "EXECUTIVE", label: "Executive", color: "#4aa8ff", rows: 3, cols: 16 },
  PREMIUM: { id: "PREMIUM", label: "Premium", color: "#8a5cff", rows: 3, cols: 16 },
  PLATINUM: { id: "PLATINUM", label: "Platinum", color: "#29f2e0", rows: 4, cols: 18 },
  BUSINESS: { id: "BUSINESS", label: "Business", color: "#ffd166", rows: 2, cols: 14 },
  PREMIER: { id: "PREMIER", label: "Premier", color: "#a3e635", rows: 1, cols: 12 },
  MACROXE: { id: "MACROXE", label: "Macro XE", color: "#f472b6", rows: 1, cols: 12 },
  DOLBYSLS: { id: "DOLBYSLS", label: "Dolby SLS", color: "#818cf8", rows: 1, cols: 10 },
  BIGPIX: { id: "BIGPIX", label: "BigPix", color: "#38bdf8", rows: 1, cols: 12 },
  PLAYHOUSE: { id: "PLAYHOUSE", label: "Playhouse", color: "#4ade80", rows: 1, cols: 10 },
  KIDDLES: { id: "KIDDLES", label: "Kiddles", color: "#fbbf24", rows: 1, cols: 10 },
  MAX4D: { id: "MAX4D", label: "MAX 4D", color: "#2dd4bf", rows: 1, cols: 10 },
  JUNIOR: { id: "JUNIOR", label: "Junior", color: "#fda4af", rows: 1, cols: 8 },
  CLASSIC: { id: "CLASSIC", label: "Classic", color: "#6ee7a0", rows: 5, cols: 18 },
  SOFA: { id: "SOFA", label: "Sofa", color: "#f9a8d4", rows: 1, cols: 8 },
  GOLD: { id: "GOLD", label: "Gold", color: "#f5c64f", rows: 6, cols: 20 },
  SILVER: { id: "SILVER", label: "Silver", color: "#c0c7d1", rows: 8, cols: 22 },
  RUBY: { id: "RUBY", label: "Ruby", color: "#f43f5e", rows: 2, cols: 12 },
  DIAMOND: { id: "DIAMOND", label: "Diamond", color: "#c084fc", rows: 2, cols: 12 },
  PEARL: { id: "PEARL", label: "Pearl", color: "#e879f9", rows: 3, cols: 14 },
  EMERALD: { id: "EMERALD", label: "Emerald", color: "#34d399", rows: 4, cols: 16 },
  WHEELCHAIR: { id: "WHEELCHAIR", label: "Wheelchair", color: "#6b7280", rows: 1, cols: 2 },
} as const;

export type SeatClassId = keyof typeof SEAT_CLASSES;

/** Display order on the seat map: premium experiences first, budget seats last */
export const SEAT_ORDER: SeatClassId[] = [
  "DIRECTORSCUT", "INSIGNIA", "LUXE", "PXL", "IMAX", "4DX", "GOLDCLASS", "VIP",
  "RECLINER", "PLATINUM", "EXECUTIVE", "PREMIUM", "BUSINESS", "PREMIER",
  "MACROXE", "DOLBYSLS", "BIGPIX", "PLAYHOUSE", "KIDDLES", "MAX4D", "JUNIOR",
  "CLASSIC", "SOFA", "GOLD", "SILVER", "RUBY", "DIAMOND", "PEARL", "EMERALD",
  "WHEELCHAIR",
];

const PVR = "https://www.pvrcinemas.com/";
const INOX = "https://www.inoxmovies.com/";
const CINEPOLIS = "https://www.cinepolisindia.com/";
const BMS = "https://www.bookmyshow.com/";

export const CITIES: City[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    lat: 19.076,
    lng: 72.8777,
    bmsSlug: "mumbai",
    theaters: [
      { id: "mum-pvr-icon-lowerparel", name: "PVR ICON Phoenix Palladium", chain: "PVR INOX", area: "Lower Parel", screens: 7, classes: ["RECLINER", "PREMIUM", "GOLD", "SILVER"], bookUrl: PVR },
      { id: "mum-inox-jwiorld", name: "Maison INOX (Jio World Plaza)", chain: "INOX", area: "Bandra Kurla Complex", screens: 6, classes: ["IMAX", "RECLINER", "PREMIUM"], bookUrl: INOX },
      { id: "mum-inox-inorbit", name: "INOX Megaplex Inorbit", chain: "INOX", area: "Inorbit, Malad West", screens: 11, classes: ["INSIGNIA", "IMAX", "RECLINER", "PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
      { id: "mum-cinepolis-funrepublic", name: "Cinépolis Fun Republic", chain: "Cinépolis", area: "Andheri West", screens: 4, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: CINEPOLIS },
      { id: "mum-movietime-malad", name: "MovieTime Cinemas", chain: "MovieTime", area: "Malad West", screens: 2, classes: ["GOLD", "SILVER"], bookUrl: "https://movietimecinemas.in/" },
    ],
  },
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    state: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    bmsSlug: "delhi",
    theaters: [
      { id: "ncr-pvr-dir-cut", name: "PVR Director's Cut", chain: "PVR INOX", area: "Ambience Mall, Vasant Kunj", screens: 4, classes: ["DIRECTORSCUT", "RECLINER"], bookUrl: PVR },
      { id: "ncr-pvr-selectcity", name: "PVR Select Citywalk", chain: "PVR INOX", area: "Saket", screens: 6, classes: ["IMAX", "GOLD", "RECLINER"], bookUrl: PVR },
      { id: "ncr-inox-nehruplace", name: "INOX Nehru Place", chain: "INOX", area: "Nehru Place", screens: 5, classes: ["INSIGNIA", "EXECUTIVE", "PREMIUM", "RECLINER"], bookUrl: INOX },
      { id: "ncr-cinepolis-sohna", name: "Cinépolis Airia Mall", chain: "Cinépolis", area: "Sohna Road, Gurgaon", screens: 7, classes: ["EXECUTIVE", "PREMIUM", "MACROXE", "DOLBYSLS", "JUNIOR"], bookUrl: CINEPOLIS },
      { id: "ncr-wave-noida", name: "Wave Cinemas", chain: "Wave", area: "Sector 18, Noida", screens: 5, classes: ["PLATINUM", "GOLD", "SILVER"], bookUrl: "https://www.wavecinemas.com/" },
    ],
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    bmsSlug: "bengaluru",
    theaters: [
      { id: "blr-pvr-orion", name: "PVR INOX Orion Mall", chain: "PVR INOX", area: "Rajajinagar, Brigade Gateway", screens: 11, classes: ["IMAX", "4DX", "PXL", "GOLD", "EXECUTIVE", "PREMIUM", "CLASSIC"], bookUrl: PVR },
      { id: "blr-pvr-vr", name: "PVR VR Bengaluru", chain: "PVR INOX", area: "Whitefield", screens: 9, classes: ["IMAX", "GOLD", "PREMIER", "PREMIUM", "EXECUTIVE"], bookUrl: PVR },
      { id: "blr-inox-garuda", name: "INOX Garuda Mall", chain: "INOX", area: "Magrath Road", screens: 5, classes: ["INSIGNIA", "EXECUTIVE", "PREMIUM", "CLASSIC"], bookUrl: INOX },
      { id: "blr-cinepolis-eta", name: "Cinépolis ETA Namma Mall", chain: "Cinépolis", area: "Magadi Road, Binny Pete", screens: 8, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: CINEPOLIS },
    ],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    lat: 17.385,
    lng: 78.4867,
    bmsSlug: "hyderabad",
    theaters: [
      { id: "hyd-pvr-inorbit", name: "PVR INOX Superplex Inorbit", chain: "PVR INOX", area: "Hitec City (Cyberabad)", screens: 11, classes: ["LUXE", "PXL", "4DX", "PREMIUM", "EXECUTIVE"], bookUrl: PVR },
      { id: "hyd-pvr-peekaboo", name: "PVR INOX Nexus Mall", chain: "PVR INOX", area: "Kukatpally", screens: 9, classes: ["4DX", "RECLINER", "PREMIUM", "EXECUTIVE", "CLASSIC"], bookUrl: PVR },
      { id: "hyd-inox-gvk", name: "PVR INOX GVK One", chain: "PVR INOX", area: "Banjara Hills", screens: 6, classes: ["EXECUTIVE", "PREMIUM", "CLASSIC"], bookUrl: PVR },
      { id: "hyd-cinepolis-manjeera", name: "Cinépolis Lulu Mall", chain: "Cinépolis", area: "Kukatpally", screens: 5, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: CINEPOLIS },
      { id: "hyd-prasads", name: "Prasads Multiplex (PCX)", chain: "Prasads", area: "NTR Marg, Khairatabad", screens: 6, classes: ["EXECUTIVE", "PREMIUM"], bookUrl: "https://www.prasadz.com/" },
    ],
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    bmsSlug: "chennai",
    theaters: [
      { id: "chn-pvr-ampa", name: "PVR INOX Ampa Skyone", chain: "PVR INOX", area: "Aminjikarai", screens: 7, classes: ["PREMIUM", "EXECUTIVE", "CLASSIC"], bookUrl: PVR },
      { id: "chn-inox-marina", name: "INOX Marina Mall", chain: "INOX", area: "OMR, Navalur (Egattor)", screens: 8, classes: ["BIGPIX", "EXECUTIVE", "PREMIUM", "CLASSIC"], bookUrl: INOX },
      { id: "chn-escape", name: "PVR Escape", chain: "PVR INOX", area: "Express Avenue, Whites Road", screens: 8, classes: ["SOFA", "GOLD", "SILVER"], bookUrl: PVR },
      { id: "chn-spi-sathyam", name: "PVR INOX Sathyam", chain: "PVR INOX", area: "Royapettah", screens: 6, classes: ["SILVER", "GOLD", "PLATINUM", "RECLINER"], bookUrl: PVR },
    ],
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    bmsSlug: "kolkata",
    theaters: [
      { id: "kol-inox-citycentre", name: "INOX City Centre I", chain: "INOX", area: "Salt Lake", screens: 4, classes: ["RECLINER", "EXECUTIVE", "PREMIUM"], bookUrl: INOX },
      { id: "kol-inox-citycentre2", name: "INOX City Centre II", chain: "INOX", area: "New Town", screens: 7, classes: ["EXECUTIVE", "PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
      { id: "kol-miraj-aurobindo", name: "Miraj Cinemas Aurobindo Mall", chain: "Miraj", area: "Salkia, Howrah", screens: 2, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: "https://mirajcinemas.com/" },
      { id: "kol-navina", name: "Navina Cinema", chain: "Navina", area: "Prince Anwar Shah Road, Tollygunge", screens: 1, classes: ["GOLD", "SILVER"], bookUrl: BMS },
    ],
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    bmsSlug: "pune",
    theaters: [
      { id: "pun-pvr-pavillion", name: "PVR ICON Pavillion Mall", chain: "PVR INOX", area: "SB Road, Shivajinagar", screens: 6, classes: ["RECLINER", "PREMIUM", "GOLD", "SILVER"], bookUrl: PVR },
      { id: "pun-inox-phoenix", name: "INOX Phoenix Marketcity", chain: "INOX", area: "Viman Nagar", screens: 9, classes: ["RECLINER", "PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
      { id: "pun-citypride", name: "City Pride Satara Road", chain: "City Pride", area: "Satara Road", screens: 4, classes: ["GOLD", "SILVER"], bookUrl: "https://www.citypride.com/" },
      { id: "pun-esquare", name: "E-Square", chain: "E-Square", area: "University Road, Shivajinagar", screens: 6, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: "https://www.esquare.in/" },
    ],
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lng: 72.5714,
    bmsSlug: "ahmedabad",
    theaters: [
      { id: "amd-pvr-acropolis", name: "PVR Acropolis", chain: "PVR INOX", area: "Thaltej", screens: 6, classes: ["RECLINER", "PREMIUM", "GOLD", "SILVER"], bookUrl: PVR },
      { id: "amd-cinepolis-kankubag", name: "Cinépolis Kankubag", chain: "Cinépolis", area: "Vastral", screens: 5, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: CINEPOLIS },
      { id: "amd-inox-himalaya", name: "INOX Himalaya Mall", chain: "INOX", area: "Drive-in Road", screens: 5, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
      { id: "amd-rajhans-cineworld", name: "Rajhans Cine World Kalasagar", chain: "Rajhans", area: "Satadhar", screens: 3, classes: ["GOLD", "SILVER"], bookUrl: BMS },
    ],
  },
  {
    id: "kochi",
    name: "Kochi",
    state: "Kerala",
    lat: 9.9312,
    lng: 76.2673,
    bmsSlug: "kochi",
    theaters: [
      { id: "koc-cinepolis-centresquare", name: "Cinépolis Centre Square", chain: "Cinépolis", area: "MG Road", screens: 12, classes: ["VIP", "IMAX", "4DX", "PREMIUM"], bookUrl: CINEPOLIS },
      { id: "koc-pvr-lulu", name: "PVR Lulu Mall", chain: "PVR INOX", area: "Lulu Mall, Edappally", screens: 9, classes: ["GOLDCLASS", "LUXE", "4DX"], bookUrl: PVR },
      { id: "koc-evm", name: "EVM Cinemas", chain: "EVM", area: "MG Road", screens: 5, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: BMS },
      { id: "koc-magicframes", name: "Magic Frames Cinemas", chain: "Magic Frames", area: "Kakkanad", screens: 6, classes: ["GOLD", "SILVER"], bookUrl: BMS },
    ],
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    bmsSlug: "jaipur",
    theaters: [
      { id: "jai-inox-gtcentral", name: "INOX GT Central Mall", chain: "INOX", area: "Malviya Nagar", screens: 5, classes: ["RECLINER", "PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
      { id: "jai-inox-jtm", name: "INOX JTM Mall", chain: "INOX", area: "Jagatpura", screens: 3, classes: ["EXECUTIVE", "PREMIUM", "RECLINER"], bookUrl: INOX },
      { id: "jai-rajmandir", name: "Raj Mandir Cinema", chain: "Raj Mandir", area: "C-Scheme", screens: 1, classes: ["RUBY", "DIAMOND", "PEARL", "EMERALD", "RECLINER"], bookUrl: "https://www.rajmandir.com/" },
    ],
  },
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8467,
    lng: 80.9462,
    bmsSlug: "lucknow",
    theaters: [
      { id: "lko-inox-phoenix", name: "INOX Megaplex Phoenix Palassio", chain: "INOX", area: "Gomti Nagar Ext", screens: 10, classes: ["IMAX", "INSIGNIA", "MAX4D", "RECLINER", "EXECUTIVE", "PREMIUM", "KIDDLES"], bookUrl: INOX },
      { id: "lko-inox-riverside", name: "INOX Riverside", chain: "INOX", area: "Gomti Nagar", screens: 4, classes: ["EXECUTIVE", "PREMIUM"], bookUrl: INOX },
      { id: "lko-carnival-krishna", name: "Carnival Krishna Cinemas", chain: "Carnival", area: "Alambagh", screens: 2, classes: ["GOLD", "SILVER"], bookUrl: "https://www.carnivalcinemas.in/" },
    ],
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    state: "Chandigarh",
    lat: 30.7333,
    lng: 76.7794,
    bmsSlug: "chandigarh",
    theaters: [
      { id: "chd-pvr-elante", name: "PVR INOX Nexus Elante", chain: "PVR INOX", area: "Industrial Area Phase I", screens: 8, classes: ["RECLINER", "4DX", "PREMIUM"], bookUrl: PVR },
      { id: "chd-inox-dhillon", name: "INOX Dhillon Square", chain: "INOX", area: "Chhatbir Road, Zirakpur", screens: 4, classes: ["RECLINER", "EXECUTIVE", "PREMIUM"], bookUrl: INOX },
      { id: "chd-piccadily", name: "Piccadily Cinema", chain: "Piccadily", area: "Sector 34A, Piccadily Square Mall", screens: 3, classes: ["BUSINESS", "GOLD", "SILVER"], bookUrl: BMS },
    ],
  },
  {
    id: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    bmsSlug: "indore",
    theaters: [
      { id: "ind-inox-central", name: "INOX Nexus Indore Central", chain: "INOX", area: "Regal Square, RNT Marg", screens: 4, classes: ["INSIGNIA", "EXECUTIVE", "PREMIUM"], bookUrl: INOX },
      { id: "ind-pvr-ti", name: "PVR INOX Treasure Island", chain: "PVR INOX", area: "M.G. Road, South Tukoganj", screens: 9, classes: ["GOLDCLASS", "LUXE", "4DX", "PLAYHOUSE"], bookUrl: PVR },
    ],
  },
  {
    id: "guwahati",
    name: "Guwahati",
    state: "Assam",
    lat: 26.1445,
    lng: 91.7362,
    bmsSlug: "guwahati",
    theaters: [
      { id: "gwa-cinepolis-central", name: "Cinépolis Central Mall", chain: "Cinépolis", area: "Christian Basti, GS Road", screens: 4, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: CINEPOLIS },
      { id: "gwa-pvr-citycentre", name: "PVR City Centre", chain: "PVR INOX", area: "GS Road, Christian Basti", screens: 5, classes: ["RECLINER", "GOLD", "SILVER"], bookUrl: PVR },
      { id: "gwa-inox-aurus", name: "INOX Aurus", chain: "INOX", area: "Aurus Mall, Guwahati", screens: 4, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
    ],
  },
  {
    id: "bhubaneswar",
    name: "Bhubaneswar",
    state: "Odisha",
    lat: 20.2961,
    lng: 85.8245,
    bmsSlug: "bhubaneswar",
    theaters: [
      { id: "bbs-inox-bmcbhawani", name: "INOX BMC Bhawani Mall", chain: "INOX", area: "Shahid Nagar", screens: 3, classes: ["PREMIUM", "GOLD", "SILVER"], bookUrl: INOX },
      { id: "bbs-cinepolis-esplanade", name: "Cinépolis Nexus Esplanade", chain: "Cinépolis", area: "Nexus Esplanade, Rasulgarh", screens: 7, classes: ["RECLINER", "VIP", "PREMIUM"], bookUrl: CINEPOLIS },
      { id: "bbs-pvr-kanikagalleria", name: "PVR INOX Utkal Galleria", chain: "PVR INOX", area: "Utkal Kanika Galleria, Kalpana Square", screens: 4, classes: ["GOLD", "SILVER"], bookUrl: PVR },
    ],
  },
];

/** Nearest city by haversine distance (used with geolocation) */
export function nearestCity(lat: number, lng: number): City {
  let best = CITIES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of CITIES) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export interface BookingPlatform {
  id: string;
  name: string;
  /** Build a deep link for a given movie title */
  url: (title: string) => string;
}

export const BOOKING_PLATFORMS: BookingPlatform[] = [
  {
    id: "bms",
    name: "BookMyShow",
    url: (title) => `https://in.bookmyshow.com/search?k=${encodeURIComponent(title)}`,
  },
  {
    id: "pvr",
    name: "PVR INOX",
    url: () => "https://www.pvrcinemas.com/",
  },
  {
    id: "district",
    name: "District",
    url: () => "https://www.district.in/",
  },
];

export function bookingLinks(title: string): { id: string; name: string; href: string }[] {
  return BOOKING_PLATFORMS.map((p) => ({ id: p.id, name: p.name, href: p.url(title) }));
}
