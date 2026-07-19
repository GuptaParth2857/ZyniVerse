import { NextRequest, NextResponse } from "next/server";
import { checkAnswer } from "@/lib/quiz";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { questionId, answer } = await req.json();
  if (!questionId || !answer) {
    return NextResponse.json({ error: "Missing questionId or answer" }, { status: 400 });
  }

  const result = await checkAnswer(questionId, answer);
  return NextResponse.json(result);
}
