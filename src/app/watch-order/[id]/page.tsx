import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const order = WATCH_ORDERS_DATA[id as keyof typeof WATCH_ORDERS_DATA];
  if (!order) return { title: "Watch Order — ZyniVerse" };

  return {
    title: `${order.title} Watch Order — Complete Viewing Guide | ZyniVerse`,
    description: order.description,
    openGraph: {
      title: `${order.title} Watch Order — ZyniVerse`,
      description: order.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function WatchOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = WATCH_ORDERS_DATA[id as keyof typeof WATCH_ORDERS_DATA];
  if (!order) notFound();

  const methods = order.methods || ["Release Order"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/watch-order" className="hover:text-[var(--color-cyan)] transition-colors">Watch Orders</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{order.title}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{order.emoji}</span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Watch Order Guide</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">{order.title} Watch Order</h1>
          </div>
        </div>
        <p className="mt-3 text-[var(--color-mute)] max-w-2xl">{order.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {methods.map((m) => (
            <span key={m} className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">{m}</span>
          ))}
          <span className="rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-magenta)] border border-[var(--color-magenta)]/20">{order.entries} entries</span>
        </div>
      </div>

      {/* Watch Order Tabs — show first method by default */}
      <div className="space-y-6">
        {methods.map((method) => {
          const entries = getWatchEntries(id, method);
          return (
            <div key={method} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
              <div className="border-b border-[var(--color-line)] bg-[var(--color-void)] px-5 py-3">
                <h2 className="font-display font-bold text-sm">{method}</h2>
              </div>
              <div className="divide-y divide-[var(--color-line)]/50">
                {entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-magenta)]/10 text-xs font-bold font-mono text-[var(--color-magenta)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="text-[10px] text-[var(--color-mute)]">{entry.info}</p>
                    </div>
                    {entry.anilistId && (
                      <Link href={`/anime/${entry.anilistId}`}
                        className="shrink-0 rounded-full border border-[var(--color-line)] px-3 py-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                      >Details</Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip box */}
      <div className="mt-10 rounded-xl border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-5">
        <p className="font-semibold text-sm mb-1">💡 Pro Tip</p>
        <p className="text-xs text-[var(--color-mute)] leading-relaxed">
          {order.tip || "Use our filler guides alongside this watch order to skip non-canon episodes while following the correct sequence."}
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/watch-order"
          className="text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors underline"
        >← Back to all watch orders</Link>
      </div>
    </div>
  );
}

function getWatchEntries(slug: string, method: string) {
  if (slug === "monogatari") return MONOGATARI_ENTRIES;
  if (slug === "fate") return FATE_ENTRIES;
  if (slug === "dragon-ball") return DRAGON_BALL_ENTRIES;
  if (slug === "gundam") return GUNDAM_UC_ENTRIES;
  if (slug === "toaru") return TOARU_ENTRIES;
  if (slug === "aot") return AOT_ENTRIES;
  if (slug === "jojo") return JOJO_ENTRIES;
  if (slug === "sao") return SAO_ENTRIES;
  if (slug === "code-geass") return CODE_GEASS_ENTRIES;
  if (slug === "steins-gate") return STEINS_GATE_ENTRIES;
  if (slug === "demon-slayer") return DEMON_SLAYER_ENTRIES;
  if (slug === "made-in-abyss") return MADE_IN_ABYSS_ENTRIES;
  if (slug === "rezero") return REZERO_ENTRIES;
  return [];
}

const MONOGATARI_ENTRIES = [
  { title: "Bakemonogatari", info: "15 episodes (2009)", anilistId: 5081 },
  { title: "Nisemonogatari", info: "11 episodes (2012)", anilistId: 11597 },
  { title: "Nekomonogatari (Kuro)", info: "4 episodes (2012)", anilistId: 11577 },
  { title: "Monogatari Series: Second Season", info: "26 episodes (2013)", anilistId: 12187 },
  { title: "Hanamonogatari", info: "5 episodes (2014)", anilistId: 17947 },
  { title: "Tsukimonogatari", info: "4 episodes (2014)", anilistId: 18177 },
  { title: "Owarimonogatari", info: "12 episodes (2015)", anilistId: 20211 },
  { title: "Kizumonogatari I: Tekketsu", info: "Movie (2016)", anilistId: 11899 },
  { title: "Kizumonogatari II: Nekketsu", info: "Movie (2016)", anilistId: 11901 },
  { title: "Kizumonogatari III: Reiketsu", info: "Movie (2017)", anilistId: 11903 },
  { title: "Owarimonogatari II", info: "7 episodes (2017)", anilistId: 21697 },
  { title: "Zoku Owarimonogatari", info: "6 episodes (2018)", anilistId: 21497 },
];

const FATE_ENTRIES = [
  { title: "Fate/stay night: Unlimited Blade Works (2014)", info: "26 episodes (2014)", anilistId: 19611 },
  { title: "Fate/stay night: Heaven's Feel I", info: "Movie (2017)", anilistId: 19612 },
  { title: "Fate/stay night: Heaven's Feel II", info: "Movie (2019)", anilistId: 20689 },
  { title: "Fate/stay night: Heaven's Feel III", info: "Movie (2020)", anilistId: 20690 },
  { title: "Fate/Zero", info: "25 episodes (2011)", anilistId: 10016 },
  { title: "Fate/Grand Order: First Order", info: "Special (2016)", anilistId: 9541 },
  { title: "Fate/kaleid liner Prisma Illya", info: "4 seasons + Movie (2013)", anilistId: 13469 },
];

const DRAGON_BALL_ENTRIES = [
  { title: "Dragon Ball", info: "153 episodes (1986)", anilistId: 225 },
  { title: "Dragon Ball Z", info: "291 episodes (1989)", anilistId: 813 },
  { title: "Dragon Ball Z: Battle of Gods", info: "Movie (2013)", anilistId: 12859 },
  { title: "Dragon Ball Z: Resurrection F", info: "Movie (2015)", anilistId: 14801 },
  { title: "Dragon Ball Super", info: "131 episodes (2015)", anilistId: 16498 },
  { title: "Dragon Ball Super: Broly", info: "Movie (2018)", anilistId: 18431 },
  { title: "Dragon Ball Super: Super Hero", info: "Movie (2022)", anilistId: 124832 },
];

const GUNDAM_UC_ENTRIES = [
  { title: "Mobile Suit Gundam", info: "43 episodes (1979)", anilistId: 80 },
  { title: "Mobile Suit Zeta Gundam", info: "50 episodes (1985)", anilistId: 82 },
  { title: "Mobile Suit Gundam ZZ", info: "47 episodes (1986)", anilistId: 83 },
  { title: "Mobile Suit Gundam: Char's Counterattack", info: "Movie (1988)", anilistId: 86 },
  { title: "Mobile Suit Gundam 0080: War in the Pocket", info: "6 episodes (1989)", anilistId: 81 },
  { title: "Mobile Suit Gundam 0083: Stardust Memory", info: "13 episodes (1991)", anilistId: 84 },
  { title: "Mobile Suit Gundam: The 08th MS Team", info: "12 episodes (1996)", anilistId: 85 },
  { title: "Mobile Suit Gundam Unicorn", info: "7 episodes (2010)", anilistId: 237 },
  { title: "Mobile Suit Gundam: Hathaway's Flash", info: "Movie (2021)", anilistId: 117687 },
];

const TOARU_ENTRIES = [
  { title: "A Certain Scientific Railgun", info: "24 episodes (2009)", anilistId: 3448 },
  { title: "A Certain Magical Index", info: "24 episodes (2008)", anilistId: 3447 },
  { title: "A Certain Scientific Railgun S", info: "24 episodes (2013)", anilistId: 12445 },
  { title: "A Certain Magical Index II", info: "24 episodes (2010)", anilistId: 3449 },
  { title: "A Certain Scientific Railgun T", info: "25 episodes (2020)", anilistId: 10460 },
  { title: "A Certain Magical Index III", info: "26 episodes (2018)", anilistId: 12727 },
];

const AOT_ENTRIES = [
  { title: "Attack on Titan Season 1", info: "25 episodes (2013)", anilistId: 20661 },
  { title: "Attack on Titan Season 2", info: "12 episodes (2017)", anilistId: 21458 },
  { title: "Attack on Titan Season 3 Part 1", info: "12 episodes (2018)", anilistId: 20992 },
  { title: "Attack on Titan Season 3 Part 2", info: "10 episodes (2019)", anilistId: 20993 },
  { title: "Attack on Titan: The Final Season", info: "16 episodes (2020)", anilistId: 110277 },
  { title: "Attack on Titan: The Final Season Part 2", info: "12 episodes (2022)", anilistId: 131587 },
  { title: "Attack on Titan: The Final Season Part 3", info: "2 episodes (2023)", anilistId: 150672 },
  { title: "Attack on Titan: No Regrets", info: "OVA (2014)", anilistId: 11061 },
  { title: "Attack on Titan: Lost Girls", info: "OVA (2017)", anilistId: 11390 },
  { title: "Attack on Titan: Junior High", info: "12 episodes — Spinoff Comedy (2015)", anilistId: 21455 },
];

const JOJO_ENTRIES = [
  { title: "JoJo's Bizarre Adventure (2012)", info: "26 episodes — Parts 1 & 2 (2012)", anilistId: 14719 },
  { title: "JoJo's Bizarre Adventure: Stardust Crusaders", info: "48 episodes — Part 3 (2014)", anilistId: 20474 },
  { title: "JoJo's Bizarre Adventure: Diamond is Unbreakable", info: "39 episodes — Part 4 (2016)", anilistId: 21450 },
  { title: "JoJo's Bizarre Adventure: Golden Wind", info: "39 episodes — Part 5 (2018)", anilistId: 21451 },
  { title: "JoJo's Bizarre Adventure: Stone Ocean", info: "38 episodes — Part 6 (2021)", anilistId: 131942 },
  { title: "Thus Spoke Kishibe Rohan", info: "4 episodes — Spinoff OVA (2017)", anilistId: 107422 },
];

const SAO_ENTRIES = [
  { title: "Sword Art Online", info: "25 episodes (2012)", anilistId: 21459 },
  { title: "Sword Art Online: Extra Edition", info: "Special — Recap + Side Story (2013)", anilistId: 20267 },
  { title: "Sword Art Online II", info: "24 episodes (2014)", anilistId: 20689 },
  { title: "Sword Art Online: Ordinal Scale", info: "Movie (2017)", anilistId: 21460 },
  { title: "Sword Art Online: Alicization", info: "24 episodes (2018)", anilistId: 21461 },
  { title: "Sword Art Online: Alicization — War of Underworld", info: "23 episodes (2019)", anilistId: 21462 },
  { title: "Sword Art Online: Alicization — War of Underworld Part 2", info: "11 episodes (2020)", anilistId: 21463 },
  { title: "Sword Art Online Alternative: Gun Gale Online", info: "12 episodes — Spinoff (2018)", anilistId: 20992 },
  { title: "Sword Art Online: Progressive — Aria of a Starless Night", info: "Movie (2021)", anilistId: 21464 },
  { title: "Sword Art Online: Progressive — Scherzo of Deep Night", info: "Movie (2022)", anilistId: 21465 },
];

const CODE_GEASS_ENTRIES = [
  { title: "Code Geass: Lelouch of the Rebellion", info: "25 episodes (2006)", anilistId: 1575 },
  { title: "Code Geass: Lelouch of the Rebellion R2", info: "25 episodes (2008)", anilistId: 3762 },
  { title: "Code Geass: Akito the Exiled", info: "5 episodes — Spinoff OVA (2012)", anilistId: 13815 },
  { title: "Code Geass: Lelouch of the Re;surrection", info: "Movie — Alternate Timeline (2019)", anilistId: 109833 },
  { title: "Code Geass: Rozé of the Recapture", info: "4 episodes (2024)", anilistId: 174625 },
];

const STEINS_GATE_ENTRIES = [
  { title: "Steins;Gate", info: "24 episodes (2011)", anilistId: 9253 },
  { title: "Steins;Gate: The Movie — Load Region of Déjà Vu", info: "Movie (2013)", anilistId: 14741 },
  { title: "Steins;Gate 0", info: "23 episodes (2018)", anilistId: 20991 },
  { title: "Steins;Gate: Kyoukaimenjou no Missing Link", info: "OVA — Divide by Zero (2015)", anilistId: 21346 },
  { title: "Steins;Gate: Soumei Eichi no Cognitive Computing", info: "4 shorts — Comedy (2014)", anilistId: 20992 },
];

const DEMON_SLAYER_ENTRIES = [
  { title: "Demon Slayer: Kimetsu no Yaiba", info: "26 episodes (2019)", anilistId: 101922 },
  { title: "Demon Slayer: Mugen Train", info: "Movie (2020)", anilistId: 112151 },
  { title: "Demon Slayer: Entertainment District Arc", info: "11 episodes (2021)", anilistId: 128668 },
  { title: "Demon Slayer: Swordsmith Village Arc", info: "11 episodes (2023)", anilistId: 145390 },
  { title: "Demon Slayer: Hashira Training Arc", info: "8 episodes (2024)", anilistId: 176713 },
  { title: "Demon Slayer: To the Swordsmith Village", info: "Compilation Movie (2023)", anilistId: 164758 },
];

const MADE_IN_ABYSS_ENTRIES = [
  { title: "Made in Abyss", info: "13 episodes (2017)", anilistId: 21659 },
  { title: "Made in Abyss: Dawn of the Deep Soul", info: "Movie — Sequel (2020)", anilistId: 108728 },
  { title: "Made in Abyss: Journey's Dawn", info: "Compilation Movie — Recap (2018)", anilistId: 102883 },
  { title: "Made in Abyss: Wandering Twilight", info: "Compilation Movie — Recap (2019)", anilistId: 104580 },
  { title: "Made in Abyss: The Golden City of the Scorching Sun", info: "12 episodes — Season 2 (2022)", anilistId: 114745 },
  { title: "Made in Abyss: Marulk's Daily Life", info: "Short — Spinoff (2022)", anilistId: 158931 },
];

const REZERO_ENTRIES = [
  { title: "Re:Zero — Starting Life in Another World", info: "25 episodes — Director's Cut (2016)", anilistId: 21355 },
  { title: "Re:Zero — Starting Life in Another World Season 2 Part 1", info: "13 episodes (2020)", anilistId: 108632 },
  { title: "Re:Zero — Starting Life in Another World Season 2 Part 2", info: "12 episodes (2021)", anilistId: 119661 },
  { title: "Re:Zero — Starting Life in Another World Season 3", info: "16 episodes (2024)", anilistId: 175449 },
  { title: "Re:Zero — Frozen Bond", info: "OVA — Prequel Movie (2019)", anilistId: 108728 },
  { title: "Re:Zero — Memory Snow", info: "OVA — Side Story (2018)", anilistId: 102883 },
  { title: "Re:Petit — Starting Life in Another World!", info: "14 shorts — Comedy Chibi Spinoff (2016)", anilistId: 21450 },
];

interface WatchOrderEntry {
  title: string;
  info: string;
  anilistId?: number;
}

interface WatchOrder {
  emoji: string;
  title: string;
  entries: number;
  methods: string[];
  description: string;
  tip?: string;
}

const WATCH_ORDERS_DATA: Record<string, WatchOrder & { entries: number }> = {
  monogatari: {
    emoji: "🦊",
    title: "Monogatari Series",
    entries: 12,
    methods: ["Release Order", "Chronological"],
    description: "The Monogatari series is known for its non-linear storytelling. The release order is the most recommended by fans, but we also provide the chronological timeline.",
    tip: "Most fans strongly recommend Release Order (aired order) for first-time viewers. The series was intentionally presented this way for narrative impact.",
  },
  fate: {
    emoji: "⚔️",
    title: "Fate Series",
    entries: 7,
    methods: ["Release Order", "Story Order"],
    description: "The Fate series spans multiple timelines and routes. Start with Unlimited Blade Works (2014) for the best modern entry point, then Fate/Zero as a prequel.",
    tip: "There is no single 'correct' Fate watch order. We recommend UBW → Heaven's Feel → Zero for the best narrative experience.",
  },
  "dragon-ball": {
    emoji: "🐉",
    title: "Dragon Ball",
    entries: 7,
    methods: ["Release Order", "Chronological"],
    description: "The Dragon Ball franchise is straightforward: start with the original, then Z, then Super. Movies can be watched at the indicated points.",
    tip: "DBZ Kai is a recut version that removes most filler — great if you want a faster watch. Use our filler guide to skip non-canon episodes.",
  },
  gundam: {
    emoji: "🤖",
    title: "Gundam Universal Century",
    entries: 9,
    methods: ["UC Timeline", "Release Order"],
    description: "The Universal Century is the main Gundam timeline. Start with the original 1979 series and follow the production order for the best experience.",
    tip: "If 1979 animation feels too dated, you can start with Gundam: The Origin as an alternative entry point.",
  },
  toaru: {
    emoji: "⚡",
    title: "Toaru (Index / Railgun)",
    entries: 6,
    methods: ["Release Order", "Chronological"],
    description: "The Toaru universe has two parallel series: Index (magic side) and Railgun (science side). They intersect at key points.",
    tip: "Start with Railgun (2009) for a slower introduction to the world, or Index (2008) for the main story. Both work.",
  },
  aot: {
    emoji: "🗡️",
    title: "Attack on Titan",
    entries: 10,
    methods: ["Release Order"],
    description: "One of the most popular anime of all time. Seasons 1-3, then The Final Season in 3 parts. Includes OVAs and spinoffs.",
    tip: "The Final Season is split into 3 parts (16 + 12 + 2 episodes). Don't skip the OVAs — No Regrets and Lost Girls add valuable backstory.",
  },
  jojo: {
    emoji: "💎",
    title: "JoJo's Bizarre Adventure",
    entries: 6,
    methods: ["Part Order"],
    description: "JoJo is divided into parts, each following a different Joestar. The 2012 anime adapts Parts 1-6 chronologically.",
    tip: "Part 1 (Phantom Blood) is only 9 episodes and sets up everything. Don't skip it — it's essential for Part 3's emotional payoff.",
  },
  sao: {
    emoji: "⚔️",
    title: "Sword Art Online",
    entries: 10,
    methods: ["Release Order", "Chronological"],
    description: "Aincrad → Fairy Dance → Phantom Bullet → Ordinal Scale → Alicization. The Progressive movies retell the early floors.",
    tip: "For the best experience, watch the main series in release order. The Progressive movies add new detail to the Aincrad arc.",
  },
  "code-geass": {
    emoji: "♟️",
    title: "Code Geass",
    entries: 5,
    methods: ["Release Order"],
    description: "R1 → R2 is the main story. Akito the Exiled is a side story set between R1 and R2. Re;surrection is an alternate timeline sequel.",
    tip: "Akito the Exiled can be skipped on first watch — it's a side story with new characters. Re;surrection takes place in an alternate timeline after R2.",
  },
  "steins-gate": {
    emoji: "⚗️",
    title: "Steins;Gate",
    entries: 5,
    methods: ["Release Order", "Chronological"],
    description: "Start with Steins;Gate (2011), then the movie, then Steins;Gate 0. The OVAs are optional but add closure.",
    tip: "Steins;Gate 0 takes place between episodes 23 and 24 of the original. Watch the original first, then 0 for a complete experience.",
  },
  "demon-slayer": {
    emoji: "⚡",
    title: "Demon Slayer",
    entries: 6,
    methods: ["Release Order"],
    description: "Season 1 → Mugen Train Movie → Entertainment District → Swordsmith Village → Hashira Training. The movie is essential canon.",
    tip: "The Mugen Train movie is NOT skippable — it's direct canon. The compilation movies are optional recaps.",
  },
  "made-in-abyss": {
    emoji: "🕳️",
    title: "Made in Abyss",
    entries: 6,
    methods: ["Release Order", "Chronological"],
    description: "Season 1 → Dawn of the Deep Soul (movie) → Season 2. The recap movies can substitute for season 1.",
    tip: "The compilation movies (Journey's Dawn + Wandering Twilight) recap Season 1 with new footage. Dawn of the Deep Soul is a direct sequel — not optional.",
  },
  rezero: {
    emoji: "🔄",
    title: "Re:Zero",
    entries: 7,
    methods: ["Release Order"],
    description: "Season 1 (Director's Cut) → Frozen Bond → Memory Snow → Season 2 → Season 3. The OVAs add context.",
    tip: "Re:Zero Season 1 has a Director's Cut that combines the original 25 episodes into 13 longer episodes with minor improvements.",
  },
};
