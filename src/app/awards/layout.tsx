import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Awards — Best Anime of the Season & Year",
  description:
    "Annual and seasonal anime awards. Vote for your favorite anime, characters, and moments. See the winners and community choices.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }], title: "Anime Awards — ZyniVerse", description: "Seasonal and annual anime awards voted by the community." },
  alternates: { canonical: "https://zyverse.in/awards" },
  robots: { index: true, follow: true },
};

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
