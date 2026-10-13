import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My List",
  description: "Your saved anime and manga watchlist, synced to your ZyniVerse account.",
  robots: { index: false, follow: false },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
