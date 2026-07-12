import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Staff Directory - Voice Actors, Directors & More | ZyniVerse",
  description:
    "Browse anime and manga staff — voice actors, directors, writers, and producers. Search by name and explore their works.",
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
