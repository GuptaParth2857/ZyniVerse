import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Community — Discussions, Posts & Critiques",
  description:
    "Join the ZyniVerse anime community. Share reviews, post critiques, discuss episodes, and connect with fellow anime fans.",
  openGraph: { title: "Anime Community — ZyniVerse", description: "Join anime discussions, critiques, and community posts." },
  alternates: { canonical: `${BASE_URL}/community` },
  robots: { index: true, follow: true },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
