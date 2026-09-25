import dynamic from "next/dynamic";
import {
  HeroSkeleton,
  CarouselSkeleton,
  RowSkeleton,
  ListSkeleton,
  CardGridSkeleton,
  SectionSkeleton,
} from "./Skeletons";

export const DynamicHero3D = dynamic(() => import("./Hero3D"), {
  ssr: true,
  loading: () => <HeroSkeleton />,
});

export const DynamicCarousel3D = dynamic(() => import("./Carousel3D"), {
  ssr: true,
  loading: () => <CarouselSkeleton />,
});

export const DynamicWatchlistCarousel3D = dynamic(() => import("./WatchlistCarousel3D"), {
  ssr: true,
  loading: () => <CarouselSkeleton />,
});

export const DynamicHorizontalScroll = dynamic(() => import("./HorizontalScroll"), {
  ssr: true,
  loading: () => (
    <div className="relative overflow-hidden border-b border-[var(--color-line)] animate-pulse">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-8 w-56 rounded bg-white/10" />
          </div>
          <div className="h-4 w-16 rounded bg-white/5" />
        </div>
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0" style={{ width: 200 }}>
              <div className="ml-[30px]">
                <div className="aspect-[2/3] rounded-[8px] bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// ── Below-fold homepage sections (deferred hydration) ──────────────────────
// These render identical SSR HTML (ssr: true keeps layout + SEO intact) but
// their client JS ships in separate lazy chunks, shrinking the homepage's
// main bundle. The loading fallbacks only show for the brief hydrate gap.

export const DynamicOnAirTicker = dynamic(() => import("./OnAirTicker"), {
  ssr: true,
  loading: () => (
    <div className="animate-pulse overflow-hidden border-y border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="h-2 w-20 rounded bg-white/10" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-2 w-24 shrink-0 rounded bg-white/5" />
        ))}
      </div>
    </div>
  ),
});

export const DynamicContinueWatching = dynamic(() => import("./ContinueWatching"), {
  ssr: true,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <RowSkeleton />
    </div>
  ),
});

export const DynamicRecommendations = dynamic(() => import("./Recommendations"), {
  ssr: true,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <RowSkeleton />
    </div>
  ),
});

export const DynamicGamificationWidget = dynamic(() => import("./GamificationWidget"), {
  ssr: true,
  loading: () => (
    <div className="animate-pulse rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-3 h-8 w-72 max-w-full rounded bg-white/10" />
      <div className="mt-4 flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 w-24 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  ),
});

export const DynamicFriendActivityFeed = dynamic(() => import("./features/FriendActivityFeed"), {
  ssr: true,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <ListSkeleton rows={3} />
    </div>
  ),
});

export const DynamicMediaCarousel = dynamic(() => import("./MediaCarousel"), {
  ssr: true,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <RowSkeleton />
    </div>
  ),
});

export const DynamicSection = dynamic(() => import("./Section"), {
  ssr: true,
  loading: () => <SectionSkeleton />,
});

export const DynamicExpandingFlexCard = dynamic(() => import("./ExpandingFlexCard"), {
  ssr: true,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <CardGridSkeleton count={6} />
    </div>
  ),
});

export const DynamicMonthlyCalendar = dynamic(() => import("./features/MonthlyCalendar"), {
  ssr: true,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <ListSkeleton rows={4} />
    </div>
  ),
});
