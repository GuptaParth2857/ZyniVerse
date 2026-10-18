import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Contest Entry",
  description:
    "Enter a ZyniVerse weekly battle: pick a contest, upload your entry, add a title and caption, then let the community vote.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
    title: "Submit a Contest Entry - ZyniVerse",
    description: "Enter a weekly battle. Winners earn a badge, XP and coins.",
    type: "website",
  },
  alternates: { canonical: "https://zyverse.in/contests/submit" },
  robots: { index: false, follow: true },
};

export default function ContestsSubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
