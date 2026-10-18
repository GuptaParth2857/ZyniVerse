import type { Metadata } from "next";
import SubmitContestClient from "./SubmitContestClient";

export const metadata: Metadata = {
  title: "Submit a Contest Entry",
  description:
    "Enter a ZyniVerse weekly battle: pick a contest, upload your entry, add a title and caption, then let the community vote.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Submit a Contest Entry — ZyniVerse",
    description: "Enter a weekly battle. Winners earn a badge, XP and coins.",
    type: "website",
  },
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ contestId?: string }> };

export default async function SubmitContestPage({ searchParams }: Props) {
  const { contestId } = await searchParams;
  return <SubmitContestClient initialContestId={contestId ?? null} />;
}
