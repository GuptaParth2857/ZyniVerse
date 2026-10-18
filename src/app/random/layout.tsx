import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random Anime Picker - Discover Something New",
  description:
    "Spin the wheel and discover a random anime to watch. Perfect when you can't decide what to watch next on ZyniVerse.",
  openGraph: {
    title: "Random Anime Picker - Discover Something New",
    description: "Spin and discover random anime recommendations when you're undecided.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/random" },
  robots: { index: true, follow: true },
};

export default function RandomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
