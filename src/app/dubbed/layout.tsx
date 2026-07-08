import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Dub Schedule — English, Hindi, Tamil & Telugu Dubs | ZyniVerse",
  description:
    "Track anime dubbing releases in English, Hindi, Tamil, Telugu, and more. Check which episodes are dubbed, release dates, and regional availability.",
  openGraph: { title: "Anime Dub Schedule — ZyniVerse", description: "Track dubbed anime releases across multiple languages." },
  robots: { index: true, follow: true },
};

export default function DubbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
