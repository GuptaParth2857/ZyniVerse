import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Anime Meme",
  description: "Upload your own anime meme to share with the ZyniVerse community.",
  alternates: { canonical: "https://zyverse.in/memes/upload" },
  robots: { index: false, follow: true },
};

export default function MemesUploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
