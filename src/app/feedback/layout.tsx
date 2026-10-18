import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback & Suggestions",
  description:
    "Share your feedback, suggestions or report issues to help improve ZyniVerse. Your voice shapes the platform.",
  openGraph: {
    title: "Feedback & Suggestions - ZyniVerse",
    description: "Share feedback and suggestions to help improve ZyniVerse.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/feedback" },
  robots: { index: true, follow: true },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
