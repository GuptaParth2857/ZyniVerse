"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MemeFeed from "@/components/MemeFeed";

export default function MemesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <PageTransition>
      <ErrorBoundary label="Memes">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="relative mb-10 overflow-hidden rounded-3xl neon-rgb-border">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
            <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative z-10 px-8 py-12 sm:px-12 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] mb-2">
                  Community
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
                  Anime Memes
                </h1>
                <p className="mt-3 max-w-xl text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  The funniest anime memes from the community. Upvote the best, downvote the cringe, and share the laughs.
                </p>
              </div>

              {status === "authenticated" && session?.user?.id && (
                <button
                  onClick={() => router.push("/memes/upload")}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-all hover:opacity-90"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Meme
                </button>
              )}
            </div>
          </div>

          <MemeFeed />
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
