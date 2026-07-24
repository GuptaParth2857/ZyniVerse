import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Airing Schedule — What's On This Week (India)",
  description:
    "See exactly when your favorite anime air this week. Episode schedules, countdown timers & Indian TV dub times. Never miss a new episode.",
  keywords: ["anime schedule", "anime airing today", "anime release schedule", "what anime is airing", "indian anime tv schedule", "weekly anime calendar"],
  openGraph: {
    title: "Anime Airing Schedule — What's On This Week",
    description: "Episode schedules, countdown timers & Indian TV dub times. Never miss a new episode.",
    url: "https://zyverse.in/schedule",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Anime Airing Schedule — What's On This Week",
    description: "Episode schedules, countdown timers & Indian TV dub times.",
  },
  alternates: { canonical: "https://zyverse.in/schedule" },
  robots: { index: true, follow: true },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
