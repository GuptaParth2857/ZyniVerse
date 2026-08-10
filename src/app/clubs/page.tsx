import type { Metadata } from "next";
import { Suspense } from "react";
import ClubsPageClient from "./ClubsPageClient";

export const metadata: Metadata = {
  title: "Anime Clubs & Groups — Find Your Community | ZyniVerse",
  description: "Join anime clubs and groups. Connect with fans who share your interests in watching, reading, and discussing anime and manga.",
};

export default function ClubsPage() {
  return (
    <Suspense fallback={null}>
      <ClubsPageClient />
    </Suspense>
  );
}
