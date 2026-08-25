import type { Metadata } from "next";
import FanArtGallery from "@/components/FanArtGallery";

export const metadata: Metadata = {
  title: "Fan Art Gallery — Anime Fan Creations | ZyniVerse",
  description:
    "Browse and share anime fan art. Discover amazing drawings, digital art, and illustrations from the community.",
};

export default function FanArtPage() {
  return <FanArtGallery />;
}
