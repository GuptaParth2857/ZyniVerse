import { NextResponse } from "next/server";
import { getDailyQuizDynamic } from "@/lib/quiz";

export async function GET() {
  const questions = await getDailyQuizDynamic();
  const safeQuestions = questions.map(({ correctAnswer: _correctAnswer, ...rest }) => rest);
  return NextResponse.json({ questions: safeQuestions, date: new Date().toISOString().split("T")[0] });
}
