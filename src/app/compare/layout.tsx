import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Anime Side by Side",
  description:
    "Compare anime side by side by score, genre, episodes, studios and more. Find which show is right for you on ZyniVerse.",
  openGraph: {
    title: "Compare Anime Side by Side",
    description: "Compare multiple anime by score, genre, episodes, studios and more.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/compare" },
  robots: { index: true, follow: true },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
