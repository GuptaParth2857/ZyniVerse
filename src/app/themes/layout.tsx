import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Themes & Customization — Dark, Light & Dim Modes | ZyniVerse",
  description:
    "Customize your ZyniVerse experience with dark mode, dim mode, and light mode themes. Choose the perfect look for your anime tracking.",
  openGraph: {
    title: "Anime Themes — Dark, Light & Dim Modes | ZyniVerse",
    description:
      "Customize your ZyniVerse experience with dark, dim, and light themes.",
  },
  robots: { index: true, follow: true },
};

export default function ThemesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
