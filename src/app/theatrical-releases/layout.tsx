import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Theatrical Releases - Movies in Theatres",
  description:
    "Track upcoming and released anime movies in Indian theatres. Find showtimes, trailers and booking info on ZyniVerse.",
  openGraph: {
    title: "Anime Theatrical Releases - Movies in Theatres",
    description: "Track anime movies coming to theatres in India with showtimes and trailers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/theatrical-releases" },
  robots: { index: true, follow: true },
};

export default function TheatricalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
