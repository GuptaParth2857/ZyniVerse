import type { Metadata } from "next";
import { getVoiceLine } from "@/lib/voice-lines";
import VoiceLineCard from "@/components/VoiceLineCard";
import QuoteDetailPanel from "@/components/QuoteDetailPanel";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  const line = getVoiceLine(id);
  if (!line) {
    return { title: "Quote Not Found | ZyniVerse", description: "Browse iconic anime quotes and voice lines from your favorite characters. Discover memorable moments from popular anime series.", robots: { index: true, follow: true } };
  }
  return {
    title: `"${line.line}" — ${line.character} | ZyniVerse Quotes`,
    description: `"${line.line}" — ${line.character} from ${line.animeTitle}`,
    openGraph: {
      title: `"${line.line}" — ${line.character}`,
      description: `Iconic quote from ${line.animeTitle}`,
      url: `${baseUrl}/voice-lines/${id}`,
    },
    alternates: { canonical: `${baseUrl}/voice-lines/${id}` },
    robots: { index: true, follow: true },
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
      <QuoteDetailPanel line={line} />
    </main>
  );
}
