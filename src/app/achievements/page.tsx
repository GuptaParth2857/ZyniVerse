import type { Metadata } from "next";
import AchievementClient from "./client";

export const metadata: Metadata = {
  title: "Achievements & Badges | ZyniVerse",
  description: "Unlock achievements, earn points, and level up as you watch and explore anime.",
};

export default function AchievementsPage() {
  return <AchievementClient />;
}
