import type { Metadata } from "next";
import WallpaperGallery from "@/components/WallpaperGallery";

export const metadata: Metadata = {
  title: "Anime Wallpapers — HD Backgrounds for Desktop & Phone | ZyniVerse",
  description:
    "Download high-quality anime wallpapers for desktop, phone, and tablet. Browse landscape, portrait, and phone wallpapers from your favorite anime series.",
  openGraph: {
    title: "Anime Wallpapers — HD Backgrounds | ZyniVerse",
    description:
      "Download high-quality anime wallpapers for desktop, phone, and tablet.",
    type: "website",
  },
};

export default function WallpapersPage() {
  return <WallpaperGallery />;
}
