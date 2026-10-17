import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Themes & Customization — Dark, Light & Dim Modes",
  description:
    "Customize your ZyniVerse experience with dark mode, dim mode, and light mode themes. Choose the perfect look for your anime tracking.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Themes — Dark, Light & Dim Modes",
    description:
      "Customize your ZyniVerse experience with dark, dim, and light themes.",
  },
  alternates: { canonical: `${BASE_URL}/themes` },
  robots: { index: true, follow: true },
};

export default function ThemesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
