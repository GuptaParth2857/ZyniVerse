import { NextRequest, NextResponse } from "next/server";
import { generateDynamicQuiz } from "@/lib/quiz";
import { storeQuestions } from "@/lib/quiz-store";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty") || undefined;
  const category = searchParams.get("category") || undefined;
  const count = Math.min(20, Math.max(1, Number(searchParams.get("count")) || 10));

  const questions = await generateDynamicQuiz(difficulty, category, count);
  storeQuestions(questions);
  const safeQuestions = questions.map(({ correctAnswer: _correctAnswer, ...rest }) => rest);

  return NextResponse.json({ questions: safeQuestions });
}
