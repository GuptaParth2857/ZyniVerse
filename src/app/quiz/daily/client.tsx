"use client";

import { useState } from "react";
import QuizGame from "@/components/QuizGame";

export default function DailyQuizClient() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="font-display text-2xl font-bold mb-2">Daily Anime Quiz</h2>
          <p className="text-sm text-[var(--color-mute)] mb-2">5 questions, same for everyone today.</p>
          <p className="text-xs text-[var(--color-mute)] mb-6">Can you get a perfect score?</p>

          <button onClick={() => setStarted(true)}
            className="w-full rounded-xl bg-[var(--color-violet)] py-3 text-base font-bold text-black hover:opacity-90 transition-opacity"
          >Start Daily Quiz</button>
        </div>
      </div>
    );
  }

  return <QuizGame />;
}
