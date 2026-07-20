import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Hindi, Tamil & Telugu Dubbed Anime — Complete List & Schedule | ZyniVerse",
  description:
    "Track every Hindi dubbed anime, Tamil dubbed anime, and Telugu dubbed anime. Complete list of Indian dubbed anime with episode schedules, release dates, and where to watch. India's #1 anime dub tracker.",
  keywords: [
    "hindi dubbed anime", "tamil dubbed anime", "telugu dubbed anime",
    "anime in hindi", "anime in tamil", "anime in telugu",
    "indian dubbed anime list", "dubbed anime schedule india",
    "hindi anime episodes", "sony yay hungama cartoon network anime",
  ],
  openGraph: {
    title: "Hindi, Tamil & Telugu Dubbed Anime — ZyniVerse",
    description: "Track every Hindi, Tamil, and Telugu dubbed anime. Complete list with episode schedules and release dates.",
    url: `${BASE_URL}/dubbed`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hindi, Tamil & Telugu Dubbed Anime — ZyniVerse",
    description: "India's #1 tracker for Hindi, Tamil, and Telugu dubbed anime. Episode schedules and release dates.",
  },
  alternates: {
    canonical: `${BASE_URL}/dubbed`,
  },
  robots: { index: true, follow: true },
};

export default function DubbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
