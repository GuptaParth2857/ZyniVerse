import type { Metadata } from "next";
import ContestsPage from "@/components/ContestsPage";

export const metadata: Metadata = {
  title: "Anime Community Contests",
  description: "Vote for the best anime meme, cosplay and fan art every week on ZyniVerse. Winners earn badges and XP.",
  openGraph: {
    title: "ZyniVerse Anime Contests",
    description: "Vote for the best meme, cosplay and fan art each week. Winners earn badges + XP.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ContestsPageWrapper() {
  return <ContestsPage />;
}