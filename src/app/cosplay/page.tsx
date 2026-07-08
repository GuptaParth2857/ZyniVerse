import type { Metadata } from "next";
import CosplayGallery from "@/components/CosplayGallery";

export const metadata: Metadata = {
  title: "Cosplay Gallery — Anime Cosplays & Costumes | ZyniVerse",
  description:
    "Browse and share anime cosplays. Show off your costumes, discover talented cosplayers from India and around the world.",
};

export default function CosplayPage() {
  return <CosplayGallery />;
}
