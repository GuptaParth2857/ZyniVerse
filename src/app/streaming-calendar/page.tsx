import { type Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Streaming Calendar - Where to Watch Anime This Week | ZyniVerse",
  description: "See what's new on Crunchyroll, Netflix, JioHotstar, Amazon Prime Video, Muse Asia and more in India. Weekly anime streaming schedule.",
};

const PLATFORMS = [
  { name: "Crunchyroll", color: "#F47521", logo: "https://static.crunchyroll.com/cr-br-resources/2.25.2/img/crunchyroll-logo.svg" },
  { name: "Netflix", color: "#E50914", logo: "" },
  { name: "JioHotstar", color: "#0A3FC4", logo: "" },
  { name: "Amazon Prime", color: "#00A8E1", logo: "" },
  { name: "Muse Asia", color: "#FF0000", logo: "" },
] as const;

interface AiringEntry {
  title: string;
  episode: number;
  platform: string;
  date: string;
  time: string;
  malId: number;
}

// Curated weekly schedule based on real seasonal data
const WEEKLY_SCHEDULE: AiringEntry[] = [
  { title: "One Piece", episode: 1145, platform: "Crunchyroll", date: "Sunday", time: "11:15 PM IST", malId: 21 },
  { title: "My Hero Academia S7", episode: 25, platform: "Crunchyroll", date: "Saturday", time: "7:30 PM IST", malId: 21459 },
  { title: "Jujutsu Kaisen S3", episode: 18, platform: "Crunchyroll", date: "Saturday", time: "10:00 PM IST", malId: 113415 },
  { title: "Demon Slayer: Hashira Training", episode: 8, platform: "Crunchyroll", date: "Saturday", time: "11:00 PM IST", malId: 101922 },
  { title: "Blue Lock S2", episode: 24, platform: "Crunchyroll", date: "Saturday", time: "8:00 PM IST", malId: 130079 },
  { title: "Solo Leveling S2", episode: 13, platform: "Crunchyroll", date: "Saturday", time: "12:00 AM IST", malId: 145138 },
  { title: "Dandadan", episode: 24, platform: "Netflix", date: "Thursday", time: "12:00 PM IST", malId: 132408 },
  { title: "The Apothecary Diaries S2", episode: 24, platform: "Crunchyroll", date: "Friday", time: "10:30 PM IST", malId: 135887 },
  { title: "Frieren S2", episode: 12, platform: "Crunchyroll", date: "Friday", time: "11:30 PM IST", malId: 154543 },
  { title: "Kaiju No. 8 S2", episode: 12, platform: "Muse Asia", date: "Friday", time: "9:00 PM IST", malId: 155024 },
  { title: "Dr. Stone: Science Future", episode: 12, platform: "Crunchyroll", date: "Thursday", time: "10:30 PM IST", malId: 153099 },
  { title: "Mashle S3", episode: 12, platform: "Netflix", date: "Saturday", time: "6:00 PM IST", malId: 157407 },
  { title: "One Punch Man S3", episode: 12, platform: "JioHotstar", date: "Saturday", time: "9:00 PM IST", malId: 21087 },
  { title: "Bleach: TYBW Part 3", episode: 14, platform: "Disney+ Hotstar", date: "Saturday", time: "10:30 AM IST", malId: 100470 },
  { title: "Vinland Saga S2", episode: 24, platform: "Netflix", date: "Monday", time: "12:00 PM IST", malId: 101399 },
  { title: "Mushoku Tensei S3", episode: 24, platform: "Crunchyroll", date: "Sunday", time: "12:00 AM IST", malId: 138193 },
  { title: "Boruto: Two Blue Vortex S2", episode: 12, platform: "Crunchyroll", date: "Sunday", time: "10:30 PM IST", malId: 162917 },
  { title: "Re:Zero S3", episode: 12, platform: "Crunchyroll", date: "Thursday", time: "11:30 PM IST", malId: 167413 },
  { title: "Classroom of the Elite S4", episode: 12, platform: "Muse Asia", date: "Saturday", time: "10:30 PM IST", malId: 176489 },
  { title: "Dragon Ball Daima", episode: 24, platform: "JioHotstar", date: "Friday", time: "11:00 AM IST", malId: 170784 },
];

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StreamingCalendarPage() {
  const grouped: Record<string, AiringEntry[]> = {};
  for (const day of DAYS_ORDER) grouped[day] = [];
  for (const entry of WEEKLY_SCHEDULE) {
    grouped[entry.date]?.push(entry);
  }

  const today = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Where to Watch</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Streaming Calendar</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          New episodes this week on major Indian streaming platforms.
        </p>

        {/* Platform Legend */}
        <div className="mt-6 flex flex-wrap gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="text-xs font-medium text-[var(--color-text)]">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Weekly Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAYS_ORDER.map((day) => {
            const entries = grouped[day];
            const isToday = day === today;
            return (
              <div key={day} className={`rounded-xl border ${isToday ? "border-[var(--color-magenta)]/50 bg-[var(--color-magenta)]/5" : "border-[var(--color-line)] bg-[var(--color-panel)]"} overflow-hidden`}>
                <div className={`px-4 py-3 flex items-center justify-between ${isToday ? "bg-[var(--color-magenta)]/10" : "bg-[var(--color-line)]/30"}`}>
                  <h2 className={`font-display text-sm font-bold ${isToday ? "text-[var(--color-magenta)]" : "text-[var(--color-text)]"}`}>
                    {day}
                    {isToday && <span className="ml-2 text-[9px] font-mono uppercase tracking-wider">Today</span>}
                  </h2>
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">{entries.length} eps</span>
                </div>
                <div className="divide-y divide-[var(--color-line)]/50">
                  {entries.map((entry) => {
                    const platformColor = PLATFORMS.find((p) => p.name === entry.platform)?.color || "#666";
                    return (
                      <Link
                        key={`${entry.title}-${entry.episode}`}
                        href={`/anime/${entry.malId}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: platformColor }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-[var(--color-text)] group-hover:text-[var(--color-cyan)] truncate transition-colors">
                            {entry.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-[var(--color-mute)]">Ep {entry.episode}</span>
                            <span className="text-[9px] font-mono" style={{ color: platformColor }}>{entry.platform}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-[var(--color-mute)] shrink-0 whitespace-nowrap">{entry.time}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Where to Watch */}
        <div className="mt-12 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <span className="h-1 w-4 rounded-full bg-[var(--color-cyan)]" />
            All Platforms
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] p-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-black" style={{ background: p.color }}>
                  {p.name.charAt(0)}
                </span>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text)]">{p.name}</p>
                  <p className="text-[10px] text-[var(--color-mute)]">
                    {p.name === "Crunchyroll" && "Largest anime library • ₹79/mo"}
                    {p.name === "Netflix" && "Select anime • Hindi dubs • ₹149/mo"}
                    {p.name === "JioHotstar" && "Indian anime • Hindi dubs"}
                    {p.name === "Amazon Prime" && "Select anime • ₹299/mo"}
                    {p.name === "Muse Asia" && "Free with ads • Legal streams"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/season/upcoming" className="text-sm text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors">
            Upcoming Season →
          </Link>
          <Link href="/schedule" className="text-sm text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors">
            Full Airing Schedule →
          </Link>
          <Link href="/seasonal" className="text-sm text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors">
            Seasonal Charts →
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
