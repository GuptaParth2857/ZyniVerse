import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getDailyQuizDynamic } from "@/lib/quiz";

async function GET_inner() {
  const questions = await getDailyQuizDynamic();
  const safeQuestions = questions.map(({ correctAnswer: _correctAnswer, ...rest }) => rest);
  return NextResponse.json({ questions: safeQuestions, date: new Date().toISOString().split("T")[0] });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
