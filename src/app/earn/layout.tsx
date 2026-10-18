import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earn Rewards on ZyniVerse",
  description:
    "Share your referral link and earn XP, coins and badges. Complete tasks to level up on ZyniVerse.",
  openGraph: {
    title: "Earn Rewards on ZyniVerse",
    description: "Refer friends and complete tasks to earn XP, coins and badges.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/earn" },
  robots: { index: true, follow: true },
};

export default function EarnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
