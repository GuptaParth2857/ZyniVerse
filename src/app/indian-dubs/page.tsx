import type { Metadata } from "next";
import Link from "next/link";
import { INDIAN_DUB_GUIDES } from "@/lib/indian-dub-guides";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 43200;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Hindi, Tamil & Telugu Dubbed Anime — Indian Dub Guides (2026) | ZyniVerse",
  description:
    "Every Hindi, Tamil and Telugu dubbed anime in one place — One Piece, Naruto, Attack on Titan, Doraemon and more. Release schedules, episode counts, where to watch. Updated weekly by ZyniVerse.",
  keywords: [
    "hindi dubbed anime", "tamil dubbed anime", "telugu dubbed anime", "anime in hindi",
    "anime in tamil", "anime in telugu", "indian dubbed anime list", "dubbed anime schedule india",
    "one piece hindi dub", "naruto hindi dub", "attack on titan hindi dub",
    "anime hindi me kaise dekhe", "hindi dub anime", "anime hindi mein", "anime hindi me episode", "hindi anime list",
  ],
  openGraph: {
    title: "Hindi, Tamil & Telugu Dubbed Anime — Indian Dub Guides | ZyniVerse",
    description: "Complete Indian anime dub guides with release schedules, episode counts and where to watch.",
    url: `${BASE_URL}/indian-dubs`,
    type: "website",
    siteName: "ZyniVerse",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Hindi, Tamil & Telugu Dubbed Anime — ZyniVerse",
    description: "India's anime dub tracker. Release schedules, episode counts & where to watch.",
  },
  alternates: { canonical: `${BASE_URL}/indian-dubs` },
  robots: { index: true, follow: true },
};

const LANG_COLORS: Record<string, string> = {
  Hindi: "bg-orange-500/20 text-orange-300",
  Tamil: "bg-blue-500/20 text-blue-300",
  Telugu: "bg-green-500/20 text-green-300",
};

function GuideCard({ slug, name, tagline, languages, platforms, status, schedule }: {
  slug: string; name: string; tagline: string; languages: string[];
  platforms: string[]; status: "Airing" | "Completed" | "Upcoming"; schedule: string;
}) {
  return (
    <Link href={`/indian-dubs/${slug}`} className="glass-card group block rounded-xl p-5 transition-colors hover:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white group-hover:text-[var(--color-cyan)] transition-colors">
          {name}
        </h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
          status === "Airing" ? "bg-cyan-500/15 text-cyan-300" : status === "Upcoming" ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-[var(--color-mute)]"
        }`}>
          {status}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-mute)]">{tagline}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {languages.map((l) => (
          <span key={l} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${LANG_COLORS[l] || "bg-white/10 text-white"}`}>
            {l}
          </span>
        ))}
        <span className="text-[10px] font-medium text-[var(--color-violet)]">• {platforms.join(" / ")}</span>
      </div>
      <p className="mt-2.5 text-[11px] text-[var(--color-mute)]">{schedule}</p>
      <p className="mt-3 text-xs font-semibold text-[var(--color-cyan)]">
        Full guide →
      </p>
    </Link>
  );
}

export default function IndianDubsPage() {
  const airing = INDIAN_DUB_GUIDES.filter((g) => g.status === "Airing");
  const completed = INDIAN_DUB_GUIDES.filter((g) => g.status === "Completed");
  const upcoming = INDIAN_DUB_GUIDES.filter((g) => g.status === "Upcoming");

  const renderGroup = (title: string, guides: typeof INDIAN_DUB_GUIDES) => (
    guides.length > 0 && (
      <>
        <h2 className="mb-4 font-display text-xl font-bold text-white">{title}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {guides.map((g) => (
            <GuideCard key={g.slug} {...g} />
          ))}
        </div>
      </>
    )
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="neon-rgb-border inline-block rounded-xl px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
          Indian Anime Dubs
        </p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          Hindi, Tamil & Telugu Dubbed Anime
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-mute)]">
          The most-watched anime dubbed into Indian languages — with release schedules, episode counts,
          release platforms and honest newcomer guides. Every entry is tracked and verified by ZyniVerse staff,
          not scraped from other sites.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dubbed"
          className="rounded-xl bg-[var(--color-cyan)] px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90">
          Live Dub Tracker →
        </Link>
        <Link href="/dubbed"
          className="neon-rgb-border rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors hover:text-[var(--color-cyan)]">
          Dub Schedule
        </Link>
        <Link href="/voice-actors/indian"
          className="neon-rgb-border rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors hover:text-[var(--color-cyan)]">
          Indian Voice Actors
        </Link>
      </div>

      <div className="mt-10 space-y-10">
        {renderGroup(`Still Airing (${airing.length})`, airing)}
        {renderGroup(`Complete Dubs (${completed.length})`, completed)}
        {renderGroup(`Coming Soon (${upcoming.length})`, upcoming)}
      </div>

      <div className="mt-10 rounded-xl bg-white/5 p-5">
        <h2 className="font-display text-lg font-bold text-white">Why track Indian dubs on ZyniVerse</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-mute)]">
          Release dates for Hindi, Tamil and Telugu dubs are scattered across announcements, channel blocks and
          streaming refreshes — and they change constantly. ZyniVerse keeps a single, human-verified record of
          which anime is dubbed in which language, how many episodes exist, which platform carries it, and when
          the next episode actually lands in IST.
        </p>
      </div>

      <div className="mt-10">
        <NativeBannerAd />
      </div>
    </div>
  );
}