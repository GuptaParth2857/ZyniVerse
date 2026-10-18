import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Characters",
  description: "Manage your favorite anime characters on ZyniVerse.",
  alternates: { canonical: "https://zyverse.in/my-characters" },
  robots: { index: false, follow: true },
};

export default function MyCharactersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
