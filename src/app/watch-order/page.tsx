"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { PageTransition, FadeIn } from "@/components/PageTransition";

export default function WatchOrderPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return WATCH_ORDERS;
    const q = query.toLowerCase();
    return WATCH_ORDERS.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.methods.some((m) => m.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <FadeIn>
          <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
            <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)]">Watch Order Guides</span>
          </nav>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Watch Orders</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1 gradient-text">Anime Watch Order Guides</h1>
            <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
              Confused about where to start? These watch order guides show you the correct sequence for complex anime franchises — chronological, release, or story-optimized.
            </p>
          </div>
        </FadeIn>

        {/* Neon RGB Search Bar */}
        <FadeIn delay={0.15}>
          <div className="relative mb-10 group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] opacity-30 group-focus-within:opacity-100 blur-sm transition-all duration-700 animate-neon-rgb" />
            <div className="relative flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 transition-colors group-focus-within:border-transparent">
              <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-mute)" }}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search watch orders by name, description, or method..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-mute)]">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={filtered.length}
          className="mb-4 text-[11px] font-mono text-[var(--color-mute)] tracking-wider uppercase"
        >
          {filtered.length} {filtered.length === 1 ? "guide" : "guides"} found
        </motion.p>

        {/* Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.length > 0 ? (
            filtered.map((order) => {
              const isHovered = hovered === order.id;

              return (
                <motion.div
                  key={order.id}
                  layout
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHovered(order.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Link
                    href={`/watch-order/${order.id}`}
                    className="glass-card group block h-full overflow-hidden !rounded-xl"
                  >
                    {/* Image section */}
                    <div className="relative h-36 sm:h-40 overflow-hidden">
                      <img
                        src={`https://img.anili.st/media/${order.anilistId}`}
                        alt={order.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono font-bold text-white/80 border border-white/10">
                          {order.entries} entries
                        </span>
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="relative p-4 pt-3">
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(600px circle at 50% 0%, rgba(0,229,255,0.06), transparent 60%)",
                        }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.35 }}
                      />

                      <div className="relative z-10">
                        <motion.p
                          className="font-display font-bold text-base truncate"
                          animate={{ color: isHovered ? "#29f2e0" : "#f0eef8" }}
                          transition={{ duration: 0.25 }}
                        >
                          {order.title}
                        </motion.p>

                        <p className="mt-1 text-xs text-[var(--color-mute)] leading-relaxed line-clamp-2">
                          {order.description}
                        </p>

                        <motion.div
                          className="mt-2.5 flex flex-wrap gap-1.5"
                          animate={{ gap: isHovered ? "0.5rem" : "0.375rem" }}
                          transition={{ duration: 0.3 }}
                        >
                          {order.methods.map((m) => (
                            <motion.span
                              key={m}
                              className="rounded-full px-2 py-0.5 text-[9px] font-mono border"
                              style={{
                                backgroundColor: isHovered
                                  ? "rgba(0,229,255,0.15)"
                                  : "rgba(0,229,255,0.08)",
                                borderColor: isHovered
                                  ? "rgba(0,229,255,0.4)"
                                  : "rgba(0,229,255,0.15)",
                                color: isHovered ? "#29f2e0" : "rgba(41,242,224,0.8)",
                              }}
                              transition={{ duration: 0.25 }}
                            >
                              {m}
                            </motion.span>
                          ))}
                        </motion.div>

                        <motion.div
                          className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold"
                          animate={{
                            color: isHovered ? "var(--color-magenta)" : "transparent",
                            x: isHovered ? 0 : 5,
                            opacity: isHovered ? 1 : 0,
                          }}
                          transition={{ duration: 0.25 }}
                        >
                          <span>View Guide</span>
                          <span>→</span>
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-4 text-4xl opacity-30">🔍</div>
              <p className="font-display text-lg font-bold text-[var(--color-mute)]">No guides found</p>
              <p className="mt-1 text-sm text-[var(--color-mute)] opacity-60">
                Try searching for &ldquo;monogatari&rdquo; or &ldquo;fate&rdquo;
              </p>
              <button
                onClick={() => setQuery("")}
                className="mt-4 rounded-full border border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 transition-all"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* FAQ Section */}
        <FadeIn delay={0.2}>
          <div className="mt-20 border-t border-[var(--color-line)] pt-12">
            <h2 className="font-display text-2xl font-bold mb-8 gradient-text">Why Watch Order Matters</h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {FAQ.map((item, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card p-5 !rounded-xl"
                >
                  <div className="relative z-10">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-magenta)]/10 text-xs font-bold text-[var(--color-magenta)] font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                    <p className="text-xs text-[var(--color-mute)] leading-relaxed">{item.a}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}

const WATCH_ORDERS = [
  { id: "aot", anilistId: 20661, title: "Attack on Titan", entries: 10, methods: ["Release Order"], description: "Seasons 1-3 → The Final Season (3 parts). Includes OVAs and spinoffs." },
  { id: "jojo", anilistId: 14719, title: "JoJo's Bizarre Adventure", entries: 6, methods: ["Part Order"], description: "Parts 1-6 adapted chronologically. Phantom Blood through Stone Ocean." },
  { id: "sao", anilistId: 21459, title: "Sword Art Online", entries: 10, methods: ["Release Order", "Chronological"], description: "Aincrad → Fairy Dance → Phantom Bullet → Alicization. Movies included." },
  { id: "demon-slayer", anilistId: 101922, title: "Demon Slayer", entries: 6, methods: ["Release Order"], description: "Season 1 → Mugen Train → Entertainment District → Swordsmith Village." },
  { id: "monogatari", anilistId: 5081, title: "Monogatari Series", entries: 30, methods: ["Release Order", "Chronological", "Light Novel"], description: "The most debated watch order in anime. Bake → Nise → Neko Kuro → etc." },
  { id: "steins-gate", anilistId: 9253, title: "Steins;Gate", entries: 5, methods: ["Release Order", "Chronological"], description: "The definitive experience. Original series → Movie → Steins;Gate 0." },
  { id: "fate", anilistId: 19611, title: "Fate Series", entries: 20, methods: ["Release Order", "Story Order", "VN Route"], description: "Stay Night → Zero → Unlimited Blade Works → Heaven's Feel." },
  { id: "code-geass", anilistId: 1575, title: "Code Geass", entries: 5, methods: ["Release Order"], description: "R1 → R2 → Akito the Exiled → Re;surrection. The complete timeline." },
  { id: "rezero", anilistId: 21355, title: "Re:Zero", entries: 7, methods: ["Release Order"], description: "Season 1 (Director's Cut) → Memory Snow → Frozen Bond → Season 2 → 3." },
  { id: "dragon-ball", anilistId: 225, title: "Dragon Ball", entries: 6, methods: ["Release Order", "Chronological"], description: "Dragon Ball → DBZ → DBS → Super Hero. Includes movies and GT." },
  { id: "gundam", anilistId: 80, title: "Gundam UC", entries: 40, methods: ["UC Timeline", "Release", "Alternate Universe"], description: "0079 → Zeta → ZZ → CCA. Includes all AUs like Wing, Seed, 00." },
  { id: "toaru", anilistId: 3448, title: "Toaru (Index / Railgun)", entries: 6, methods: ["Release Order", "Chronological"], description: "Index, Railgun, Accelerator — where they intersect." },
  { id: "made-in-abyss", anilistId: 21659, title: "Made in Abyss", entries: 6, methods: ["Release Order", "Chronological"], description: "Season 1 → Dawn of the Deep Soul → Season 2. A masterpiece." },
  { id: "madoka", anilistId: 9756, title: "Madoka Magica", entries: 5, methods: ["Release Order", "Chronological"], description: "Series → Rebellion → Magia Record. The definitive watch order." },
  { id: "evangelion", anilistId: 30, title: "Neon Genesis Evangelion", entries: 5, methods: ["Release Order", "Chronological"], description: "NGE → EoE → Rebuilds. The correct way to experience this classic." },
];

const FAQ = [
  { q: "What is a watch order?", a: "A watch order tells you the correct sequence to watch anime in a franchise. Some series have multiple timelines, prequels released after sequels, or spinoffs that intersect with the main story." },
  { q: "Release Order vs Chronological Order?", a: "Release order is how the anime was originally aired. Chronological order follows the story's timeline. Each has its pros — we explain both." },
  { q: "Can I skip filler in these guides?", a: "Yes! Our filler guides complement these watch orders. Use them together to skip non-canon episodes while following the right sequence." },
  { q: "Are these guides spoiler-free?", a: "We avoid major plot spoilers. The guides focus on episode numbers, titles, and order — not story events." },
];
