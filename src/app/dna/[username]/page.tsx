import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDnaForUser } from "@/lib/dna";
import { safeDecode } from "@/lib/url-params";
import { logError } from "@/lib/logger";
import DnaExplorer from "@/components/DnaExplorer";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: raw } = await params;
  const username = safeDecode(raw);
  return {
    title: `${username} — Anime DNA`,
    description: `${username} ka Anime DNA on ZyniVerse — taste, genres aur archetype derived from their watchlist.`,
    robots: { index: false, follow: true },
  };
}

export default async function DnaUserPage({ params }: PageProps) {
  const { username: raw } = await params;
  const username = safeDecode(raw);

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, avatar: true },
  });
  if (!user) notFound();

  let profile;
  try {
    profile = await getDnaForUser(user.id, user.username, user.username, user.avatar);
  } catch (e) {
    logError(e);
    notFound();
  }

  return (
    <main className="relative mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 30% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 70% 15%, rgba(0,255,224,0.28), transparent 70%), radial-gradient(40% 40% at 50% 85%, rgba(255,122,217,0.22), transparent 70%)",
        }}
      />

      <section className="mb-8 text-center">
        <p className="console-label mb-3 inline-flex items-center gap-2 text-[var(--color-magenta)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-magenta)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />
          </span>
          Taste, decoded
        </p>
        <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">Anime DNA</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-mute)]">
          Watchlist, genres, studios aur streaks se bana ek visual DNA — kya taste hata hai, bina bataye pata chal
          jata hai. Card download karke poll bana do. 🧬
        </p>
        <Link
          href="/dna"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/10"
        >
          Apna DNA banao → login
        </Link>
      </section>

      <DnaExplorer profile={profile} isOwn={false} />

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-mute)]">
        Generated from {profile.totalAnime} titles · ZyniVerse
      </p>
    </main>
  );
}