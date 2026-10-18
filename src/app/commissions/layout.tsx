import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Commissions - Artist Marketplace",
  description:
    "Browse anime commissions from talented artists. Find custom art, badges and more on ZyniVerse.",
  openGraph: {
    title: "Anime Commissions - Artist Marketplace",
    description: "Browse and discover anime commission artists on ZyniVerse.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/commissions" },
  robots: { index: true, follow: true },
};

export default function CommissionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
