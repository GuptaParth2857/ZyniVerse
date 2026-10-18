import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Anime Characters by Traits",
  description:
    "Filter anime characters by gender, hair color, eye color, age, and popularity. Find the perfect character on ZyniVerse.",
  openGraph: {
    title: "Search Anime Characters by Traits",
    description: "Filter anime characters by gender, hair color, eye color, age, and popularity.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/characters/trait-search" },
  robots: { index: true, follow: true },
};

export default function TraitSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
