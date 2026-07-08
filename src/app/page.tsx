import Link from "next/link";
import {
  getTrending, getPopular, getUpcoming, getTopRated, getAiringSchedule, bestTitle,
} from "@/lib/anilist";
import Section from "@/components/Section";
import MediaCarousel from "@/components/MediaCarousel";
import OnAirTicker from "@/components/OnAirTicker";
import { FadeIn, PageTransition } from "@/components/PageTransition";
import { DynamicHero3D as Hero3D, DynamicHorizontalScroll as HorizontalScroll } from "@/components/lazy";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";
import ContinueWatching from "@/components/ContinueWatching";
import Recommendations from "@/components/Recommendations";
import AdBanner from "@/components/AdBanner";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import FriendActivityFeed from "@/components/features/FriendActivityFeed";
import MonthlyCalendar from "@/components/features/MonthlyCalendar";
import type { Media } from "@/lib/anilist";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 ${className}`}>
      {children}
    </section>
  );
}

export const revalidate = 300;

export default async function Home() {
  const [trending, popular, upcoming, topRated] = await Promise.allSettled([
    getTrending(24), getPopular(18), getUpcoming(12), getTopRated(12),
  ]);

  const now = Math.floor(Date.now() / 1000);
  let ticker: Awaited<ReturnType<typeof getAiringSchedule>> = [];
  try { ticker = await getAiringSchedule(now - 3600 * 6, now + 3600 * 18); } catch {}

  const getData = (r: PromiseSettledResult<Media[]>) => r.status === "fulfilled" ? r.value : [];
  const trendingData = getData(trending);
  const popularData = getData(popular);
  const upcomingData = getData(upcoming);
  const topRatedData = getData(topRated);

  return (
    <PageTransition>
      <Hero3D items={trendingData} />
      <HorizontalScroll items={trendingData.slice(0, 20)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <AdBanner placement="homepage" type="banner" />
      </div>
      <OnAirTicker items={ticker.slice(0, 20)} />

      <QuoteOfTheDay />

      <ContinueWatching />
      <Recommendations />

      {/* Friend Activity Feed */}
      <FadeIn delay={0.05}>
        <AnimatedSection className="!py-6">
          <FriendActivityFeed />
        </AnimatedSection>
      </FadeIn>

      <FadeIn>
        <AnimatedSection>
          <div className="mb-6 flex items-end justify-between">
            <div>
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

      <FadeIn delay={0.2}>
        <AnimatedSection>
          <Section eyebrow="Coming soon" title="Upcoming Releases" viewAllTo="/search?status=NOT_YET_RELEASED" items={upcomingData} />
        </AnimatedSection>
      </FadeIn>

      <FadeIn delay={0.3}>
        <AnimatedSection>
          <Section eyebrow="Critics' pick" title="Top Rated" viewAllTo="/search?sort=SCORE_DESC" items={topRatedData} />
        </AnimatedSection>
      </FadeIn>

      {/* Pillar 4: Indian Content Hub */}
      <FadeIn delay={0.35}>
        <AnimatedSection className="!py-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">🇮🇳 Indian Hub</p>
              <h2 className="font-display text-2xl font-bold">Hindi, Tamil &amp; Telugu Dubs</h2>
            </div>
            <Link href="/indian-dubs" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/indian-dubs" className="rounded-xl border border-[var(--color-line)] bg-gradient-to-br from-[#ff9933]/10 to-transparent p-5 hover:border-[#ff9933]/40 transition-all">
              <span className="text-2xl">🇮🇳</span>
              <p className="font-display text-lg font-bold mt-2">Hindi Dubs</p>
              <p className="text-xs text-[var(--color-mute)] mt-1">25+ anime dubbed in Hindi</p>
            </Link>
            <Link href="/indian-dubs" className="rounded-xl border border-[var(--color-line)] bg-gradient-to-br from-[#e84a5f]/10 to-transparent p-5 hover:border-[#e84a5f]/40 transition-all">
              <span className="text-2xl">🏛️</span>
              <p className="font-display text-lg font-bold mt-2">Tamil Dubs</p>
              <p className="text-xs text-[var(--color-mute)] mt-1">15+ anime dubbed in Tamil</p>
            </Link>
            <Link href="/indian-dubs" className="rounded-xl border border-[var(--color-line)] bg-gradient-to-br from-[#6c63ff]/10 to-transparent p-5 hover:border-[#6c63ff]/40 transition-all">
              <span className="text-2xl">🌊</span>
              <p className="font-display text-lg font-bold mt-2">Telugu Dubs</p>
              <p className="text-xs text-[var(--color-mute)] mt-1">10+ anime dubbed in Telugu</p>
            </Link>
            <Link href="/voice-actors/indian" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 hover:border-[var(--color-cyan)]/40 transition-all">
              <span className="text-2xl">🎙️</span>
              <p className="font-display text-lg font-bold mt-2">Indian VAs</p>
              <p className="text-xs text-[var(--color-mute)] mt-1">Meet the voice artists</p>
            </Link>
          </div>
        </AnimatedSection>
      </FadeIn>

      {/* Pillar 5: Community Engagement */}
      <FadeIn delay={0.4}>
        <AnimatedSection className="!py-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
              <h2 className="font-display text-2xl font-bold">Challenges, Forums &amp; More</h2>
            </div>
            <Link href="/community" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
              Explore →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Link href="/challenges" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-magenta)]/40 transition-all text-center">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold mt-2">Challenges</p>
              <p className="text-[10px] text-[var(--color-mute)]">Seasonal &amp; yearly</p>
            </Link>
            <Link href="/forum" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-magenta)]/40 transition-all text-center">
              <span className="text-xl">💬</span>
              <p className="text-sm font-bold mt-2">Forums</p>
              <p className="text-[10px] text-[var(--color-mute)]">Discuss anime</p>
            </Link>
            <Link href="/quiz" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-magenta)]/40 transition-all text-center">
              <span className="text-xl">🧠</span>
              <p className="text-sm font-bold mt-2">Quiz</p>
              <p className="text-[10px] text-[var(--color-mute)]">100+ questions</p>
            </Link>
            <Link href="/tierlist" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-magenta)]/40 transition-all text-center">
              <span className="text-xl">📊</span>
              <p className="text-sm font-bold mt-2">Tier Lists</p>
              <p className="text-[10px] text-[var(--color-mute)]">Make your ranking</p>
            </Link>
            <Link href="/achievements" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-magenta)]/40 transition-all text-center">
              <span className="text-xl">🎖️</span>
              <p className="text-sm font-bold mt-2">Achievements</p>
              <p className="text-[10px] text-[var(--color-mute)]">30 badges to earn</p>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Link href="/blog" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">✍️ Blogs</Link>
            <span className="text-xs text-[var(--color-line)]">·</span>
            <Link href="/clubs" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">👥 Clubs</Link>
            <span className="text-xs text-[var(--color-line)]">·</span>
            <Link href="/conventions" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">📅 Conventions</Link>
            <span className="text-xs text-[var(--color-line)]">·</span>
            <Link href="/cosplay" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">📸 Cosplay</Link>
            <span className="text-xs text-[var(--color-line)]">·</span>
            <Link href="/watch-party" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">🎬 Watch Parties</Link>
            <span className="text-xs text-[var(--color-line)]">·</span>
            <Link href="/messages" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">💬 Chat</Link>
          </div>
        </AnimatedSection>
      </FadeIn>

      {/* Monthly Calendar */}
      <FadeIn delay={0.45}>
        <AnimatedSection className="!py-6">
          <MonthlyCalendar />
        </AnimatedSection>
      </FadeIn>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 sm:p-12 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold">Discover more on ZyniVerse</p>
            <p className="mt-2 text-[var(--color-mute)] max-w-lg mx-auto">
              Browse manga, explore character details, check weekly schedules, and build your personal watchlist.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/filler" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">Skip Filler →</Link>
              <Link href="/manga" className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">Browse Manga</Link>
              <Link href="/schedule" className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">View Schedule</Link>
              <Link href="/watchlist" className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">My Watchlist</Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}


