import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Wordle — Daily Guessing Game | ZyniVerse",
  description: "Guess the daily anime in 6 tries! Get hints about genre, format, year, and studio. New anime every day!",
  alternates: { canonical: "https://zyverse.in/wordle" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Anime Wordle | ZyniVerse",
    description: "Guess the daily anime in 6 tries! New anime every day.",
    url: "https://zyverse.in/wordle",
  },
};

export default function WordleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
