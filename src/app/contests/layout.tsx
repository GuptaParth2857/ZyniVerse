import type { Metadata } from "next";
import ContestSubNav from "@/components/ContestSubNav";

export const metadata: Metadata = {
  title: "Anime Contests",
  description:
    "Weekly anime community contests — vote for the best meme, cosplay, fan art and moment. Winners earn a badge, XP and coins.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "ZyniVerse Anime Contests",
    description: "Vote for the best meme, cosplay and fan art each week. Winners earn badges, XP and coins.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <ContestSubNav />
      {children}
    </div>
  );
}
