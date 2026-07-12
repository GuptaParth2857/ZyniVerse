import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { questionId, options } = await req.json();
  if (!questionId || !options) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const { checkAnswer } = await import("@/lib/quiz");
  const result = checkAnswer(questionId, options[0]);

  const wrongOptions = options.filter((o: string) => o !== result.correctAnswer);
  const toRemove = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);

  return NextResponse.json({ remove: toRemove });
}
