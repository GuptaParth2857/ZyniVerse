import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Community — Discussions, Posts & Critiques | ZyniVerse",
  description:
    "Join the ZyniVerse anime community. Share reviews, post critiques, discuss episodes, and connect with fellow anime fans.",
  openGraph: { title: "Anime Community — ZyniVerse", description: "Join anime discussions, critiques, and community posts." },
  robots: { index: true, follow: true },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
