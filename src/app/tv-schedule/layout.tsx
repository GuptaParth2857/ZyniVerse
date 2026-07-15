import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime TV Schedule — What's Airing Today on Indian TV | ZyniVerse",
  description:
    "Check what anime is airing today on Indian TV channels like Cartoon Network, Sony YAY, Hungama, Nick, and more. Complete TV schedule with DTH channel numbers.",
  openGraph: {
    title: "Anime TV Schedule — Indian TV Channels | ZyniVerse",
    description:
      "Check what anime is airing today on Indian TV channels. Complete schedule with DTH channel numbers.",
  },
  robots: { index: true, follow: true },
};

export default function TvScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
