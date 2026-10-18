import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Figure Collection - Manage Your Anime Figures",
  description:
    "Track and showcase your anime figure collection. Add figures, see stats and share with the community on ZyniVerse.",
  openGraph: {
    title: "Figure Collection - Manage Your Anime Figures",
    description: "Track and showcase your anime figure collection with stats and sharing.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/figures" },
  robots: { index: true, follow: true },
};

export default function FiguresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
