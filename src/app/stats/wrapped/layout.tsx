import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Wrapped - Your Year in Anime Stats",
  description:
    "See your anime wrapped: top shows, total watch time, streaks, genres and more. Share your 2026 anime year with friends on ZyniVerse.",
  openGraph: {
    title: "Anime Wrapped - Your Year in Anime Stats",
    description: "See your anime wrapped: top shows, total watch time, streaks, genres and more.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/stats/wrapped" },
  robots: { index: true, follow: true },
};

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
