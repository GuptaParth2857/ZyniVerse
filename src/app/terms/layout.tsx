import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ZyniVerse",
  description: "Read the terms of service for using ZyniVerse — India's free anime filler guides, dub tracking, and community platform.",
  alternates: { canonical: "https://zyverse.in/terms" },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
