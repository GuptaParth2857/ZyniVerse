import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFillerData, getFillerDataFromCache, type FillerEpisode, type FillerShow } from "@/lib/filler";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const all = await getFillerData();
    return all.map((s) => ({ slug: s.slug }));
  } catch (e) {
    console.error("[filler-slug] generateStaticParams FAILED:", e);
    return [];
  }
}

const FALLBACK_METADATA: Metadata = {
  title: "Filler List — Every Anime Filler Episode to Skip | ZyniVerse",
  description:
    "Complete filler episode guides for popular anime. See exactly which episodes are filler, canon, or mixed — and skip straight to the story.",
  robots: { index: true, follow: true },
};

function summarize(show: FillerShow) {
  const total = show.episodes.length;
  const filler = show.episodes.filter((e) => e.type === "filler").length;
  const mangaCanon = show.episodes.filter((e) => e.type === "manga-canon").length;
  const animeCanon = show.episodes.filter((e) => e.type === "anime-canon").length;
  const mixed = show.episodes.filter((e) => e.type === "mixed-manga").length;
  const fillerPercent = total > 0 ? Math.round((filler / total) * 100) : 0;
  const canonPercent = total > 0 ? Math.round(((mangaCanon + animeCanon) / total) * 100) : 0;
  return { total, filler, mangaCanon, animeCanon, mixed, fillerPercent, canonPercent };
}

function quickRanges(episodes: FillerEpisode[], type: string): string[] {
  const nums = episodes.filter((e) => e.type === type).map((e) => e.episode).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = nums[0];
  let end = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === end + 1) end = nums[i];
    else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = nums[i];
      end = nums[i];
    }
  }
  if (nums.length > 0) ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const all = getFillerDataFromCache();
    const show = all.find((s) => s.slug === slug);
    if (!show) return FALLBACK_METADATA;

    const { total, filler, fillerPercent } = summarize(show);
    const keyword = `${slug.replace(/-/g, " ")} filler list`;

    const title = `${show.title} Filler List — Every Filler Episode to Skip (${new Date().getFullYear()})`;
    const description = total > 0
      ? `${show.title} has ${total} episodes with ${filler} filler episodes (${fillerPercent}%). Complete episode-by-episode guide showing exactly which to skip and which are canon.`
      : `${show.title} filler list — complete episode-by-episode guide. Skip filler and watch only the canon episodes.`;

    return {
      title,
      description,
      keywords: [keyword, `${slug.replace(/-/g, " ")} filler episodes`, "skip filler episodes", "anime filler list", "canon episodes list"],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/filler/${slug}`,
        type: "website",
        siteName: "ZyniVerse",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: { canonical: `${BASE_URL}/filler/${slug}` },
      robots: { index: true, follow: true },
    };
  } catch {
    return FALLBACK_METADATA;
  }
}

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "manga-canon": { label: "Manga Canon", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  "anime-canon": { label: "Anime Canon", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  "mixed-manga": { label: "Mixed", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  filler: { label: "Filler", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default async function FillerSlugPage({ params }: Props) {
  const { slug } = await params;

  let show: FillerShow | null = null;
  try {
    const all = getFillerDataFromCache();
    show = all.find((s) => s.slug === slug) || null;
  } catch {
    show = null;
  }
  if (!show) notFound();

  const { total, filler, mangaCanon, animeCanon, mixed, fillerPercent, canonPercent } = summarize(show);
  const fillerEpisodes = show.episodes.filter((e) => e.type === "filler");
  const canonEpisodes = show.episodes.filter((e) => e.type !== "filler");
  const skipRanges = quickRanges(show.episodes, "filler");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much filler does ${show.title} have?`,
        acceptedAnswer: { "@type": "Answer", text: `${show.title} has ${total} episodes, of which ${filler} are filler (${fillerPercent}%) and ${mangaCanon + animeCanon} are canon.` },
      },
      ...(skipRanges.length > 0 ? [{
        "@type": "Question",
        name: `Which ${show.title} episodes are filler and can be skipped?`,
        acceptedAnswer: { "@type": "Answer", text: `You can skip ${show.title} filler episodes: ${skipRanges.join(", ")}.` },
      }] : []),
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Filler Guides", item: `${BASE_URL}/filler` },
      { "@type": "ListItem", position: 3, name: `${show.title} Filler List`, item: `${BASE_URL}/filler/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/filler" className="hover:text-[var(--color-cyan)] transition-colors">Filler Guides</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">{show.title}</span>
        </nav>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Filler List · Updated {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {show.title} Filler List
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
            {show.title} has <strong className="text-[var(--color-ink)]">{total} episodes</strong> — of those,
            <strong className="text-red-400"> {filler} are filler ({fillerPercent}%)</strong> and
            <strong className="text-green-400"> {mangaCanon + animeCanon} are canon</strong>.
            {fillerPercent > 30
              ? " Skip the filler episodes below to save hours and follow the real story."
              : fillerPercent > 0
              ? " Only a handful of episodes are filler — skip them with the quick list below."
              : " This show has no filler — you can watch every episode."}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[var(--color-ink)]">{total}</p>
            <p className="text-xs text-[var(--color-mute)]">Total Episodes</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-green-400">{mangaCanon + animeCanon}</p>
            <p className="text-xs text-[var(--color-mute)]">Canon Episodes</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-amber-400">{mixed}</p>
            <p className="text-xs text-[var(--color-mute)]">Mixed</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-red-400">{filler}</p>
            <p className="text-xs text-[var(--color-mute)]">Filler Episodes</p>
          </div>
        </div>

        <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-[var(--color-line)]">
          {mangaCanon > 0 && <div className="h-full bg-green-500" style={{ width: `${(mangaCanon / total) * 100}%` }} />}
          {animeCanon > 0 && <div className="h-full bg-blue-500" style={{ width: `${(animeCanon / total) * 100}%` }} />}
          {mixed > 0 && <div className="h-full bg-amber-500" style={{ width: `${(mixed / total) * 100}%` }} />}
          {filler > 0 && <div className="h-full bg-red-500" style={{ width: `${(filler / total) * 100}%` }} />}
        </div>

        <section className="mb-10 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold mb-3">Quick Skip Guide for {show.title}</h2>
          {skipRanges.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--color-mute)]">Skip these {filler} episodes — they don&apos;t affect the main story:</p>
              <div className="flex flex-wrap gap-2">
                {skipRanges.map((r) => (
                  <span key={r} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-mono text-sm font-bold text-red-400">
                    Ep. {r}
                  </span>
                ))}
              </div>
              <p className="pt-2 text-sm text-[var(--color-mute)]">
                <strong className="text-[var(--color-ink)]">Total time saved:</strong> ~{filler * 24} minutes at 24 min/ep — or ~{Math.max(1, Math.round((filler * 24) / 60))} hours.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-mute)]">
              {show.title} has no filler episodes — watch the whole series from start to finish.
            </p>
          )}
        </section>

        {fillerEpisodes.length > 0 && (
          <section id="filler-list" className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-red-500" />
              Filler Episodes — Safe to Skip
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {fillerEpisodes.map((ep) => (
                <div key={ep.episode} className="flex items-center gap-3 rounded-lg neon-rgb-border bg-red-500/5 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 font-mono text-xs font-bold text-red-400">
                    {ep.episode}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{ep.title}</p>
                    {ep.aired_date && <p className="text-[10px] text-[var(--color-mute)]">Aired {ep.aired_date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {canonEpisodes.length > 0 && (
          <section id="canon-list" className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-green-500" />
              Canon &amp; Mixed Episodes — Must Watch
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {canonEpisodes.map((ep) => {
                const style = TYPE_STYLES[ep.type];
                return (
                  <div key={ep.episode} className="flex items-center gap-3 rounded-lg neon-rgb-border bg-[var(--color-panel)] p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-void)] font-mono text-xs font-bold text-[var(--color-ink)]">
                      {ep.episode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ep.title}</p>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style?.bg} ${style?.color} ${style?.border}`}>
                        {style?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
          <p className="font-display text-lg font-bold">{canonPercent}% of {show.title} is canon — the rest is skippable.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/filler" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity">
              Browse All Filler Guides →
            </Link>
            <Link href="/search" className="rounded-full neon-rgb-border px-5 py-2.5 text-xs font-semibold transition-colors">
              Track {show.title} →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
