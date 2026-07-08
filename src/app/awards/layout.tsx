import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Awards — Best Anime of the Season & Year | ZyniVerse",
  description:
    "Annual and seasonal anime awards. Vote for your favorite anime, characters, and moments. See the winners and community choices.",
  openGraph: { title: "Anime Awards — ZyniVerse", description: "Seasonal and annual anime awards voted by the community." },
  robots: { index: true, follow: true },
};

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
