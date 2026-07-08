import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Airing Schedule — Weekly Release Calendar | ZyniVerse",
  description:
    "Complete weekly anime airing schedule. See when your favorite shows air, upcoming episodes, and countdown timers. Stay up to date with every new release.",
  openGraph: { title: "Anime Airing Schedule — ZyniVerse", description: "Weekly anime airing schedule with episode countdowns." },
  robots: { index: true, follow: true },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
