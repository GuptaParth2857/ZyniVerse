"use client";

import { use } from "react";
import { PageTransition } from "@/components/PageTransition";
import ListComparison from "@/components/features/ListComparison";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CompareContent({ paramsPromise }: { paramsPromise: Promise<{ username: string }> }) {
  const { username } = use(paramsPromise);
  const { data: session } = useSession();

  if (!session) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="font-display text-2xl font-bold mb-2">Sign in to Compare</p>
          <p className="text-[var(--color-mute)] text-sm">You need to sign in to compare your list with other users.</p>
          <Link href="/login" className="mt-4 inline-block rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black">Sign In</Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Social</p>
          <h1 className="font-display text-3xl font-bold mt-1">Comparing with @{username}</h1>
        </div>
        <ListComparison username={username} />
      </div>
    </PageTransition>
  );
}
