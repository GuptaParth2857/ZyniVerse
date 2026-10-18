import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Clips - Iconic Scenes",
  description:
    "Discover and share the best anime clips and iconic moments. A curated collection of legendary anime scenes on ZyniVerse.",
  openGraph: {
    title: "Anime Clips - Iconic Scenes",
    description: "Discover and share the best anime clips and iconic moments.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/clips" },
  robots: { index: true, follow: true },
};

export default function ClipsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
