import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import PodcastSection from "@/components/PodcastSection";
import NativeBannerAd from "@/components/NativeBannerAd";

export const metadata: Metadata = {
  title: "Anime Podcast — Hindi & English Anime Discussions | ZyniVerse",
  description:
    "Listen to anime podcasts covering Hindi dubs, Indian anime scene, streaming platforms, and more.",
  openGraph: {
    title: "Anime Podcast — Hindi & English Anime Discussions | ZyniVerse",
    description: "Listen to anime podcasts covering Hindi dubs, Indian anime scene, streaming platforms, and more.",
  },
};

export default function PodcastPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Podcast & Audio
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            Anime Podcast
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Hindi & English anime discussions, reviews, and Indian anime community talks.
          </p>
        </div>

        <PodcastSection />

        <div className="mt-8">
          <NativeBannerAd />
        </div>
      </div>
    </PageTransition>
  );
}
