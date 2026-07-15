import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Dub Schedule — English, Hindi, Tamil & Telugu Dubs | ZyniVerse",
  description:
    "Track anime dubbing releases in English, Hindi, Tamil, Telugu, and more. India's #1 anime dub tracker. Check which episodes are dubbed, release dates, and regional availability.",
  openGraph: {
    title: "Anime Dub Schedule — Hindi, Tamil & Telugu | ZyniVerse",
    description: "Track dubbed anime releases across English, Hindi, Tamil, and Telugu. India's comprehensive anime dub tracker.",
  },
  robots: { index: true, follow: true },
};

export default function DubbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
