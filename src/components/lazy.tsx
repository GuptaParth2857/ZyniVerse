import dynamic from "next/dynamic";
import { HeroSkeleton, CarouselSkeleton } from "./Skeletons";

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
