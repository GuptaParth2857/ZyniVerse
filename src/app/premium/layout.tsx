import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZyniVerse Pro — Unlock Premium Anime Features | ZyniVerse",
  description:
    "Upgrade to ZyniVerse Pro. Get ad-free experience, advanced stats, CSV export, priority support, and exclusive features for just Rs 499/month.",
  openGraph: {
    title: "ZyniVerse Pro — Premium Anime Features",
    description:
      "Ad-free experience, advanced stats, CSV export, and more for Rs 499/month.",
  },
  robots: { index: true, follow: true },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
