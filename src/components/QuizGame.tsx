"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

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

const RANKS = [
  { name: "Bronze", xp: 0, color: "#cd7f32", icon: "🥉" },
  { name: "Silver", xp: 500, color: "#c0c0c0", icon: "🥈" },
  { name: "Gold", xp: 1500, color: "#ffd700", icon: "🥇" },
  { name: "Platinum", xp: 3500, color: "#00ffff", icon: "💎" },
  { name: "Diamond", xp: 7000, color: "#ff00ff", icon: "👑" },
  { name: "Legend", xp: 15000, color: "#ff3366", icon: "⭐" },
];

function getRank(xp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (xp >= r.xp) rank = r; }
  return rank;
}

function getNextRank(xp: number) {
  for (const r of RANKS) { if (xp < r.xp) return r; }
  return null;
}

function getDifficultyMult(d: string) {
  if (d === "hard") return 2;
  if (d === "medium") return 1.5;
  return 1;
}

function getDifficultyColor(d: string) {
  switch (d) {
    case "easy": return "#00ffff";
    case "medium": return "#ffd700";
    case "hard": return "#ff00ff";
    default: return "#888";
  }
}

function getTimerForDifficulty(d: string) {
  if (d === "easy") return 20;
  if (d === "medium") return 25;
  return 30;
}

interface Wallet {
  xp: number;
  totalCorrect: number;
  totalPlayed: number;
  dailyStreak: number;
  lastPlayedDate: string;
  powerUps: { fiftyFifty: number; skip: number; doubleXp: number };
  bestScore: number;
  bestStreak: number;
  totalXpEarned: number;
  quizzesPlayed: number;
}

function loadWallet(): Wallet {
  try {
    const raw = localStorage.getItem("quizWallet");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        xp: parsed.xp || 0,
        totalCorrect: parsed.totalCorrect || 0,
        totalPlayed: parsed.totalPlayed || 0,
        dailyStreak: parsed.dailyStreak || 0,
        lastPlayedDate: parsed.lastPlayedDate || "",
        powerUps: {
          fiftyFifty: parsed.powerUps?.fiftyFifty ?? 3,
          skip: parsed.powerUps?.skip ?? 1,
          doubleXp: parsed.powerUps?.doubleXp ?? 1,
        },
        bestScore: parsed.bestScore || 0,
        bestStreak: parsed.bestStreak || 0,
        totalXpEarned: parsed.totalXpEarned || 0,
        quizzesPlayed: parsed.quizzesPlayed || 0,
      };
    }
  } catch {}
  return {
    xp: 0, totalCorrect: 0, totalPlayed: 0, dailyStreak: 0, lastPlayedDate: "",
    powerUps: { fiftyFifty: 3, skip: 1, doubleXp: 1 },
    bestScore: 0, bestStreak: 0, totalXpEarned: 0, quizzesPlayed: 0,
  };
}

function saveWallet(wallet: Wallet) {
  localStorage.setItem("quizWallet", JSON.stringify(wallet));
}

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try { ctxRef.current = new AudioContext(); } catch { return null; }
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) => {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  const correct = useCallback(() => { play(880, 0.15); setTimeout(() => play(1100, 0.2), 100); }, [play]);
  const wrong = useCallback(() => { play(200, 0.3, "sawtooth", 0.1); }, [play]);
  const streak = useCallback(() => { play(660, 0.1); setTimeout(() => play(880, 0.1), 80); setTimeout(() => play(1100, 0.15), 160); setTimeout(() => play(1320, 0.2), 240); }, [play]);
  const powerUp = useCallback(() => { play(523, 0.1); setTimeout(() => play(659, 0.1), 100); setTimeout(() => play(784, 0.15), 200); }, [play]);
  const tick = useCallback(() => { play(440, 0.05, "square", 0.05); }, [play]);
  const rankUp = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.12), i * 120));
  }, [play]);

  return { correct, wrong, streak, powerUp, tick, rankUp };
}

function Confetti({ show }: { show: boolean }) {
  const colors = ["#ff00ff", "#00ffff", "#ffd700", "#ff3366", "#00ff7f", "#8a2be2", "#ff6b35", "#00bfff"];
  const shapes = ["circle", "square", "triangle"];
  /* eslint-disable react-hooks/purity */
  const particles = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    width: `${6 + Math.random() * 6}px`,
    height: shapes[i % 3] === "triangle" ? "0" : `${6 + Math.random() * 6}px`,
    animationDuration: `${1.5 + Math.random() * 2}s`,
    animationDelay: `${Math.random() * 0.8}s`,
  })), []);
  /* eslint-enable react-hooks/purity */
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p, i) => {
        const shape = shapes[i % 3];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: p.left,
              top: `-5%`,
              width: p.width,
              height: shape === "triangle" ? "0" : p.height,
              backgroundColor: shape !== "triangle" ? colors[i % colors.length] : "transparent",
              borderRadius: shape === "circle" ? "50%" : shape === "square" ? "2px" : "0",
              borderLeft: shape === "triangle" ? "4px solid transparent" : undefined,
              borderRight: shape === "triangle" ? "4px solid transparent" : undefined,
              borderBottom: shape === "triangle" ? `8px solid ${colors[i % colors.length]}` : undefined,
              animation: `confettiFall ${p.animationDuration} ease-in forwards`,
              animationDelay: p.animationDelay,
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
}

function FloatingXP({ value, show }: { value: number; show: boolean }) {
  if (!show || value <= 0) return null;
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className="text-4xl font-black font-mono"
        style={{
          color: "#ffd700",
          textShadow: "0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)",
          animation: "floatUp 1.5s ease-out forwards",
        }}
      >
        +{value} XP
      </div>
    </div>
  );
}

function StreakMilestone({ streak, show, onDone }: { streak: number; show: boolean; onDone: () => void }) {
  useEffect(() => {
    if (show) { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }
  }, [show, onDone]);
  if (!show || streak < 3) return null;
  const msgs: Record<number, { text: string; color: string }> = {
    3: { text: "🔥 ON FIRE!", color: "#ffa500" },
    5: { text: "🔥🔥 BLAZING!", color: "#ff6600" },
    7: { text: "🔥🔥🔥 UNSTOPPABLE!", color: "#ff3300" },
    10: { text: "⚡ GODLIKE!", color: "#ffd700" },
    15: { text: "💀 LEGENDARY!", color: "#ff00ff" },
  };
  const msg = msgs[streak] || (streak >= 15 ? msgs[15] : msgs[10]);
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="text-center" style={{ animation: "milestonePop 2s ease-out forwards" }}>
        <div className="text-5xl sm:text-7xl font-black" style={{ color: msg.color, textShadow: `0 0 30px ${msg.color}88, 0 0 60px ${msg.color}44` }}>
          {msg.text}
        </div>
        <div className="text-lg font-bold text-white mt-2" style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>
          {streak}x Streak Combo!
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, duration = 1000, prefix = "", suffix = "" }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);
  return <span>{prefix}{display}{suffix}</span>;
}

function RankUpBanner({ newRank, show, onDone }: { newRank: typeof RANKS[0]; show: boolean; onDone: () => void }) {
  useEffect(() => {
    if (show) { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="neon-premium rounded-3xl max-w-sm mx-4" style={{ animation: "rankUpPop 3.5s ease-out forwards" }}>
        <div className="neon-premium-track rounded-3xl" />
        <div className="neon-premium-overlay rounded-[22px]" />
        <div className="neon-premium-content p-8 text-center">
          <div className="text-sm uppercase tracking-widest text-gray-400 mb-2">New Rank Unlocked!</div>
          <div className="text-7xl mb-3">{newRank.icon}</div>
          <div className="text-3xl font-black" style={{ color: newRank.color, textShadow: `0 0 20px ${newRank.color}66` }}>
            {newRank.name}
          </div>
          <div className="text-sm text-gray-400 mt-2">Keep grinding to reach the next rank!</div>
        </div>
      </div>
    </div>
  );
}

function QuestionTransition({ children, questionKey }: { children: React.ReactNode; questionKey: number }) {
  return (
    <div key={questionKey} style={{ animation: "questionSlideIn 0.35s ease-out" }}>
      {children}
    </div>
  );
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
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; correct: boolean; xpEarned: number }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"none" | "correct" | "wrong" | "timeout">("none");
  const [timer, setTimer] = useState(30);
  const [maxTimer, setMaxTimer] = useState(30);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [wallet, setWallet] = useState<Wallet>(loadWallet);
  const [prevRank, setPrevRank] = useState<ReturnType<typeof getRank> | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [floatingXPValue, setFloatingXPValue] = useState(0);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [doubleXpActive, setDoubleXpActive] = useState(false);
  const [streakFire, setStreakFire] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const [newRank, setNewRank] = useState<typeof RANKS[0]>(RANKS[0]);
  const [questionKey, setQuestionKey] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [showCorrectHighlight, setShowCorrectHighlight] = useState(false);
  const answerTimestampRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audio = useAudio();
  const currentQ = questions[currentIndex];

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setLastCorrectAnswer(null);
      setAnswerState("none");
      setEliminated([]);
      setDoubleXpActive(false);
      setShowCorrectHighlight(false);
      setSpeedBonus(0);
      const newQ = questions[currentIndex + 1];
      const t = getTimerForDifficulty(newQ?.difficulty || "medium");
      setTimer(t);
      setMaxTimer(t);
      setQuestionKey((k) => k + 1);
    } else {
      setPhase("result");
      if (startTime) setTotalTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }
  }, [currentIndex, questions.length, startTime, questions]);

  useEffect(() => {
    if (phase !== "playing" || answerState !== "none") {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase, answerState, currentIndex]);

  useEffect(() => {
    if (phase === "playing" && timer === 0 && answerState === "none") {
      audio.wrong();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswerState("timeout");
      setStreak(0);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
      if (currentQ) setLastCorrectAnswer(null);
      setAnswers((a) => [...a, { questionId: currentQ!.id, answer: "⏰ TIME UP", correct: false, xpEarned: 0 }]);
      setTimeout(nextQuestion, 2000);
    }
  }, [timer, phase, answerState, nextQuestion, currentQ, audio]);

  useEffect(() => {
    if (streak >= 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreakFire(true);
      const t = setTimeout(() => setStreakFire(false), 600);
      return () => clearTimeout(t);
    }
  }, [streak]);

  function calcXp(difficulty: string, streakCount: number, isDouble: boolean, speedBonusVal: number): number {
    const base = 10;
    const mult = getDifficultyMult(difficulty);
    const streakBonus = Math.min(streakCount, 10) * 5;
    let total = Math.round((base + streakBonus + speedBonusVal) * mult);
    if (isDouble) total *= 2;
    return total;
  }

  async function startQuiz() {
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      params.set("count", String(count));
      const res = await fetch(`/api/quiz/generate?${params}`);
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) return;
      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setLastCorrectAnswer(null);
      setAnswerState("none");
      setEliminated([]);
      setDoubleXpActive(false);
      setShowCorrectHighlight(false);
      setSpeedBonus(0);
      setXpEarned(0);
      const firstQ = data.questions[0];
      const t = getTimerForDifficulty(firstQ?.difficulty || "medium");
      setTimer(t);
      setMaxTimer(t);
      setStartTime(new Date());
      setQuestionKey(0);
      setPrevRank(getRank(wallet.xp));
      setPhase("playing");
    } catch (e) {
      console.error("Failed to start quiz", e);
    }
  }

  function activatePowerUp(type: "fiftyFifty" | "skip" | "doubleXp") {
    const w = { ...wallet };
    if (w.powerUps[type] <= 0 || answerState !== "none" || !currentQ) return;
    audio.powerUp();

    if (type === "fiftyFifty") {
      w.powerUps.fiftyFifty--;
      setWallet(w);
      saveWallet(w);
      fetch("/api/quiz/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQ.id, options: currentQ.options }),
      })
        .then((r) => r.json())
        .then((data) => setEliminated(data.remove || []))
        .catch(() => {});
    } else if (type === "skip") {
      w.powerUps.skip--;
      setWallet(w);
      saveWallet(w);
      setAnswers((a) => [...a, { questionId: currentQ!.id, answer: "SKIPPED", correct: false, xpEarned: 0 }]);
      nextQuestion();
    } else if (type === "doubleXp") {
      setDoubleXpActive(true);
      w.powerUps.doubleXp--;
      setWallet(w);
      saveWallet(w);
    }
  }

  async function handleAnswer(answer: string) {
    if (answerState !== "none" || !currentQ) return;
    setSelectedAnswer(answer);

    // eslint-disable-next-line react-hooks/purity
    const elapsed = (Date.now() - answerTimestampRef.current) / 1000;
    let spdBonus = 0;
    if (elapsed < 3) spdBonus = 15;
    else if (elapsed < 5) spdBonus = 10;
    else if (elapsed < 8) spdBonus = 5;
    setSpeedBonus(spdBonus);

    try {
      const res = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQ.id, answer }),
      });
      const data = await res.json();
      setLastCorrectAnswer(data.correctAnswer);

      if (data.correct) {
        audio.correct();
        setAnswerState("correct");
        setShowCorrectHighlight(true);
        setScore((s) => s + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setBestStreak((b) => Math.max(b, newStreak));

        const earned = calcXp(currentQ.difficulty, newStreak, doubleXpActive, spdBonus);
        setXpEarned((prev) => prev + earned);
        setFloatingXPValue(earned);
        setShowFloatingXP(true);
        setTimeout(() => setShowFloatingXP(false), 1500);

        if (newStreak >= 3 && newStreak % 2 === 1) {
          audio.streak();
          setShowMilestone(true);
        }
      } else {
        audio.wrong();
        setAnswerState("wrong");
        setShowCorrectHighlight(true);
        setStreak(0);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
      }
      setAnswers((a) => [...a, { questionId: currentQ!.id, answer, correct: data.correct, xpEarned: data.correct ? calcXp(currentQ.difficulty, streak + 1, doubleXpActive, spdBonus) : 0 }]);
      setTimeout(nextQuestion, 1800);
    } catch {
      audio.wrong();
      setAnswerState("wrong");
      setStreak(0);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
      setAnswers((a) => [...a, { questionId: currentQ!.id, answer, correct: false, xpEarned: 0 }]);
      setTimeout(nextQuestion, 1800);
    }
  }

  function finishQuiz() {
    const w = { ...wallet };
    w.xp += xpEarned;
    w.totalCorrect += score;
    w.totalPlayed += questions.length;
    w.totalXpEarned += xpEarned;
    w.quizzesPlayed += 1;

    const today = new Date().toISOString().split("T")[0];
    if (w.lastPlayedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      w.dailyStreak = w.lastPlayedDate === yesterday ? w.dailyStreak + 1 : 1;
      w.lastPlayedDate = today;
    }

    if (score > w.bestScore) w.bestScore = score;
    if (bestStreak > w.bestStreak) w.bestStreak = bestStreak;

    if (score >= 8) w.powerUps.fiftyFifty += 1;
    if (score >= 5) w.powerUps.skip += 1;
    if (bestStreak >= 5) w.powerUps.doubleXp += 1;
    if (score === questions.length) {
      w.powerUps.fiftyFifty += 2;
      w.powerUps.doubleXp += 1;
    }

    const oldRank = prevRank || getRank(w.xp - xpEarned);
    const newRankVal = getRank(w.xp);
    if (newRankVal.name !== oldRank.name) {
      setNewRank(newRankVal);
      setShowRankUp(true);
      audio.rankUp();
    }

    setWallet(w);
    saveWallet(w);

    if (score >= questions.length * 0.8 || bestStreak >= 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }

  useEffect(() => {
    if (phase === "result") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      finishQuiz();
      fetch("/api/quiz/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: questions[0]?.category || "General",
          difficulty: questions[0]?.difficulty || "medium",
          score,
          totalQuestions: questions.length,
          timeTaken: Math.floor((Date.now() - (startTime?.getTime() || Date.now())) / 1000),
          xpEarned,
          isDaily: false,
        }),
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "playing") {
      answerTimestampRef.current = Date.now();
    }
  }, [currentIndex, phase]);

  const walletRef = useRef(wallet);
  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  if (phase === "start") {
    const rank = getRank(wallet.xp);
    const nextRank = getNextRank(wallet.xp);
    const progress = nextRank ? ((wallet.xp - rank.xp) / (nextRank.xp - rank.xp)) * 100 : 100;

    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <div className="neon-premium rounded-2xl mb-6">
          <div className="neon-premium-track rounded-2xl" />
          <div className="neon-premium-overlay rounded-[14.5px]" />
          <div className="neon-premium-content p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{rank.icon}</div>
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Current Rank</p>
                <p className="text-xl font-bold" style={{ color: rank.color }}>{rank.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono text-[#ffd700]" style={{ textShadow: "0 0 10px rgba(255,215,0,0.3)" }}>{wallet.xp}</p>
                <p className="text-[10px] text-gray-500">TOTAL XP</p>
              </div>
            </div>
            {nextRank && (
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{rank.name}</span>
                  <span>{nextRank.name} ({nextRank.xp} XP)</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})` }} />
                </div>
              </div>
            )}
            <div className="flex justify-around mt-4 text-center">
              <div><p className="text-sm font-bold text-[#00ffff]">{wallet.totalCorrect}</p><p className="text-[9px] text-gray-500">Correct</p></div>
              <div><p className="text-sm font-bold text-[#ff00ff]">{wallet.totalPlayed}</p><p className="text-[9px] text-gray-500">Played</p></div>
              <div><p className="text-sm font-bold text-[#ffd700]">🔥 {wallet.dailyStreak}</p><p className="text-[9px] text-gray-500">Day Streak</p></div>
              <div><p className="text-sm font-bold text-[#00ff7f]">{wallet.bestScore}</p><p className="text-[9px] text-gray-500">Best</p></div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {[
            { key: "fiftyFifty" as const, label: "50:50", icon: "✂️", count: wallet.powerUps.fiftyFifty, desc: "Remove 2 wrong" },
            { key: "skip" as const, label: "Skip", icon: "⏭️", count: wallet.powerUps.skip, desc: "Skip question" },
            { key: "doubleXp" as const, label: "2x XP", icon: "⚡", count: wallet.powerUps.doubleXp, desc: "Double XP" },
          ].map((p) => (
            <div key={p.key} className="neon-premium rounded-xl flex-1">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-3 text-center">
                <span className="text-lg">{p.icon}</span>
                <p className="text-[10px] font-bold text-white mt-1">{p.label}</p>
                <p className="text-xs font-mono font-bold text-[#ffd700]">×{p.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="neon-premium rounded-2xl">
          <div className="neon-premium-track rounded-2xl" />
          <div className="neon-premium-overlay rounded-[14.5px]" />
          <div className="neon-premium-content p-6 sm:p-8">
            <span className="text-3xl block mb-3">🎮</span>
            <h2 className="font-display text-2xl font-bold mb-1">Ready to Play?</h2>
            <p className="text-sm text-gray-400 mb-6">Choose your settings and start earning XP</p>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm outline-none focus:border-[#8a2be2] text-white"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button key={d.value} onClick={() => setDifficulty(d.value)}
                      className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all border"
                      style={{
                        borderColor: difficulty === d.value ? getDifficultyColor(d.value) : "rgba(255,255,255,0.1)",
                        color: difficulty === d.value ? getDifficultyColor(d.value) : "#666",
                        background: difficulty === d.value ? `${getDifficultyColor(d.value)}11` : "transparent",
                        boxShadow: difficulty === d.value ? `0 0 10px ${getDifficultyColor(d.value)}22` : "none",
                      }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Questions</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button key={n} onClick={() => setCount(n)}
                      className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all border"
                      style={{
                        borderColor: count === n ? "#8a2be2" : "rgba(255,255,255,0.1)",
                        color: count === n ? "#8a2be2" : "#666",
                        background: count === n ? "rgba(138,43,226,0.1)" : "transparent",
                      }}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={startQuiz}
              className="mt-6 w-full rounded-xl py-3.5 text-base font-bold transition-all border hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(138,43,226,0.2), rgba(255,0,255,0.1))",
                borderColor: "#8a2be2",
                color: "#8a2be2",
                boxShadow: "0 0 30px rgba(138,43,226,0.3)",
              }}
            >🚀 Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    let grade = "F";
    let gradeColor = "#ff3366";
    if (pct >= 90) { grade = "S"; gradeColor = "#ffd700"; }
    else if (pct >= 80) { grade = "A"; gradeColor = "#00ffff"; }
    else if (pct >= 70) { grade = "B"; gradeColor = "#00ff7f"; }
    else if (pct >= 60) { grade = "C"; gradeColor = "#8a2be2"; }
    else if (pct >= 50) { grade = "D"; gradeColor = "#ffa500"; }

    const finalRank = getRank(wallet.xp);
    const isNewBest = score >= wallet.bestScore && score > 0;
    const totalSpeedBonus = answers.reduce((sum, a) => sum + a.xpEarned, 0);

    const xpBreakdown = answers.filter((a) => a.correct).reduce((acc, a) => {
      const base = Math.round(a.xpEarned / (doubleXpActive ? 2 : 1));
      acc.base += base;
      return acc;
    }, { base: 0 });

    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <Confetti show={showConfetti} />
        <RankUpBanner newRank={newRank} show={showRankUp} onDone={() => setShowRankUp(false)} />
        <FloatingXP value={floatingXPValue} show={showFloatingXP} />

        <div className="neon-premium rounded-2xl">
          <div className="neon-premium-track rounded-2xl" />
          <div className="neon-premium-overlay rounded-[14.5px]" />
          <div className="neon-premium-content p-8 text-center">
            <div className="text-8xl font-black font-mono mb-2" style={{ color: gradeColor, textShadow: `0 0 40px ${gradeColor}66, 0 0 80px ${gradeColor}33` }}>
              {grade}
            </div>
            <h2 className="font-display text-2xl font-bold mb-1">
              {pct >= 90 ? "LEGENDARY!" : pct >= 80 ? "AMAZING!" : pct >= 70 ? "GREAT JOB!" : pct >= 50 ? "NOT BAD!" : "KEEP TRYING!"}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {pct >= 90 ? "You're a true anime master! 🔥" : pct >= 70 ? "Keep pushing for that S rank! 💪" : pct >= 50 ? "You're getting better every time! 🎯" : "Practice makes perfect! 📚"}
            </p>

            {isNewBest && (
              <div className="inline-block rounded-full px-4 py-1.5 mb-4 text-xs font-bold"
                style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)", animation: "pulse 2s infinite" }}>
                ⭐ NEW PERSONAL BEST!
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-xl font-bold font-mono text-[#00ffff]">
                  <AnimatedNumber value={score} duration={800} suffix={`/${questions.length}`} />
                </div>
                <div className="text-[9px] text-gray-500 uppercase">Score</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-xl font-bold font-mono text-[#ffd700]">
                  <AnimatedNumber value={xpEarned} duration={1000} />
                </div>
                <div className="text-[9px] text-gray-500 uppercase">XP Earned</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-xl font-bold font-mono text-[#ff00ff]">
                  <AnimatedNumber value={totalTime} duration={600} suffix="s" />
                </div>
                <div className="text-[9px] text-gray-500 uppercase">Time</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-xl font-bold font-mono text-[#ff3366]">
                  <AnimatedNumber value={bestStreak} duration={600} />
                </div>
                <div className="text-[9px] text-gray-500 uppercase">Best Streak</div>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{finalRank.icon}</span>
                  <div className="text-left">
                    <p className="text-sm font-bold" style={{ color: finalRank.color }}>{finalRank.name}</p>
                    <p className="text-[10px] text-gray-500">{wallet.xp} Total XP</p>
                  </div>
                </div>
                <div className="text-right">
                  {wallet.dailyStreak > 1 && <p className="text-sm font-bold text-[#ffd700]">🔥 {wallet.dailyStreak} Day Streak!</p>}
                  {pct === 100 && <p className="text-xs font-bold text-[#ff00ff]">💯 PERFECT!</p>}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4 text-left">
              <p className="text-[10px] text-gray-500 uppercase mb-2">XP Breakdown</p>
              <div className="space-y-1 text-xs">
                {speedBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#00ffff]">⚡ Speed Bonus</span>
                    <span className="font-mono text-[#00ffff]">+{speedBonus}</span>
                  </div>
                )}
                {bestStreak >= 5 && (
                  <div className="flex justify-between">
                    <span className="text-[#ffa500]">🔥 Streak Bonus (Best: {bestStreak}x)</span>
                    <span className="font-mono text-[#ffa500]">+{Math.min(bestStreak, 10) * 5}</span>
                  </div>
                )}
                {doubleXpActive && (
                  <div className="flex justify-between">
                    <span className="text-[#ffd700]">⚡ Double XP Active</span>
                    <span className="font-mono text-[#ffd700]">×2</span>
                  </div>
                )}
              </div>
            </div>

            {(score >= 5 || bestStreak >= 5 || score === questions.length) && (
              <div className="rounded-xl bg-[#ffd700]/5 border border-[#ffd700]/20 p-3 mb-6">
                <p className="text-xs font-bold text-[#ffd700] mb-2">🎁 Power-ups Earned!</p>
                <div className="flex justify-center gap-3 text-xs text-gray-400">
                  {score >= 8 && <span>✂️ +1 50:50</span>}
                  {score >= 5 && <span>⏭️ +1 Skip</span>}
                  {bestStreak >= 5 && <span>⚡ +1 2x XP</span>}
                  {score === questions.length && <span className="text-[#ffd700]">🏆 PERFECT BONUS!</span>}
                </div>
              </div>
            )}

            <div className="space-y-1.5 mb-6 text-left max-h-52 overflow-y-auto">
              {answers.map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: a.correct ? "rgba(0,255,127,0.08)" : "rgba(255,51,102,0.08)",
                    color: a.correct ? "#00ff7f" : "#ff3366",
                  }}
                >
                  <span className="font-mono w-5">{a.correct ? "✓" : "✗"}</span>
                  <span className="flex-1 truncate">Q{i + 1}</span>
                  {a.xpEarned > 0 && <span className="font-mono text-[#ffd700]">+{a.xpEarned}</span>}
                  {a.answer === "SKIPPED" && <span className="text-gray-500 italic">Skipped</span>}
                  {a.answer === "⏰ TIME UP" && <span className="text-gray-500">Time up</span>}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={startQuiz}
                className="flex-1 rounded-xl py-3 text-sm font-bold border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, rgba(138,43,226,0.2), rgba(255,0,255,0.1))", borderColor: "#8a2be2", color: "#8a2be2", boxShadow: "0 0 20px rgba(138,43,226,0.2)" }}
              >🔄 Play Again</button>
              <button onClick={() => setPhase("start")}
                className="flex-1 rounded-xl py-3 text-sm font-bold border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "#888" }}
              >⚙️ Change Settings</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return <div className="p-8 text-center text-sm text-gray-500">Loading...</div>;

  const timerPct = maxTimer > 0 ? (timer / maxTimer) * 100 : 0;
  const timerColor = timer > 15 ? "#00ffff" : timer > 7 ? "#ffd700" : "#ff3366";
  const currentXP = calcXp(currentQ.difficulty, streak, doubleXpActive, speedBonus);
  const comboMultiplier = streak >= 10 ? "3.0x" : streak >= 7 ? "2.5x" : streak >= 5 ? "2.0x" : streak >= 3 ? "1.5x" : "1.0x";

  return (
    <div
      className={`mx-auto max-w-2xl px-4 py-6 transition-transform ${screenShake ? "quiz-shake" : ""}`}
      style={{ animation: screenShake ? "screenShake 0.5s ease-in-out" : undefined }}
    >
      <FloatingXP value={floatingXPValue} show={showFloatingXP} />
      <StreakMilestone streak={streak} show={showMilestone} onDone={() => setShowMilestone(false)} />

      <div className={`mb-6 ${timer <= 10 && answerState === "none" ? "quiz-timer-urgent" : ""}`}>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timerPct}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}dd)`,
              boxShadow: `0 0 12px ${timerColor}88, 0 0 24px ${timerColor}44`,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 font-medium">Question {currentIndex + 1} / {questions.length}</span>
          <div className="flex items-center gap-3">
            {streak >= 3 && (
              <span className="text-xs font-bold" style={{ color: streak >= 5 ? "#ffd700" : "#ffa500" }}>
                {comboMultiplier}
              </span>
            )}
            <span className="font-mono text-sm font-bold" style={{
              color: timerColor,
              textShadow: timer <= 10 ? `0 0 12px ${timerColor}` : undefined,
              animation: timer <= 5 ? "timerPulse 0.5s ease-in-out infinite" : undefined,
            }}>
              {timer}s
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
            <span className="text-xs text-gray-500">Score </span>
            <span className="font-mono text-sm font-bold text-[#00ffff]">{score}</span>
          </div>
          {streak > 0 && (
            <div className="rounded-lg px-3 py-1.5" style={{
              background: streak >= 5 ? "rgba(255,215,0,0.15)" : "rgba(255,165,0,0.1)",
              border: `1px solid ${streak >= 5 ? "rgba(255,215,0,0.4)" : "rgba(255,165,0,0.25)"}`,
              boxShadow: streak >= 5 ? "0 0 12px rgba(255,215,0,0.2)" : undefined,
            }}>
              <span className="text-xs font-bold" style={{ color: streak >= 5 ? "#ffd700" : "#ffa500" }}>
                🔥 x{streak}
              </span>
            </div>
          )}
          {doubleXpActive && (
            <div className="rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#ffd700] border border-[#ffd700]/30 bg-[#ffd700]/10">
              ⚡ 2x
            </div>
          )}
          <div className="rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 px-3 py-1.5">
            <span className="text-xs font-bold text-[#ffd700]">+{currentXP} XP</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border px-2 py-1 text-[10px] font-bold" style={{ color: getDifficultyColor(currentQ.difficulty), borderColor: `${getDifficultyColor(currentQ.difficulty)}33` }}>
            {currentQ.difficulty.toUpperCase()}
          </span>
          <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-gray-500">{currentQ.category}</span>
        </div>
      </div>

      <QuestionTransition questionKey={questionKey}>
        <div className="neon-premium rounded-2xl mb-4">
          <div className="neon-premium-track rounded-2xl" />
          <div className="neon-premium-overlay rounded-[14.5px]" />
          <div className="neon-premium-content p-6">
            {currentQ.animeTitle && (
              <p className="text-[10px] uppercase tracking-wider text-[#8a2be2] mb-2 font-mono">{currentQ.animeTitle}</p>
            )}
            <h3 className="font-display text-lg font-bold leading-relaxed">{currentQ.question}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4">
          {currentQ.options.map((opt, i) => {
            if (eliminated.includes(opt)) {
              return (
                <div key={i} className="w-full text-left rounded-xl border border-white/5 px-5 py-3.5 text-sm font-medium text-gray-700 line-through opacity-40 cursor-not-allowed">
                  <span className="mr-3 font-mono text-gray-700">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </div>
              );
            }

            let borderColor = "rgba(255,255,255,0.1)";
            let bgColor = "transparent";
            let textColor = "white";

            if (answerState !== "none" && selectedAnswer === opt) {
              if (answerState === "correct") {
                borderColor = "#00ff7f";
                bgColor = "rgba(0,255,127,0.1)";
                textColor = "#00ff7f";
              } else {
                borderColor = "#ff3366";
                bgColor = "rgba(255,51,102,0.1)";
                textColor = "#ff3366";
              }
            } else if (showCorrectHighlight && opt === lastCorrectAnswer) {
              borderColor = "#00ff7f";
              bgColor = "rgba(0,255,127,0.08)";
              textColor = "#00ff7f";
            }

            const isDisabled = answerState !== "none";

            return (
              <button key={i} onClick={() => handleAnswer(opt)}
                disabled={isDisabled}
                className="w-full text-left rounded-xl border px-5 py-3.5 text-sm font-medium transition-all active:scale-[0.98]"
                style={{
                  borderColor,
                  background: bgColor,
                  color: textColor,
                  cursor: isDisabled ? "default" : "pointer",
                  boxShadow: answerState === "correct" && selectedAnswer === opt ? "0 0 20px rgba(0,255,127,0.2)" : answerState !== "none" && selectedAnswer === opt ? "0 0 20px rgba(255,51,102,0.2)" : undefined,
                }}
              >
                <span className="mr-3 font-mono" style={{ color: answerState !== "none" ? textColor : "#666" }}>{String.fromCharCode(65 + i)}.</span>
                {opt}
                {showCorrectHighlight && opt === lastCorrectAnswer && selectedAnswer !== opt && (
                  <span className="ml-2 text-[10px] font-bold text-[#00ff7f]">← Correct</span>
                )}
              </button>
            );
          })}
        </div>

        {answerState !== "none" && lastCorrectAnswer && answerState !== "correct" && selectedAnswer !== lastCorrectAnswer && (
          <div className="rounded-lg border border-[#00ff7f]/20 bg-[#00ff7f]/5 px-4 py-2.5 mb-4 text-xs text-left">
            <span className="text-[#00ff7f] font-bold">Correct answer: </span>
            <span className="text-[#00ff7f]">{lastCorrectAnswer}</span>
          </div>
        )}

        {answerState === "none" && (
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { key: "fiftyFifty" as const, icon: "✂️", label: "50:50", count: wallet.powerUps.fiftyFifty },
              { key: "skip" as const, icon: "⏭️", label: "Skip", count: wallet.powerUps.skip },
              { key: "doubleXp" as const, icon: "⚡", label: "2x", count: wallet.powerUps.doubleXp },
            ].filter((p) => p.count > 0).map((p) => (
              <button key={p.key} onClick={() => activatePowerUp(p.key)}
                className="rounded-lg border px-5 py-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  borderColor: "rgba(255,215,0,0.3)",
                  background: p.key === "doubleXp" && doubleXpActive ? "rgba(255,215,0,0.15)" : "rgba(255,215,0,0.05)",
                  color: "#ffd700",
                }}
              >
                {p.icon} {p.label} <span className="text-[10px] opacity-60">×{p.count}</span>
              </button>
            ))}
          </div>
        )}
      </QuestionTransition>

      {streakFire && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute bottom-0 left-0 right-0 h-40"
            style={{
              background: streak >= 5
                ? "linear-gradient(to top, rgba(255,215,0,0.12), transparent)"
                : "linear-gradient(to top, rgba(255,165,0,0.08), transparent)",
              animation: "streakGlow 0.6s ease-out",
            }}
          />
        </div>
      )}
    </div>
  );
}
