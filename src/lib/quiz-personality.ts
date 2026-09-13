export type PersonalityKey =
  | "luffy"
  | "naruto"
  | "gojo"
  | "lelouch"
  | "levi"
  | "edward"
  | "goku"
  | "senku";

export interface Personality {
  key: PersonalityKey;
  name: string;
  anime: string;
  emoji: string;
  from: string;
  accent: string;
  line: string;
  traits: string[];
}

export const PERSONALITIES: Record<PersonalityKey, Personality> = {
  luffy: {
    key: "luffy",
    name: "LUFFY",
    anime: "One Piece",
    emoji: "🏴‍☠️",
    from: "#7f1d1d",
    accent: "#f87171",
    line: "Dimaag se nahi, dil se jeeta hai bhai!",
    traits: ["Free-spirited rebel", "Doost pehle, plan baad me", "Hungry for adventure (and food)"],
  },
  naruto: {
    key: "naruto",
    name: "NARUTO",
    anime: "Naruto",
    emoji: "🍥",
    from: "#9a3412",
    accent: "#fb923c",
    line: "Kabhi haar nahi maanta — sapna bada hai!",
    traits: ["Relentless hustle", "Never gives up", "Believes in people till the end"],
  },
  gojo: {
    key: "gojo",
    name: "GOJO",
    anime: "Jujutsu Kaisen",
    emoji: "🕶️",
    from: "#1e3a8a",
    accent: "#93c5fd",
    line: "Problem? Bas ek smile aur style se khatam.",
    traits: ["Chills in crisis", "Technique clear, mask cleaner", "Secretly the strongest one"],
  },
  lelouch: {
    key: "lelouch",
    name: "LELOUCH",
    anime: "Code Geass",
    emoji: "♟️",
    from: "#4c1d95",
    accent: "#c4b5fd",
    line: "Jo baaki log nahi kar sakte, wo 3D chess me crack kar deta hai.",
    traits: ["Master planner", "10 steps ahead", "Takes big risks for the goal"],
  },
  levi: {
    key: "levi",
    name: "LEVI",
    anime: "Attack on Titan",
    emoji: "🧹",
    from: "#155e75",
    accent: "#67e8f9",
    line: "No nonsense, clean kaam, killer moves.",
    traits: ["Silent but deadly", "Zero drama, full discipline", "Cuts the real threat first"],
  },
  edward: {
    key: "edward",
    name: "EDWARD",
    anime: "Fullmetal Alchemist",
    emoji: "⚗️",
    from: "#92400e",
    accent: "#fcd34d",
    line: "Chhota sa height, full-size hustle.",
    traits: ["Small package, big respect", "Brains + heart = equal parts", "Will break a rule to fix things"],
  },
  goku: {
    key: "goku",
    name: "GOKU",
    anime: "Dragon Ball Z",
    emoji: "💥",
    from: "#1e40af",
    accent: "#fbbf24",
    line: "Pehle fight karo, sochna baad me.",
    traits: ["Charges in first", "Born to level up", "Smiles even mid-battle"],
  },
  senku: {
    key: "senku",
    name: "SENKU",
    anime: "Dr. Stone",
    emoji: "💡",
    from: "#14532d",
    accent: "#86efac",
    line: "Scientific approach — 10 billion percent vibes.",
    traits: ["Calculates everything", "Turns wild ideas into reality", "Logic over emotions (90% ke time)"],
  },
};

export const PERSONALITY_LIST = Object.values(PERSONALITIES);

export interface PersonalityOption {
  text: string;
  w: PersonalityKey[];
}

export interface PersonalityQuestion {
  id: string;
  q: string;
  options: PersonalityOption[];
}

export const QUESTIONS: PersonalityQuestion[] = [
  {
    id: "q1",
    q: "College ke baad 2 free ghante mile toh?",
    options: [
      { text: "Library me xyz tak padhta rehta", w: ["lelouch", "senku"] },
      { text: "Gym/dojo — body bhi work karti hai", w: ["goku", "levi"] },
      { text: "Dosto ke saath kuch random adventure", w: ["luffy", "naruto"] },
      { text: "Chill + style, group me vibe", w: ["gojo", "edward"] },
    ],
  },
  {
    id: "q2",
    q: "Group plan me tera default kya hota hai?",
    options: [
      { text: "Sabki fight (aur energy) main badhata", w: ["goku", "luffy"] },
      { text: "Pura plan 3D chess ki tarah likhta", w: ["lelouch", "senku"] },
      { text: "Doston ko uthata, motivate karta", w: ["naruto", "edward"] },
      { text: "Chup chaap najar rakhta, tab strike karta", w: ["gojo", "levi"] },
    ],
  },
  {
    id: "q3",
    q: "Sunday ka perfect plan?",
    options: [
      { text: "Naya episode (fight/scene) aur training", w: ["goku", "levi"] },
      { text: "Dosto ke saath hangout — sath me sab accha", w: ["luffy", "naruto"] },
      { text: "Koi puzzle, strategy game ya experiment", w: ["lelouch", "senku"] },
      { text: "Bekar me bhi top class dikhna chahiye", w: ["gojo", "edward"] },
    ],
  },
  {
    id: "q4",
    q: "Ek superpower mile toh kya choose karega?",
    options: [
      { text: "Super strength — seedha soluh uljhe hue", w: ["goku", "levi"] },
      { text: "Aisi power jo boredom ko khatam kare", w: ["luffy", "naruto"] },
      { text: "Mind ko master karne wali strategy", w: ["lelouch", "senku"] },
      { text: "Koi bhi lekin style se usse karne ka", w: ["gojo", "edward"] },
    ],
  },
  {
    id: "q5",
    q: "Villain saamne aaye — pehla reaction?",
    options: [
      { text: '"Ruk, main sambhal leta hoon!"', w: ["goku", "naruto"] },
      { text: '"Pehle uska weak point dhundho"', w: ["lelouch", "senku"] },
      { text: '"Dost saath hain toh dar kya hai"', w: ["luffy", "edward"] },
      { text: '"Overthinking mat, kaam jaldi khatam karo"', w: ["gojo", "levi"] },
    ],
  },
  {
    id: "q6",
    q: "Tera go-to outfits?",
    options: [
      { text: "Comfort + energy — track suit vibes", w: ["goku", "naruto"] },
      { text: "All black / minimal / clean", w: ["levi", "gojo"] },
      { text: "Bright colors, bandana, ekdum iconic", w: ["luffy", "edward"] },
      { text: "Techy, chashma, data-driven look", w: ["lelouch", "senku"] },
    ],
  },
];

export function computePersonality(answers: PersonalityKey[]): Personality {
  const tally: Record<PersonalityKey, number> = {
    luffy: 0,
    naruto: 0,
    gojo: 0,
    lelouch: 0,
    levi: 0,
    edward: 0,
    goku: 0,
    senku: 0,
  };
  for (const a of answers) if (tally[a] !== undefined) tally[a]++;
  const sorted = (Object.entries(tally) as [PersonalityKey, number][]).sort((a, b) => b[1] - a[1]);
  return PERSONALITIES[sorted[0][0]];
}

export const shareLinkOf = (key: PersonalityKey, name?: string) => {
  const base = typeof window !== "undefined" ? window.location.origin : "https://zyverse.in";
  const u = new URLSearchParams({ a: key });
  if (name && name.trim()) u.set("n", name.trim());
  return `${base}/quiz/personality?${u.toString()}`;
};

export const ogUrlOf = (key: PersonalityKey, name?: string) => {
  const base = typeof window !== "undefined" ? window.location.origin : "https://zyverse.in";
  const u = new URLSearchParams({ a: key });
  if (name && name.trim()) u.set("n", name.trim());
  return `${base}/api/og/quiz-personality?${u.toString()}`;
};