import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Reels",
  description:
    "Short anime clips, AMVs and fan edits — vertical reels on ZyniVerse. Like, comment and share your favourites.",
  alternates: { canonical: `${BASE_URL}/reels` },
  openGraph: {
    title: "Reels",
    description:
      "Short anime clips, AMVs and fan edits — vertical reels on ZyniVerse.",
    type: "website",
    url: `${BASE_URL}/reels`,
  },
  twitter: { card: "summary_large_image" },
};

export default function ReelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
