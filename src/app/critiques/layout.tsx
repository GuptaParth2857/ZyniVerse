import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Critiques & Reviews — Community Ratings",
  description:
    "Read and write anime critiques. Share your thoughts on episodes, characters, and series. See community ratings and reviews.",
  openGraph: { title: "Anime Critiques — ZyniVerse", description: "Read and write community anime critiques and reviews." },
  alternates: { canonical: `${BASE_URL}/critiques` },
  robots: { index: true, follow: true },
};

export default function CritiquesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
