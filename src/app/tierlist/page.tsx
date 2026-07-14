import Link from "next/link";
import TierListGrid from "./TierListGrid";
import NativeBannerAd from "@/components/NativeBannerAd";

export const metadata = {
  title: "Anime Tier Lists — Rank Your Favorites | ZyniVerse",
  description:
    "Create and share anime tier lists. Rank your favorite series, compare with friends, and discover what others think.",
  openGraph: {
    title: "Anime Tier Lists — Rank Your Favorites | ZyniVerse",
    description:
      "Create and share anime tier lists. Rank your favorite series, compare with friends, and discover what others think.",
  },
};

export default function TierListsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 animate-page-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tier Lists</h1>
          <p className="mt-1 text-[var(--color-mute)]">Create and share anime tier lists</p>
        </div>
        <Link
          href="/tierlist/create"
          className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
        >
          Create New Tier List
        </Link>
      </div>

      <TierListGrid />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div>
  );
}
