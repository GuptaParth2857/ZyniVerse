import Link from "next/link";
import {
  getTrending, getPopular, getUpcoming, getTopRated, getAiringSchedule, bestTitle,
} from "@/lib/anilist";
import Section from "@/components/Section";
import MediaCarousel from "@/components/MediaCarousel";
import OnAirTicker from "@/components/OnAirTicker";
import { FadeIn, PageTransition } from "@/components/PageTransition";
import Hero3D from "@/components/Hero3D";
import HorizontalScroll from "@/components/HorizontalScroll";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";
import ContinueWatching from "@/components/ContinueWatching";
import Recommendations from "@/components/Recommendations";
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
      <OnAirTicker items={ticker.slice(0, 20)} />

      <ContinueWatching />
      <Recommendations />

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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 sm:p-12 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold">Discover more on ZyniVerse</p>
            <p className="mt-2 text-[var(--color-mute)] max-w-lg mx-auto">
              Browse manga, explore character details, check weekly schedules, and build your personal watchlist.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
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


