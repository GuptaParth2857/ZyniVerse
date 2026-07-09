import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Watch Order Guides — Complete Series Watch Orders | ZyniVerse",
  description:
    "Never be confused about anime watch order again. Complete watch order guides for Monogatari, Fate, Dragon Ball, Gundam, and dozens more complex series.",
  openGraph: {
    title: "Anime Watch Order Guides — ZyniVerse",
    description: "Complete watch order guides for Monogatari, Fate, Dragon Ball, Gundam, and more.",
  },
  robots: { index: true, follow: true },
};

export default function WatchOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
