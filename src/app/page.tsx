import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getHomepageData, getAiringSchedule,
} from "@/lib/anilist";

export const metadata: Metadata = {
  title: "ZyniVerse | India's #1 Anime Platform - Filler Guides, Indian Dubs & Community",
  description:
    "ZyniVerse: Free anime platform with filler guides for 200+ anime, Indian dub tracking (Hindi, Tamil, Telugu), AI recommendations, manga reader, cosplay gallery, and community. Join millions of Indian anime fans.",
  keywords: [
    "anime",
    "filler guides",
    "indian dubs",
    "anime community",
    "anime website",
    "zyverse",
    "anime tracker",
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in",
  },
  openGraph: {
    title: "ZyniVerse | India's #1 Anime Platform",
    description:
      "Free anime platform with filler guides, Indian dub tracking, AI recommendations, and community.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZyniVerse | India's #1 Anime Platform",
    description:
      "Free anime platform with filler guides, Indian dub tracking, AI recommendations, and community.",
  },
};

export const revalidate = 3600;
import { FadeIn, PageTransition } from "@/components/PageTransition";
import {
  DynamicSection as Section,
  DynamicMediaCarousel as MediaCarousel,
  DynamicOnAirTicker as OnAirTicker,
  DynamicExpandingFlexCard as ExpandingFlexCard,
  DynamicContinueWatching as ContinueWatching,
  DynamicRecommendations as Recommendations,
  DynamicFriendActivityFeed as FriendActivityFeed,
  DynamicMonthlyCalendar as MonthlyCalendar,
  DynamicGamificationWidget as GamificationWidget,
  DynamicHero3D as Hero3D,
  DynamicHorizontalScroll as HorizontalScroll,
} from "@/components/lazy";
import PersonalizedHero from "@/components/PersonalizedHero";
import AdBanner from "@/components/AdBanner";
import NativeBannerAd from "@/components/NativeBannerAd";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import HomeMomentButton from "@/components/HomeMomentButton";
import AnimeOfTheDay from "@/components/AnimeOfTheDay";
import FeaturedFeedbackCarousel from "@/components/FeaturedFeedbackCarousel";
import WhyZyniVerse from "@/components/WhyZyniVerse";
import NeonBanner from "@/components/NeonBanner";
import BrandPartners from "@/components/BrandPartners";
import PoweredBy from "@/components/PoweredBy";
import { prisma } from "@/lib/prisma";
import { posterCategoryOf } from "@/lib/post-types";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 ${className}`}>
      {children}
    </section>
  );
}

type FeaturedTournament = {
  id: string;
  title: string;
  description: string | null;
  size: number;
  mode: string;
  status: string;
  currentRound: number;
  qualifyingEndsAt: Date | null;
  roundEndsAt: Date | null;
  creator: { username: string };
  _count: { participants: number };
} | null;

async function loadAiringSchedule(): Promise<Awaited<ReturnType<typeof getAiringSchedule>>> {
  const now = Math.floor(Date.now() / 1000);
  return getAiringSchedule(now - 3600 * 6, now + 3600 * 18);
}

function featuredEndsInOf(featuredTournament: FeaturedTournament): string | null {
  if (!featuredTournament) return null;
  const d =
    featuredTournament.mode === "qualifying" ? featuredTournament.qualifyingEndsAt : featuredTournament.roundEndsAt;
  if (!d) return null;
  const days = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
  if (featuredTournament.mode === "qualifying") {
    return days === 0 ? "Voting closes today" : `Voting ends in ${days} day${days === 1 ? "" : "s"}`;
  }
  return days === 0
    ? "This round closes today"
    : `Round ${featuredTournament.currentRound} ends in ${days} day${days === 1 ? "" : "s"}`;
}

export default async function Home() {
  const [homepage, tickerRes, userCountRes, latestPostersRes, featuredTournamentRes] = await Promise.allSettled([
    getHomepageData(),
    loadAiringSchedule(),
    prisma.user.count(),
    prisma.post.findMany({
      where: { image: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, image: true, type: true },
    }),
    prisma.characterTournament.findFirst({
      where: { status: { in: ["qualifying", "active"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        size: true,
        mode: true,
        status: true,
        currentRound: true,
        qualifyingEndsAt: true,
        roundEndsAt: true,
        creator: { select: { username: true } },
        _count: { select: { participants: true } },
      },
    }),
  ] as const);

  // The homepage is statically prerendered, so whatever AniList returns during
  // `next build` is what gets baked into the HTML and served from the CDN.
  // When the four rails all come back empty the old code stored `[]` silently,
  // shipping a blank hero to every visitor with no error anywhere. Surface it
  // instead of letting it ship.
  const homepageData =
    homepage.status === "fulfilled"
      ? homepage.value
      : { trending: [], popular: [], upcoming: [], topRated: [] };

  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const hasAnyAnime =
    homepageData.trending.length > 0 ||
    homepageData.popular.length > 0 ||
    homepageData.upcoming.length > 0 ||
    homepageData.topRated.length > 0;

  if (isBuild && !hasAnyAnime) {
    throw new Error(
      "Homepage prerender produced no AniList data. AniList rate-limits at 30 req/min " +
        "per IP and a build prerenders hundreds of pages from one IP, so the live fetch " +
        "is rate-limited and the shared Prisma cache had nothing to fall back on. " +
        "Bailing out instead of shipping an empty homepage to the CDN.",
    );
  }

  const trendingData = homepageData.trending;
  const popularData = homepageData.popular;
  const upcomingData = homepageData.upcoming;
  const topRatedData = homepageData.topRated;

  const ticker: Awaited<ReturnType<typeof getAiringSchedule>> = tickerRes.status === "fulfilled" ? tickerRes.value : [];
  const userCount = userCountRes.status === "fulfilled" ? userCountRes.value : 0;
  const latestPosters: { id: string; title: string; image: string | null; type: string }[] = latestPostersRes.status === "fulfilled" ? latestPostersRes.value : [];
  const featuredTournament: {
    id: string;
    title: string;
    description: string | null;
    size: number;
    mode: string;
    status: string;
    currentRound: number;
    qualifyingEndsAt: Date | null;
    roundEndsAt: Date | null;
    creator: { username: string };
    _count: { participants: number };
  } | null = featuredTournamentRes.status === "fulfilled" ? featuredTournamentRes.value : null;

  const featuredEndsIn = featuredEndsInOf(featuredTournament);

  const featuredHref = featuredTournament
    ? `/character-tournaments/${featuredTournament.id}`
    : "/character-tournaments";
  const featuredChip = featuredTournament
    ? featuredTournament.mode === "qualifying"
      ? "⚡ Qualifying — Vote Now"
      : "🔥 Live Bracket"
    : "🚀 Starting Soon";

  const heroStats = {
    users: userCount,
    fillerGuides: 200,
    watchOrders: 40,
    indianDubs: 1000,
  };

  return (
    <PageTransition>
      <div className="animate-page-in zy-home">
      <FadeIn>
            <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
              <Link
                href={featuredHref}
                className="group relative block overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_10px_50px_-15px_rgba(217,70,239,0.4)] transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_12px_60px_-12px_var(--color-cyan)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(80% 160% at 8% 15%, var(--color-violet), transparent 60%), radial-gradient(80% 160% at 92% 15%, var(--color-cyan), transparent 55%), linear-gradient(125deg, #160a24 0%, #0b0614 70%)",
                  }}
                />
                <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider sm:justify-start">
                      <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-cyan-300">
                        {featuredChip}
                      </span>
                      {featuredTournament && (
                        <>
                          <span className="rounded-full border border-[var(--color-line)] bg-black/40 px-2.5 py-0.5 text-[var(--color-mute)]">
                            {featuredTournament.size} candidates
                          </span>
                          <span className="text-[var(--color-mute)]">
                            by @{featuredTournament.creator.username}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-4xl">
                      {featuredTournament
                        ? featuredTournament.title
                        : "The Dream 16 — Biggest Anime Character Tournament"}
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl line-clamp-2 text-sm text-white/70 sm:mx-0">
                      {featuredTournament
                        ? featuredTournament.description ||
                          "Anime characters going head-to-head — your vote decides."
                        : "64 anime characters, one favorite vote each. The Dream 16 advance to a 1v1 bracket — your vote picks the legends."}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-white/60 sm:justify-start">
                      {featuredTournament ? (
                        <>
                          {featuredEndsIn && <span>⏳ {featuredEndsIn}</span>}
                          <span>{featuredTournament._count.participants} fighters</span>
                        </>
                      ) : (
                        <span>Voting opens soon</span>
                      )}
                      <span className="rounded-md bg-white/10 px-3 py-1.5 font-bold text-white transition-colors group-hover:bg-white/20">
                        {featuredTournament ? "Vote your fav →" : "Be first in line →"}
                      </span>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <div className="h-40 w-32 rotate-2 overflow-hidden rounded-t-2xl rounded-b-lg border-2 border-[var(--color-cyan)]/60 shadow-[0_0_35px_-5px_var(--color-cyan)] transition duration-300 group-hover:rotate-0 group-hover:scale-105 sm:h-48 sm:w-40">
                      <Image
                        src="/dream16.jpg"
                        alt="Dream 16 poster"
                        width={320}
                        height={384}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-2 -left-3 -rotate-3 rounded-md bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                      Dream 16
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </FadeIn>
          <div className="relative">
            <Hero3D items={trendingData} stats={heroStats} />
            <PersonalizedHero className="absolute inset-0 z-20" fallbackItems={[]} />
          </div>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <AnimeOfTheDay />
      </div>
      {latestPosters.length > 0 && (
        <FadeIn delay={0.01}>
          <AnimatedSection className="!py-10">
            <div className="mb-5 flex items-end justify-between">
              <div className="rounded-xl px-4 py-2">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Main Attraction</p>
                <h2 className="font-display text-3xl font-bold sm:text-4xl">Latest Posters</h2>
              </div>
              <Link href="/posts" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {latestPosters.map((p) => {
                const cat = posterCategoryOf(p.type);
                return (
                  <Link
                    key={p.id}
                    href={`/posts/${p.id}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]"
                  >
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[var(--color-violet)]/70 to-[var(--color-magenta)]/70" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                      {cat.emoji} {cat.label}
                    </span>
                    <p className="absolute inset-x-2.5 bottom-2 line-clamp-2 text-sm font-bold text-white drop-shadow">
                      {p.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </AnimatedSection>
        </FadeIn>
      )}
      <FadeIn delay={0.02}>
        <NeonBanner />
      </FadeIn>
      <FadeIn delay={0.03}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <GamificationWidget />
        </div>
      </FadeIn>
      <HorizontalScroll items={trendingData.slice(0, 20)} />
      <FadeIn delay={0.05}>
        <WhyZyniVerse />
      </FadeIn>
      <FadeIn delay={0.06}>
        <BrandPartners />
      </FadeIn>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <AdBanner placement="homepage" type="banner" />
      </div>
      <OnAirTicker items={ticker.slice(0, 20)} />

      <QuoteOfTheDay />

      <ContinueWatching />
      <Recommendations type="personalized" title="Handpicked for You" />

      {/* Friend Activity Feed */}
      <FadeIn delay={0.05}>
        <AnimatedSection className="!py-6">
          <FriendActivityFeed />
        </AnimatedSection>
      </FadeIn>

      <FadeIn>
        <AnimatedSection>
          <div className="mb-6 flex items-end justify-between">
            <div className="rounded-xl px-4 py-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Right now</p>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Trending Anime</h2>
            </div>
            <Link href="/search?sort=TRENDING_DESC" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
              View all →
            </Link>
          </div>
          <ExpandingFlexCard items={trendingData} />
        </AnimatedSection>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AnimatedSection>
          <MediaCarousel eyebrow="All-time" title="Most Popular" viewAllTo="/search?sort=POPULARITY_DESC" items={popularData} rows={3} />
        </AnimatedSection>
      </FadeIn>

      {/* Native banner between Popular and Upcoming sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <NativeBannerAd />
      </div>

      <FadeIn delay={0.2}>
        <AnimatedSection>
          <Section eyebrow="Coming soon" title="Upcoming Releases" viewAllTo="/search?status=NOT_YET_RELEASED" items={upcomingData} />
        </AnimatedSection>
      </FadeIn>

      <FadeIn delay={0.3}>
        <AnimatedSection>
          <Section eyebrow="Critics' pick" title="Top Rated" viewAllTo="/top-anime" items={topRatedData} />
        </AnimatedSection>
      </FadeIn>

      {/* Pillar 4: Indian Content Hub */}
      <FadeIn delay={0.35}>
        <AnimatedSection className="!py-8">
          <div className="mb-6 flex items-end justify-between">
            <div className="rounded-xl px-4 py-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">🇮🇳 Indian Hub</p>
              <h2 className="font-display text-2xl font-bold">Hindi, Tamil &amp; Telugu Dubs</h2>
            </div>
            <Link href="/indian-dubs" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/indian-dubs", emoji: "🇮🇳", title: "Hindi Dubs", desc: "25+ anime dubbed in Hindi", color: "#ff9933" },
              { href: "/indian-dubs", emoji: "🏛️", title: "Tamil Dubs", desc: "15+ anime dubbed in Tamil", color: "#e84a5f" },
              { href: "/indian-dubs", emoji: "🌊", title: "Telugu Dubs", desc: "10+ anime dubbed in Telugu", color: "#6c63ff" },
              { href: "/voice-actors/indian", emoji: "🎙️", title: "Indian VAs", desc: "Meet the voice artists", color: "#29f2e0" },
            ].map((card) => (
              <Link key={card.title} href={card.href} className="overflow-hidden rounded-xl neon-feature-card group">
                <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${card.color}, transparent 40%, ${card.color}80, transparent 70%, ${card.color})` }} />
                <div className="neon-glow rounded-xl" style={{ background: card.color }} />
                <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
                  <div className="h-[2px] w-full" style={{ background: card.color }} />
                  <div className="p-5 relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}08, transparent 70%)` }} />
                    <span className="text-3xl relative z-10 block mb-3">{card.emoji}</span>
                    <p className="font-display text-lg font-bold relative z-10">{card.title}</p>
                    <p className="text-xs text-[var(--color-mute)] mt-1 relative z-10">{card.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </FadeIn>

      {/* Pillar 5: Community Engagement */}
      <FadeIn delay={0.4}>
        <AnimatedSection className="!py-8">
          <div className="mb-6 flex items-end justify-between">
            <div className="rounded-xl px-4 py-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
              <h2 className="font-display text-2xl font-bold">Challenges, Forums &amp; More</h2>
            </div>
            <Link href="/community" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
              Explore →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { href: "/challenges", emoji: "🏆", title: "Challenges", desc: "Seasonal & yearly", color: "#ff2d78" },
              { href: "/forum", emoji: "💬", title: "Forums", desc: "Discuss anime", color: "#29f2e0" },
              { href: "/quiz", emoji: "🧠", title: "Quiz", desc: "100+ questions", color: "#8a5cff" },
              { href: "/characters/battle", emoji: "⚔️", title: "Character Battle", desc: "Daily matchup", color: "#ff6b35" },
              { href: "/critiques", emoji: "📝", title: "Critiques", desc: "Deep reviews", color: "#f59e0b" },
            ].map((card) => (
              <Link key={card.title} href={card.href} className="overflow-hidden rounded-xl neon-feature-card group text-center">
                <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${card.color}, transparent 40%, ${card.color}80, transparent 70%, ${card.color})` }} />
                <div className="neon-glow rounded-xl" style={{ background: card.color }} />
                <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
                  <div className="h-[2px] w-full" style={{ background: card.color }} />
                  <div className="p-4 relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}08, transparent 70%)` }} />
                    <span className="text-2xl relative z-10 block mb-2">{card.emoji}</span>
                    <p className="text-sm font-bold relative z-10">{card.title}</p>
                    <p className="text-[10px] text-[var(--color-mute)] mt-0.5 relative z-10">{card.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/blog", emoji: "✍️", label: "Blogs" },
              { href: "/clubs", emoji: "👥", label: "Clubs" },
              { href: "/conventions", emoji: "📅", label: "Conventions" },
              { href: "/cosplay", emoji: "📸", label: "Cosplay" },
              { href: "/fanart", emoji: "🎨", label: "Fan Art" },
              { href: "/watch-party", emoji: "🎬", label: "Watch Parties" },
              { href: "/messages", emoji: "💬", label: "Chat" },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors flex items-center gap-1.5"
              >
                <span>{link.emoji}</span>{link.label}
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </FadeIn>

      {/* Featured Feedback */}
      <FadeIn delay={0.42}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FeaturedFeedbackCarousel />
        </div>
      </FadeIn>

      {/* Monthly Calendar */}
      <FadeIn delay={0.45}>
        <AnimatedSection className="!py-6">
          <MonthlyCalendar />
        </AnimatedSection>
      </FadeIn>

      {/* Powered By */}
      <FadeIn delay={0.46}>
        <PoweredBy />
      </FadeIn>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 sm:p-12 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold">Discover more on ZyniVerse</p>
            <p className="mt-2 text-[var(--color-mute)] max-w-lg mx-auto">
              Browse manga, explore character details, check weekly schedules, and build your personal watchlist.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/manga-million" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">📰 Manga Million News →</Link>
              <Link href="/filler" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold transition-colors">Skip Filler →</Link>
              <Link href="/tools" className="rounded-full bg-[var(--color-cyan)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">Anime Tools →</Link>
              <Link href="/manga" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold transition-colors">Browse Manga</Link>
              <Link href="/schedule" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold transition-colors">View Schedule</Link>
              <Link href="/top-anime" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold transition-colors">Top Anime</Link>
              <Link href="/watchlist" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold transition-colors">My Watchlist</Link>
              <HomeMomentButton />
              <Link href="/stats/wrapped" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">🎌 My Year in Anime →</Link>
            </div>
          </div>
        </FadeIn>
      </div>
      </div>
    </PageTransition>
  );
}


