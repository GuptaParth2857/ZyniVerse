import type { Metadata } from "next";
import QuizGame from "@/components/QuizGame";

export const metadata: Metadata = {
  title: "Anime Quiz — Play | ZyniVerse",
  description: "Test your anime knowledge with trivia quizzes.",
};

export default function QuizPlayPage() {
  return <QuizGame />;
}
