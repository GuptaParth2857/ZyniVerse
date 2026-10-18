import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Memes - Community Humor",
  description:
    "Browse, share and upvote the funniest anime memes from the ZyniVerse community. Daily fresh anime humor.",
  openGraph: {
    title: "Anime Memes - Community Humor",
    description: "Browse and share funny anime memes from the ZyniVerse community.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/memes" },
  robots: { index: true, follow: true },
};

export default function MemesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
