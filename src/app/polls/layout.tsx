import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Polls — Vote on Your Favorites",
  description:
    "Create and vote on anime polls. Best anime, best character, best fight scene — have your say in the ZyniVerse community.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Polls — Vote on Your Favorites",
    description:
      "Create and vote on anime polls. Have your say in the community.",
  },
  alternates: { canonical: `${BASE_URL}/polls` },
  robots: { index: true, follow: true },
};

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
