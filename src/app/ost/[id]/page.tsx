import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOSTs, getArtist } from "@/lib/ost";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const results = getOSTs();
  const ost = results.find((e) => e.id === id);
  if (!ost) return { title: "OST Not Found" };
  return {
    title: `${ost.title} — ${ost.artist} | ZyniVerse Music`,
    description: `${ost.title} by ${ost.artist} from ${ost.animeTitle}. ${ost.type} — ${ost.year}.`,
    openGraph: {
      title: `${ost.title} — ${ost.artist}`,
      description: `${ost.type} from ${ost.animeTitle} (${ost.year})`,
    },
  };
}

export default async function OSTDetailPage({ params }: Props) {
  const { id } = await params;
  const results = getOSTs();
  const ost = results.find((e) => e.id === id);
  if (!ost) notFound();

  const artistData = getArtist(ost.artist);
  const animeOSTs = getOSTs(undefined, undefined, undefined, ost.animeId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/ost" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to OST Database
      </Link>

      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
              ost.type === "OP" ? "bg-red-600/20 text-red-400 border-red-600/30" :
              ost.type === "ED" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
              ost.type === "OST" ? "bg-purple-600/20 text-purple-400 border-purple-600/30" :
              ost.type === "INSERT" ? "bg-green-600/20 text-green-400 border-green-600/30" :
              "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
            }`}>{ost.type}</span>
            <h1 className="font-display text-2xl font-bold mt-2">{ost.title}</h1>
          </div>
          {ost.videoUrl && (
            <a href={ost.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[var(--color-cyan)]/10 px-4 py-2 text-sm text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Watch on YouTube
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <DetailRow label="Artist" value={ost.artist} />
            {ost.composer && <DetailRow label="Composer" value={ost.composer} />}
            {ost.lyrics && <DetailRow label="Lyrics" value={ost.lyrics} />}
          </div>
          <div className="space-y-3">
            <DetailRow label="Anime" value={ost.animeTitle} />
            <DetailRow label="Year" value={String(ost.year)} />
            {ost.season && <DetailRow label="Season" value={ost.season} />}
            {ost.episodeRange && <DetailRow label="Episodes" value={ost.episodeRange} />}
          </div>
        </div>

        {ost.videoUrl && (
          <div className="aspect-video w-full rounded-xl overflow-hidden mb-8">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(ost.videoUrl)}?autoplay=0`}
              title={`${ost.title} - ${ost.artist}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      {animeOSTs.length > 1 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold mb-4">More from {ost.animeTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {animeOSTs.filter((e) => e.id !== ost.id).slice(0, 6).map((e) => (
              <Link key={e.id} href={`/ost/${e.id}`}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-3 hover:border-[var(--color-cyan)]/40 transition-all">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                  e.type === "OP" ? "bg-red-600/20 text-red-400 border-red-600/30" :
                  e.type === "ED" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
                  "bg-purple-600/20 text-purple-400 border-purple-600/30"
                }`}>{e.type}</span>
                <p className="text-sm font-semibold mt-1 truncate">{e.title}</p>
                <p className="text-xs text-[var(--color-mute)] truncate">{e.artist}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {artistData && artistData.songs.length > 1 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold mb-4">More by {ost.artist}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {artistData.songs.filter((e) => e.id !== ost.id).slice(0, 6).map((e) => (
              <Link key={e.id} href={`/ost/${e.id}`}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-3 hover:border-[var(--color-cyan)]/40 transition-all">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                  e.type === "OP" ? "bg-red-600/20 text-red-400 border-red-600/30" :
                  e.type === "ED" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
                  "bg-purple-600/20 text-purple-400 border-purple-600/30"
                }`}>{e.type}</span>
                <p className="text-sm font-semibold mt-1 truncate">{e.title}</p>
                <p className="text-xs text-[var(--color-mute)] truncate">{e.animeTitle}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-mono text-[var(--color-mute)]/60 min-w-20">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return "";
}
