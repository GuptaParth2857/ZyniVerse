import type { Metadata } from "next";
import { getUnifiedFeed } from "@/lib/feed";
import FeedClient from "@/components/FeedClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "My Feed",
  description:
    "ZyniVerse ka personalized anime feed — news, memes, reels, moments, fan art, cosplay aur blogs, tumhare taste ke hisaab se ranked. Follow aur discover karo.",
  alternates: { canonical: "/feed" },
  openGraph: {
    title: "My Feed",
    description: "Tumhare taste ke hisaab se ranked anime community feed — sab kuch ek jagah.",
    url: "/feed",
    type: "website",
  },
};

export default async function FeedPage() {
  // Server-render page 1 for SEO + fast first paint; FeedClient hydrates the
  // personalized/infinite-scroll behavior on top.
  const initial = await getUnifiedFeed({ mode: "foryou", limit: 20 });

  return (
    <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
        }}
      />

      {/* Header */}
      <section className="mb-8">
        <p className="console-label mb-3 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
          </span>
          Unified Feed · Ranked For You
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">My Feed</h1>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-mute)]">
            News, memes, reels, moments, fan art, cosplay, wallpapers aur blogs — sab ek jagah, tumhare follows aur
            engagement ke hisaab se sorted. 🎌
          </p>
        </div>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-[var(--color-magenta)]/40 via-[var(--color-cyan)]/30 to-transparent" />
      </section>

      <FeedClient initialItems={initial.items} />

      {/* SEO body copy */}
      <section className="mt-14">
        <h2 className="font-display text-lg font-bold text-white">What is ZyniVerse Feed?</h2>
        <p className="mt-2 max-w-3xl space-y-2 text-sm leading-relaxed text-[var(--color-mute)]">
          ZyniVerse ka unified feed anime community ki latest activity ko ek hi jagah laata hai — trending news, fan art,
          cosplay, reels, memes, moments aur wallpapers. Ranked algorithm recency, engagement aur aapke entertainment
          pattern ko combine karta hai, taaki top content pehle dikhe. Creators ko follow karke apna personal feed banao —
          sirf unhi ka content dikhega.
        </p>
      </section>
    </main>
  );
}