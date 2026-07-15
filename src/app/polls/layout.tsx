import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Polls — Vote on Your Favorites | ZyniVerse",
  description:
    "Create and vote on anime polls. Best anime, best character, best fight scene — have your say in the ZyniVerse community.",
  openGraph: {
    title: "Anime Polls — Vote on Your Favorites | ZyniVerse",
    description:
      "Create and vote on anime polls. Have your say in the community.",
  },
  robots: { index: true, follow: true },
};

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
