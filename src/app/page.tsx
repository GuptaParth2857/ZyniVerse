import Link from "next/link";
import {
  getTrending, getPopular, getUpcoming, getTopRated, getAiringSchedule,
} from "@/lib/anilist";
import { auth } from "@/lib/auth";
import Section from "@/components/Section";
import MediaCarousel from "@/components/MediaCarousel";
import OnAirTicker from "@/components/OnAirTicker";
import { FadeIn, PageTransition } from "@/components/PageTransition";
import { DynamicHero3D as Hero3D, DynamicHorizontalScroll as HorizontalScroll } from "@/components/lazy";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";
import ContinueWatching from "@/components/ContinueWatching";
import Recommendations from "@/components/Recommendations";
import AdBanner from "@/components/AdBanner";
import NativeBannerAd from "@/components/NativeBannerAd";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import HomeMomentButton from "@/components/HomeMomentButton";
import FriendActivityFeed from "@/components/features/FriendActivityFeed";
import MonthlyCalendar from "@/components/features/MonthlyCalendar";
import FeaturedFeedbackCarousel from "@/components/FeaturedFeedbackCarousel";
import WhyZyniVerse from "@/components/WhyZyniVerse";
import NeonBanner from "@/components/NeonBanner";
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
  const session = await auth();

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
      <div className="animate-page-in">
      <Hero3D items={trendingData} />
      <FadeIn delay={0.02}>
        <NeonBanner />
      </FadeIn>
      <HorizontalScroll items={trendingData.slice(0, 20)} />
      <FadeIn delay={0.05}>
        <WhyZyniVerse />
      </FadeIn>
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
            <div>
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
              { href: "/tierlist", emoji: "📊", title: "Tier Lists", desc: "Make your ranking", color: "#22c55e" },
              { href: "/achievements", emoji: "🎖️", title: "Achievements", desc: "30 badges to earn", color: "#f59e0b" },
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
              { href: "/watch-party", emoji: "🎬", label: "Watch Parties" },
              { href: "/messages", emoji: "💬", label: "Chat" },
            ].map((link, i, arr) => (
              <span key={link.href} className="flex items-center gap-2 text-xs">
                <Link href={link.href} className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors flex items-center gap-1">
                  <span>{link.emoji}</span>{link.label}
                </Link>
                {i < arr.length - 1 && <span className="text-[var(--color-line)]">·</span>}
              </span>
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
              <HomeMomentButton />
            </div>
          </div>
        </FadeIn>
      </div>
      </div>
    </PageTransition>
  );
}


