import type { Metadata } from "next";
import ClubsPageClient from "./ClubsPageClient";

export const metadata: Metadata = {
  title: "Anime Clubs & Groups — Find Your Community | ZyniVerse",
  description: "Join anime clubs and groups. Connect with fans who share your interests in watching, reading, and discussing anime and manga.",
};

export default function ClubsPage() {
  return <ClubsPageClient />;
}
