import type { Metadata } from "next";
import HallOfFameClient from "./HallOfFameClient";

export const metadata: Metadata = {
  title: "Hall of Fame — Past Contest Winners",
  description:
    "Every weekly ZyniVerse contest winner, with the winning entry and the podium. See who has taken home the badge, XP and coins.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "ZyniVerse Hall of Fame",
    description: "Every weekly contest winner and podium, archived forever.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function HallOfFamePage() {
  return <HallOfFameClient />;
}
