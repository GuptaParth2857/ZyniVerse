import type { Metadata } from "next";
import Link from "next/link";
import { INDIAN_DUB_GUIDES } from "@/lib/indian-dub-guides";
import { getMediaBatch, type MediaBasic } from "@/lib/anilist";
import NativeBannerAd from "@/components/NativeBannerAd";
import DubExplorer, { type DubListItem } from "@/components/indian-dubs/DubExplorer";
import LiveDubFeeds from "@/components/indian-dubs/LiveDubFeeds";
import IndianDubCountdown from "@/components/indian-dubs/IndianDubCountdown";
import {
  WEEKDAYS,
  parseDubSlot,
  nextAiringAt,
  formatIST,
  firstNumber,
  todayIndexInIST,
} from "@/lib/indian-dub-schedule";
import "./indian-dubs.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Hindi, Tamil & Telugu Dubbed Anime — Indian Dub Meter (2026) | ZyniVerse",
  description:
    "India's live dub meter for One Piece, Naruto, Attack on Titan, Doraemon and more. IST drop windows, episode counts and where to watch every Hindi, Tamil & Telugu anime dub — compiled from official sources.",
  keywords: [
    "hindi dubbed anime", "tamil dubbed anime", "telugu dubbed anime", "anime in hindi",
    "anime in tamil", "anime in telugu", "indian dubbed anime list", "dubbed anime schedule india",
    "one piece hindi dub", "naruto hindi dub", "attack on titan hindi dub",
    "anime hindi me kaise dekhe", "hindi dub anime", "anime hindi mein", "anime hindi me episode", "hindi anime list",
    "doraemon hindi", "shin chan hindi", "pokemon in hindi", "solo leveling hindi dub",
  ],
  openGraph: {
    title: "Hindi, Tamil & Telugu Dubbed Anime — Indian Dub Meter | ZyniVerse",
    description: "India's live dub meter: IST schedules, weekly countdowns and where to watch every Indian anime dub.",
    url: `${BASE_URL}/indian-dubs`,
    type: "website",
    siteName: "ZyniVerse",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Indian Dub Meter — Hindi, Tamil & Telugu | ZyniVerse",
    description: "Every Hindi, Tamil & Telugu anime dub, one live meter. Countdowns, schedules, guides.",
  },
  alternates: { canonical: `${BASE_URL}/indian-dubs` },
  robots: { index: true, follow: true },
};

async function loadPosterMap(guides: (typeof INDIAN_DUB_GUIDES)[number][]): Promise<Map<number, MediaBasic>> {
  const ids = guides.map((g) => g.anilistId).filter((v): v is number => typeof v === "number");
  const map = new Map<number, MediaBasic>();
  if (ids.length === 0) return map;
  try {
    const batch = await getMediaBatch(ids);
    for (const m of batch) map.set(m.id, m);
  } catch {
    // Poster art is decorative — the hub still works without it.
  }
  return map;
}

function toItems(guides: (typeof INDIAN_DUB_GUIDES)[number][], posterMap: Map<number, MediaBasic>): DubListItem[] {
  return guides.map((g) => {
    const media = g.anilistId != null ? posterMap.get(g.anilistId) : undefined;
    return {
      slug: g.slug,
      name: g.name,
      tagline: g.tagline,
      genres: g.genres,
      platforms: g.platforms,
      languages: g.languages,
      status: g.status,
      episodeCount: g.episodeCount,
      schedule: g.schedule,
      poster: media?.coverImage?.large || media?.coverImage?.extraLarge || null,
      color: media?.coverImage?.color || null,
      score: media?.averageScore ?? null,
    };
  });
}

function formatClock(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ap = hour < 12 ? "AM" : "PM";
  return `${h12}:${String(minute).padStart(2, "0")} ${ap}`;
}

export default async function IndianDubsPage() {
  const posterMap = await loadPosterMap(INDIAN_DUB_GUIDES);
  const items = toItems(INDIAN_DUB_GUIDES, posterMap);

  const byStatus = {
    Airing: items.filter((i) => i.status === "Airing"),
    Completed: items.filter((i) => i.status === "Completed"),
    Upcoming: items.filter((i) => i.status === "Upcoming"),
  };

  const totalEpisodes = INDIAN_DUB_GUIDES.reduce((sum, g) => sum + firstNumber(g.episodeCount), 0);
  const langSet = new Set<string>();
  INDIAN_DUB_GUIDES.forEach((g) => g.languages.forEach((l) => langSet.add(l)));
  const langCount = langSet.size;
  const hindiCount = INDIAN_DUB_GUIDES.filter((g) => g.languages.includes("Hindi")).length;
  const tamilCount = INDIAN_DUB_GUIDES.filter((g) => g.languages.includes("Tamil")).length;
  const teluguCount = INDIAN_DUB_GUIDES.filter((g) => g.languages.includes("Telugu")).length;

  const drops = byStatus.Airing
    .map((item) => ({ item, target: nextAiringAt(item.schedule) }))
    .filter((d): d is { item: DubListItem; target: number } => d.target != null)
    .sort((a, b) => a.target - b.target);

  const nextDrop = drops[0] ?? null;
  const nextThree = drops.slice(0, 3);

  const todayIdx = todayIndexInIST();

  const stats = [
    { label: "Dubs Tracked", value: items.length, accent: "text-[var(--color-cyan)]", sub: "official Indian dubs" },
    { label: "Episodes", value: `${Math.floor(totalEpisodes / 1000)}k+`, accent: "text-[var(--color-magenta)]", sub: "dubbed & counted" },
    { label: "Languages", value: langCount, accent: "text-[var(--color-violet)]", sub: "Hindi · Tamil · Telugu" },
    { label: "On Air Now", value: byStatus.Airing.length, accent: "text-amber-300", sub: "airing or rolling out" },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Indian Anime Dub Guides — Hindi, Tamil & Telugu",
      description: "Every Indian anime dub tracked from official sources: drop windows, episodes and where to watch in IST.",
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE_URL}/indian-dubs/${it.slug}`,
        name: `${it.name} (${it.languages.join(" / ")} dub)`,
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-mute)]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
        <span className="text-white/20">/</span>
        <span className="text-[var(--color-cyan)]">Indian Dubs</span>
      </nav>

      {/* ─────────── Hero ─────────── */}
      <section className="dub-hero rounded-3xl border border-white/10">
        <div className="dub-hero-bg" />
        <div className="dub-hero-glow" />
        <div className="tricolor-beam relative z-10" />

        <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="dub-wordmark">ZyniVerse · Dub Meter</span>
              <span className="glass-badge flex items-center gap-1.5 text-[var(--color-cyan)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-cyan)]" />
                Live · IST
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="gradient-text">Hindi, Tamil & Telugu</span>
              <br />
              Dubbed Anime. One Meter.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-mute)] sm:text-base">
              Every official Indian anime dub — One Piece, Naruto, Doraemon, Solo Leveling — compiled into one
              broadcast-style board: IST drop windows, episode counts, languages and where to watch. Data is drawn
              from official platforms and announcements; where a slot isn&apos;t confirmed, we say so instead of guessing.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#explore"
                className="btn-magnetic inline-flex items-center gap-2 rounded-xl bg-[var(--color-cyan)] px-5 py-3 text-sm font-bold text-black">
                Explore All Dubs
              </Link>
              <Link href="/dubbed"
                className="neon-rgb-border inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:text-[var(--color-cyan)]">
                Live Dub Tracker →
              </Link>
              <Link href="/voice-actors/indian"
                className="neon-rgb-border inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:text-[var(--color-cyan)]">
                Indian Voice Actors
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { l: "Hindi", c: hindiCount, cls: "text-[#ffb366] border-[#ff9933]/40 bg-[#ff9933]/10" },
                { l: "Tamil", c: tamilCount, cls: "text-[#8ec5ff] border-[#4fa3ff]/40 bg-[#4fa3ff]/10" },
                { l: "Telugu", c: teluguCount, cls: "text-[#6ee0a4] border-[#2fbf71]/40 bg-[#2fbf71]/10" },
              ].map((chip) => (
                <span key={chip.l} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${chip.cls}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {chip.l} · {chip.c} shows
                </span>
              ))}
            </div>
          </div>

          {/* Next drop card */}
          <div className="neon-premium rounded-2xl">
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" />
            <div className="neon-premium-content rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="console-label">Next Drop Window</p>
                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-magenta)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-magenta)]" />
                  On Air Track
                </span>
              </div>

              {nextDrop ? (
                <>
                  <div className="mt-4 flex items-center gap-4">
                    {nextDrop.item.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={nextDrop.item.poster}
                        alt={`${nextDrop.item.name} poster`}
                        className="h-24 w-16 shrink-0 rounded-lg border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
                        <span className="font-display text-2xl font-black text-white/60">{nextDrop.item.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link href={`/indian-dubs/${nextDrop.item.slug}`} className="font-display text-2xl font-black leading-tight text-white transition-colors hover:text-[var(--color-cyan)]">
                        {nextDrop.item.name}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-[var(--color-cyan)]">{formatIST(nextDrop.target)}</p>
                      <p className="mt-1 text-[11px] text-[var(--color-mute)]">
                        {nextDrop.item.languages.join(" · ")} dub on {nextDrop.item.platforms.join(" / ")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <IndianDubCountdown target={nextDrop.target} size="lg" />
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm leading-relaxed text-[var(--color-mute)]">
                    No official drop date is confirmed right now. Indian dubs now land in seasonal batches — these are
                    the live rollout windows we&apos;re tracking:
                  </p>
                  <ul className="space-y-2">
                    {byStatus.Airing.slice(0, 4).map((d) => (
                      <li key={d.slug}>
                        <Link href={`/indian-dubs/${d.slug}`} className="group flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-white group-hover:text-[var(--color-cyan)]">{d.name}</span>
                          <span className="line-clamp-1 text-right text-[var(--color-mute)]">{d.schedule}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-[var(--color-mute)]/70">
                    A live countdown starts the moment a window is officially announced — we never project a date.
                  </p>
                </div>
              )}

              {nextThree.length > 1 && (
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                  {nextThree.slice(1).map((d) => (
                    <Link key={d.item.slug} href={`/indian-dubs/${d.item.slug}`}
                      className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-[var(--color-mute)] hover:text-[var(--color-cyan)]">{d.item.name}</span>
                      <span className="font-mono text-[var(--color-cyan)]/80">{formatIST(d.target)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Stats Strip ─────────── */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Dub hub stats">
        {stats.map((s) => (
          <div key={s.label} className="dub-stat-card">
            <div className="rounded-xl p-4 sm:p-5">
              <p className="console-label">{s.label}</p>
              <p className={`mt-1 font-display text-3xl font-black sm:text-4xl ${s.accent}`}>{s.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">{s.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ─────────── Dub Radar Ticker ─────────── */}
      {byStatus.Airing.length > 0 && (
        <section className="on-air-ticker relative mt-6" aria-label="Weekly Indian dub radar">
          <div className="relative flex items-stretch rounded-xl bg-[var(--color-panel)]/80">
            <div className="on-air-badge hidden select-none items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[var(--color-magenta)] pulse-dot" />
              <span>DUB RADAR</span>
            </div>
            <div className="ticker-window relative flex-1 overflow-hidden py-2.5">
              <div className="ticker-track flex w-max whitespace-nowrap">
                {[...byStatus.Airing, ...byStatus.Airing].map((item, idx) => (
                  <Link
                    key={`${item.slug}-${idx}`}
                    href={`/indian-dubs/${item.slug}`}
                    aria-hidden={idx >= byStatus.Airing.length || undefined}
                    tabIndex={idx >= byStatus.Airing.length ? -1 : undefined}
                    className="dub-on-air-item mx-5 inline-flex items-center gap-2 text-sm"
                  >
                    <span className="on-air-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-magenta)] pulse-dot" />
                    <span className="neon-tick-title font-display font-semibold text-[var(--color-ink)]">{item.name}</span>
                    <span className="neon-tick-ep font-mono text-xs tracking-wider text-[var(--color-cyan)]">
                      {item.episodeCount}
                    </span>
                    <span className="text-[var(--color-mute)]/70">·</span>
                    <span className="text-xs text-[var(--color-mute)]">{item.schedule}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Weekly Broadcast Board ─────────── */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="console-label">IST Drop Board</p>
            <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">Confirmed Drop Windows</h2>
          </div>
          <p className="max-w-md text-xs text-[var(--color-mute)]">
            Indian streaming dubs now roll out in seasonal batches rather than fixed weekly slots — this board shows
            the confirmed recurring windows, not guesses.
          </p>
        </div>

        <div className="dub-week mt-4">
          {WEEKDAYS.map((day, idx) => {
            const shows = byStatus.Airing.filter((it) => {
              const slot = parseDubSlot(it.schedule);
              return slot && slot.day === day;
            });
            const isToday = idx === todayIdx;
            return (
              <div key={day} className={`dub-week-col ${isToday ? "is-today" : ""}`}>
                <div className="dub-week-header">
                  {isToday && <span className="dub-week-dot" />}
                  {day.slice(0, 3)}
                  {isToday && <span className="ml-auto font-bold normal-case text-[var(--color-magenta)]">Today</span>}
                </div>
                {shows.length === 0 ? (
                  <p className="text-[11px] text-[var(--color-mute)]/50">No confirmed window</p>
                ) : (
                  <ul className="space-y-2">
                    {shows.map((it) => {
                      const slot = parseDubSlot(it.schedule);
                      return (
                        <li key={it.slug}>
                          <Link href={`/indian-dubs/${it.slug}`} className="group block rounded-lg border border-white/5 bg-white/[0.03] p-2 transition-colors hover:border-[var(--color-cyan)]/40 hover:bg-white/[0.06]">
                            <p className="truncate text-xs font-semibold text-white group-hover:text-[var(--color-cyan)]">{it.name}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-[var(--color-magenta)]">
                              {slot ? formatClock(slot.hour, slot.minute) : "—"} · {it.platforms.join("/")}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {(() => {
          const rolling = byStatus.Airing.filter((it) => !parseDubSlot(it.schedule));
          if (rolling.length === 0) return null;
          return (
            <p className="mt-4 text-xs leading-relaxed text-[var(--color-mute)]">
              <span className="font-semibold text-white">Also airing / rolling out in batches: </span>
              {rolling.map((it, i) => (
                <span key={it.slug}>
                  {i > 0 && <span className="text-white/30"> · </span>}
                  <Link href={`/indian-dubs/${it.slug}`} className="hover:text-[var(--color-cyan)]">{it.name}</Link>
                </span>
              ))}
              <span className="text-white/30"> — these drop to on-demand in batches, not fixed weekly slots.</span>
            </p>
          );
        })()}
      </section>

      {/* ─────────── Dub Explorer ─────────── */}
      <div className="mt-12">
        <DubExplorer items={items} />
      </div>

      {/* ─────────── Live Auto-fetched Feed ─────────── */}
      <LiveDubFeeds />

      {/* ─────────── Why ZyniVerse ─────────── */}
      <section className="mt-14 grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-xl p-5">
          <p className="font-display text-lg font-bold text-white">Honest sourcing</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-mute)]">
            Indian dub schedules shift constantly — channels re-block, streaming refreshes land late, some dubs pause.
            Every entry here is compiled from official platforms and announcements, and where a slot isn&apos;t confirmed
            we say so instead of inventing one.
          </p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="font-display text-lg font-bold text-white">Clocks in IST</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-mute)]">
            No timezone math anywhere. Every window, board and countdown is set to Indian Standard Time — from the
            Egghead arc&apos;s Monday 1:30 AM One Piece batches to Muse India&apos;s 8:15 PM daily Attack on Titan drops.
            When an official date is announced, we start the countdown.
          </p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="font-display text-lg font-bold text-white">Deep guides, not just lists</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-mute)]">
            Each dub links to a full guide: dubbing studio, dub history, where to watch, and a FAQ. The beginner-friendly
            way to jump between Hindi, Tamil and Telugu tracks without guessing.
          </p>
        </div>
      </section>

      {/* ─────────── CTA Band ─────────── */}
      <section className="neon-banner-card mt-14 rounded-2xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl p-6 sm:p-8">
          <div>
            <p className="console-label">Backed by India&apos;s anime platform</p>
            <h2 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">
              Follow the whole dub schedule, <span className="gradient-text">not just the guides.</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-mute)]">
              The live interactive dub hub refreshes in real time across Hindi, Tamil and Telugu — including the
              shows we cannot squeeze into a static page.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dubbed" className="btn-magnetic rounded-xl bg-[var(--color-cyan)] px-6 py-3 text-sm font-bold text-black">
              Open Live Dub Tracker
            </Link>
            <Link href="/dub-schedule" className="neon-rgb-border rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors hover:text-[var(--color-cyan)]">
              Week Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── Editorial + FAQ ─────────── */}
      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="console-label">Why this exists</p>
          <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">
            Why ZyniVerse tracks Indian dubs
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">
            Release dates for Hindi, Tamil and Telugu dubs are scattered across channel announcement blocks, streaming
            refreshes and the grapevine — and they change constantly. ZyniVerse keeps a single, sourced record of which
            anime is dubbed in which language, how many episodes exist, which platform carries it, and when the next
            drop window lands in IST.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">
            The Dub Meter merges that record into one broadcast-style board: the shows that air this week, a live
            countdown to every drop, and deep guides that answer the questions Indian fans actually ask — where to
            watch, who dubbed it, and whether a Tamil or Telugu track exists yet.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-black text-white sm:text-3xl">Your dub questions, answered</h2>
          <div className="mt-4 space-y-3">
            {[
              { q: "Which anime has a Hindi dub on Crunchyroll?", a: "One Piece, Naruto: Shippuden, Solo Leveling, Jujutsu Kaisen, Frieren and Fullmetal Alchemist: Brotherhood — plus more of an everyday rotation. Death Note's Hindi dub streams on Anime Times, Dragon Ball Super aired on Cartoon Network, and Detective Conan lives on ETV Bal Bharat TV." },
              { q: "Do Hindi-dubbed anime also get Tamil or Telugu?", a: "Some do. One Piece, Naruto: Shippuden, Attack on Titan, Frieren, Fullmetal Alchemist: Brotherhood, Solo Leveling and Dragon Ball Super all have Tamil and Telugu tracks. Filter the directory by Tamil or Telugu to see them all." },
              { q: "Are the schedules in Indian time?", a: "Yes — every slot, countdown and clock on this page is in Indian Standard Time (IST). Where a fixed weekly window isn't confirmed, the card says so openly rather than guessing." },
            ].map((f, i) => (
              <details key={f.q} className="glass-card group rounded-xl p-4" open={i === 0}>
                <summary className="cursor-pointer list-none font-semibold text-white">
                  <span className="mr-2 inline-block text-[var(--color-cyan)] transition-transform group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <p className="mt-3 pl-5 text-sm leading-relaxed text-[var(--color-mute)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12">
        <NativeBannerAd />
      </div>
    </div>
  );
}