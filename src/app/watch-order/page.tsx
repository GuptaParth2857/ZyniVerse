import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Watch Order Guides — Complete Series Watch Orders | ZyniVerse",
  description:
    "Never be confused about anime watch order again. Complete watch order guides for Monogatari, Fate, Dragon Ball, Gundam, and dozens more complex series.",
  openGraph: {
    title: "Anime Watch Order Guides — ZyniVerse",
    description: "Complete watch order guides for Monogatari, Fate, Dragon Ball, Gundam, and more.",
  },
  robots: { index: true, follow: true },
};

export default function WatchOrderPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Watch Order Guides</span>
      </nav>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Watch Orders</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Anime Watch Order Guides</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Confused about where to start? These watch order guides show you the correct sequence for complex anime franchises — chronological, release, or story-optimized.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WATCH_ORDERS.map((order) => (
          <Link
            key={order.id}
            href={`/watch-order/${order.id}`}
            className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 hover:border-[var(--color-cyan)]/40 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{order.emoji}</span>
              <div>
                <p className="font-display font-bold text-lg group-hover:text-[var(--color-cyan)] transition-colors">{order.title}</p>
                <p className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider">{order.entries} entries</p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-mute)] leading-relaxed">{order.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {order.methods.map((m) => (
                <span key={m} className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-mono text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">{m}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 border-t border-[var(--color-line)] pt-10">
        <h2 className="font-display text-2xl font-bold mb-6">Why Watch Order Matters</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
              <p className="text-xs text-[var(--color-mute)] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const WATCH_ORDERS = [
  { id: "aot", emoji: "🗡️", title: "Attack on Titan", entries: 10, methods: ["Release Order"], description: "Seasons 1-3 → The Final Season (3 parts). Includes OVAs and spinoffs." },
  { id: "jojo", emoji: "💎", title: "JoJo's Bizarre Adventure", entries: 6, methods: ["Part Order"], description: "Parts 1-6 adapted chronologically. Phantom Blood through Stone Ocean." },
  { id: "sao", emoji: "⚔️", title: "Sword Art Online", entries: 10, methods: ["Release Order", "Chronological"], description: "Aincrad → Fairy Dance → Phantom Bullet → Alicization. Movies included." },
  { id: "demon-slayer", emoji: "⚡", title: "Demon Slayer", entries: 6, methods: ["Release Order"], description: "Season 1 → Mugen Train → Entertainment District → Swordsmith Village." },
  { id: "monogatari", emoji: "🦊", title: "Monogatari Series", entries: 30, methods: ["Release Order", "Chronological", "Light Novel"], description: "The most debated watch order in anime. Bake → Nise → Neko Kuro → etc." },
  { id: "steins-gate", emoji: "⚗️", title: "Steins;Gate", entries: 5, methods: ["Release Order", "Chronological"], description: "The definitive experience. Original series → Movie → Steins;Gate 0." },
  { id: "fate", emoji: "⚔️", title: "Fate Series", entries: 20, methods: ["Release Order", "Story Order", "VN Route"], description: "Stay Night → Zero → Unlimited Blade Works → Heaven's Feel." },
  { id: "code-geass", emoji: "♟️", title: "Code Geass", entries: 5, methods: ["Release Order"], description: "R1 → R2 → Akito the Exiled → Re;surrection. The complete timeline." },
  { id: "rezero", emoji: "🔄", title: "Re:Zero", entries: 7, methods: ["Release Order"], description: "Season 1 (Director's Cut) → Memory Snow → Frozen Bond → Season 2 → 3." },
  { id: "dragon-ball", emoji: "🐉", title: "Dragon Ball", entries: 6, methods: ["Release Order", "Chronological"], description: "Dragon Ball → DBZ → DBS → Super Hero. Includes movies and GT." },
  { id: "gundam", emoji: "🤖", title: "Gundam UC", entries: 40, methods: ["UC Timeline", "Release", "Alternate Universe"], description: "0079 → Zeta → ZZ → CCA. Includes all AUs like Wing, Seed, 00." },
  { id: "toaru", emoji: "⚡", title: "Toaru (Index / Railgun)", entries: 6, methods: ["Release Order", "Chronological"], description: "Index, Railgun, Accelerator — where they intersect." },
  { id: "made-in-abyss", emoji: "🕳️", title: "Made in Abyss", entries: 6, methods: ["Release Order", "Chronological"], description: "Season 1 → Dawn of the Deep Soul → Season 2. A masterpiece." },
  { id: "madoka", emoji: "🎀", title: "Madoka Magica", entries: 5, methods: ["Release Order", "Chronological"], description: "Series → Rebellion → Magia Record. The definitive watch order." },
  { id: "evangelion", emoji: "🤯", title: "Neon Genesis Evangelion", entries: 5, methods: ["Release Order", "Chronological"], description: "NGE → EoE → Rebuilds. The correct way to experience this classic." },
];

const FAQ = [
  { q: "What is a watch order?", a: "A watch order tells you the correct sequence to watch anime in a franchise. Some series have multiple timelines, prequels released after sequels, or spinoffs that intersect with the main story." },
  { q: "Release Order vs Chronological Order?", a: "Release order is how the anime was originally aired. Chronological order follows the story's timeline. Each has its pros — we explain both." },
  { q: "Can I skip filler in these guides?", a: "Yes! Our filler guides complement these watch orders. Use them together to skip non-canon episodes while following the right sequence." },
  { q: "Are these guides spoiler-free?", a: "We avoid major plot spoilers. The guides focus on episode numbers, titles, and order — not story events." },
];
