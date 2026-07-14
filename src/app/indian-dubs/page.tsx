import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import NativeBannerAd from "@/components/NativeBannerAd";
import { getIndianVoiceActors } from "@/lib/voice-actors";

export const metadata: Metadata = {
  title: "Indian Anime Dubs — Hindi, Tamil & Telugu Dubbed Anime | ZyniVerse",
  description: "Complete guide to Indian anime dubs. Find Hindi, Tamil, and Telugu dubbed anime on Crunchyroll, Netflix, and more. Track the latest Indian dub releases.",
  openGraph: {
    title: "Indian Anime Dubs — Hindi, Tamil & Telugu | ZyniVerse",
    description: "Complete guide to Indian anime dubs. Hindi, Tamil & Telugu dubbed anime tracker.",
  },
};

const LANG_INFO: Record<string, { color: string; emoji: string; filterKey: string }> = {
  HINDI: { color: "#ff9933", emoji: "🇮🇳", filterKey: "hasHindi" },
  TAMIL: { color: "#e84a5f", emoji: "🏛️", filterKey: "hasTamil" },
  TELUGU: { color: "#6c63ff", emoji: "🌊", filterKey: "hasTelugu" },
};

interface DubAnime {
  mal_id: number;
  title: string;
  displayTitle: string;
  image: string;
  synopsis: string;
  genres: string[];
  hasHindi: boolean;
  hasTamil: boolean;
  hasTelugu: boolean;
  score: string;
  comingSoonLanguages: string[];
}

async function getDubData(): Promise<DubAnime[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dub-schedule?language=all`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("API failed");
    const json = await res.json();
    if (!json.success) throw new Error("API returned error");
    const { currentSeason, available, comingSoon, recent } = json.data || {};
    const seen = new Set<number>();
    const all = [...(currentSeason || []), ...(available || []), ...(comingSoon || []), ...(recent || [])];
    return all.filter((d: DubAnime) => {
      if (seen.has(d.mal_id)) return false;
      seen.add(d.mal_id);
      return d.hasHindi || d.hasTamil || d.hasTelugu;
    });
  } catch {
    return [];
  }
}

export default async function IndianDubsPage() {
  const [allDubs, indianVAs] = await Promise.all([
    getDubData(),
    getIndianVoiceActors(),
  ]);

  const dubsByLang: Record<string, DubAnime[]> = { HINDI: [], TAMIL: [], TELUGU: [] };
  for (const dub of allDubs) {
    if (dub.hasHindi) dubsByLang.HINDI.push(dub);
    if (dub.hasTamil) dubsByLang.TAMIL.push(dub);
    if (dub.hasTelugu) dubsByLang.TELUGU.push(dub);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">// Indian Dubs</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Indian Anime Dubs</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-3xl">
          Complete guide to Hindi, Tamil, and Telugu dubbed anime. See what&apos;s available on Crunchyroll, Netflix,
          and other streaming platforms. Track upcoming Indian dub releases.
        </p>
      </div>

      {(["HINDI", "TAMIL", "TELUGU"] as const).map((lang) => {
        const info = LANG_INFO[lang];
        const dubs = dubsByLang[lang];
        return (
          <section key={lang} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{info.emoji}</span>
              <h2 className="font-display text-2xl font-bold">{lang} Dubs</h2>
              <span className="text-sm text-[var(--color-mute)]">({dubs.length} available)</span>
            </div>
            {dubs.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
                <p className="text-sm text-[var(--color-mute)]">No {lang} dubs found. Data is being refreshed.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dubs.slice(0, 50).map((dub) => (
                  <Link key={dub.mal_id} href={`/anime/${dub.mal_id}`}
                    className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-cyan)]/40 transition-all group"
                  >
                    {dub.image && (
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-[var(--color-line)]">
                        <Image src={dub.image} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--color-cyan)] transition-colors">
                        {dub.displayTitle || dub.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {dub.genres?.slice(0, 3).map((g: string) => (
                          <span key={g} className="rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] text-[var(--color-mute)]">{g}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {dub.comingSoonLanguages?.length > 0 ? (
                          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[9px] font-bold text-yellow-400">Coming Soon</span>
                        ) : (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-bold text-green-400">Available</span>
                        )}
                        {dub.score && (
                          <span className="text-[10px] text-[var(--color-mute)]">★ {dub.score}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {dubs.length > 50 && (
              <Link href={`/dubbed?language=${lang.toLowerCase()}`}
                className="mt-3 inline-block text-sm text-[var(--color-cyan)] hover:underline"
              >View all {dubs.length} {lang} dubs →</Link>
            )}
          </section>
        );
      })}

      <hr className="border-[var(--color-line)] my-10" />

      <section>
        <h2 className="font-display text-2xl font-bold mb-2">Indian Voice Actors</h2>
        <p className="text-sm text-[var(--color-mute)] mb-6">Meet the talented artists behind Indian anime dubs.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {indianVAs.slice(0, 8).map((va) => (
            <Link key={va.name} href="/voice-actors/indian"
              className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-cyan)]/40 transition-all group"
            >
              <div className="relative h-14 w-14 rounded-full overflow-hidden shrink-0">
                {va.image ? (
                  <Image src={va.image} alt="" fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${va.name.length * 37 % 360}, ${va.name.length * 73 % 360})` }}
                  >{va.name.charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-[var(--color-cyan)] transition-colors">{va.name}</p>
                <p className="text-[10px] text-[var(--color-mute)]">{va.roles?.[0]?.language || "Various"} • {va.roles?.length || 0} roles</p>
              </div>
            </Link>
          ))}
        </div>
        {indianVAs.length > 8 && (
          <Link href="/voice-actors/indian" className="mt-4 inline-block text-sm text-[var(--color-cyan)] hover:underline">
            View all {indianVAs.length} voice actors →
          </Link>
        )}
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div>
  );
}
