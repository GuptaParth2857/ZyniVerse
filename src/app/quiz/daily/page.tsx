import type { Metadata } from "next";
import DailyQuizClient from "./client";

export const metadata: Metadata = {
  title: "Daily Anime Quiz | ZyniVerse",
  description: "Take the daily anime quiz. Everyone gets the same questions!",
};

export default function DailyQuizPage() {
  return <DailyQuizClient />;
}
