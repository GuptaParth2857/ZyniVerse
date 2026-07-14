import Link from "next/link";
import type { Metadata } from "next";
import NativeBannerAd from "@/components/NativeBannerAd";

export const metadata: Metadata = {
  title: "Anime Quiz — Test Your Knowledge | ZyniVerse",
  description: "Challenge yourself with anime trivia quizzes. Earn XP, climb ranks, and become the ultimate anime quiz champion!",
};

const CATEGORIES = [
  { name: "General", desc: "Classics to modern hits", color: "#00ffff", icon: "🌐" },
  { name: "Characters", desc: "Identify your favorites", color: "#ff00ff", icon: "🎭" },
  { name: "Plot", desc: "Storylines and arcs", color: "#8a2be2", icon: "📖" },
  { name: "Studio", desc: "Who made what", color: "#ffd700", icon: "🎬" },
  { name: "Music", desc: "OPs, EDs & OSTs", color: "#ff3366", icon: "🎵" },
  { name: "Voice Actors", desc: "Seiyuu trivia", color: "#00ff7f", icon: "🎙️" },
];

const RANKS = [
  { name: "Bronze", xp: 0, color: "#cd7f32", icon: "🥉" },
  { name: "Silver", xp: 500, color: "#c0c0c0", icon: "🥈" },
  { name: "Gold", xp: 1500, color: "#ffd700", icon: "🥇" },
  { name: "Platinum", xp: 3500, color: "#00ffff", icon: "💎" },
  { name: "Diamond", xp: 7000, color: "#ff00ff", icon: "👑" },
  { name: "Legend", xp: 15000, color: "#ff3366", icon: "⭐" },
];

export default function QuizPage() {
  return (
    <div className="min-h-screen animate-page-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#8a2be2]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#ff00ff]/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ffd700]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(138,43,226,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-premium rounded-xl h-12 w-12">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-2xl">🎮</span>
                  </div>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a2be2]" style={{ textShadow: "0 0 10px rgba(138,43,226,0.5)" }}>Mini Game</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 0 30px rgba(138,43,226,0.3), 0 0 60px rgba(255,0,255,0.2)" }}>
                Anime <span className="text-[#8a2be2]">Quiz</span>
              </h1>
              <p className="mt-3 text-base text-gray-400 max-w-lg">
                Test your anime knowledge, earn XP, climb ranks, and become the ultimate quiz champion!
              </p>
            </div>

            <Link href="/quiz/play">
              <div className="neon-premium rounded-xl">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#8a2be2" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Quick Play
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8a2be2] to-transparent shadow-[0_0_10px_rgba(138,43,226,0.5)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Daily Quiz */}
        <div className="neon-premium rounded-2xl mb-8">
          <div className="neon-premium-track rounded-2xl" />
          <div className="neon-premium-overlay rounded-[14.5px]" />
          <div className="neon-premium-content p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="neon-premium rounded-xl h-14 w-14 shrink-0">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-xl font-bold">Daily Challenge</h2>
                  <span className="text-[10px] font-bold bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/30 px-2 py-0.5 rounded-full">+50 XP BONUS</span>
                </div>
                <p className="text-sm text-gray-400">5 questions — same for everyone. Compete for the best score and earn bonus XP!</p>
              </div>
              <Link href="/quiz/daily">
                <div className="neon-premium rounded-xl shrink-0">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#ffd700" }}>
                    Play Daily
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Rank System */}
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-[#ffd700]">👑</span> Rank Progression
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
          {RANKS.map((rank) => (
            <div key={rank.name} className="neon-premium rounded-xl">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-3 text-center">
                <span className="text-2xl block mb-1">{rank.icon}</span>
                <p className="text-[11px] font-bold" style={{ color: rank.color }}>{rank.name}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">{rank.xp > 0 ? `${rank.xp} XP` : "Start"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-[#ff00ff]">⚡</span> Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/quiz/play?category=${cat.name}`}>
              <div className="neon-premium rounded-xl h-full">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <div className="neon-premium-content p-4 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cat.icon}</span>
                    <h3 className="font-display font-bold text-sm" style={{ color: cat.color }}>{cat.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{cat.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How XP Works */}
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-[#00ffff]">✨</span> How XP Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: "Correct Answer", desc: "+10 XP per correct answer", color: "#00ff7f", icon: "✓" },
            { title: "Streak Bonus", desc: "+5 XP extra per streak level", color: "#ffd700", icon: "🔥" },
            { title: "Difficulty Multiplier", desc: "Easy 1x | Medium 1.5x | Hard 2x", color: "#ff3366", icon: "⚡" },
          ].map((item) => (
            <div key={item.title} className="neon-premium rounded-xl">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-4">
                <span className="text-lg mb-2 block">{item.icon}</span>
                <h3 className="font-display font-bold text-sm mb-1" style={{ color: item.color }}>{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div>
  );
}
