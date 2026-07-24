import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indian & International Cartoons — Chhota Bheem, Doraemon, Shin-chan & More",
  description:
    "Complete database of cartoons popular in India. Indian originals (Chhota Bheem, Motu Patlu) + international dubbed (Doraemon, Shin-chan, Ben 10). Hindi dub info, episode counts & where to watch.",
  keywords: [
    "indian cartoons", "hindi dubbed cartoons", "chhota bheem", "motu patlu",
    "doraemon hindi", "shinchan hindi", "pokemon hindi", "ben 10 hindi",
    "cartoon network india", "nickelodeon india", "kids shows india",
    "tom and jerry hindi", "oggy and cockroaches hindi",
  ],
  openGraph: {
    title: "Indian & International Cartoons — Complete Database",
    description: "Every cartoon popular in India — Indian originals + international dubbed. Hindi dub info and where to watch.",
    url: "https://zyverse.in/toons",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Indian & International Cartoons — Complete Database",
    description: "Every cartoon popular in India — Indian originals + international dubbed.",
  },
  alternates: { canonical: "https://zyverse.in/toons" },
  robots: { index: true, follow: true },
};

export default function ToonsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
