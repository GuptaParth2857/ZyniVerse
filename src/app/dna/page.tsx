import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Anime DNA | ZyniVerse",
  description: "Apna Anime DNA dekho — watchlist, genres aur streaks se bana visual taste profile. Share karo, compare karo.",
  robots: { index: false, follow: true },
};

export default async function DnaPage() {
  const session = await auth();
  const username = session?.user?.name;
  if (session?.user?.id && username) {
    redirect(`/dna/${encodeURIComponent(username)}`);
  }

  return (
    <main className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 40% 25%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 65% 60%, rgba(0,255,224,0.25), transparent 70%)",
        }}
      />
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-3xl border-2 border-dashed border-[var(--color-magenta)]/40" />
        <span className="text-5xl">🧬</span>
      </div>
      <h1 className="neon-text-gradient font-display text-4xl font-black tracking-tight">Anime DNA</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-mute)]">
        Apna taste, archetype aur top genres ka visual card banana hai? Login karke turant mil jayega — download karke
        friends se compare karo.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="neon-banner-btn rounded-xl px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-[var(--color-line)] px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
        >
          Join free
        </Link>
      </div>
    </main>
  );
}