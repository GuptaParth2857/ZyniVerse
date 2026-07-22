import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import MerchStore from "@/components/MerchStore";
import NativeBannerAd from "@/components/NativeBannerAd";

export const metadata: Metadata = {
  title: "Anime Merch Store — Figures, Clothing & More | ZyniVerse",
  description:
    "Buy anime merchandise in India. Figures, manga, clothing, accessories and more with best prices.",
  openGraph: {
    title: "Anime Merch Store — Figures, Clothing & More | ZyniVerse",
    description: "Buy anime merchandise in India. Figures, manga, clothing, accessories and more.",
  },
};

export default function MerchPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Merchandise
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            Anime Merch Store
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Buy anime figures, manga, clothing, and accessories. Best prices in India.
          </p>
        </div>

        <MerchStore />

        <div className="mt-8">
          <NativeBannerAd />
        </div>
      </div>
    </PageTransition>
  );
}
