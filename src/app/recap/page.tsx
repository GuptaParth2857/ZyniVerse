import { Suspense } from "react";
import type { Metadata } from "next";
import RecapView from "@/components/RecapView";

export const metadata: Metadata = {
  title: "Your Year in Anime | ZyniVerse Recap",
  description: "See how much anime you watched this year — total episodes, hours, favourites and more.",
  robots: { index: false, follow: false },
};

export default function RecapPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-[var(--color-mute)]">Loading recap…</div>
    }>
      <RecapView />
    </Suspense>
  );
}
