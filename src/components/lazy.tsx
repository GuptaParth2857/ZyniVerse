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
  loading: () => <div className="h-40 animate-pulse bg-[var(--color-panel)] rounded-xl mx-4" />,
});
