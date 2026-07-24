import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Characters Database — Voice Actors, Rankings & Stats",
  description:
    "Explore 10,000+ anime characters. Voice actor details, appearances, favorites count & rankings. Find your waifu or husbando.",
  keywords: ["anime characters", "anime voice actors", "anime character database", "best anime characters", "anime rankings", "waifu list"],
  openGraph: {
    title: "Anime Characters Database — Voice Actors, Rankings & Stats",
    description: "Explore 10,000+ anime characters. Voice actor details, appearances & rankings.",
    url: "https://zyverse.in/characters",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Anime Characters Database — Voice Actors, Rankings & Stats",
    description: "Explore 10,000+ anime characters. Voice actor details, appearances & rankings.",
  },
  alternates: { canonical: "https://zyverse.in/characters" },
  robots: { index: true, follow: true },
};

export default function CharactersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
