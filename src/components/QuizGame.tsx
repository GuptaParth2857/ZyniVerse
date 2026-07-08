"use client";

import { useState, useEffect, useCallback } from "react";

interface QuizQ {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
  animeTitle?: string;
  animeImage?: string;
}

type Phase = "start" | "playing" | "result";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "General", label: "General" },
  { value: "Characters", label: "Characters" },
  { value: "Plot", label: "Plot" },
  { value: "Studio", label: "Studio" },
  { value: "Music", label: "Music" },
  { value: "Voice Actors", label: "Voice Actors" },
];

const DIFFICULTIES = [
  { value: "all", label: "All Levels" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function getDifficultyColor(d: string) {
  switch (d) {
    case "easy": return "var(--color-cyan)";
    case "medium": return "var(--color-amber)";
    case "hard": return "var(--color-magenta)";
    default: return "var(--color-mute)";
  }
}

export default function QuizGame() {
  const [phase, setPhase] = useState<Phase>("start");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; correct: boolean }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"none" | "correct" | "wrong">("none");
  const [timer, setTimer] = useState(30);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState(0);

  const currentQ = questions[currentIndex];

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswerState("none");
      setTimer(30);
    } else {
      setPhase("result");
      if (startTime) setTotalTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }
  }, [currentIndex, questions.length, startTime]);

  useEffect(() => {
    if (phase !== "playing" || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, timer]);

  useEffect(() => {
    if (phase === "playing" && timer === 0 && answerState === "none") {
      setAnswerState("wrong");
      setStreak(0);
      setAnswers((a) => [...a, { questionId: currentQ!.id, answer: "", correct: false }]);
      setTimeout(nextQuestion, 1500);
    }
  }, [timer, phase, answerState, nextQuestion, currentQ]);

  async function startQuiz() {
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      params.set("count", String(count));
      const res = await fetch(`/api/quiz/generate?${params}`);
      const data = await res.json();
      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setAnswerState("none");
      setTimer(30);
      setStartTime(new Date());
      setPhase("playing");
    } catch (e) {
      console.error("Failed to start quiz", e);
    }
  }

  async function handleAnswer(answer: string) {
    if (answerState !== "none") return;
    setSelectedAnswer(answer);

    try {
      const res = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQ!.id, answer }),
      });
      const data = await res.json();
      if (data.correct) {
        setAnswerState("correct");
        setScore((s) => s + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
      } else {
        setAnswerState("wrong");
        setStreak(0);
      }
      setAnswers((a) => [...a, { questionId: currentQ!.id, answer, correct: data.correct }]);
      setTimeout(nextQuestion, 1500);
    } catch {
      setAnswerState("wrong");
      setTimeout(nextQuestion, 1500);
    }
  }

  if (phase === "start") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="font-display text-2xl font-bold mb-2">Anime Quiz</h2>
          <p className="text-sm text-[var(--color-mute)] mb-6">Test your anime knowledge with trivia questions</p>

          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs text-[var(--color-mute)] block mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-violet)]"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-mute)] block mb-1.5">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-violet)]"
              >
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-mute)] block mb-1.5">Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button key={n} onClick={() => setCount(n)}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                      count === n ? "bg-[var(--color-violet)] text-black" : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-violet)]"
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={startQuiz}
            className="mt-8 w-full rounded-xl bg-[var(--color-violet)] py-3 text-base font-bold text-black hover:opacity-90 transition-opacity"
          >Start Quiz</button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    let grade = "F";
    if (pct >= 90) grade = "S";
    else if (pct >= 80) grade = "A";
    else if (pct >= 70) grade = "B";
    else if (pct >= 60) grade = "C";
    else if (pct >= 50) grade = "D";

    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
          <div className="text-5xl font-bold font-mono text-[var(--color-violet)] mb-2">{grade}</div>
          <h2 className="font-display text-2xl font-bold mb-1">Quiz Complete!</h2>
          <p className="text-sm text-[var(--color-mute)] mb-6">Here&apos;s how you did</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-[var(--color-line)] p-3">
              <div className="text-2xl font-bold font-mono text-[var(--color-cyan)]">{score}/{questions.length}</div>
              <div className="text-[10px] text-[var(--color-mute)]">Score</div>
            </div>
            <div className="rounded-lg border border-[var(--color-line)] p-3">
              <div className="text-2xl font-bold font-mono text-[var(--color-amber)]">{totalTime}s</div>
              <div className="text-[10px] text-[var(--color-mute)]">Time</div>
            </div>
            <div className="rounded-lg border border-[var(--color-line)] p-3">
              <div className="text-2xl font-bold font-mono text-[var(--color-magenta)]">{bestStreak}</div>
              <div className="text-[10px] text-[var(--color-mute)]">Best Streak</div>
            </div>
          </div>

          <div className="space-y-1.5 mb-6 text-left">
            {answers.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                a.correct ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}>
                <span className="font-mono">{a.correct ? "✓" : "✗"}</span>
                <span className="truncate flex-1">Q{i + 1}</span>
                {!a.correct && a.answer && <span className="text-[var(--color-mute)]">Your: {a.answer}</span>}
              </div>
            ))}
          </div>

          <button onClick={startQuiz}
            className="w-full rounded-xl bg-[var(--color-violet)] py-3 text-base font-bold text-black hover:opacity-90 transition-opacity"
          >Play Again</button>
        </div>
      </div>
    );
  }

  if (!currentQ) return <div className="p-8 text-center text-sm text-[var(--color-mute)]">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-violet)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-[var(--color-mute)] shrink-0">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 text-xs text-[var(--color-mute)]">
        <div className="flex items-center gap-3">
          <span>Score: <span className="font-mono text-[var(--color-cyan)]">{score}</span></span>
          {streak > 1 && <span>Streak: <span className="font-mono text-[var(--color-amber)]">x{streak}</span></span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono ${timer <= 10 ? "text-[var(--color-magenta)]" : ""}`}>{timer}s</span>
          <span className="rounded border border-[var(--color-line)] px-1.5 py-0.5" style={{ color: getDifficultyColor(currentQ.difficulty), borderColor: getDifficultyColor(currentQ.difficulty) }}>
            {currentQ.difficulty}
          </span>
          <span className="rounded border border-[var(--color-line)] px-1.5 py-0.5 text-[var(--color-mute)]">{currentQ.category}</span>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 mb-4">
        {currentQ.animeTitle && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-violet)] mb-2 font-mono">{currentQ.animeTitle}</p>
        )}
        <h3 className="font-display text-lg font-bold leading-relaxed">{currentQ.question}</h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2">
        {currentQ.options.map((opt, i) => {
          let variant = "border-[var(--color-line)] hover:border-[var(--color-violet)]";
          if (answerState !== "none" && selectedAnswer === opt) {
            variant = answerState === "correct"
              ? "border-green-500 bg-green-500/10"
              : "border-red-500 bg-red-500/10";
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)}
              disabled={answerState !== "none"}
              className={`w-full text-left rounded-xl border px-5 py-3.5 text-sm font-medium transition-all ${variant} ${
                answerState !== "none" ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className="mr-3 font-mono text-[var(--color-mute)]">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
