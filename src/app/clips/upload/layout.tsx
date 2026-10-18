import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Anime Clip",
  description: "Upload your favorite anime clip to share with the ZyniVerse community.",
  alternates: { canonical: "https://zyverse.in/clips/upload" },
  robots: { index: false, follow: true },
};

export default function ClipsUploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
