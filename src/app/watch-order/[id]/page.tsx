import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WatchOrderDetail from "./WatchOrderDetail";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const order = WATCH_ORDERS_DATA[id as keyof typeof WATCH_ORDERS_DATA];
  if (!order) return { title: "Watch Order — ZyniVerse" };

  const slugToAnimeName: Record<string, string> = {
    rezero: "Re:Zero", sao: "Sword Art Online", fate: "Fate",
    monogatari: "Monogatari", naruto: "Naruto", "dragon-ball": "Dragon Ball",
    jojo: "JoJo's Bizarre Adventure", aot: "Attack on Titan",
    "steins-gate": "Steins;Gate", evangelion: "Neon Genesis Evangelion",
    "demon-slayer": "Demon Slayer", bleach: "Bleach", fma: "Fullmetal Alchemist",
    "one-piece": "One Piece", "hunter-x-hunter": "Hunter x Hunter",
    mha: "My Hero Academia", "code-geass": "Code Geass",
  };
  const animeName = slugToAnimeName[id] || order.title;

  return {
    title: `${animeName} Watch Order — Correct Order to Watch (2026) | ZyniVerse`,
    description: `${order.description} Complete ${animeName} watch order with release order, chronological order, and spoiler-free tips. Updated for 2026.`,
    keywords: [
      `${animeName.toLowerCase()} watch order`,
      `how to watch ${animeName.toLowerCase()}`,
      `${animeName.toLowerCase()} viewing order`,
      `${animeName.toLowerCase()} order`,
      "anime watch order 2026",
    ],
    openGraph: {
      title: `${animeName} Watch Order — ZyniVerse`,
      description: order.description,
      url: `${BASE_URL}/watch-order/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${animeName} Watch Order — ZyniVerse`,
      description: order.description,
    },
    alternates: {
      canonical: `${BASE_URL}/watch-order/${id}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function WatchOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = WATCH_ORDERS_DATA[id as keyof typeof WATCH_ORDERS_DATA];
  if (!order) notFound();

  const entries = getWatchEntries(id);
  const methods = order.methods || ["Release Order"];

  const slugToAnimeName: Record<string, string> = {
    rezero: "Re:Zero", sao: "Sword Art Online", fate: "Fate",
    monogatari: "Monogatari", naruto: "Naruto", "dragon-ball": "Dragon Ball",
    jojo: "JoJo's Bizarre Adventure", aot: "Attack on Titan",
    "steins-gate": "Steins;Gate", evangelion: "Neon Genesis Evangelion",
    "demon-slayer": "Demon Slayer", bleach: "Bleach", fma: "Fullmetal Alchemist",
    "one-piece": "One Piece", "hunter-x-hunter": "Hunter x Hunter",
    mha: "My Hero Academia", "code-geass": "Code Geass",
  };
  const animeName = slugToAnimeName[id] || order.title;
  const firstMethod = methods[0];
  const methodEntries = entries[firstMethod] || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Watch ${animeName} — ${firstMethod}`,
    description: order.description,
    step: methodEntries.map((entry, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: entry.title,
      text: entry.info,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-page-in">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/watch-order" className="hover:text-[var(--color-cyan)] transition-colors">Watch Orders</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{order.title}</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--glass-border)] mb-8">
        <div className="absolute inset-0">
          <img
            src={`https://img.anili.st/media/${order.anilistId}`}
            alt={order.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/70 to-[var(--color-panel)]/30" />
        </div>
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl sm:text-5xl drop-shadow-lg shrink-0">{order.emoji}</span>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
                {/* watch order guide */}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-[var(--color-ink)]">
                {order.title}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-mute)] max-w-xl leading-relaxed">
                {order.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {methods.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
                    {m}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-magenta)] border border-[var(--color-magenta)]/20">
                  {order.entries} entries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Watch Order Timeline */}
      <WatchOrderDetail
        slug={id}
        methods={methods}
        entries={entries}
        tip={order.tip}
      />

      {/* Back link */}
      <div className="mt-10 text-center">
        <Link
          href="/watch-order"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          Back to all watch orders
        </Link>
      </div>
    </div>
    </>
  );
}

function getWatchEntries(slug: string): Record<string, { title: string; info: string; anilistId?: number }[]> {
  if (slug === "monogatari") return { "Release Order": MONOGATARI_ENTRIES, "Chronological": MONOGATARI_CHRONO };
  if (slug === "fate") return { "Release Order": FATE_ENTRIES, "Story Order": FATE_STORY };
  if (slug === "dragon-ball") return { "Release Order": DRAGON_BALL_ENTRIES };
  if (slug === "gundam") return { "UC Timeline": GUNDAM_UC_ENTRIES, "Release Order": GUNDAM_UC_ENTRIES };
  if (slug === "toaru") return { "Release Order": TOARU_ENTRIES, "Chronological": TOARU_ENTRIES };
  if (slug === "aot") return { "Release Order": AOT_ENTRIES };
  if (slug === "jojo") return { "Part Order": JOJO_ENTRIES };
  if (slug === "sao") return { "Release Order": SAO_ENTRIES, "Chronological": SAO_ENTRIES };
  if (slug === "code-geass") return { "Release Order": CODE_GEASS_ENTRIES };
  if (slug === "steins-gate") return { "Release Order": STEINS_GATE_ENTRIES, "Chronological": STEINS_GATE_ENTRIES };
  if (slug === "demon-slayer") return { "Release Order": DEMON_SLAYER_ENTRIES };
  if (slug === "made-in-abyss") return { "Release Order": MADE_IN_ABYSS_ENTRIES, "Chronological": MADE_IN_ABYSS_ENTRIES };
  if (slug === "rezero") return { "Release Order": REZERO_ENTRIES };
  if (slug === "madoka") return { "Release Order": MADOKA_ENTRIES };
  if (slug === "evangelion") return { "Release Order": EVANGELION_ENTRIES };
  if (slug === "naruto") return { "Release Order": NARUTO_ENTRIES, "Chronological": NARUTO_CHRONO };
  if (slug === "bleach") return { "Release Order": BLEACH_ENTRIES };
  if (slug === "fma") return { "Release Order": FMA_ENTRIES, "Brotherhood First": FMA_BROTHERHOOD_FIRST };
  if (slug === "one-piece") return { "Release Order": ONE_PIECE_ENTRIES };
  if (slug === "hunter-x-hunter") return { "Release Order": HUNTER_X_HUNTER_ENTRIES };
  if (slug === "mha") return { "Release Order": MHA_ENTRIES };
  if (slug === "psycho-pass") return { "Release Order": PSYCHO_PASS_ENTRIES, "Chronological": PSYCHO_PASS_CHRONO };
  if (slug === "haruhi") return { "Chronological": HARUHI_CHRONO, "Broadcast Order": HARUHI_ENTRIES };
  if (slug === "durarara") return { "Release Order": DURARARA_ENTRIES };
  if (slug === "baccano") return { "Release Order": BACCANO_ENTRIES };
  if (slug === "higurashi") return { "Release Order": HIGURASHI_ENTRIES };
  if (slug === "ghost-in-the-shell") return { "Release Order": GITS_ENTRIES, "Timeline": GITS_CHRONO };
  if (slug === "gintama") return { "Release Order": GINTAMA_ENTRIES };
  if (slug === "conan") return { "Release Order": CONAN_ENTRIES };
  if (slug === "digimon") return { "Release Order": DIGIMON_ENTRIES };
  if (slug === "pokemon") return { "Release Order": POKEMON_ENTRIES };
  if (slug === "initial-d") return { "Stage Order": INITIAL_D_ENTRIES };
  if (slug === "symphogear") return { "Release Order": SYMPHOGEAR_ENTRIES };
  if (slug === "macross") return { "Release Order": MACROSS_ENTRIES, "Timeline": MACROSS_CHRONO };
  if (slug === "yu-yu-hakusho") return { "Release Order": YUYU_HAKUSHO_ENTRIES };
  if (slug === "slam-dunk") return { "Release Order": SLAM_DUNK_ENTRIES };
  if (slug === "precure") return { "Release Order": PRECURE_ENTRIES };
  if (slug === "katangatari") return { "Release Order": KATANAGATARI_ENTRIES };
  if (slug === "tiger-and-bunny") return { "Release Order": TIGER_BUNNY_ENTRIES };
  return {};
}

const MONOGATARI_ENTRIES = [
  { title: "Bakemonogatari", info: "15 episodes (2009)", anilistId: 5081 },
  { title: "Nisemonogatari", info: "11 episodes (2012)", anilistId: 11597 },
  { title: "Nekomonogatari (Kuro)", info: "4 episodes (2012)", anilistId: 15689 },
  { title: "Monogatari Series: Second Season", info: "26 episodes (2013)", anilistId: 12187 },
  { title: "Hanamonogatari", info: "5 episodes (2014)", anilistId: 17947 },
  { title: "Tsukimonogatari", info: "4 episodes (2014)", anilistId: 18177 },
  { title: "Owarimonogatari", info: "12 episodes (2015)", anilistId: 21262 },
  { title: "Kizumonogatari I: Tekketsu", info: "Movie (2016)", anilistId: 9260 },
  { title: "Kizumonogatari II: Nekketsu", info: "Movie (2016)", anilistId: 21399 },
  { title: "Kizumonogatari III: Reiketsu", info: "Movie (2017)", anilistId: 21400 },
  { title: "Owarimonogatari II", info: "7 episodes (2017)", anilistId: 21745 },
  { title: "Zoku Owarimonogatari", info: "6 episodes (2018)", anilistId: 100815 },
];

const MONOGATARI_CHRONO = [
  { title: "Kizumonogatari I: Tekketsu", info: "Movie — First chronologically", anilistId: 11899 },
  { title: "Kizumonogatari II: Nekketsu", info: "Movie", anilistId: 11901 },
  { title: "Kizumonogatari III: Reiketsu", info: "Movie", anilistId: 11903 },
  { title: "Nekomonogatari (Kuro)", info: "4 episodes — Prequel", anilistId: 11577 },
  { title: "Bakemonogatari", info: "15 episodes", anilistId: 5081 },
  { title: "Nisemonogatari", info: "11 episodes", anilistId: 11597 },
  { title: "Monogatari Series: Second Season", info: "26 episodes", anilistId: 12187 },
  { title: "Hanamonogatari", info: "5 episodes", anilistId: 17947 },
  { title: "Tsukimonogatari", info: "4 episodes", anilistId: 18177 },
  { title: "Owarimonogatari", info: "12 episodes", anilistId: 20211 },
  { title: "Owarimonogatari II", info: "7 episodes", anilistId: 21697 },
  { title: "Zoku Owarimonogatari", info: "6 episodes", anilistId: 21497 },
];

const FATE_ENTRIES = [
  { title: "Fate/stay night: Unlimited Blade Works (2014)", info: "26 episodes", anilistId: 19603 },
  { title: "Fate/stay night: Heaven's Feel I", info: "Movie (2017)", anilistId: 20791 },
  { title: "Fate/stay night: Heaven's Feel II", info: "Movie (2019)", anilistId: 21718 },
  { title: "Fate/stay night: Heaven's Feel III", info: "Movie (2020)", anilistId: 21719 },
  { title: "Fate/Zero", info: "25 episodes — Prequel (2011)", anilistId: 10087 },
  { title: "Fate/Grand Order: First Order", info: "Special (2016)", anilistId: 97815 },
  { title: "Fate/kaleid liner Prisma Illya", info: "4 seasons + Movie (2013)", anilistId: 14829 },
];

const FATE_STORY = [
  { title: "Fate/Zero", info: "25 episodes — Prequel (2011)", anilistId: 10087 },
  { title: "Fate/stay night: Unlimited Blade Works (2014)", info: "26 episodes", anilistId: 19603 },
  { title: "Fate/stay night: Heaven's Feel I", info: "Movie (2017)", anilistId: 20791 },
  { title: "Fate/stay night: Heaven's Feel II", info: "Movie (2019)", anilistId: 21718 },
  { title: "Fate/stay night: Heaven's Feel III", info: "Movie (2020)", anilistId: 21719 },
  { title: "Fate/Grand Order: First Order", info: "Special (2016)", anilistId: 97815 },
  { title: "Fate/kaleid liner Prisma Illya", info: "4 seasons + Movie (2013)", anilistId: 14829 },
];

const DRAGON_BALL_ENTRIES = [
  { title: "Dragon Ball", info: "153 episodes (1986)", anilistId: 223 },
  { title: "Dragon Ball Z", info: "291 episodes (1989)", anilistId: 813 },
  { title: "Dragon Ball Z: Battle of Gods", info: "Movie (2013)", anilistId: 12859 },
  { title: "Dragon Ball Z: Resurrection F", info: "Movie (2015)", anilistId: 20778 },
  { title: "Dragon Ball Super", info: "131 episodes (2015)", anilistId: 21175 },
  { title: "Dragon Ball Super: Broly", info: "Movie (2018)", anilistId: 101302 },
  { title: "Dragon Ball Super: Super Hero", info: "Movie (2022)", anilistId: 133898 },
];

const GUNDAM_UC_ENTRIES = [
  { title: "Mobile Suit Gundam", info: "43 episodes (1979)", anilistId: 80 },
  { title: "Mobile Suit Zeta Gundam", info: "50 episodes (1985)", anilistId: 85 },
  { title: "Mobile Suit Gundam ZZ", info: "47 episodes (1986)", anilistId: 86 },
  { title: "Mobile Suit Gundam: Char's Counterattack", info: "Movie (1988)", anilistId: 87 },
  { title: "Mobile Suit Gundam 0080: War in the Pocket", info: "6 episodes (1989)", anilistId: 82 },
  { title: "Mobile Suit Gundam 0083: Stardust Memory", info: "13 episodes (1991)", anilistId: 84 },
  { title: "Mobile Suit Gundam: The 08th MS Team", info: "12 episodes (1996)", anilistId: 81 },
  { title: "Mobile Suit Gundam Unicorn RE:0096", info: "22 episodes (2016)", anilistId: 21658 },
  { title: "Mobile Suit Gundam: Hathaway's Flash", info: "Movie (2021)", anilistId: 105595 },
];

const TOARU_ENTRIES = [
  { title: "A Certain Scientific Railgun", info: "24 episodes (2009)", anilistId: 6213 },
  { title: "A Certain Magical Index", info: "24 episodes (2008)", anilistId: 4654 },
  { title: "A Certain Scientific Railgun S", info: "24 episodes (2013)", anilistId: 16049 },
  { title: "A Certain Magical Index II", info: "24 episodes (2010)", anilistId: 8937 },
  { title: "A Certain Scientific Railgun T", info: "25 episodes (2020)", anilistId: 104462 },
  { title: "A Certain Magical Index III", info: "26 episodes (2018)", anilistId: 100185 },
];

const AOT_ENTRIES = [
  { title: "Attack on Titan Season 1", info: "25 episodes (2013)", anilistId: 16498 },
  { title: "Attack on Titan Season 2", info: "12 episodes (2017)", anilistId: 20958 },
  { title: "Attack on Titan Season 3 Part 1", info: "12 episodes (2018)", anilistId: 99147 },
  { title: "Attack on Titan Season 3 Part 2", info: "10 episodes (2019)", anilistId: 104578 },
  { title: "Attack on Titan: The Final Season", info: "16 episodes (2020)", anilistId: 110277 },
  { title: "Attack on Titan: The Final Season Part 2", info: "12 episodes (2022)", anilistId: 131681 },
  { title: "Attack on Titan: The Final Season Part 3", info: "2 episodes (2023)", anilistId: 146984 },
  { title: "Attack on Titan: No Regrets", info: "OVA (2014)", anilistId: 20811 },
  { title: "Attack on Titan: Lost Girls", info: "OVA (2017)", anilistId: 99634 },
  { title: "Attack on Titan: Junior High", info: "12 episodes — Spinoff Comedy (2015)", anilistId: 21281 },
];

const JOJO_ENTRIES = [
  { title: "JoJo's Bizarre Adventure (2012)", info: "26 episodes — Parts 1 & 2", anilistId: 14719 },
  { title: "JoJo's Bizarre Adventure: Stardust Crusaders", info: "48 episodes — Part 3 (2014)", anilistId: 20474 },
  { title: "JoJo's Bizarre Adventure: Diamond is Unbreakable", info: "39 episodes — Part 4 (2016)", anilistId: 21450 },
  { title: "JoJo's Bizarre Adventure: Golden Wind", info: "39 episodes — Part 5 (2018)", anilistId: 102883 },
  { title: "JoJo's Bizarre Adventure: Stone Ocean", info: "38 episodes — Part 6 (2021)", anilistId: 131942 },
  { title: "Thus Spoke Kishibe Rohan", info: "4 episodes — Spinoff OVA (2017)", anilistId: 21778 },
];

const SAO_ENTRIES = [
  { title: "Sword Art Online", info: "25 episodes (2012)", anilistId: 11757 },
  { title: "Sword Art Online: Extra Edition", info: "Special — Recap + Side Story (2013)", anilistId: 20021 },
  { title: "Sword Art Online II", info: "24 episodes (2014)", anilistId: 20594 },
  { title: "Sword Art Online: Ordinal Scale", info: "Movie (2017)", anilistId: 21403 },
  { title: "Sword Art Online: Alicization", info: "24 episodes (2018)", anilistId: 100182 },
  { title: "Sword Art Online: Alicization — War of Underworld", info: "23 episodes (2019)", anilistId: 108759 },
  { title: "Sword Art Online: Alicization — War of Underworld Part 2", info: "11 episodes (2020)", anilistId: 114308 },
  { title: "Sword Art Online Alternative: Gun Gale Online", info: "12 episodes — Spinoff (2018)", anilistId: 100183 },
  { title: "Sword Art Online: Progressive — Aria of a Starless Night", info: "Movie (2021)", anilistId: 124140 },
  { title: "Sword Art Online: Progressive — Scherzo of Deep Night", info: "Movie (2022)", anilistId: 140999 },
];

const CODE_GEASS_ENTRIES = [
  { title: "Code Geass: Lelouch of the Rebellion", info: "25 episodes (2006)", anilistId: 1575 },
  { title: "Code Geass: Lelouch of the Rebellion R2", info: "25 episodes (2008)", anilistId: 2904 },
  { title: "Code Geass: Akito the Exiled", info: "5 episodes — Spinoff OVA (2012)", anilistId: 8888 },
  { title: "Code Geass: Lelouch of the Re;surrection", info: "Movie — Alternate Timeline (2019)", anilistId: 97880 },
  { title: "Code Geass: Rozé of the Recapture", info: "4 episodes (2024)", anilistId: 126830 },
];

const STEINS_GATE_ENTRIES = [
  { title: "Steins;Gate", info: "24 episodes (2011)", anilistId: 9253 },
  { title: "Steins;Gate: The Movie — Load Region of Déjà Vu", info: "Movie (2013)", anilistId: 11577 },
  { title: "Steins;Gate 0", info: "23 episodes (2018)", anilistId: 21127 },
  { title: "Steins;Gate: Kyoukaimenjou no Missing Link", info: "OVA — Divide by Zero (2015)", anilistId: 21624 },
  { title: "Steins;Gate: Soumei Eichi no Cognitive Computing", info: "4 shorts — Comedy (2014)", anilistId: 20907 },
];

const DEMON_SLAYER_ENTRIES = [
  { title: "Demon Slayer: Kimetsu no Yaiba", info: "26 episodes (2019)", anilistId: 101922 },
  { title: "Demon Slayer: Mugen Train", info: "Movie (2020)", anilistId: 112151 },
  { title: "Demon Slayer: Entertainment District Arc", info: "11 episodes (2021)", anilistId: 142329 },
  { title: "Demon Slayer: Swordsmith Village Arc", info: "11 episodes (2023)", anilistId: 145139 },
  { title: "Demon Slayer: Hashira Training Arc", info: "8 episodes (2024)", anilistId: 176713 },
  { title: "Demon Slayer: To the Swordsmith Village", info: "Compilation Movie (2023)", anilistId: 164758 },
];

const MADE_IN_ABYSS_ENTRIES = [
  { title: "Made in Abyss", info: "13 episodes (2017)", anilistId: 97986 },
  { title: "Made in Abyss: Dawn of the Deep Soul", info: "Movie — Sequel (2020)", anilistId: 100643 },
  { title: "Made in Abyss: Journey's Dawn", info: "Compilation Movie — Recap (2018)", anilistId: 101343 },
  { title: "Made in Abyss: Wandering Twilight", info: "Compilation Movie — Recap (2019)", anilistId: 101344 },
  { title: "Made in Abyss: The Golden City of the Scorching Sun", info: "12 episodes — Season 2 (2022)", anilistId: 114745 },
];

const REZERO_ENTRIES = [
  { title: "Re:Zero — Starting Life in Another World", info: "25 episodes — Director's Cut (2016)", anilistId: 21355 },
  { title: "Re:Zero — Starting Life in Another World Season 2 Part 1", info: "13 episodes (2020)", anilistId: 108632 },
  { title: "Re:Zero — Starting Life in Another World Season 2 Part 2", info: "12 episodes (2021)", anilistId: 119661 },
  { title: "Re:Zero — Starting Life in Another World Season 3", info: "16 episodes (2024)", anilistId: 163134 },
  { title: "Re:Zero — Frozen Bond", info: "OVA — Prequel Movie (2019)", anilistId: 100049 },
  { title: "Re:Zero — Memory Snow", info: "OVA — Side Story (2018)", anilistId: 100049 },
  { title: "Re:Petit — Starting Life in Another World!", info: "14 shorts — Comedy Chibi Spinoff (2016)", anilistId: 21891 },
];

const MADOKA_ENTRIES = [
  { title: "Puella Magi Madoka Magica", info: "12 episodes (2011)", anilistId: 9756 },
  { title: "Madoka Magica: Beginnings", info: "Compilation Movie — Recap (2012)", anilistId: 11977 },
  { title: "Madoka Magica: Eternal", info: "Compilation Movie — Recap (2012)", anilistId: 11979 },
  { title: "Madoka Magica: Rebellion", info: "Movie — Sequel (2013)", anilistId: 11981 },
  { title: "Magia Record", info: "2 seasons — Spinoff (2020)", anilistId: 104051 },
];

const EVANGELION_ENTRIES = [
  { title: "Neon Genesis Evangelion", info: "26 episodes (1995)", anilistId: 30 },
  { title: "Neon Genesis Evangelion: The End of Evangelion", info: "Movie (1997)", anilistId: 32 },
  { title: "Evangelion: 1.0 You Are (Not) Alone", info: "Rebuild Movie (2007)", anilistId: 2759 },
  { title: "Evangelion: 2.0 You Can (Not) Advance", info: "Rebuild Movie (2009)", anilistId: 3784 },
  { title: "Evangelion: 3.0 You Can (Not) Redo", info: "Rebuild Movie (2012)", anilistId: 3785 },
  { title: "Evangelion: 3.0+1.0 Thrice Upon a Time", info: "Rebuild Movie (2021)", anilistId: 3786 },
];

const NARUTO_ENTRIES = [
  { title: "Naruto", info: "220 episodes (2002)", anilistId: 1735 },
  { title: "Naruto the Movie: Ninja Clash in the Land of Snow", info: "Movie (2004)", anilistId: 1651 },
  { title: "Naruto: Shippuden", info: "500 episodes (2007)", anilistId: 1735 },
  { title: "Naruto Shippuden the Movie: Bonds", info: "Movie (2008)", anilistId: 3486 },
  { title: "Naruto Shippuden the Movie: The Will of Fire", info: "Movie (2009)", anilistId: 6146 },
  { title: "Naruto Shippuden the Movie: The Lost Tower", info: "Movie (2010)", anilistId: 7474 },
  { title: "Naruto the Movie: Road to Ninja", info: "Movie (2012)", anilistId: 11617 },
  { title: "The Last: Naruto the Movie", info: "Movie (2014)", anilistId: 15851 },
];

const NARUTO_CHRONO = [
  { title: "Naruto", info: "220 episodes (2002)", anilistId: 1735 },
  { title: "Naruto the Movie: Ninja Clash in the Land of Snow", info: "Movie — after ep 101", anilistId: 1651 },
  { title: "Naruto: Shippuden", info: "500 episodes (2007)", anilistId: 1735 },
  { title: "Naruto Shippuden the Movie: Bonds", info: "Movie — after ep 71", anilistId: 3486 },
  { title: "Naruto Shippuden the Movie: The Will of Fire", info: "Movie — after ep 145", anilistId: 6146 },
  { title: "Naruto Shippuden the Movie: The Lost Tower", info: "Movie — after ep 221", anilistId: 7474 },
  { title: "Naruto the Movie: Road to Ninja", info: "Movie — after ep 248", anilistId: 11617 },
  { title: "The Last: Naruto the Movie", info: "Movie — after ep 493", anilistId: 15851 },
];

const BLEACH_ENTRIES = [
  { title: "Bleach", info: "366 episodes (2004)", anilistId: 269 },
  { title: "Bleach: Fade to Black", info: "Movie (2008)", anilistId: 4924 },
  { title: "Bleach: Hell Verse", info: "Movie (2010)", anilistId: 7320 },
  { title: "Bleach: Thousand-Year Blood War — The Separation", info: "13 episodes (2023)", anilistId: 143260 },
  { title: "Bleach: Thousand-Year Blood War — The Conflict", info: "26 episodes (2024)", anilistId: 167857 },
];

const FMA_ENTRIES = [
  { title: "Fullmetal Alchemist", info: "51 episodes (2003)", anilistId: 121 },
  { title: "Fullmetal Alchemist: The Conqueror of Shamballa", info: "Movie (2005)", anilistId: 122 },
  { title: "Fullmetal Alchemist: Brotherhood", info: "64 episodes (2009)", anilistId: 5114 },
  { title: "Fullmetal Alchemist: The Sacred Star of Milos", info: "Movie (2011)", anilistId: 8689 },
];

const FMA_BROTHERHOOD_FIRST = [
  { title: "Fullmetal Alchemist: Brotherhood", info: "64 episodes (2009)", anilistId: 5114 },
  { title: "Fullmetal Alchemist: The Sacred Star of Milos", info: "Movie (2011)", anilistId: 8689 },
  { title: "Fullmetal Alchemist", info: "51 episodes — Alternate telling (2003)", anilistId: 121 },
  { title: "Fullmetal Alchemist: The Conqueror of Shamballa", info: "Movie (2005)", anilistId: 122 },
];

const ONE_PIECE_ENTRIES = [
  { title: "One Piece", info: "1100+ episodes (1999)", anilistId: 21 },
  { title: "One Piece: Episode of East Blue", info: "Special (2017)", anilistId: 99127 },
  { title: "One Piece: Episode of Nami", info: "Special (2012)", anilistId: 11651 },
  { title: "One Piece Film: Strong World", info: "Movie (2009)", anilistId: 5663 },
];

const HUNTER_X_HUNTER_ENTRIES = [
  { title: "Hunter x Hunter (1999)", info: "62 episodes (1999)", anilistId: 145 },
  { title: "Hunter x Hunter: Greed Island", info: "OVA (2002)", anilistId: 146 },
  { title: "Hunter x Hunter (2011)", info: "148 episodes (2011)", anilistId: 11061 },
];

const MHA_ENTRIES = [
  { title: "My Hero Academia Season 1", info: "13 episodes (2016)", anilistId: 21459 },
  { title: "My Hero Academia: Two Heroes", info: "Movie (2018)", anilistId: 100148 },
  { title: "My Hero Academia Season 2", info: "25 episodes (2017)", anilistId: 21460 },
  { title: "My Hero Academia Season 3", info: "25 episodes (2018)", anilistId: 21461 },
  { title: "My Hero Academia: Heroes Rising", info: "Movie (2020)", anilistId: 112032 },
  { title: "My Hero Academia Season 4", info: "25 episodes (2019)", anilistId: 21462 },
  { title: "My Hero Academia: World Heroes' Mission", info: "Movie (2021)", anilistId: 131636 },
  { title: "My Hero Academia Season 5", info: "25 episodes (2021)", anilistId: 21463 },
];

const PSYCHO_PASS_ENTRIES = [
  { title: "Psycho-Pass", info: "22 episodes (2012)", anilistId: 13927 },
  { title: "Psycho-Pass: The Movie", info: "Movie (2015)", anilistId: 20238 },
  { title: "Psycho-Pass 2", info: "11 episodes (2014)", anilistId: 21169 },
  { title: "Psycho-Pass 3", info: "8 episodes (2019)", anilistId: 106224 },
  { title: "Psycho-Pass 3: First Inspector", info: "Movie (2020)", anilistId: 112044 },
];

const PSYCHO_PASS_CHRONO = [
  { title: "Psycho-Pass", info: "22 episodes (2012)", anilistId: 13927 },
  { title: "Psycho-Pass 2", info: "11 episodes (2014)", anilistId: 21169 },
  { title: "Psycho-Pass: The Movie", info: "Movie (2015)", anilistId: 20238 },
  { title: "Psycho-Pass 3", info: "8 episodes (2019)", anilistId: 106224 },
  { title: "Psycho-Pass 3: First Inspector", info: "Movie (2020)", anilistId: 112044 },
];

const HARUHI_ENTRIES = [
  { title: "The Melancholy of Haruhi Suzumiya", info: "14 episodes (2006)", anilistId: 849 },
  { title: "The Melancholy of Haruhi Suzumiya (2009 Repeat)", info: "14 episodes — Chronological rebroadcast", anilistId: 849 },
  { title: "The Disappearance of Haruhi Suzumiya", info: "Movie (2010)", anilistId: 3896 },
  { title: "The Disappearance of Nagato Yuki-chan", info: "17 episodes — Spinoff (2015)", anilistId: 20613 },
];

const HARUHI_CHRONO = [
  { title: "The Melancholy of Haruhi Suzumiya (2009 Order)", info: "14 episodes — Chronological", anilistId: 849 },
  { title: "The Disappearance of Haruhi Suzumiya", info: "Movie (2010)", anilistId: 3896 },
  { title: "The Disappearance of Nagato Yuki-chan", info: "17 episodes — Spinoff (2015)", anilistId: 20613 },
];

const DURARARA_ENTRIES = [
  { title: "Durarara!!", info: "24 episodes (2010)", anilistId: 6114 },
  { title: "Durarara!! x2 Shou", info: "12 episodes (2015)", anilistId: 21621 },
  { title: "Durarara!! x2 Ten", info: "12 episodes (2015)", anilistId: 21622 },
  { title: "Durarara!! x2 Ketsu", info: "12 episodes (2016)", anilistId: 21623 },
];

const BACCANO_ENTRIES = [
  { title: "Baccano!", info: "13 episodes (2007)", anilistId: 2251 },
  { title: "Baccano! (Railgun Special)", info: "3 episodes — OVAs (2007)", anilistId: 2252 },
];

const HIGURASHI_ENTRIES = [
  { title: "Higurashi: When They Cry — Question Arcs", info: "26 episodes (2006)", anilistId: 934 },
  { title: "Higurashi: When They Cry — Answer Arcs", info: "26 episodes (2007)", anilistId: 935 },
  { title: "Higurashi no Naku Koro ni Rei", info: "5 episodes — OVA (2009)", anilistId: 7135 },
  { title: "Higurashi: When They Cry — Gou", info: "24 episodes (2020)", anilistId: 114144 },
  { title: "Higurashi: When They Cry — Sotsu", info: "15 episodes (2021)", anilistId: 133672 },
];

const GITS_ENTRIES = [
  { title: "Ghost in the Shell: Stand Alone Complex", info: "26 episodes (2002)", anilistId: 43 },
  { title: "Ghost in the Shell: S.A.C. 2nd GIG", info: "26 episodes (2004)", anilistId: 44 },
  { title: "Ghost in the Shell: Stand Alone Complex — Solid State Society", info: "Movie (2006)", anilistId: 2166 },
  { title: "Ghost in the Shell: Arise — Border 1: Ghost Pain", info: "OVA (2013)", anilistId: 15809 },
  { title: "Ghost in the Shell (2015)", info: "Movie (2015)", anilistId: 20363 },
];

const GITS_CHRONO = [
  { title: "Ghost in the Shell: Arise — Border 1: Ghost Pain", info: "OVA (2013)", anilistId: 15809 },
  { title: "Ghost in the Shell: Stand Alone Complex", info: "26 episodes (2002)", anilistId: 43 },
  { title: "Ghost in the Shell: S.A.C. 2nd GIG", info: "26 episodes (2004)", anilistId: 44 },
  { title: "Ghost in the Shell: Stand Alone Complex — Solid State Society", info: "Movie (2006)", anilistId: 2166 },
  { title: "Ghost in the Shell (2015)", info: "Movie (2015)", anilistId: 20363 },
];

const GINTAMA_ENTRIES = [
  { title: "Gintama", info: "201 episodes (2006)", anilistId: 979 },
  { title: "Gintama: Benizakura-hen", info: "Movie — Arc 5 (2010)", anilistId: 7463 },
  { title: "Gintama'", info: "51 episodes (2011)", anilistId: 979 },
  { title: "Gintama': Enchousen", info: "13 episodes (2012)", anilistId: 979 },
  { title: "Gintama° (Season 4)", info: "51 episodes (2015)", anilistId: 979 },
];

const CONAN_ENTRIES = [
  { title: "Detective Conan (Case Closed)", info: "1100+ episodes (1996)", anilistId: 235 },
  { title: "Detective Conan: The Time-Bombed Skyscraper", info: "Movie 1 (1997)", anilistId: 1137 },
  { title: "Detective Conan: The Fist of Blue Sapphire", info: "Movie 23 (2019)", anilistId: 105267 },
  { title: "Detective Conan: The Million-dollar Pentagram", info: "Movie 27 (2024)", anilistId: 171347 },
];

const DIGIMON_ENTRIES = [
  { title: "Digimon Adventure", info: "54 episodes (1999)", anilistId: 180 },
  { title: "Digimon Adventure 02", info: "50 episodes (2000)", anilistId: 181 },
  { title: "Digimon Tamers", info: "51 episodes (2001)", anilistId: 182 },
  { title: "Digimon Frontier", info: "50 episodes (2002)", anilistId: 183 },
  { title: "Digimon Data Squad", info: "48 episodes (2006)", anilistId: 184 },
];

const POKEMON_ENTRIES = [
  { title: "Pokémon: Indigo League", info: "82 episodes (1997)", anilistId: 2540 },
  { title: "Pokémon: Advanced Generation", info: "192 episodes (2002)", anilistId: 2540 },
  { title: "Pokémon: Diamond & Pearl", info: "191 episodes (2006)", anilistId: 2540 },
  { title: "Pokémon: XY", info: "140 episodes (2013)", anilistId: 2540 },
  { title: "Pokémon: Sun & Moon", info: "147 episodes (2016)", anilistId: 2540 },
];

const INITIAL_D_ENTRIES = [
  { title: "Initial D: First Stage", info: "26 episodes (1998)", anilistId: 467 },
  { title: "Initial D: Second Stage", info: "13 episodes (1999)", anilistId: 468 },
  { title: "Initial D: Third Stage", info: "Movie (2001)", anilistId: 469 },
  { title: "Initial D: Fourth Stage", info: "24 episodes (2004)", anilistId: 470 },
  { title: "Initial D: Fifth Stage", info: "14 episodes (2012)", anilistId: 471 },
  { title: "Initial D: Final Stage", info: "4 episodes (2014)", anilistId: 472 },
];

const SYMPHOGEAR_ENTRIES = [
  { title: "Senki Zesshou Symphogear", info: "13 episodes (2012)", anilistId: 11813 },
  { title: "Senki Zesshou Symphogear G", info: "13 episodes (2013)", anilistId: 15725 },
  { title: "Senki Zesshou Symphogear GX", info: "13 episodes (2015)", anilistId: 21631 },
  { title: "Senki Zesshou Symphogear AXZ", info: "13 episodes (2017)", anilistId: 21632 },
  { title: "Senki Zesshou Symphogear XV", info: "13 episodes (2019)", anilistId: 107599 },
];

const MACROSS_ENTRIES = [
  { title: "Super Dimension Fortress Macross", info: "36 episodes (1982)", anilistId: 963 },
  { title: "Macross Plus", info: "4 episodes (1994)", anilistId: 964 },
  { title: "Macross Zero", info: "5 episodes (2002)", anilistId: 965 },
  { title: "Macross Frontier", info: "25 episodes (2008)", anilistId: 966 },
  { title: "Macross Delta", info: "26 episodes (2016)", anilistId: 967 },
];

const MACROSS_CHRONO = [
  { title: "Macross Zero", info: "5 episodes — Prequel", anilistId: 965 },
  { title: "Super Dimension Fortress Macross", info: "36 episodes (1982)", anilistId: 963 },
  { title: "Macross Plus", info: "4 episodes (1994)", anilistId: 964 },
  { title: "Macross Frontier", info: "25 episodes (2008)", anilistId: 966 },
  { title: "Macross Delta", info: "26 episodes (2016)", anilistId: 967 },
];

const YUYU_HAKUSHO_ENTRIES = [
  { title: "YuYu Hakusho", info: "112 episodes (1992)", anilistId: 381 },
  { title: "YuYu Hakusho: The Movie", info: "Movie (1994)", anilistId: 1021 },
  { title: "YuYu Hakusho: Eizou Hakusho II", info: "OVA (1995)", anilistId: 1022 },
];

const SLAM_DUNK_ENTRIES = [
  { title: "Slam Dunk", info: "101 episodes (1993)", anilistId: 1629 },
  { title: "Slam Dunk: Takehime no Hanamichi", info: "Movie (1994)", anilistId: 1630 },
  { title: "The First Slam Dunk", info: "Movie (2022)", anilistId: 144464 },
];

const PRECURE_ENTRIES = [
  { title: "Futari wa Pretty Cure", info: "49 episodes (2004)", anilistId: 3816 },
  { title: "Futari wa Pretty Cure Max Heart", info: "47 episodes (2005)", anilistId: 3817 },
  { title: "Pretty Cure (General Guide)", info: "Each season is standalone", anilistId: 3816 },
];

const KATANAGATARI_ENTRIES = [
  { title: "Katanagatari", info: "12 episodes (2010)", anilistId: 6595 },
];

const TIGER_BUNNY_ENTRIES = [
  { title: "Tiger & Bunny", info: "25 episodes (2011)", anilistId: 10075 },
  { title: "Tiger & Bunny: The Beginning", info: "Movie — Compilation (2012)", anilistId: 11725 },
  { title: "Tiger & Bunny: The Rising", info: "Movie — Sequel (2014)", anilistId: 21079 },
];

interface WatchOrder {
  emoji: string;
  title: string;
  entries: number;
  methods: string[];
  description: string;
  tip?: string;
}

const WATCH_ORDERS_DATA: Record<string, WatchOrder & { anilistId?: number }> = {
  monogatari: {
    emoji: "🦊",
    title: "Monogatari Series",
    anilistId: 5081,
    entries: 12,
    methods: ["Release Order", "Chronological"],
    description: "The Monogatari series is known for its non-linear storytelling. The release order is the most recommended by fans, but we also provide the chronological timeline.",
    tip: "Most fans strongly recommend Release Order (aired order) for first-time viewers. The series was intentionally presented this way for narrative impact.",
  },
  fate: {
    emoji: "⚔️",
    title: "Fate Series",
    anilistId: 19603,
    entries: 7,
    methods: ["Release Order", "Story Order"],
    description: "The Fate series spans multiple timelines and routes. Start with Unlimited Blade Works (2014) for the best modern entry point, then Fate/Zero as a prequel.",
    tip: "There is no single 'correct' Fate watch order. We recommend UBW → Heaven's Feel → Zero for the best narrative experience.",
  },
  "dragon-ball": {
    emoji: "🐉",
    title: "Dragon Ball",
    anilistId: 223,
    entries: 7,
    methods: ["Release Order"],
    description: "The Dragon Ball franchise is straightforward: start with the original, then Z, then Super. Movies can be watched at the indicated points.",
    tip: "DBZ Kai is a recut version that removes most filler — great if you want a faster watch.",
  },
  gundam: {
    emoji: "🤖",
    title: "Gundam Universal Century",
    anilistId: 80,
    entries: 9,
    methods: ["UC Timeline", "Release Order"],
    description: "The Universal Century is the main Gundam timeline. Start with the original 1979 series and follow the production order.",
    tip: "If 1979 animation feels too dated, you can start with Gundam: The Origin as an alternative entry point.",
  },
  toaru: {
    emoji: "⚡",
    title: "Toaru (Index / Railgun)",
    anilistId: 4654,
    entries: 6,
    methods: ["Release Order", "Chronological"],
    description: "The Toaru universe has two parallel series: Index (magic side) and Railgun (science side). They intersect at key points.",
    tip: "Start with Railgun (2009) for a slower introduction to the world, or Index (2008) for the main story.",
  },
  aot: {
    emoji: "🗡️",
    title: "Attack on Titan",
    anilistId: 16498,
    entries: 10,
    methods: ["Release Order"],
    description: "One of the most popular anime of all time. Seasons 1-3, then The Final Season in 3 parts. Includes OVAs and spinoffs.",
    tip: "Don't skip the OVAs — No Regrets and Lost Girls add valuable backstory.",
  },
  jojo: {
    emoji: "💎",
    title: "JoJo's Bizarre Adventure",
    anilistId: 14719,
    entries: 6,
    methods: ["Part Order"],
    description: "JoJo is divided into parts, each following a different Joestar. The 2012 anime adapts Parts 1-6 chronologically.",
    tip: "Part 1 (Phantom Blood) is only 9 episodes and sets up everything. Don't skip it.",
  },
  sao: {
    emoji: "⚔️",
    title: "Sword Art Online",
    anilistId: 11757,
    entries: 10,
    methods: ["Release Order", "Chronological"],
    description: "Aincrad → Fairy Dance → Phantom Bullet → Ordinal Scale → Alicization. The Progressive movies retell the early floors.",
    tip: "For the best experience, watch the main series in release order.",
  },
  "code-geass": {
    emoji: "♟️",
    title: "Code Geass",
    anilistId: 1575,
    entries: 5,
    methods: ["Release Order"],
    description: "R1 → R2 is the main story. Akito the Exiled is a side story. Re;surrection is an alternate timeline sequel.",
    tip: "Akito the Exiled can be skipped on first watch — it's a side story with new characters.",
  },
  "steins-gate": {
    emoji: "⚗️",
    title: "Steins;Gate",
    anilistId: 9253,
    entries: 5,
    methods: ["Release Order", "Chronological"],
    description: "Start with Steins;Gate (2011), then the movie, then Steins;Gate 0. The OVAs are optional but add closure.",
    tip: "Steins;Gate 0 takes place between episodes 23 and 24 of the original.",
  },
  "demon-slayer": {
    emoji: "⚡",
    title: "Demon Slayer",
    anilistId: 101922,
    entries: 6,
    methods: ["Release Order"],
    description: "Season 1 → Mugen Train Movie → Entertainment District → Swordsmith Village → Hashira Training.",
    tip: "The Mugen Train movie is NOT skippable — it's direct canon.",
  },
  "made-in-abyss": {
    emoji: "🕳️",
    title: "Made in Abyss",
    anilistId: 97986,
    entries: 6,
    methods: ["Release Order", "Chronological"],
    description: "Season 1 → Dawn of the Deep Soul (movie) → Season 2. The recap movies can substitute for season 1.",
    tip: "Dawn of the Deep Soul is a direct sequel — not optional.",
  },
  rezero: {
    emoji: "🔄",
    title: "Re:Zero",
    anilistId: 21355,
    entries: 7,
    methods: ["Release Order"],
    description: "Season 1 (Director's Cut) → Frozen Bond → Memory Snow → Season 2 → Season 3.",
    tip: "Re:Zero Season 1 has a Director's Cut that combines the original 25 episodes into 13 longer episodes.",
  },
  madoka: {
    emoji: "✨",
    title: "Madoka Magica",
    anilistId: 9756,
    entries: 5,
    methods: ["Release Order"],
    description: "The original series, followed by recap movies and the essential Rebellion sequel movie.",
    tip: "Don't be fooled by the cute art style — this is a dark magical girl deconstruction.",
  },
  evangelion: {
    emoji: "🤖",
    title: "Neon Genesis Evangelion",
    anilistId: 30,
    entries: 6,
    methods: ["Release Order"],
    description: "The original series, End of Evangelion movie, and the four Rebuild movies.",
    tip: "Watch the original series first, then End of Evangelion, then the Rebuilds as a separate experience.",
  },
  naruto: {
    emoji: "🍥",
    title: "Naruto",
    anilistId: 1735,
    entries: 8,
    methods: ["Release Order", "Chronological"],
    description: "Naruto → Shippuden → Boruto. Includes movies and OVAs placement.",
    tip: "Watch movies in release order between Shippuden episodes for the best experience.",
  },
  bleach: {
    emoji: "⚔️",
    title: "Bleach",
    anilistId: 269,
    entries: 5,
    methods: ["Release Order"],
    description: "Original series → Thousand-Year Blood War. The final arc is split into 4 cour.",
    tip: "The TYBW anime is a direct continuation — no filler needed.",
  },
  fma: {
    emoji: "⚗️",
    title: "Fullmetal Alchemist",
    anilistId: 5114,
    entries: 4,
    methods: ["Release Order", "Brotherhood First"],
    description: "Brotherhood is the definitive adaptation. 2003 version is an alternate telling.",
    tip: "Start with Brotherhood for the canon story. The 2003 version is a great alternate take.",
  },
  "one-piece": {
    emoji: "🏴‍☠️",
    title: "One Piece",
    anilistId: 21,
    entries: 4,
    methods: ["Release Order"],
    description: "East Blue → Alabasta → Skypiea → Water 7 → Marineford → Wano → Egghead.",
    tip: "The anime is very long — focus on canon arcs for the main story.",
  },
  "hunter-x-hunter": {
    emoji: "🎯",
    title: "Hunter x Hunter",
    anilistId: 11061,
    entries: 3,
    methods: ["Release Order"],
    description: "2011 version covers the full manga. 1999 version is an alternate take.",
    tip: "The 2011 version is the definitive adaptation — covers everything.",
  },
  mha: {
    emoji: "💪",
    title: "My Hero Academia",
    anilistId: 21459,
    entries: 8,
    methods: ["Release Order"],
    description: "Seasons 1-7 + movies. Movies can be watched after their respective seasons.",
    tip: "Movies are mostly standalone — watch after the season they're released alongside.",
  },
  "psycho-pass": {
    emoji: "🔫",
    title: "Psycho-Pass",
    anilistId: 13927,
    entries: 5,
    methods: ["Release Order", "Chronological"],
    description: "Season 1 → Movie → Season 2 → 3 → Providence. The extended universe.",
    tip: "Season 1 is essential — the rest builds on its themes.",
  },
  haruhi: {
    emoji: "🌸",
    title: "The Melancholy of Haruhi Suzumiya",
    anilistId: 849,
    entries: 4,
    methods: ["Chronological", "Broadcast Order"],
    description: "The infamous watch order debate. Chronological vs broadcast order explained.",
    tip: "The 2009 rebroadcast uses chronological order — recommended for first-time viewers.",
  },
  durarara: {
    emoji: "🐉",
    title: "Durarara!!",
    anilistId: 6114,
    entries: 4,
    methods: ["Release Order"],
    description: "Season 1 → Ketsu → Shou → Ten. The Ikebukuro underworld saga.",
    tip: "Watch in release order — each season builds on the last.",
  },
  baccano: {
    emoji: "🚂",
    title: "Baccano!",
    anilistId: 2251,
    entries: 2,
    methods: ["Release Order", "Chronological"],
    description: "Non-linear storytelling on a train. Watch order matters less than you think.",
    tip: "The non-linear order is intentional — it's part of the mystery.",
  },
  higurashi: {
    emoji: "🪓",
    title: "Higurashi: When They Cry",
    anilistId: 934,
    entries: 5,
    methods: ["Release Order"],
    description: "Question Arcs → Answer Arcs → Rei → Gou → Sotsu. Don't skip arcs.",
    tip: "Question Arcs are confusing on purpose — Answer Arcs explain everything.",
  },
  "ghost-in-the-shell": {
    emoji: "🤖",
    title: "Ghost in the Shell",
    anilistId: 43,
    entries: 5,
    methods: ["Release Order", "Timeline"],
    description: "Stand Alone Complex → Arise → Movies. The cyberpunk masterpiece.",
    tip: "SAC is the best starting point for the anime series.",
  },
  gintama: {
    emoji: "👽",
    title: "Gintama",
    anilistId: 979,
    entries: 5,
    methods: ["Release Order"],
    description: "Episodes 1-201 → Benizakura → 202-316 → Silver Soul Arc. Comedy meets action.",
    tip: "Skip episode 1 and 2 (recap). Start from episode 3.",
  },
  conan: {
    emoji: "🔍",
    title: "Detective Conan",
    anilistId: 235,
    entries: 3,
    methods: ["Release Order", "Filler-Free"],
    description: "1000+ episodes. Focus on canon episodes for the main storyline.",
    tip: "Use a filler list — the main story is in about 400 episodes.",
  },
  digimon: {
    emoji: "🦕",
    title: "Digimon",
    anilistId: 180,
    entries: 5,
    methods: ["Release Order", "Chronological"],
    description: "Adventure → 02 → Tamers → Frontier → Data Squad. Each season is standalone.",
    tip: "Each season is a fresh start — pick whichever interests you.",
  },
  pokemon: {
    emoji: "⚡",
    title: "Pokémon",
    anilistId: 2540,
    entries: 4,
    methods: ["Release Order"],
    description: "Indigo League → Advanced → Diamond & Pearl → XY → Sun & Moon → Horizons.",
    tip: "Each generation is mostly standalone — start wherever you want.",
  },
  "initial-d": {
    emoji: "🏎️",
    title: "Initial D",
    anilistId: 467,
    entries: 6,
    methods: ["Stage Order"],
    description: "Stage 1 → 2 → 3 → 4 → 5 → Final. The legendary street racing anime.",
    tip: "Watch in stage order — it follows Takumi's journey from beginner to legend.",
  },
  symphogear: {
    emoji: "🎵",
    title: "Symphogear",
    anilistId: 11813,
    entries: 5,
    methods: ["Release Order"],
    description: "5 seasons of singing, fighting, and saving the world. Pure hype.",
    tip: "The show gets better every season — stick with it.",
  },
  macross: {
    emoji: "🚀",
    title: "Macross",
    anilistId: 963,
    entries: 5,
    methods: ["Timeline", "Release Order"],
    description: "SDF Macross → Plus → Zero → Frontier → Delta. Mecha + music + love triangles.",
    tip: "Each series is mostly standalone — pick based on your era preference.",
  },
  "yu-yu-hakusho": {
    emoji: "👻",
    title: "YuYu Hakusho",
    anilistId: 381,
    entries: 3,
    methods: ["Release Order"],
    description: "Seasons 1-4 + movies + OVAs. Toguro Arc through Chapter Black.",
    tip: "The first arc (Dark Tournament) is peak anime.",
  },
  "slam-dunk": {
    emoji: "🏀",
    title: "Slam Dunk",
    anilistId: 1629,
    entries: 3,
    methods: ["Release Order"],
    description: "TV Series → Movies → The First Slam Dunk. The GOAT sports anime.",
    tip: "The First Slam Dunk (2022) is a masterpiece — watch after the series.",
  },
  precure: {
    emoji: "🎀",
    title: "Pretty Cure (Precure)",
    anilistId: 3816,
    entries: 3,
    methods: ["Release Order", "Standalone"],
    description: "Each season is standalone but follows the same formula. Where to start guide.",
    tip: "Start with Futari wa or HeartCatch — both are fan favorites.",
  },
  katangatari: {
    emoji: "🗡️",
    title: "Katanagatari",
    anilistId: 6595,
    entries: 1,
    methods: ["Release Order"],
    description: "12 episodes, 12 swords. A unique linguistic and martial arts adventure.",
    tip: "Watch all 12 episodes — the ending is unforgettable.",
  },
  "tiger-and-bunny": {
    emoji: "🦸",
    title: "Tiger & Bunny",
    anilistId: 10075,
    entries: 3,
    methods: ["Release Order"],
    description: "Season 1 → Movie 1 → Movie 2 → Season 2. Superhero action comedy.",
    tip: "Great for superhero fans who want something different from Western comics.",
  },
};
