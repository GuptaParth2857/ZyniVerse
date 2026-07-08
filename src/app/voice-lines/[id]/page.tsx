import type { Metadata } from "next";
import { getVoiceLine } from "@/lib/voice-lines";
import VoiceLineCard from "@/components/VoiceLineCard";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const line = getVoiceLine(id);
  if (!line) {
    return { title: "Quote Not Found | ZyniVerse" };
  }
  return {
    title: `"${line.line}" — ${line.character} | ZyniVerse Quotes`,
    description: `"${line.line}" — ${line.character} from ${line.animeTitle}`,
    openGraph: {
      title: `"${line.line}" — ${line.character}`,
      description: `Iconic quote from ${line.animeTitle}`,
    },
  };
}

export default async function VoiceLineDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const line = getVoiceLine(id);

  if (!line) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg text-[var(--color-mute)]">Quote not found</p>
        <Link
          href="/voice-lines"
          className="mt-4 inline-block rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-cyan)] hover:bg-cyan-500/10 transition-colors"
        >
          Back to quotes
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/voice-lines"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to all quotes
      </Link>
      <VoiceLineCard line={line} />
      <div className="mt-8 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h2 className="font-display text-lg font-bold">About this quote</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-mute)]">
          <li><strong className="text-[var(--color-ink)]">Character:</strong> {line.character}</li>
          <li><strong className="text-[var(--color-ink)]">Anime:</strong> {line.animeTitle}</li>
          <li><strong className="text-[var(--color-ink)]">Type:</strong> {line.type.charAt(0).toUpperCase() + line.type.slice(1)}</li>
          <li><strong className="text-[var(--color-ink)]">Language:</strong> {line.language.charAt(0).toUpperCase() + line.language.slice(1)}</li>
          {line.context && <li><strong className="text-[var(--color-ink)]">Context:</strong> {line.context}</li>}
          {line.episode && <li><strong className="text-[var(--color-ink)]">Episode:</strong> {line.episode}</li>}
          {line.lineJapanese && (
            <li><strong className="text-[var(--color-ink)]">Japanese:</strong> {line.lineJapanese}</li>
          )}
          {line.lineHindi && (
            <li><strong className="text-[var(--color-ink)]">Hindi:</strong> {line.lineHindi}</li>
          )}
        </ul>
      </div>
    </main>
  );
}
