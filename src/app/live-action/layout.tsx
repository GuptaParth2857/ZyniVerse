import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live-Action Anime Adaptations — Movies & TV Shows | ZyniVerse",
  description:
    "Browse live-action anime adaptations. Find movies and TV shows based on your favorite anime — cast, ratings, streaming platforms, and more.",
  openGraph: {
    title: "Live-Action Anime Adaptations | ZyniVerse",
    description:
      "Browse live-action anime movies and TV shows. Cast, ratings, and streaming platforms.",
  },
  robots: { index: true, follow: true },
};

export default function LiveActionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
