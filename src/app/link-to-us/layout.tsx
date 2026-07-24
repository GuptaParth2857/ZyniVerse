import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link to ZyniVerse — Badges, Buttons & Resources for Partners",
  description:
    "Partner with ZyniVerse. Get free badges, buttons, and embed codes to link to India's #1 anime platform. Help your visitors discover filler guides, Hindi dubs & more.",
  keywords: ["link to zyniverse", "partner with zyniverse", "anime badges", "anime link buttons", "zyniverse partner"],
  openGraph: {
    title: "Link to ZyniVerse — Badges, Buttons & Resources",
    description: "Get free badges, buttons & embed codes to link to India's #1 anime platform.",
    url: "https://zyverse.in/link-to-us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Link to ZyniVerse — Badges, Buttons & Resources",
    description: "Get free badges, buttons & embed codes to link to India's #1 anime platform.",
  },
  alternates: { canonical: "https://zyverse.in/link-to-us" },
  robots: { index: true, follow: true },
};

export default function LinkToUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
