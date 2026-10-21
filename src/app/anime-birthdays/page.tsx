import type { Metadata } from "next";
import Link from "next/link";
import {
  ANIME_BIRTHDAYS,
  birthdaysOn,
  dayLabel,
  upcomingBirthdays,
  monthName,
  BIRTHDAY_MONTHS,
  type AnimeBirthday,
} from "@/lib/anime-birthdays";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 43200;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Birthdays Calendar — Today & This Week (2026)",
  description:
    "Which anime character has a birthday today? Browse the 2026 anime birthday calendar — today's anime birthdays, this week's birthdays and every month, with series info.",
  keywords: [
    "anime birthdays", "anime character birthdays", "today anime birthdays",
    "naruto birthday", "luffy birthday", "gojo birthday", "levi birthday",
    "anime characters born today", "this week anime birthdays", "anime birthday calendar",
  ],
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Birthdays — Today & This Week",
    description: "Today's anime birthdays and the full 2026 calendar — Naruto, Luffy, Gojo, Levi and more.",
    url: `${BASE_URL}/anime-birthdays`,
    type: "website",
    siteName: "ZyniVerse",
  },
  alternates: { canonical: `${BASE_URL}/anime-birthdays` },
  robots: { index: true, follow: true },
};

function BirthdayChip({ b, date }: { b: AnimeBirthday; date?: Date }) {
  return (
    <div className="flex flex-col justify-between gap-1 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4">
      <div>
        <p className="font-semibold text-white" style={b.color ? { color: b.color } : undefined}>
          {b.name}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-mute)]">{b.anime}</p>
      </div>
      {date && (
        <p className="font-mono text-[11px] text-[var(--color-cyan)]">
          🎂 {b.month} / {b.day}
        </p>
      )}
    </div>
  );
}

export default function AnimeBirthdaysPage() {
  const now = new Date();
  const todayMsg = dayLabel(now);
  const today = birthdaysOn(now.getMonth() + 1, now.getDate());
  const upcoming = upcomingBirthdays(now, 7);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Anime birthdays on ${todayMsg}`,
    description: "Anime character birthdays happening today and this week.",
    url: `${BASE_URL}/anime-birthdays`,
    itemListElement: ANIME_BIRTHDAYS.slice(0, 30).map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${b.name} (${b.anime})`,
      url: `${BASE_URL}/anime-birthdays`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Anime Birthdays</span>
        </nav>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Anime Birthday Calendar · Today: {todayMsg}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Anime Birthdays — Who Was Born Today?
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
            Every day, a famous anime character has a birthday. Here&apos;s today&apos;s batch plus the full
            2026 calendar across Naruto, One Piece, Demon Slayer, Attack on Titan, Jujutsu Kaisen and more.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="font-display text-lg font-bold mb-3">🎂 Today — {todayMsg}</h2>
          {today.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {today.map((b) => (
                <BirthdayChip key={`${b.name}-${b.month}-${b.day}`} b={b} date={now} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 text-sm text-[var(--color-mute)]">
              No major character birthdays on our roster today — check the full calendar below or the
              next 7 days.
            </p>
          )}
        </section>

        <section className="mb-10">
          <h2 className="font-display text-lg font-bold mb-3">📅 This week</h2>
          {upcoming.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(({ birthday, date }) => (
                <BirthdayChip
                  key={`${birthday.name}-${date.getMonth()}-${date.getDate()}`}
                  b={birthday}
                  date={date}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 text-sm text-[var(--color-mute)]">
              Quiet week on the roster.
            </p>
          )}
        </section>

        <section className="mb-10">
          <h2 className="font-display text-lg font-bold mb-3">🗓️ Full 2026 calendar</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BIRTHDAY_MONTHS.map((m) => {
              const items = ANIME_BIRTHDAYS.filter((b) => b.month === m).sort((a, b) => a.day - b.day);
              return (
                <div key={m} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                  <p className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-cyan)]">
                    {monthName(m)}
                  </p>
                  {items.length > 0 ? (
                    <ul className="space-y-2">
                      {items.map((b) => (
                        <li key={b.name} className="flex items-baseline justify-between gap-2 text-xs">
                          <span className="text-[var(--color-ink)]">{b.name}</span>
                          <span className="text-[var(--color-mute)]">
                            {b.day} · {b.anime}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[var(--color-mute)]">No roster rows</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-10">
          <NativeBannerAd />
        </div>
      </div>
    </>
  );
}